import { API_BASE_URL } from '../config';
import { api, ApiError, setJwtToken, clearJwtToken } from './apiClient';
import { storage } from './storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

export interface RegisterData {
  nama?: string;
  username?: string;
  email?: string;
  password?: string;
  konfirmasi?: string;
}

export interface AuthUser {
  id: string;
  nama: string;
  username: string;
  email: string;
}

export type SessionResult = AuthUser & { token: string };

export class AuthError extends Error {
  field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

const K_SESSION = 'laporcepat.session';
const K_JWT = 'laporcepat.jwt';
const K_TRIES = 'laporcepat.tries';
const K_BIO = 'laporcepat.biometric';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const JWT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const ITER = 1000;
const MAX_TRIES = 5;
const LOCK_MS = 30 * 1000;

type MockRecord = {
  id: string;
  nama: string;
  username: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
};

const norm = (s: unknown): string => String(s || '').trim().toLowerCase();
const sha256 = (t: string): Promise<string> => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, t);
const toHex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const randomHex = async (n: number): Promise<string> => toHex(await Crypto.getRandomBytesAsync(n));

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const manualBase64 = (s: string): string => {
  const bytes = Array.from(s, (c) => c.charCodeAt(0));
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1] ?? null;
    const b2 = bytes[i + 2] ?? null;
    out += B64_CHARS[b0 >> 2] + B64_CHARS[((b0 & 3) << 4) | (b1 != null ? b1 >> 4 : 0)];
    out += b1 == null ? '=' : B64_CHARS[((b1 & 15) << 2) | (b2 != null ? b2 >> 6 : 0)];
    out += b2 == null ? '=' : B64_CHARS[b2 & 63];
  }
  return out;
};
const base64Url = (str: string): string => {
  const b64 = typeof btoa === 'function' ? btoa(str) : manualBase64(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const encodePayload = (obj: unknown): string => base64Url(JSON.stringify(obj));
const userKey = async (id: unknown): Promise<string> => 'laporcepat.user.' + (await sha256(norm(id))).slice(0, 32);
const publicUser = (r: any): AuthUser => ({ id: r.id, nama: r.nama, username: r.username, email: r.email });

async function hashPassword(password: string, salt: string): Promise<string> {
  let h = await sha256(salt + password);
  for (let i = 0; i < ITER; i++) h = await sha256(h + salt);
  return h;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const JWT_SECRET = 'laporcepat_jwt_secret_dev';
const now = (): number => Date.now();

async function signJwt(payload: Record<string, unknown>): Promise<string> {
  const header = encodePayload({ alg: 'HS256', typ: 'JWT' });
  const body = encodePayload({ ...payload, iat: Math.floor(now() / 1000), exp: Math.floor((now() + JWT_EXPIRY_MS) / 1000) });
  const signingInput = `${header}.${body}`;
  const sig = await sha256(JWT_SECRET + '.' + signingInput);
  return `${signingInput}.${sig}`;
}

function decodeJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadStr = decodeURIComponent(
      Array.from(atob(payloadB64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(payloadStr);
  } catch { return null; }
}

export function isTokenExpired(token: string): boolean {
  const p = decodeJwt(token);
  if (!p || !p.exp) return true;
  return Date.now() > p.exp * 1000;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USER_RE = /^[a-z0-9_.]{3,20}$/;

export function validateRegister({ nama, username, email, password, konfirmasi }: RegisterData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!String(nama || '').trim()) e.nama = 'Nama wajib diisi.';
  if (!USER_RE.test(norm(username))) e.username = 'Username 3–20 karakter: huruf, angka, titik, atau garis bawah.';
  if (!EMAIL_RE.test(norm(email))) e.email = 'Format email belum benar.';
  if (String(password || '').length < 8) e.password = 'Password minimal 8 karakter.';
  if (konfirmasi !== undefined && konfirmasi !== password) e.konfirmasi = 'Konfirmasi password tidak sama.';
  return e;
}

async function checkLock(): Promise<void> {
  const raw = await storage.get(K_TRIES);
  if (!raw) return;
  const { until } = JSON.parse(raw);
  if (until && Date.now() < until) {
    const s = Math.ceil((until - Date.now()) / 1000);
    throw new AuthError(`Terlalu banyak percobaan. Coba lagi dalam ${s} detik.`);
  }
}
async function recordFail(): Promise<void> {
  const raw = await storage.get(K_TRIES);
  const count = (raw ? JSON.parse(raw).count || 0 : 1);
  const locked = count >= MAX_TRIES;
  await storage.set(K_TRIES, JSON.stringify({ count: locked ? 0 : count, until: locked ? Date.now() + LOCK_MS : 0 }));
}
const clearFails = (): Promise<void> => storage.remove(K_TRIES);

async function startSession(record: MockRecord): Promise<SessionResult> {
  const token = await signJwt({ sub: record.id, email: record.email, nama: record.nama, role: 'warga' });
  const session = { token, user: publicUser(record), expiresAt: Date.now() + SESSION_MS };
  await storage.set(K_SESSION, JSON.stringify(session));
  await setJwtToken(token); // access token disimpan untuk Authorization: Bearer
  return { ...session.user, token };
}

export async function restoreSession(): Promise<SessionResult | null> {
  const raw = await storage.get(K_SESSION);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s.token || !s.user || Date.now() > s.expiresAt) throw new Error('expired');
    if (isTokenExpired(s.token)) throw new Error('jwt_expired');
    await setJwtToken(s.token);
    return { ...s.user, token: s.token };
  } catch {
    await storage.remove(K_SESSION);
    await clearJwtToken();
    return null;
  }
}

export const logout = async (): Promise<void> => {
  
  await storage.remove(K_SESSION);
  await clearJwtToken();
  
  if (!isMockMode()) {
    try { await api.post('/auth/logout', undefined, { skipAuth: true }); } catch { /* abaikan */ }
  }
};


export const isMockMode = (): boolean => !API_BASE_URL;

async function apiLogin(identifier: string, password: string): Promise<SessionResult> {
  const data = await api.post('/auth/login', { identifier, password }, { skipAuth: true });
  const token = data.accessToken || data.token || data.access_token;
  if (!token) throw new AuthError('Server tidak mengembalikan access token.');
  const user = data.user || data.data || decodeJwt(token) || {};
  await setJwtToken(token);
  await storage.set(K_SESSION, JSON.stringify({ token, user, expiresAt: Date.now() + SESSION_MS }));
  return { ...publicUser(user), token };
}

async function apiRegister(data: RegisterData): Promise<any> {
  const res = await api.post('/auth/register', data, { skipAuth: true });
  const token = res.accessToken || res.token || res.access_token;
  if (token) await setJwtToken(token);
  return res;
}

export async function register(data: RegisterData): Promise<any> {
  if (!isMockMode()) return apiRegister(data);

  const errs = validateRegister(data);
  const first = Object.keys(errs)[0];
  if (first) throw new AuthError(errs[first], first);

  const emailKey = await userKey(data.email);
  const nameKey = await userKey(data.username);
  if (await storage.get(emailKey)) throw new AuthError('Email sudah terdaftar.', 'email');
  if (await storage.get(nameKey)) throw new AuthError('Username sudah dipakai.', 'username');

  const salt = await randomHex(16);
  const record: MockRecord = {
    id: await randomHex(8),
    nama: (data.nama || '').trim(),
    username: norm(data.username),
    email: norm(data.email),
    salt,
    hash: await hashPassword(data.password || '', salt),
    createdAt: Date.now(),
  };
  const json = JSON.stringify(record);
  await storage.set(emailKey, json);
  await storage.set(nameKey, json);
  return startSession(record);
}

export async function login(identifier: string, password: string): Promise<any> {
  if (!norm(identifier) || !password) throw new AuthError('Isi email/username dan password.');
  if (!isMockMode()) return apiLogin(identifier, password);

  await checkLock();
  const raw = await storage.get(await userKey(identifier));
  const fail = async (): Promise<never> => {
    await recordFail();
    throw new AuthError('Email/username atau password salah.');
  };
  if (!raw) {
    await hashPassword(password, '0'.repeat(32));
    return fail();
  }
  const record: MockRecord = JSON.parse(raw);
  if (!safeEqual(await hashPassword(password, record.salt), record.hash)) return fail();

  await clearFails();
  return startSession(record);
}

const DEMO: { nama: string; username: string; email: string; password: string } = { nama: 'Warga Demo', username: 'demo', email: 'demo@laporcepat.id', password: 'demo12345' };
export async function loginDemo(): Promise<any> {
  if (!(await storage.get(await userKey(DEMO.email)))) return register(DEMO);
  return login(DEMO.email, DEMO.password);
}

export interface BiometricInfo {
  available: boolean;
  hasFace: boolean;
  hasFingerprint: boolean;
}

export async function getBiometricInfo(): Promise<BiometricInfo> {
  try {
    const [hw, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const T = LocalAuthentication.AuthenticationType;
    return {
      available: hw && enrolled,
      hasFace: types.includes(T.FACIAL_RECOGNITION),
      hasFingerprint: types.includes(T.FINGERPRINT),
    };
  } catch {
    return { available: false, hasFace: false, hasFingerprint: false };
  }
}

async function promptBiometric(message: string): Promise<void> {
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: message,
    cancelLabel: 'Batal',
    fallbackLabel: 'Gunakan kode perangkat',
  });
  if (!r.success) {
    throw new AuthError(r.error === 'user_cancel' ? 'Verifikasi dibatalkan.' : 'Verifikasi biometrik gagal.');
  }
}

export async function isBiometricEnabledFor(email: unknown): Promise<boolean> {
  return (await storage.get(K_BIO)) === norm(email);
}
export async function hasBiometricUser(): Promise<boolean> {
  return !!(await storage.get(K_BIO));
}
export async function enableBiometric(user: AuthUser | null): Promise<void> {
  const info = await getBiometricInfo();
  if (!info.available) throw new AuthError('Biometrik belum tersedia atau belum diatur di perangkat ini.');
  await promptBiometric('Aktifkan masuk dengan biometrik');
  await storage.set(K_BIO, norm(user?.email ?? ''));
}
export const disableBiometric = (): Promise<void> => storage.remove(K_BIO);

export async function loginBiometric(): Promise<any> {
  const email = await storage.get(K_BIO);
  if (!email) throw new AuthError('Aktifkan biometrik dulu di halaman Profil setelah masuk.');
  await promptBiometric('Masuk ke LaporCepat');
  const raw = await storage.get(await userKey(email));
  if (!raw) throw new AuthError('Akun tidak ditemukan. Masuk dengan password.');
  return startSession(JSON.parse(raw));
}

export const authTest = {
  
  async authenticated(): Promise<unknown> {
    const token = await storage.get(K_JWT);
    if (!token) throw new AuthError('Tidak ada access token. Masuk terlebih dahulu.');
    if (isTokenExpired(token)) throw new AuthError('Access token expired.');
    return api.get('/laporan', { skipAuth: false }); // Authorization: Bearer dipasang otomatis
  },
  
  async unauthenticated(): Promise<{ blocked: boolean; status?: number }> {
    try {
      await api.get('/laporan', { skipAuth: true });
      return { blocked: false };
    } catch (e) {
      return { blocked: true, status: (e as ApiError).status };
    }
  },
};

import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from './storage';

const K_SESSION = 'laporcepat.session';
const K_TRIES = 'laporcepat.tries';
const K_BIO = 'laporcepat.biometric';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const ITER = 1000;
const MAX_TRIES = 5;
const LOCK_MS = 30 * 1000;

export class AuthError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

const norm = (s) => String(s || '').trim().toLowerCase();
const sha256 = (t) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, t);
const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const randomHex = async (n) => toHex(await Crypto.getRandomBytesAsync(n));
const userKey = async (id) => 'laporcepat.user.' + (await sha256(norm(id))).slice(0, 32);
const publicUser = (r) => ({ id: r.id, nama: r.nama, username: r.username, email: r.email });

async function hashPassword(password, salt) {
  let h = await sha256(salt + password);
  for (let i = 0; i < ITER; i++) h = await sha256(h + salt);
  return h;
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USER_RE = /^[a-z0-9_.]{3,20}$/;

export function validateRegister({ nama, username, email, password, konfirmasi }) {
  const e = {};
  if (!String(nama || '').trim()) e.nama = 'Nama wajib diisi.';
  if (!USER_RE.test(norm(username))) e.username = 'Username 3–20 karakter: huruf, angka, titik, atau garis bawah.';
  if (!EMAIL_RE.test(norm(email))) e.email = 'Format email belum benar.';
  if (String(password || '').length < 8) e.password = 'Password minimal 8 karakter.';
  if (konfirmasi !== undefined && konfirmasi !== password) e.konfirmasi = 'Konfirmasi password tidak sama.';
  return e;
}

async function checkLock() {
  const raw = await storage.get(K_TRIES);
  if (!raw) return;
  const { until } = JSON.parse(raw);
  if (until && Date.now() < until) {
    const s = Math.ceil((until - Date.now()) / 1000);
    throw new AuthError(`Terlalu banyak percobaan. Coba lagi dalam ${s} detik.`);
  }
}
async function recordFail() {
  const raw = await storage.get(K_TRIES);
  const count = (raw ? JSON.parse(raw).count || 0 : 0) + 1;
  const locked = count >= MAX_TRIES;
  await storage.set(K_TRIES, JSON.stringify({ count: locked ? 0 : count, until: locked ? Date.now() + LOCK_MS : 0 }));
}
const clearFails = () => storage.remove(K_TRIES);

async function startSession(record) {
  const session = { token: await randomHex(32), user: publicUser(record), expiresAt: Date.now() + SESSION_MS };
  await storage.set(K_SESSION, JSON.stringify(session));
  return session.user;
}

export async function restoreSession() {
  const raw = await storage.get(K_SESSION);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s.token || !s.user || Date.now() > s.expiresAt) throw new Error('expired');
    return s.user;
  } catch {
    await storage.remove(K_SESSION);
    return null;
  }
}

export const logout = () => storage.remove(K_SESSION);

export async function register(data) {
  const errs = validateRegister(data);
  const first = Object.keys(errs)[0];
  if (first) throw new AuthError(errs[first], first);

  const emailKey = await userKey(data.email);
  const nameKey = await userKey(data.username);
  if (await storage.get(emailKey)) throw new AuthError('Email sudah terdaftar.', 'email');
  if (await storage.get(nameKey)) throw new AuthError('Username sudah dipakai.', 'username');

  const salt = await randomHex(16);
  const record = {
    id: await randomHex(8),
    nama: data.nama.trim(),
    username: norm(data.username),
    email: norm(data.email),
    salt,
    hash: await hashPassword(data.password, salt),
    createdAt: Date.now(),
  };
  const json = JSON.stringify(record);
  await storage.set(emailKey, json);
  await storage.set(nameKey, json);
  return startSession(record);
}

export async function login(identifier, password) {
  if (!norm(identifier) || !password) throw new AuthError('Isi email/username dan password.');
  await checkLock();

  const raw = await storage.get(await userKey(identifier));
  const fail = async () => {
    await recordFail();
    throw new AuthError('Email/username atau password salah.');
  };
  if (!raw) {
    await hashPassword(password, '0'.repeat(32));
    return fail();
  }
  const record = JSON.parse(raw);
  if (!safeEqual(await hashPassword(password, record.salt), record.hash)) return fail();

  await clearFails();
  return startSession(record);
}

const DEMO = { nama: 'Warga Demo', username: 'demo', email: 'demo@laporcepat.id', password: 'demo12345' };
export async function loginDemo() {
  if (!(await storage.get(await userKey(DEMO.email)))) return register(DEMO);
  return login(DEMO.email, DEMO.password);
}

export async function getBiometricInfo() {
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

async function promptBiometric(message) {
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: message,
    cancelLabel: 'Batal',
    fallbackLabel: 'Gunakan kode perangkat',
  });
  if (!r.success) {
    throw new AuthError(r.error === 'user_cancel' ? 'Verifikasi dibatalkan.' : 'Verifikasi biometrik gagal.');
  }
}

export async function isBiometricEnabledFor(email) {
  return (await storage.get(K_BIO)) === norm(email);
}
export async function hasBiometricUser() {
  return !!(await storage.get(K_BIO));
}
export async function enableBiometric(user) {
  const info = await getBiometricInfo();
  if (!info.available) throw new AuthError('Biometrik belum tersedia atau belum diatur di perangkat ini.');
  await promptBiometric('Aktifkan masuk dengan biometrik');
  await storage.set(K_BIO, norm(user.email));
}
export const disableBiometric = () => storage.remove(K_BIO);

export async function loginBiometric() {
  const email = await storage.get(K_BIO);
  if (!email) throw new AuthError('Aktifkan biometrik dulu di halaman Profil setelah masuk.');
  await promptBiometric('Masuk ke LaporCepat');
  const raw = await storage.get(await userKey(email));
  if (!raw) throw new AuthError('Akun tidak ditemukan. Masuk dengan password.');
  return startSession(JSON.parse(raw));
}

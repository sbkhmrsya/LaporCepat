// Token JWT sekali pakai (one-time token) untuk LaporCepat-auth.
// Format standar JWT HS256: header.payload.signature (base64url).
// Sekali pakai ditegakkan lewat penyimpanan jti yang sudah dikonsumsi
// di SecureStore (native) / localStorage (web).
//
// Contoh pakai:
//   import { createOneTimeToken, verifyOneTimeToken } from './oneTimeTokenService';
//
//   // Terbitkan (mis. reset password / verifikasi aksi sensitif, TTL 5 menit):
//   const token = await createOneTimeToken({ sub: user.email, purpose: 'reset-password' });
//
//   // Verifikasi + langsung hanguskan (pemakaian kedua akan ditolak):
//   const payload = await verifyOneTimeToken(token, { expectedPurpose: 'reset-password' });
//
//   // Verifikasi tanpa menghanguskan (untuk preview saja):
//   const payload2 = await verifyOneTimeToken(token, { expectedPurpose: 'reset-password', consume: false });

import * as Crypto from 'expo-crypto';
import { storage } from './storage';
import { signJwt, verifyJwt, decodeJwt, JwtError } from '../utils/jwt';

export class OneTimeTokenError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'OneTimeTokenError';
    this.code = code;
  }
}

const K_SECRET = 'laporcepat.ott.secret';
const K_USED = 'laporcepat.ott.used';

export const OTT_ISSUER = 'laporcepat';
export const OTT_DEFAULT_TTL_SEC = 300; // 5 menit
const LEEWAY_SEC = 30;

const nowSec = () => Math.floor(Date.now() / 1000);

function fromJwtError(e, fallback = 'Token tidak valid.') {
  if (e instanceof JwtError) {
    if (e.code === 'EXPIRED') return new OneTimeTokenError('Token kedaluwarsa.', 'EXPIRED');
    if (e.code === 'BAD_SIGNATURE') return new OneTimeTokenError('Signature token tidak valid.', 'INVALID');
    if (e.code === 'MALFORMED') return new OneTimeTokenError('Format token tidak valid.', 'MALFORMED');
    if (e.code === 'BAD_ALG') return new OneTimeTokenError('Algoritma token ditolak.', 'INVALID');
    if (e.code === 'NOT_ACTIVE') return new OneTimeTokenError('Token belum aktif.', 'INVALID');
    return new OneTimeTokenError(e.message || fallback, 'INVALID');
  }
  return new OneTimeTokenError(fallback, 'INVALID');
}

// ---------- util acak (pakai expo-crypto bila ada, fallback Math.random) ----------
function fallbackHex(nBytes) {
  let s = '';
  for (let i = 0; i < nBytes; i++) s += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return s;
}

async function randomHex(nBytes) {
  try {
    if (Crypto?.getRandomBytesAsync) {
      const bytes = await Crypto.getRandomBytesAsync(nBytes);
      return Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // abaikan, pakai fallback
  }
  return fallbackHex(nBytes);
}

// ---------- secret ----------
export async function getOrCreateSecret() {
  const existing = await storage.get(K_SECRET);
  if (typeof existing === 'string' && existing.length >= 32) return existing;
  const fresh = (await randomHex(32)) + (await randomHex(8)); // 80 hex chars
  await storage.set(K_SECRET, fresh);
  return fresh;
}

/** Putar secret. Semua token lama otomatis tidak valid. */
export async function rotateSecret() {
  const fresh = (await randomHex(32)) + (await randomHex(8));
  await storage.set(K_SECRET, fresh);
  await storage.remove(K_USED);
  return true;
}

// ---------- registry jti terpakai ----------
async function loadUsed() {
  try {
    const raw = await storage.get(K_USED);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

async function saveUsed(map) {
  await storage.set(K_USED, JSON.stringify(map));
}

function purgeExpired(map, now = nowSec()) {
  let changed = false;
  for (const jti of Object.keys(map)) {
    if (typeof map[jti] !== 'number' || map[jti] < now) {
      delete map[jti];
      changed = true;
    }
  }
  return { map, changed };
}

export async function isTokenUsed(jti) {
  const used = await loadUsed();
  return Object.prototype.hasOwnProperty.call(used, jti);
}

/** Hapus semua catatan pemakaian (darurat/testing saja). */
export const clearUsedTokens = () => storage.remove(K_USED);

// ---------- API utama ----------
/**
 * Terbitkan token sekali pakai.
 * @param {object} opts
 * @param {string} opts.sub - identitas pemilik (mis. email/user id). Wajib.
 * @param {string} [opts.purpose='generic'] - ikat token ke satu keperluan.
 * @param {*} [opts.data=null] - data tambahan (harus JSON-serializable, kecil saja).
 * @param {number} [opts.expiresInSec=300] - umur token dalam detik (1..86400).
 * @returns {Promise<string>} token JWT.
 */
export async function createOneTimeToken({ sub, purpose = 'generic', data = null, expiresInSec = OTT_DEFAULT_TTL_SEC } = {}) {
  if (!sub || typeof sub !== 'string' || !sub.trim()) {
    throw new OneTimeTokenError('sub (identitas pemilik) wajib diisi.', 'BAD_ARGS');
  }
  const cleanPurpose = String(purpose || 'generic').trim() || 'generic';
  const ttl = Math.max(1, Math.min(86400, Math.floor(expiresInSec ?? OTT_DEFAULT_TTL_SEC)));
  const secret = await getOrCreateSecret();
  const iat = nowSec();
  const payload = {
    iss: OTT_ISSUER,
    sub: sub.trim(),
    purpose: cleanPurpose,
    data: data ?? null,
    jti: await randomHex(16),
    iat,
    exp: iat + ttl,
  };
  return signJwt(payload, secret);
}

/**
 * Verifikasi token sekali pakai.
 * Default consume=true: token langsung ditandai terpakai, pemakaian ulang ditolak.
 * @param {string} token
 * @param {object} [opts]
 * @param {string} [opts.expectedPurpose] - bila diisi, purpose harus sama persis.
 * @param {string} [opts.expectedSub] - bila diisi, sub harus sama persis.
 * @param {boolean} [opts.consume=true]
 * @returns {Promise<object>} payload JWT bila valid.
 */
export async function verifyOneTimeToken(token, { expectedPurpose, expectedSub, consume = true } = {}) {
  if (!token || typeof token !== 'string') {
    throw new OneTimeTokenError('Token wajib diisi.', 'MALFORMED');
  }
  const secret = await getOrCreateSecret();
  let payload;
  try {
    ({ payload } = verifyJwt(token, secret, { leewaySec: LEEWAY_SEC }));
  } catch (e) {
    throw fromJwtError(e);
  }

  if (payload.iss !== OTT_ISSUER) throw new OneTimeTokenError('Issuer token tidak dikenal.', 'INVALID');
  if (!payload.jti || typeof payload.jti !== 'string') {
    throw new OneTimeTokenError('Token tanpa jti ditolak.', 'INVALID');
  }
  if (expectedPurpose !== undefined && payload.purpose !== expectedPurpose) {
    throw new OneTimeTokenError('Token bukan untuk keperluan ini.', 'PURPOSE_MISMATCH');
  }
  if (expectedSub !== undefined && payload.sub !== expectedSub) {
    throw new OneTimeTokenError('Token bukan milik pengguna ini.', 'SUB_MISMATCH');
  }

  const used = await loadUsed();
  const { map, changed } = purgeExpired(used);
  if (changed) await saveUsed(map);
  if (Object.prototype.hasOwnProperty.call(map, payload.jti)) {
    throw new OneTimeTokenError('Token sudah dipakai.', 'REUSED');
  }

  if (consume) {
    map[payload.jti] = typeof payload.exp === 'number' ? payload.exp : nowSec() + OTT_DEFAULT_TTL_SEC;
    await saveUsed(map);
  }
  return payload;
}

/** Baca isi token tanpa verifikasi signature. Jangan untuk otorisasi. */
export function peekOneTimeToken(token) {
  try {
    return decodeJwt(token).payload;
  } catch (e) {
    throw fromJwtError(e);
  }
}

// ---------- convenience untuk AuthContext ----------
/**
 * Terbitkan token aksi untuk user yang sedang login.
 * @param {{ email?: string, id?: string }} user
 * @param {string} purpose
 */
export async function issueUserActionToken(user, purpose, { data = null, expiresInSec = OTT_DEFAULT_TTL_SEC } = {}) {
  const sub = user?.email || user?.id;
  if (!sub) throw new OneTimeTokenError('User tidak valid untuk diterbitkan token.', 'BAD_ARGS');
  return createOneTimeToken({ sub: String(sub).trim().toLowerCase(), purpose, data, expiresInSec });
}

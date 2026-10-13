// JWT sekali pakai (one-time token). Kompatibel dengan utils/jwt.js di aplikasi Expo
// (sama-sama HS256 standar, bisa diverifikasi silang selama JWT_SECRET sama).
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtSecret, ottTtlSec } = require('./config');
const { ISSUER: ISS } = require('./jwt');
const { load, save, purgeUsedOtt } = require('./store');

class OttError extends Error {
  constructor(message, code, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function issueOtt({ sub, purpose = 'generic', data = null, expiresInSec = ottTtlSec }) {
  if (!sub || typeof sub !== 'string' || !sub.trim()) throw new OttError('sub wajib diisi.', 'BAD_ARGS');
  const ttl = Math.max(1, Math.min(86400, Math.floor(expiresInSec ?? ottTtlSec)));
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: sub.trim(),
    purpose: String(purpose || 'generic').trim() || 'generic',
    data: data ?? null,
    jti: crypto.randomUUID(),
    kind: 'ott',
  };
  const token = jwt.sign(payload, jwtSecret, { issuer: ISS, expiresIn: ttl });
  return { token, expiresAt: (now + ttl) * 1000 };
}

function verifyOtt(token, { expectedPurpose, expectedSub, consume = true } = {}) {
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { issuer: ISS });
  } catch (e) {
    if (e.name === 'TokenExpiredError') throw new OttError('Token kedaluwarsa.', 'EXPIRED', 410);
    throw new OttError('Token tidak valid.', 'INVALID', 401);
  }
  if (payload.kind !== 'ott') throw new OttError('Bukan token sekali pakai.', 'INVALID', 401);
  if (!payload.jti) throw new OttError('Token tanpa jti ditolak.', 'INVALID', 401);
  if (expectedPurpose !== undefined && payload.purpose !== expectedPurpose) {
    throw new OttError('Token bukan untuk keperluan ini.', 'PURPOSE_MISMATCH', 403);
  }
  if (expectedSub !== undefined && payload.sub !== expectedSub) {
    throw new OttError('Token bukan milik pengguna ini.', 'SUB_MISMATCH', 403);
  }
  const db = load();
  purgeUsedOtt(db);
  if (Object.prototype.hasOwnProperty.call(db.usedOtt, payload.jti)) {
    throw new OttError('Token sudah dipakai.', 'REUSED', 409);
  }
  if (consume) {
    db.usedOtt[payload.jti] = payload.exp;
    save(db);
  }
  return payload;
}

module.exports = { OttError, issueOtt, verifyOtt };

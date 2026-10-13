// JWT HS256 murni tanpa dependensi native.
// Kompatibel Expo (iOS/Android/Web) + Node. Tidak memakai Buffer/btoa.

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// ---------- UTF-8 ----------
function utf8Encode(str) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  // Fallback manual (Expo Hermes lama / JSC tanpa TextEncoder)
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      const cp = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return Uint8Array.from(out);
}

function utf8Decode(bytes) {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
  let s = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++];
    if (b < 0x80) s += String.fromCharCode(b);
    else if (b < 0xe0) s += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else if (b < 0xf0)
      s += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
    else {
      const cp =
        ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      const c = cp - 0x10000;
      s += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff));
    }
  }
  return s;
}

// ---------- Base64 / Base64URL (implementasi sendiri, aman biner) ----------
function base64EncodeBytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    s += B64_CHARS[(n >> 18) & 63] + B64_CHARS[(n >> 12) & 63];
    s += i + 1 < bytes.length ? B64_CHARS[(n >> 6) & 63] : '=';
    s += i + 2 < bytes.length ? B64_CHARS[n & 63] : '=';
  }
  return s;
}

function base64DecodeToBytes(b64) {
  const clean = String(b64).replace(/[^A-Za-z0-9+/=]/g, '');
  const lookup = {};
  for (let i = 0; i < 64; i++) lookup[B64_CHARS[i]] = i;
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean[i]] ?? 0;
    const b = lookup[clean[i + 1]] ?? 0;
    const c = clean[i + 2] === '=' ? 0 : lookup[clean[i + 2]] ?? 0;
    const d = clean[i + 3] === '=' ? 0 : lookup[clean[i + 3]] ?? 0;
    const n = (a << 18) | (b << 12) | (c << 6) | d;
    out.push((n >> 16) & 0xff);
    if (clean[i + 2] !== '=') out.push((n >> 8) & 0xff);
    if (clean[i + 3] !== '=') out.push(n & 0xff);
  }
  return Uint8Array.from(out);
}

export function base64urlEncode(input) {
  const bytes = typeof input === 'string' ? utf8Encode(input) : input;
  return base64EncodeBytes(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64urlDecodeToBytes(segment) {
  let b64 = String(segment).replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  return base64DecodeToBytes(b64);
}

export function base64urlDecodeToString(segment) {
  return utf8Decode(base64urlDecodeToBytes(segment));
}

// ---------- SHA-256 (murni JS, operasi pada bytes) ----------
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Bytes(messageBytes) {
  const msg = messageBytes instanceof Uint8Array ? messageBytes : Uint8Array.from(messageBytes);
  const bitLen = msg.length * 8;
  // Padding: 0x80 + nol sampai panjang % 64 == 56, lalu 8 byte panjang big-endian.
  const withOne = msg.length + 1;
  const padLen = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + padLen + 8;
  const padded = new Uint8Array(total);
  padded.set(msg, 0);
  padded[msg.length] = 0x80;
  // Panjang 64-bit big-endian (cukup 53-bit aman JS untuk pesan wajar).
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  padded[total - 8] = (hi >>> 24) & 0xff;
  padded[total - 7] = (hi >>> 16) & 0xff;
  padded[total - 6] = (hi >>> 8) & 0xff;
  padded[total - 5] = hi & 0xff;
  padded[total - 4] = (lo >>> 24) & 0xff;
  padded[total - 3] = (lo >>> 16) & 0xff;
  padded[total - 2] = (lo >>> 8) & 0xff;
  padded[total - 1] = lo & 0xff;

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Array(64);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] =
        ((padded[off + i * 4] << 24) |
          (padded[off + i * 4 + 1] << 16) |
          (padded[off + i * 4 + 2] << 8) |
          padded[off + i * 4 + 3]) >>>
        0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (hs[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (hs[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (hs[i] >>> 8) & 0xff;
    out[i * 4 + 3] = hs[i] & 0xff;
  }
  return out;
}

export function hmacSha256(keyBytes, messageBytes) {
  let key = keyBytes instanceof Uint8Array ? keyBytes : Uint8Array.from(keyBytes);
  const msg = messageBytes instanceof Uint8Array ? messageBytes : Uint8Array.from(messageBytes);
  if (key.length > 64) key = sha256Bytes(key);
  const padded = new Uint8Array(64);
  padded.set(key.subarray(0, 64), 0);
  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = padded[i] ^ 0x36;
    opad[i] = padded[i] ^ 0x5c;
  }
  const inner = new Uint8Array(64 + msg.length);
  inner.set(ipad, 0);
  inner.set(msg, 64);
  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad, 0);
  outer.set(innerHash, 64);
  return sha256Bytes(outer);
}

// ---------- JWT HS256 ----------
export class JwtError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'JwtError';
    this.code = code;
  }
}

function toSecretBytes(secret) {
  if (secret instanceof Uint8Array) return secret;
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new JwtError('Secret minimal 16 karakter.', 'BAD_SECRET');
  }
  return utf8Encode(secret);
}

export function signJwt(payload, secret, header = { alg: 'HS256', typ: 'JWT' }) {
  if (!payload || typeof payload !== 'object') throw new JwtError('Payload harus objek.', 'BAD_PAYLOAD');
  const h = { alg: 'HS256', typ: 'JWT', ...(header || {}) };
  if (h.alg !== 'HS256') throw new JwtError('Hanya HS256 yang didukung.', 'BAD_ALG');
  const signingInput = `${base64urlEncode(JSON.stringify(h))}.${base64urlEncode(JSON.stringify(payload))}`;
  const sig = hmacSha256(toSecretBytes(secret), utf8Encode(signingInput));
  return `${signingInput}.${base64urlEncode(sig)}`;
}

export function decodeJwt(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new JwtError('Format token harus 3 bagian.', 'MALFORMED');
  try {
    return {
      header: JSON.parse(base64urlDecodeToString(parts[0])),
      payload: JSON.parse(base64urlDecodeToString(parts[1])),
      signingInput: `${parts[0]}.${parts[1]}`,
      signature: parts[2],
    };
  } catch {
    throw new JwtError('Payload/header bukan JSON valid.', 'MALFORMED');
  }
}

export function safeEqualStr(a, b) {
  const x = String(a);
  const y = String(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

export function verifyJwt(token, secret, { leewaySec = 30 } = {}) {
  const { header, payload, signingInput, signature } = decodeJwt(token);
  if (header.alg !== 'HS256') throw new JwtError(`Algoritma ${header.alg} ditolak.`, 'BAD_ALG');
  const expected = base64urlEncode(hmacSha256(toSecretBytes(secret), utf8Encode(signingInput)));
  if (!safeEqualStr(signature, expected)) throw new JwtError('Signature tidak valid.', 'BAD_SIGNATURE');
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && now > payload.exp + leewaySec) {
    throw new JwtError('Token kedaluwarsa.', 'EXPIRED');
  }
  if (typeof payload.nbf === 'number' && now + leewaySec < payload.nbf) {
    throw new JwtError('Token belum aktif.', 'NOT_ACTIVE');
  }
  return { header, payload };
}

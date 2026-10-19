// ============================================================
// API CLIENT generik berbasis fetch bawaan React Native.
// Dipakai semua service agar baseURL, timeout, header, dan
// penanganan error terpusat di satu tempat.
// ============================================================
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { storage } from './storage';

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const K_TOKEN = 'laporcepat.jwt';

function withTimeout(signal, ms, controller) {
  if (!ms) return null;
  const id = setTimeout(() => controller.abort(), ms);
  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      controller.abort();
    });
  }
  return id;
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) throw new ApiError('API_BASE_URL belum diisi. Aktifkan mock atau isi URL backend di config.js');
  const base = API_BASE_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return base + suffix;
}

async function getAuthHeader() {
  let token = null;
  try {
    const raw = await storage.get(K_TOKEN);
    if (raw) token = JSON.parse(raw).token || raw;
  } catch {}
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setJwtToken(token) {
  return storage.set(K_TOKEN, typeof token === 'string' ? token : JSON.stringify(token));
}

export function clearJwtToken() {
  return storage.remove(K_TOKEN);
}

/**
 * @param {string} path  contoh '/laporan' atau URL penuh
 * @param {object} opts  { method, body, headers, timeout, signal, skipAuth }
 */
export async function request(path, opts = {}) {
  const { method = 'GET', body, headers = {}, timeout = API_TIMEOUT_MS, signal, skipAuth } = opts;
  const url = buildUrl(path);
  const controller = new AbortController();
  const timer = withTimeout(signal, timeout, controller);

  const authHeaders = skipAuth ? {} : await getAuthHeader();

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...authHeaders, ...headers },
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `Request gagal (${res.status})`;
      throw new ApiError(msg, res.status, data);
    }
    return data;
  } catch (e) {
    if (e?.name === 'AbortError') throw new ApiError('Waktu request habis. Periksa koneksi lalu coba lagi.');
    if (e instanceof ApiError) throw e;
    throw new ApiError(e?.message || 'Gagal terhubung ke server.');
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

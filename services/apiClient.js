// ============================================================
// API CLIENT generik berbasis fetch bawaan React Native.
// Dipakai semua service agar baseURL, timeout, header, dan
// penanganan error terpusat di satu tempat.
//
// TASK 01 — HANDLE API ERROR:
//   2xx  -> data dikembalikan apa adanya.
//   4xx  -> pesan client error (400/401/403/404) yang jelas.
//   5xx  -> pesan server error (500/503).
//   Request gagal -> deteksi offline / network error.
// Semua error dilempar sebagai ApiError agar UI mudah membedakan.
// ============================================================
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { storage } from './storage';

// Pesan standar sesuai brief Mobile Programming.
export const PESAN_API = {
  offline: 'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.',
  server: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  tidakDitemukan: 'Data tidak ditemukan. Laporan yang Anda cari tidak tersedia.',
  tidakTersedia: 'Data tidak ditemukan. Layanan yang Anda cari tidak tersedia.',
  timeout: 'Waktu request habis. Periksa koneksi lalu coba lagi.',
  gagal: 'Gagal mengambil data. Silakan coba lagi.',
};

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.offline = false;
    this.kategori = kategoriDefault(status);
  }
}

function kategoriDefault(status) {
  if (status >= 500) return 'server';
  if (status === 404 || status === 403) return 'notfound';
  if (status >= 400) return 'client';
  return 'generic';
}

// Helper untuk membedakan jenis error di UI (icon & pesan).
export function kategoriError(e) {
  if (e?.offline) return 'offline';
  if (e?.kategori === 'timeout') return 'timeout';
  return e?.kategori || 'generic';
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

function pesanDariStatus(res, data) {
  // 4xx: pesan spesifik dari server lebih diutamakan, lalu fallback per status.
  if (res.status === 404) return (data?.message) || PESAN_API.tidakDitemukan;
  if (res.status === 403) return (data?.message) || 'Akses ditolak. Anda tidak punya izin (403).';
  if (res.status === 401) return (data?.message) || 'Sesi berakhir. Silakan masuk kembali (401).';
  if (res.status === 400) return (data?.message) || 'Permintaan tidak valid. Periksa isian Anda (400).';
  if (res.status >= 500) return (data?.message) || PESAN_API.server;
  return (data && (data.message || data.error)) || `Request gagal (${res.status})`;
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

    // ---- 2xx: sukses ----
    if (res.ok) return data;

    // ---- 4xx & 5xx: HTTP error -> ApiError bertanda kategori ----
    const err = new ApiError(pesanDariStatus(res, data), res.status, data);
    throw err;
  } catch (e) {
    // ---- Timeout ----
    if (e?.name === 'AbortError') {
      const err = new ApiError(PESAN_API.timeout, 0);
      err.kategori = 'timeout';
      throw err;
    }
    if (e instanceof ApiError) throw e;
    // ---- Request gagal: tidak ada koneksi / network error ----
    const offline =
      e instanceof TypeError ||
      /network request failed|failed to fetch|networkerror|gagal terhubung/i.test(e?.message || '');
    if (offline) {
      const err = new ApiError(PESAN_API.offline, 0, { offline: true });
      err.offline = true;
      throw err;
    }
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

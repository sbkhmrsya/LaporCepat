import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { storage } from './storage';

export type KategoriError = 'server' | 'notfound' | 'client' | 'generic' | 'timeout' | 'offline';

export const PESAN_API = {
  offline: 'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.',
  server: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  tidakDitemukan: 'Data tidak ditemukan. Laporan yang Anda cari tidak tersedia.',
  tidakTersedia: 'Data tidak ditemukan. Layanan yang Anda cari tidak tersedia.',
  timeout: 'Waktu request habis. Periksa koneksi lalu coba lagi.',
  gagal: 'Gagal mengambil data. Silakan coba lagi.',
} as const;

export class ApiError extends Error {
  status: number;
  data: any;
  offline: boolean;
  kategori: KategoriError;

  constructor(message: string, status = 0, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.offline = false;
    this.kategori = kategoriDefault(status);
  }
}

function kategoriDefault(status: number): KategoriError {
  if (status >= 500) return 'server';
  if (status === 404 || status === 403) return 'notfound';
  if (status >= 400) return 'client';
  return 'generic';
}

export function kategoriError(e: unknown): KategoriError {
  const err = e as Partial<ApiError> | null | undefined;
  if (err?.offline) return 'offline';
  if (err?.kategori === 'timeout') return 'timeout';
  return err?.kategori || 'generic';
}

const K_TOKEN = 'laporcepat.jwt';

function withTimeout(signal: AbortSignal | undefined, ms: number, controller: AbortController): ReturnType<typeof setTimeout> | null {
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

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) throw new ApiError('API_BASE_URL belum diisi. Aktifkan mock atau isi URL backend di config.js');
  const base = API_BASE_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return base + suffix;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  let token: string | null = null;
  try {
    const raw = await storage.get(K_TOKEN);
    if (raw) token = JSON.parse(raw).token || raw;
  } catch { /* abaikan */ }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setJwtToken(token: string | { token?: string }): Promise<void> {
  return storage.set(K_TOKEN, typeof token === 'string' ? token : JSON.stringify(token));
}

export function clearJwtToken(): Promise<void> {
  return storage.remove(K_TOKEN);
}

function pesanDariStatus(res: Response, data: any): string {
  // 4xx: pesan spesifik dari server lebih diutamakan, lalu fallback per status.
  if (res.status === 404) return (data?.message) || PESAN_API.tidakDitemukan;
  if (res.status === 403) return (data?.message) || 'Akses ditolak. Anda tidak punya izin (403).';
  if (res.status === 401) return (data?.message) || 'Sesi berakhir. Silakan masuk kembali (401).';
  if (res.status === 400) return (data?.message) || 'Permintaan tidak valid. Periksa isian Anda (400).';
  if (res.status >= 500) return (data?.message) || PESAN_API.server;
  return (data && (data.message || data.error)) || `Request gagal (${res.status})`;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

/**
 * path: contoh '/laporan' atau URL penuh
 * opts: { method, body, headers, timeout, signal, skipAuth }
 */
export async function request(path: string, opts: RequestOptions = {}): Promise<any> {
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
    let data: any = null;
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
  } catch (e: any) {
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
  get: (path: string, opts?: RequestOptions) => request(path, { ...opts, method: 'GET' }),
  post: (path: string, body?: unknown, opts?: RequestOptions) => request(path, { ...opts, method: 'POST', body }),
  patch: (path: string, body?: unknown, opts?: RequestOptions) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path: string, body?: unknown, opts?: RequestOptions) => request(path, { ...opts, method: 'PUT', body }),
  del: (path: string, opts?: RequestOptions) => request(path, { ...opts, method: 'DELETE' }),
};

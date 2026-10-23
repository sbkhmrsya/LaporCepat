// ============================================================
// LAPORAN API — CRUD laporan dengan data modeling Lengkap.
// Mode ganda:
//  1. MOCK (default): API_BASE_URL kosong -> simulasi network lokal.
//  2. REAL: isi API_BASE_URL di config.js -> request ke backend.
// Endpoint:
//   GET    /laporan
//   GET    /laporan/:id
//   POST   /laporan          { judul, lokasi, status, emoji, deskripsi }
//   PATCH  /laporan/:id      { judul?, lokasi?, status?, emoji?, deskripsi? }
//   DELETE /laporan/:id
// ============================================================
import { API_BASE_URL } from '../config';
import { api, ApiError, PESAN_API } from './apiClient';
import { laporanAwal } from '../data/laporanAwal';
import { Laporan, STATUS_VALID } from '../data/models';

export { ApiError, Laporan, STATUS_VALID };
export const isMockMode = () => !API_BASE_URL;

const MOCK_DELAY_MS = 600;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// SIMULATOR KONDISI API (mode mock) — untuk praktikum TASK 01..03
// 'normal'  -> semua request sukses (2xx)
// 'offline' -> semua request gagal: tidak ada koneksi
// '404'     -> client error: data tidak ditemukan
// '500'     -> server error: server sedang gangguan
// ============================================================
export const MODE_SIMULASI = [
  { id: 'normal', label: 'Normal (2xx)', icon: 'checkmark-circle' },
  { id: 'offline', label: 'Tanpa Internet', icon: 'cloud-offline-outline' },
  { id: '404', label: 'Client Error 404', icon: 'alert-circle-outline' },
  { id: '500', label: 'Server Error 500', icon: 'server-outline' },
];
let modeSimulasi = 'normal';
export function setSimulasi(m) { modeSimulasi = m; }
export function getSimulasi() { return modeSimulasi; }

// Dipanggil di setiap endpoint mock; melempar error sesuai mode simulasi.
function lemparSimulasi() {
  if (modeSimulasi === 'offline') {
    const e = new ApiError(PESAN_API.offline, 0, { offline: true });
    e.offline = true;
    throw e;
  }
  if (modeSimulasi === '404') throw new ApiError(PESAN_API.tidakDitemukan, 404);
  if (modeSimulasi === '500') throw new ApiError(PESAN_API.server, 500);
}

let mockDb = laporanAwal.map((x) => Laporan.fromMock(x));

function validateInput({ judul, lokasi, status }) {
  const e = {};
  if (!String(judul || '').trim()) e.judul = 'Judul wajib diisi.';
  if (!String(lokasi || '').trim()) e.lokasi = 'Lokasi wajib diisi.';
  if (status && !STATUS_VALID.includes(status)) e.status = `Status harus salah satu: ${STATUS_VALID.join(', ')}.`;
  if (Object.keys(e).length) throw new ApiError('Validasi gagal.', 400, e);
}

// ---------------- READ ----------------
export async function getLaporan() {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
    lemparSimulasi();
    return mockDb.map((x) => new Laporan(x.toJSON()));
  }
  const data = await api.get('/laporan');
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.map((row) => Laporan.fromBackend(row));
}

export async function getLaporanById(id) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const found = mockDb.find((x) => String(x.id) === String(id));
    if (!found) throw new ApiError('Laporan tidak ditemukan.', 404);
    return new Laporan(found.toJSON());
  }
  return Laporan.fromBackend(await api.get(`/laporan/${id}`));
}

// ---------------- CREATE ----------------
export async function createLaporan({ judul, lokasi, emoji = '💡', status = 'Dilaporkan', deskripsi = '', lat = null, lng = null }) {
  validateInput({ judul, lokasi, status });
  const baru = new Laporan({ judul, lokasi, emoji, status, deskripsi, lat, lng });
  baru.validate();

  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
    lemparSimulasi();
    const entitas = {
      ...baru.toJSON(),
      id: String(Date.now()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const model = Laporan.fromMock(entitas);
    mockDb = [model, ...mockDb];
    return model;
  }
  return Laporan.fromBackend(await api.post('/laporan', baru.toPayload()));
}

// ---------------- UPDATE ----------------
export async function updateLaporan(id, patch) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    lemparSimulasi();
    const i = mockDb.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new ApiError('Laporan tidak ditemukan.', 404);
    const gabungan = new Laporan({ ...mockDb[i].toJSON(), ...patch, updatedAt: Date.now() });
    gabungan.validate();
    mockDb[i] = gabungan;
    return gabungan;
  }
  return Laporan.fromBackend(await api.patch(`/laporan/${id}`, patch));
}

// ---------------- DELETE ----------------
export async function deleteLaporan(id) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    lemparSimulasi();
    mockDb = mockDb.filter((x) => String(x.id) !== String(id));
    return true;
  }
  await api.del(`/laporan/${id}`);
  return true;
}

// Reset mock ke data awal (berguna untuk demo/praktikum).
export function resetMock() {
  mockDb = laporanAwal.map((x) => Laporan.fromMock(x));
}

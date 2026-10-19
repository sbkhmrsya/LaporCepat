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
import { api, ApiError } from './apiClient';
import { laporanAwal } from '../data/laporanAwal';
import { Laporan, STATUS_VALID } from '../data/models';

export { ApiError, Laporan, STATUS_VALID };
export const isMockMode = () => !API_BASE_URL;

const MOCK_DELAY_MS = 600;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
export async function createLaporan({ judul, lokasi, emoji = '💡', status = 'Dilaporkan', deskripsi = '' }) {
  validateInput({ judul, lokasi, status });
  const baru = new Laporan({ judul, lokasi, emoji, status, deskripsi });
  baru.validate();

  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
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

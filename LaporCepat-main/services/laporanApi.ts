import { API_BASE_URL } from '../config';
import { api, ApiError, PESAN_API } from './apiClient';
import { laporanAwal } from '../data/laporanAwal';
import { Laporan, STATUS_VALID } from '../data/models';
import type { LaporanProps, StatusLaporan } from '../data/models';
import { delay } from '../utils/delay';

export type { StatusLaporan };
import type { IconName } from '../theme';

export { ApiError, Laporan, STATUS_VALID };
export const isMockMode = (): boolean => !API_BASE_URL;

export interface LaporanBaru {
  judul: string;
  lokasi: string;
  emoji?: string;
  status?: StatusLaporan;
  deskripsi?: string;
  lat?: number | null;
  lng?: number | null;
  foto?: string | null;
}

export type LaporanId = LaporanProps['id'];

const MOCK_DELAY_MS = 600;

export interface ModeSimulasiItem { id: 'normal' | 'offline' | '404' | '500'; label: string; icon: IconName }

export const MODE_SIMULASI: ModeSimulasiItem[] = [
  { id: 'normal', label: 'Normal (2xx)', icon: 'checkmark-circle' },
  { id: 'offline', label: 'Tanpa Internet', icon: 'cloud-offline-outline' },
  { id: '404', label: 'Client Error 404', icon: 'alert-circle-outline' },
  { id: '500', label: 'Server Error 500', icon: 'server-outline' },
];
let modeSimulasi: ModeSimulasiItem['id'] = 'normal';
export function setSimulasi(m: ModeSimulasiItem['id']): void { modeSimulasi = m; }
export function getSimulasi(): ModeSimulasiItem['id'] { return modeSimulasi; }

function lemparSimulasi(): void {
  if (modeSimulasi === 'offline') {
    const e = new ApiError(PESAN_API.offline, 0, { offline: true });
    e.offline = true;
    throw e;
  }
  if (modeSimulasi === '404') throw new ApiError(PESAN_API.tidakDitemukan, 404);
  if (modeSimulasi === '500') throw new ApiError(PESAN_API.server, 500);
}

let mockDb: Laporan[] = laporanAwal.map((x) => Laporan.fromMock(x));

function validateInput({ judul, lokasi, status }: { judul?: string; lokasi?: string; status?: StatusLaporan }): void {
  const e: Record<string, string> = {};
  if (!String(judul || '').trim()) e.judul = 'Judul wajib diisi.';
  if (!String(lokasi || '').trim()) e.lokasi = 'Lokasi wajib diisi.';
  if (status && !STATUS_VALID.includes(status)) e.status = `Status harus salah satu: ${STATUS_VALID.join(', ')}.`;
  if (Object.keys(e).length) throw new ApiError('Validasi gagal.', 400, e);
}

export async function getLaporan(): Promise<Laporan[]> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
    lemparSimulasi();
    return mockDb.map((x) => new Laporan(x.toJSON()));
  }
  const data = await api.get('/laporan');
  const list: any[] = Array.isArray(data) ? data : data?.data ?? [];
  return list.map((row) => Laporan.fromBackend(row));
}

export async function getLaporanById(id: LaporanId): Promise<Laporan> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const found = mockDb.find((x) => String(x.id) === String(id));
    if (!found) throw new ApiError('Laporan tidak ditemukan.', 404);
    return new Laporan(found.toJSON());
  }
  return Laporan.fromBackend(await api.get(`/laporan/${id}`));
}

export async function createLaporan({ judul, lokasi, emoji = '💡', status = 'Dilaporkan', deskripsi = '', lat = null, lng = null, foto = null }: LaporanBaru): Promise<Laporan> {
  validateInput({ judul, lokasi, status });
  const baru = new Laporan({ judul, lokasi, emoji, status, deskripsi, lat, lng, foto });
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

export async function updateLaporan(id: LaporanId, patch: Partial<LaporanProps>): Promise<Laporan> {
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

export async function deleteLaporan(id: LaporanId): Promise<boolean> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    lemparSimulasi();
    mockDb = mockDb.filter((x) => String(x.id) !== String(id));
    return true;
  }
  await api.del(`/laporan/${id}`);
  return true;
}

export function resetMock(): void {
  mockDb = laporanAwal.map((x) => Laporan.fromMock(x));
}

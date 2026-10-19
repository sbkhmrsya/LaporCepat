// ============================================================
// USER API — RESTful endpoints untuk manajemen user/profil.
// Mode ganda: MOCK (localStorage simulasi) atau REAL (backend).
// Endpoint:
//   GET    /users          -> list user
//   GET    /users/:id      -> detail user
//   PATCH  /users/:id      -> update profil
//   DELETE /users/:id      -> hapus akun
// ============================================================
import { API_BASE_URL } from '../config';
import { api, ApiError } from './apiClient';
import { User, ValidationError } from '../data/models';

export { ApiError, ValidationError };
export const isMockMode = () => !API_BASE_URL;

const MOCK_DELAY_MS = 500;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Simulasi database user lokal untuk mode mock.
let mockUsers = [];

function seedMock() {
  if (mockUsers.length > 0) return;
  mockUsers = [
    new User({ id: '1', nama: 'Warga Demo', username: 'demo', email: 'demo@laporcepat.id', role: 'warga', createdAt: Date.now() }),
  ];
}
seedMock();

const toJson = (user) => user.toJSON();
const fromJson = (obj) => User.fromBackend(obj);

// ---------------- READ ----------------
export async function getUsers() {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
    return mockUsers.map((u) => ({ ...u }));
  }
  const data = await api.get('/users');
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.map(fromJson);
}

export async function getUserById(id) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const found = mockUsers.find((u) => String(u.id) === String(id));
    if (!found) throw new ApiError('User tidak ditemukan.', 404);
    return { ...found };
  }
  return fromJson(await api.get(`/users/${id}`));
}

// ---------------- UPDATE ----------------
export async function updateUser(id, patch) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const i = mockUsers.findIndex((u) => String(u.id) === String(id));
    if (i < 0) throw new ApiError('User tidak ditemukan.', 404);
    const gabungan = new User({ ...mockUsers[i], ...patch });
    gabungan.validate();
    mockUsers[i] = gabungan;
    return { ...gabungan };
  }
  return fromJson(await api.patch(`/users/${id}`, patch));
}

// ---------------- DELETE ----------------
export async function deleteUser(id) {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const i = mockUsers.findIndex((u) => String(u.id) === String(id));
    if (i < 0) throw new ApiError('User tidak ditemukan.', 404);
    mockUsers = mockUsers.filter((u) => String(u.id) !== String(id));
    return true;
  }
  await api.del(`/users/${id}`);
  return true;
}

// Reset mock user ke data awal (demo/praktikum).
export function resetMockUsers() {
  mockUsers = [];
  seedMock();
}

export { User };

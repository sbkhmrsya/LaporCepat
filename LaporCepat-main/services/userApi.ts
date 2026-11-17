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
import type { UserProps } from '../data/models';
import { delay } from '../utils/delay';

export { ApiError, ValidationError };
export const isMockMode = (): boolean => !API_BASE_URL;

const MOCK_DELAY_MS = 500;

let mockUsers: User[] = [];

function seedMock(): void {
  if (mockUsers.length > 0) return;
  mockUsers = [
    new User({ id: '1', nama: 'Warga Demo', username: 'demo', email: 'demo@laporcepat.id', role: 'warga', createdAt: Date.now() }),
  ];
}
seedMock();

const fromJson = (obj: any): User => User.fromBackend(obj);

export async function getUsers(): Promise<User[]> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS);
    return mockUsers.map((u) => ({ ...u }) as User);
  }
  const data = await api.get('/users');
  const list: any[] = Array.isArray(data) ? data : data?.data ?? [];
  return list.map(fromJson);
}

export async function getUserById(id: string | number | null): Promise<User> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const found = mockUsers.find((u) => String(u.id) === String(id));
    if (!found) throw new ApiError('User tidak ditemukan.', 404);
    return { ...found } as User;
  }
  return fromJson(await api.get(`/users/${id}`));
}

export async function updateUser(id: string | number | null, patch: Partial<UserProps>): Promise<User> {
  if (isMockMode()) {
    await delay(MOCK_DELAY_MS / 2);
    const i = mockUsers.findIndex((u) => String(u.id) === String(id));
    if (i < 0) throw new ApiError('User tidak ditemukan.', 404);
    const gabungan = new User({ ...mockUsers[i].toJSON(), ...patch });
    gabungan.validate();
    mockUsers[i] = gabungan;
    return { ...gabungan } as User;
  }
  return fromJson(await api.patch(`/users/${id}`, patch));
}

export async function deleteUser(id: string | number | null): Promise<boolean> {
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

export function resetMockUsers(): void {
  mockUsers = [];
  seedMock();
}

export { User };

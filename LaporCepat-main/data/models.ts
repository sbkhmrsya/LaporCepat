// ============================================================
// DATA MODELING — entitas domain LaporCepat.
// Setiap model memiliki: validasi, dari backend (mapper),
// ke backend (payload), dan representasi default.
// ============================================================

export type StatusLaporan = 'Dilaporkan' | 'Diverifikasi' | 'Dikerjakan' | 'Selesai' | 'Ditolak';

export const STATUS_VALID: StatusLaporan[] = ['Dilaporkan', 'Diverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak'];

export class ValidationError extends Error {
  errors: Record<string, string>;
  constructor(errors: Record<string, string> = {}) {
    super('Validasi gagal.');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ---------- util ----------
const required = (val: unknown, field: string): string | null => {
  if (val == null || String(val).trim() === '') return `${field} wajib diisi.`;
  return null;
};
const inEnum = (val: StatusLaporan, allowed: StatusLaporan[], field: string): string | null => {
  if (!allowed.includes(val)) return `${field} harus salah satu: ${allowed.join(', ')}.`;
  return null;
};

// ============================================================
// MODEL: Laporan
// Bentuk: { id, judul, lokasi, status, emoji, deskripsi, createdAt, updatedAt }
// ============================================================
export interface LaporanProps {
  id?: string | number | null;
  judul?: string;
  lokasi?: string;
  status?: StatusLaporan;
  emoji?: string;
  deskripsi?: string;
  lat?: number | null;
  lng?: number | null;
  foto?: string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
}

type LaporanRow = Partial<LaporanProps> & Record<string, any>;

export class Laporan {
  id: string | number | null;
  judul: string;
  lokasi: string;
  status: StatusLaporan;
  emoji: string;
  deskripsi: string;
  lat: number | null;
  lng: number | null;
  foto: string | null;
  createdAt: number | string | null;
  updatedAt: number | string | null;

  constructor({
    id = null,
    judul = '',
    lokasi = '',
    status = 'Dilaporkan',
    emoji = '🕳️',
    deskripsi = '',
    lat = null,
    lng = null,
    foto = null,
    createdAt = null,
    updatedAt = null,
  }: LaporanProps = {}) {
    this.id = id;
    this.judul = String(judul).trim();
    this.lokasi = String(lokasi).trim();
    this.status = status;
    this.emoji = emoji;
    this.deskripsi = String(deskripsi).trim();
    this.lat = lat != null ? Number(lat) : null;
    this.lng = lng != null ? Number(lng) : null;
    this.foto = foto ?? null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate(): true {
    const e: Record<string, string> = {};
    const rJudul = required(this.judul, 'Judul');
    if (rJudul) e.judul = rJudul;
    const rLokasi = required(this.lokasi, 'Lokasi');
    if (rLokasi) e.lokasi = rLokasi;
    const rStatus = inEnum(this.status, STATUS_VALID, 'Status');
    if (rStatus) e.status = rStatus;
    if (Object.keys(e).length) throw new ValidationError(e);
    return true;
  }

  isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch { return false; }
  }

  toPayload(): { judul: string; lokasi: string; status: StatusLaporan; emoji: string; deskripsi: string; foto?: string; lat?: number; lng?: number } {
    const payload: ReturnType<Laporan['toPayload']> = {
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
    };
    // Koordinat & foto hanya dikirim bila ada.
    if (this.lat != null && this.lng != null) {
      payload.lat = this.lat;
      payload.lng = this.lng;
    }
    if (this.foto) payload.foto = this.foto;
    return payload;
  }

  toJSON(): Required<Omit<LaporanProps, 'status'>> & { status: StatusLaporan } {
    return {
      id: this.id,
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
      lat: this.lat,
      lng: this.lng,
      foto: this.foto,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromBackend(row: LaporanRow): Laporan {
    return new Laporan({
      id: row.id ?? row._id ?? null,
      judul: row.judul ?? row.title ?? '',
      lokasi: row.lokasi ?? row.location ?? '',
      status: (row.status as StatusLaporan) ?? 'Dilaporkan',
      emoji: row.emoji ?? '🕳️',
      deskripsi: row.deskripsi ?? row.description ?? '',
      lat: row.lat ?? row.latitude ?? null,
      lng: row.lng ?? row.longitude ?? null,
      foto: row.foto ?? row.photo ?? row.image ?? null,
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    });
  }

  static fromMock(row: LaporanRow): Laporan {
    return new Laporan({
      id: row.id,
      judul: row.judul,
      lokasi: row.lokasi,
      status: (row.status as StatusLaporan) ?? 'Dilaporkan',
      emoji: row.emoji,
      deskripsi: row.deskripsi ?? '',
      lat: row.lat ?? null,
      lng: row.lng ?? null,
      foto: row.foto ?? null,
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    });
  }
}

// ============================================================
// MODEL: User
// Bentuk: { id, nama, username, email, role, createdAt }
// ============================================================
export interface UserProps {
  id?: string | number | null;
  nama?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: number | string | null;
}

type UserRow = Partial<UserProps> & Record<string, any>;

export class User {
  id: string | number | null;
  nama: string;
  username: string;
  email: string;
  role: string;
  createdAt: number | string | null;

  constructor({ id = null, nama = '', username = '', email = '', role = 'warga', createdAt = null }: UserProps = {}) {
    this.id = id;
    this.nama = String(nama).trim();
    this.username = String(username).trim();
    this.email = String(email).trim().toLowerCase();
    this.role = role;
    this.createdAt = createdAt;
  }

  validate(): true {
    const e: Record<string, string> = {};
    const rNama = required(this.nama, 'Nama');
    if (rNama) e.nama = rNama;
    const rUsername = required(this.username, 'Username');
    if (rUsername) e.username = rUsername;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!reEmail.test(this.email)) e.email = 'Format email tidak valid.';
    if (Object.keys(e).length) throw new ValidationError(e);
    return true;
  }

  isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch { return false; }
  }

  toPayload(): { nama: string; username: string; email: string; role: string } {
    return { nama: this.nama, username: this.username, email: this.email, role: this.role };
  }

  toJSON(): Required<UserProps> {
    return { id: this.id, nama: this.nama, username: this.username, email: this.email, role: this.role, createdAt: this.createdAt };
  }

  static fromBackend(row: UserRow): User {
    return new User({
      id: row.id ?? row._id ?? null,
      nama: row.nama ?? '',
      username: row.username ?? '',
      email: row.email ?? '',
      role: row.role ?? 'warga',
      createdAt: row.createdAt ?? null,
    });
  }

  publicProfile(): { id: string | number | null; nama: string; username: string; email: string; role: string } {
    return { id: this.id, nama: this.nama, username: this.username, email: this.email, role: this.role };
  }
}

// ============================================================
// DTO: Data Transfer Object — objek polos untuk mentransfer
// data antar lapisan (API <-> Model <-> UI) tanpa logika bisnis.
// Item checklist: DTO concept.
// ============================================================
export class LaporanDTO {
  judul: string;
  lokasi: string;
  status: StatusLaporan;
  emoji: string;
  deskripsi: string;

  constructor({ judul = '', lokasi = '', status = 'Dilaporkan' as StatusLaporan, emoji = '🕳️', deskripsi = '' }: LaporanProps = {}) {
    this.judul = String(judul || '').trim();
    this.lokasi = String(lokasi || '').trim();
    this.status = status;
    this.emoji = emoji;
    this.deskripsi = String(deskripsi || '').trim();
  }

  static fromForm({ judul, lokasi, deskripsi = '', status = 'Dilaporkan' as StatusLaporan, emoji = '💡' }: {
    judul?: string | null; lokasi?: string | null; deskripsi?: string | null; status?: StatusLaporan; emoji?: string | null;
  }): LaporanDTO {
    return new LaporanDTO({ judul: judul ?? '', lokasi: lokasi ?? '', deskripsi: deskripsi ?? '', status, emoji: emoji ?? '💡' });
  }

  toPayload(): { judul: string; lokasi: string; status: StatusLaporan; emoji: string; deskripsi: string } {
    return {
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
    };
  }

  static fromBackend(row: LaporanRow): LaporanDTO {
    return new LaporanDTO({
      judul: row.judul ?? row.title ?? '',
      lokasi: row.lokasi ?? row.location ?? '',
      status: (row.status as StatusLaporan) ?? 'Dilaporkan',
      emoji: row.emoji ?? '🕳️',
      deskripsi: row.deskripsi ?? row.description ?? '',
    });
  }

  isValid(): boolean {
    return Boolean(this.judul && this.lokasi);
  }
}

export class UserDTO {
  nama: string;
  username: string;
  email: string;
  role: string;

  constructor({ nama = '', username = '', email = '', role = 'warga' }: UserProps = {}) {
    this.nama = String(nama || '').trim();
    this.username = String(username || '').trim();
    this.email = String(email || '').trim().toLowerCase();
    this.role = role;
  }

  static fromForm({ nama, username, email, role = 'warga' }: { nama?: string | null; username?: string | null; email?: string | null; role?: string }): UserDTO {
    return new UserDTO({ nama: nama ?? '', username: username ?? '', email: email ?? '', role });
  }

  toPayload(): { nama: string; username: string; email: string; role: string } {
    return { nama: this.nama, username: this.username, email: this.email, role: this.role };
  }

  static fromBackend(row: UserRow): UserDTO {
    return new UserDTO({
      nama: row.nama ?? '',
      username: row.username ?? '',
      email: row.email ?? '',
      role: row.role ?? 'warga',
    });
  }

  isValid(): boolean {
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return Boolean(this.nama && this.username && reEmail.test(this.email));
  }
}

// ============================================================
// DATA MODELING — entitas domain LaporCepat.
// Setiap model memiliki: validasi, dari backend (mapper),
// ke backend (payload), dan representasi default.
// ============================================================

export const STATUS_VALID = ['Dilaporkan', 'Diverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak'];

export class ValidationError extends Error {
  constructor(errors = {}) {
    super('Validasi gagal.');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ---------- util ----------
const required = (val, field) => {
  if (val == null || String(val).trim() === '') return `${field} wajib diisi.`;
  return null;
};
const inEnum = (val, allowed, field) => {
  if (!allowed.includes(val)) return `${field} harus salah satu: ${allowed.join(', ')}.`;
  return null;
};

// ============================================================
// MODEL: Laporan
// Bentuk: { id, judul, lokasi, status, emoji, deskripsi, createdAt, updatedAt }
// ============================================================
export class Laporan {
  constructor({
    id = null,
    judul = '',
    lokasi = '',
    status = 'Dilaporkan',
    emoji = '🕳️',
    deskripsi = '',
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.judul = String(judul).trim();
    this.lokasi = String(lokasi).trim();
    this.status = status;
    this.emoji = emoji;
    this.deskripsi = String(deskripsi).trim();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validate() {
    const e = {};
    const rJudul = required(this.judul, 'Judul');
    if (rJudul) e.judul = rJudul;
    const rLokasi = required(this.lokasi, 'Lokasi');
    if (rLokasi) e.lokasi = rLokasi;
    const rStatus = inEnum(this.status, STATUS_VALID, 'Status');
    if (rStatus) e.status = rStatus;
    if (Object.keys(e).length) throw new ValidationError(e);
    return true;
  }

  isValid() {
    try {
      this.validate();
      return true;
    } catch { return false; }
  }

  toPayload() {
    return {
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
    };
  }

  toJSON() {
    return {
      id: this.id,
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromBackend(row) {
    return new Laporan({
      id: row.id ?? row._id ?? null,
      judul: row.judul ?? row.title ?? '',
      lokasi: row.lokasi ?? row.location ?? '',
      status: row.status ?? 'Dilaporkan',
      emoji: row.emoji ?? '🕳️',
      deskripsi: row.deskripsi ?? row.description ?? '',
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    });
  }

  static fromMock(row) {
    return new Laporan({
      id: row.id,
      judul: row.judul,
      lokasi: row.lokasi,
      status: row.status,
      emoji: row.emoji,
      deskripsi: row.deskripsi ?? '',
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    });
  }
}

// ============================================================
// MODEL: User
// Bentuk: { id, nama, username, email, role, createdAt }
// ============================================================
export class User {
  constructor({ id = null, nama = '', username = '', email = '', role = 'warga', createdAt = null } = {}) {
    this.id = id;
    this.nama = String(nama).trim();
    this.username = String(username).trim();
    this.email = String(email).trim().toLowerCase();
    this.role = role;
    this.createdAt = createdAt;
  }

  validate() {
    const e = {};
    const rNama = required(this.nama, 'Nama');
    if (rNama) e.nama = rNama;
    const rUsername = required(this.username, 'Username');
    if (rUsername) e.username = rUsername;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!reEmail.test(this.email)) e.email = 'Format email tidak valid.';
    if (Object.keys(e).length) throw new ValidationError(e);
    return true;
  }

  isValid() {
    try {
      this.validate();
      return true;
    } catch { return false; }
  }

  toPayload() {
    return { nama: this.nama, username: this.username, email: this.email, role: this.role };
  }

  toJSON() {
    return { id: this.id, nama: this.nama, username: this.username, email: this.email, role: this.role, createdAt: this.createdAt };
  }

  static fromBackend(row) {
    return new User({
      id: row.id ?? row._id ?? null,
      nama: row.nama ?? '',
      username: row.username ?? '',
      email: row.email ?? '',
      role: row.role ?? 'warga',
      createdAt: row.createdAt ?? null,
    });
  }

  publicProfile() {
    return { id: this.id, nama: this.nama, username: this.username, email: this.email, role: this.role };
  }
}

// ============================================================
// DTO: Data Transfer Object — objek polos untuk mentransfer
// data antar lapisan (API <-> Model <-> UI) tanpa logika bisnis.
// Item checklist: DTO concept.
// ============================================================
export class LaporanDTO {
  constructor({ judul = '', lokasi = '', status = 'Dilaporkan', emoji = '🕳️', deskripsi = '' } = {}) {
    this.judul = String(judul || '').trim();
    this.lokasi = String(lokasi || '').trim();
    this.status = status;
    this.emoji = emoji;
    this.deskripsi = String(deskripsi || '').trim();
  }

  static fromForm({ judul, lokasi, deskripsi = '', status = 'Dilaporkan', emoji = '💡' }) {
    return new LaporanDTO({ judul, lokasi, deskripsi, status, emoji });
  }

  toPayload() {
    return {
      judul: this.judul,
      lokasi: this.lokasi,
      status: this.status,
      emoji: this.emoji,
      deskripsi: this.deskripsi,
    };
  }

  static fromBackend(row) {
    return new LaporanDTO({
      judul: row.judul ?? row.title ?? '',
      lokasi: row.lokasi ?? row.location ?? '',
      status: row.status ?? 'Dilaporkan',
      emoji: row.emoji ?? '🕳️',
      deskripsi: row.deskripsi ?? row.description ?? '',
    });
  }

  isValid() {
    return Boolean(this.judul && this.lokasi);
  }
}

export class UserDTO {
  constructor({ nama = '', username = '', email = '', role = 'warga' } = {}) {
    this.nama = String(nama || '').trim();
    this.username = String(username || '').trim();
    this.email = String(email || '').trim().toLowerCase();
    this.role = role;
  }

  static fromForm({ nama, username, email, role = 'warga' }) {
    return new UserDTO({ nama, username, email, role });
  }

  toPayload() {
    return { nama: this.nama, username: this.username, email: this.email, role: this.role };
  }

  static fromBackend(row) {
    return new UserDTO({
      nama: row.nama ?? '',
      username: row.username ?? '',
      email: row.email ?? '',
      role: row.role ?? 'warga',
    });
  }

  isValid() {
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return Boolean(this.nama && this.username && reEmail.test(this.email));
  }
}

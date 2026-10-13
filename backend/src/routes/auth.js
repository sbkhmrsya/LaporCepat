// POST /api/auth/register | POST /api/auth/login | GET /api/auth/me | POST /api/auth/demo
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Router } = require('express');
const { norm, load, save, publicUser, findByIdentifier, emailTaken, usernameTaken } = require('../store');
const { signAccessToken } = require('../jwt');

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USER_RE = /^[a-z0-9_.]{3,20}$/;

// Rate-limit login sederhana: maks 5x salah per identitas, kunci 30 detik.
const fails = new Map(); // key -> { count, until }
const MAX_TRIES = 5;
const LOCK_MS = 30 * 1000;

function checkLock(key) {
  const rec = fails.get(key);
  if (rec && rec.until && Date.now() < rec.until) {
    const s = Math.ceil((rec.until - Date.now()) / 1000);
    return `Terlalu banyak percobaan. Coba lagi dalam ${s} detik.`;
  }
  return null;
}
function recordFail(key) {
  const cur = fails.get(key) || { count: 0, until: 0 };
  const count = cur.count + 1;
  fails.set(key, count >= MAX_TRIES ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 });
}

router.post('/register', async (req, res) => {
  const { nama, username, email, password } = req.body || {};
  if (!String(nama || '').trim()) return res.status(400).json({ error: 'Nama wajib diisi.', code: 'BAD_ARGS', field: 'nama' });
  if (!USER_RE.test(norm(username))) {
    return res.status(400).json({ error: 'Username 3-20 karakter: huruf, angka, titik, garis bawah.', code: 'BAD_ARGS', field: 'username' });
  }
  if (!EMAIL_RE.test(norm(email))) return res.status(400).json({ error: 'Format email belum benar.', code: 'BAD_ARGS', field: 'email' });
  if (String(password || '').length < 8) {
    return res.status(400).json({ error: 'Password minimal 8 karakter.', code: 'BAD_ARGS', field: 'password' });
  }
  const db = load();
  if (emailTaken(db, email)) return res.status(409).json({ error: 'Email sudah terdaftar.', code: 'TAKEN', field: 'email' });
  if (usernameTaken(db, username)) return res.status(409).json({ error: 'Username sudah dipakai.', code: 'TAKEN', field: 'username' });

  const record = {
    id: crypto.randomUUID(),
    nama: String(nama).trim(),
    username: norm(username),
    email: norm(email),
    hash: await bcrypt.hash(String(password), 10),
    createdAt: Date.now(),
  };
  db.users.push(record);
  save(db);
  return res.status(201).json({ user: publicUser(record), token: signAccessToken(record) });
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!norm(identifier) || !password) {
    return res.status(400).json({ error: 'Isi email/username dan password.', code: 'BAD_ARGS' });
  }
  const key = `login:${norm(identifier)}`;
  const locked = checkLock(key);
  if (locked) return res.status(429).json({ error: locked, code: 'LOCKED' });

  const db = load();
  const record = findByIdentifier(db, identifier);
  const mismatch = !record || !(await bcrypt.compare(String(password), record.hash));
  if (mismatch) {
    recordFail(key);
    return res.status(401).json({ error: 'Email/username atau password salah.', code: 'INVALID' });
  }
  fails.delete(key);
  return res.json({ user: publicUser(record), token: signAccessToken(record) });
});

router.post('/demo', async (req, res) => {
  const DEMO = { nama: 'Warga Demo', username: 'demo', email: 'demo@laporcepat.id', password: 'demo12345' };
  const db = load();
  let record = findByIdentifier(db, DEMO.email);
  if (!record) {
    record = {
      id: crypto.randomUUID(),
      nama: DEMO.nama,
      username: DEMO.username,
      email: DEMO.email,
      hash: await bcrypt.hash(DEMO.password, 10),
      createdAt: Date.now(),
    };
    db.users.push(record);
    save(db);
  }
  return res.json({ user: publicUser(record), token: signAccessToken(record) });
});

router.get('/me', require('../middleware/requireAuth'), (req, res) => {
  const db = load();
  const record = db.users.find((u) => u.id === req.user.id);
  if (!record) return res.status(404).json({ error: 'Akun tidak ditemukan.', code: 'NOT_FOUND' });
  return res.json({ user: publicUser(record) });
});

module.exports = router;

// Penyimpanan file JSON sederhana: users + jti token sekali pakai yang sudah dikonsumsi.
const fs = require('fs');
const path = require('path');
const { dataFile } = require('./config');

const norm = (s) => String(s || '').trim().toLowerCase();

function blank() {
  return { users: [], usedOtt: {} };
}

function ensureDir() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(blank(), null, 2));
}

function load() {
  ensureDir();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const db = JSON.parse(raw);
    if (!Array.isArray(db.users)) db.users = [];
    if (!db.usedOtt || typeof db.usedOtt !== 'object') db.usedOtt = {};
    return db;
  } catch {
    return blank();
  }
}

function save(db) {
  ensureDir();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

function publicUser(r) {
  return { id: r.id, nama: r.nama, username: r.username, email: r.email };
}

function findByIdentifier(db, identifier) {
  const key = norm(identifier);
  return db.users.find((u) => u.email === key || u.username === key) || null;
}

function emailTaken(db, email) {
  return db.users.some((u) => u.email === norm(email));
}

function usernameTaken(db, username) {
  return db.users.some((u) => u.username === norm(username));
}

// ---- one-time token registry (jti -> exp epoch detik) ----
function purgeUsedOtt(db, nowSec = Math.floor(Date.now() / 1000)) {
  let changed = false;
  for (const jti of Object.keys(db.usedOtt)) {
    if (typeof db.usedOtt[jti] !== 'number' || db.usedOtt[jti] < nowSec) {
      delete db.usedOtt[jti];
      changed = true;
    }
  }
  if (changed) save(db);
}

module.exports = { norm, load, save, publicUser, findByIdentifier, emailTaken, usernameTaken, purgeUsedOtt };

// Konfigurasi backend. Jangan commit file .env asli.
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-minimal-32-karakter-acak!!';
if (!process.env.JWT_SECRET) {
  console.warn('[auth-api] WARNING: JWT_SECRET tidak diset, memakai secret dev. Salin .env.example menjadi .env untuk produksi.');
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  ottTtlSec: Number(process.env.OTT_TTL_SEC || 300),
  dataFile: require('path').join(__dirname, '..', 'data', 'db.json'),
};

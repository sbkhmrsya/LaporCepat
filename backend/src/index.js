// LaporCepat Auth API — node src/index.js
const express = require('express');
const cors = require('cors');
const { port } = require('./config');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => res.json({
  ok: true,
  service: 'laporcepat-auth-api',
  endpoints: [
    'GET /api/health',
    'POST /api/auth/register',
    'POST /api/auth/login',
    'POST /api/auth/demo',
    'GET /api/auth/me',
    'POST /api/tokens/one-time',
    'POST /api/tokens/one-time/verify',
  ],
}));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'laporcepat-auth-api' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tokens', require('./routes/tokens'));

app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.', code: 'NOT_FOUND' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Kesalahan server.', code: 'INTERNAL' });
});

app.listen(port, () => console.log(`[auth-api] jalan di http://localhost:${port}`));

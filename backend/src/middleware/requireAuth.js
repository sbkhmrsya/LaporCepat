// Wajib Bearer <JWT akses>. Mengisi req.user = payload token.
const { verifyAccessToken } = require('../jwt');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Header Authorization: Bearer <token> wajib diisi.', code: 'NO_TOKEN' });
  }
  try {
    const payload = verifyAccessToken(token);
    if (payload.kind && payload.kind !== 'access') {
      return res.status(401).json({ error: 'Bukan token akses.', code: 'INVALID' });
    }
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa.', code: 'INVALID' });
  }
}

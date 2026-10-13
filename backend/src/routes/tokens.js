// POST /api/tokens/one-time (perlu login) | POST /api/tokens/one-time/verify (publik)
const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const { issueOtt, verifyOtt, OttError } = require('../ott');

const router = Router();

// Terbitkan token sekali pakai untuk user yang sedang login.
router.post('/one-time', requireAuth, (req, res) => {
  const { purpose = 'generic', data = null, expiresInSec } = req.body || {};
  try {
    const sub = req.user.email || req.user.id;
    const { token, expiresAt } = issueOtt({ sub, purpose, data, expiresInSec });
    return res.status(201).json({ token, purpose, expiresAt });
  } catch (e) {
    const status = e instanceof OttError ? e.status : 400;
    return res.status(status).json({ error: e.message, code: e.code || 'BAD_ARGS' });
  }
});

// Verifikasi + (default) hanguskan. Pemakaian ulang -> 409 REUSED.
router.post('/one-time/verify', (req, res) => {
  const { token, expectedPurpose, expectedSub, consume = true } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token wajib diisi.', code: 'MALFORMED' });
  try {
    const payload = verifyOtt(token, { expectedPurpose, expectedSub, consume });
    return res.json({ valid: true, payload });
  } catch (e) {
    const status = e instanceof OttError ? e.status : 400;
    return res.status(status).json({ valid: false, error: e.message, code: e.code || 'INVALID' });
  }
});

module.exports = router;

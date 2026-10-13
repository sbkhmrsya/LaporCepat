// JWT akses (login/session) HS256 via jsonwebtoken.
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('./config');

const ISSUER = 'laporcepat';

function signAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, username: user.username, kind: 'access' }, jwtSecret, {
    issuer: ISSUER,
    expiresIn: jwtExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret, { issuer: ISSUER });
}

module.exports = { ISSUER, signAccessToken, verifyAccessToken };

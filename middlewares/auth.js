const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const JWT_SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET : 'dev-secret';

const auth = (req, res, next) => {
  const jwtToken = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(jwtToken, JWT_SECRET);
    if (!payload) {
      throw new UnauthorizedError('Необходима авторизация');
    }
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  req.user = payload;

  next();
};

module.exports = auth;

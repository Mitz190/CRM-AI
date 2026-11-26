const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, jwtCookieDays, isProd } = require('../config/env');

const COOKIE_NAME = 'clientiq_token';

const baseCookie = { httpOnly: true, secure: isProd, sameSite: 'lax' };

const signToken = (userId) => jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });

const setAuthCookie = (res, userId) =>
  res.cookie(COOKIE_NAME, signToken(userId), {
    ...baseCookie,
    maxAge: jwtCookieDays * 24 * 60 * 60 * 1000,
  });

const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookie);

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
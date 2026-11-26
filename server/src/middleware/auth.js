const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');
const { COOKIE_NAME } = require('../utils/token');

// Authentication: who are you? Attaches req.user and req.organizationId.
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) throw new AppError('Please log in to continue.', 401);

  const decoded = jwt.verify(token, jwtSecret); // errors are normalized to 401 by errorHandler

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new AppError('Your session is no longer valid. Please log in again.', 401);
  if (user.changedPasswordAfter(decoded.iat)) throw new AppError('Password was changed. Please log in again.', 401);

  req.user = user;
  req.organizationId = user.organization; // ALWAYS use this, never an id from the request body
  next();
});

// Authorization: are you allowed? Usage: authorize('admin')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, authorize };
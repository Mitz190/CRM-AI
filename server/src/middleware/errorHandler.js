const AppError = require('../utils/AppError');
const { isProd } = require('../config/env');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Translate common library errors into clean operational errors.
const normalize = (err) => {
  if (err.name === 'ValidationError') {
    return new AppError(Object.values(err.errors).map((e) => e.message).join(', '), 400);
  }
  if (err.name === 'CastError') return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  if (err.code === 11000) {
    return new AppError(`Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`, 409);
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Invalid or expired token. Please log in again.', 401);
  }
    if (err.name === 'MulterError') {
    return new AppError(err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 1 MB).' : err.message, 400);
  }
  return err;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (rawErr, req, res, next) => {
  const err = normalize(rawErr);
  const statusCode = err.statusCode || 500;

  if (!err.isOperational) console.error('UNEXPECTED ERROR:', rawErr);

  res.status(statusCode).json({
    success: false,
    message: err.isOperational || !isProd ? err.message : 'Something went wrong',
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
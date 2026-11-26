const { body, param, query } = require('express-validator');
const User = require('../models/User');

const createUserRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase(),
  body('password')
    .isString().isLength({ min: 8, max: 72 }).withMessage('Temporary password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('role').optional().isIn(User.ROLES).withMessage(`Role must be one of: ${User.ROLES.join(', ')}`),
];

const updateUserRules = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('role').optional().isIn(User.ROLES).withMessage(`Role must be one of: ${User.ROLES.join(', ')}`),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
];

const listUsersRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().isLength({ max: 100 }),
];

module.exports = { createUserRules, updateUserRules, listUsersRules };
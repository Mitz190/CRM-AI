const { body, param } = require('express-validator');

const passwordRule = (field) =>
  body(field)
    .isString().withMessage('Password is required')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number');

const emailRule = body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase();

const nameRule = body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters');

const registerRules = [
  nameRule,
  body('organizationName').trim().isLength({ min: 2, max: 100 }).withMessage('Organization name must be 2-100 characters'),
  emailRule,
  passwordRule('password'),
];

const loginRules = [emailRule, body('password').notEmpty().withMessage('Password is required')];

const forgotPasswordRules = [emailRule];

const resetPasswordRules = [
  param('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid reset token'),
  passwordRule('password'),
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Phone is too long'),
  body('jobTitle').optional({ values: 'falsy' }).trim().isLength({ max: 80 }).withMessage('Job title is too long'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateProfileRules,
  changePasswordRules,
};
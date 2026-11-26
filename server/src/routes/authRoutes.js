const express = require('express');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const v = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authLimiter, v.registerRules, validate, ctrl.register);
router.post('/login', authLimiter, v.loginRules, validate, ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', authLimiter, v.forgotPasswordRules, validate, ctrl.forgotPassword);
router.patch('/reset-password/:token', authLimiter, v.resetPasswordRules, validate, ctrl.resetPassword);

router.get('/me', protect, ctrl.getMe);
router.patch('/me', protect, v.updateProfileRules, validate, ctrl.updateProfile);
router.patch('/change-password', protect, v.changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
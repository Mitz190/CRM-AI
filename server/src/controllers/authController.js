const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/crm/authService');
const { setAuthCookie, clearAuthCookie } = require('../utils/token');

const sendAuth = (res, user, status = 200) => {
  setAuthCookie(res, user._id);
  res.status(status).json({ success: true, data: { user } });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = req.body;
  const user = await authService.registerOrganization({ name, email, password, organizationName });
  sendAuth(res, user, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login({ email, password });
  sendAuth(res, user);
});

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.params.token, req.body.password);
  sendAuth(res, user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, jobTitle } = req.body;
  const user = await authService.updateProfile(req.user, { name, phone, jobTitle });
  res.json({ success: true, data: { user } });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword(req.user._id, currentPassword, newPassword);
  sendAuth(res, user); // reissue cookie because old tokens are now invalid
});
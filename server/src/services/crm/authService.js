const crypto = require('crypto');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const AppError = require('../../utils/AppError');
const sendEmail = require('../../utils/sendEmail');
const { clientUrl } = require('../../config/env');

// Creates an organization and its first Admin. Role is forced to 'admin' here, never taken from input.
const registerOrganization = async ({ name, email, password, organizationName }) => {
  if (await User.exists({ email })) throw new AppError('An account with this email already exists.', 409);

  const organization = await Organization.create({ name: organizationName });
  try {
    const user = await User.create({ organization: organization._id, name, email, password, role: 'admin' });
    organization.owner = user._id;
    await organization.save();
    return user;
  } catch (err) {
    await Organization.findByIdAndDelete(organization._id); // don't leave orphan organizations
    throw err;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  // Same message for "no such user" and "wrong password" to avoid revealing which emails exist.
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password.', 401);
  if (!user.isActive) throw new AppError('This account has been deactivated. Contact your administrator.', 403);

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  return user;
};

// Always resolves quietly so the API never reveals whether an email is registered.
const forgotPassword = async (email) => {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return;

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${clientUrl}/reset-password/${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your ClientIQ password',
      text: `Hi ${user.name},\n\nUse the link below to reset your password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    });
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
};

const resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } });
  if (!user) throw new AppError('Reset link is invalid or has expired.', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return user;
};

const updateProfile = async (user, { name, phone, jobTitle }) => {
  // Whitelist: only these fields can ever be changed here.
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  await user.save();
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new AppError('Current password is incorrect.', 400);
  user.password = newPassword;
  await user.save();
  return user;
};

module.exports = { registerOrganization, login, forgotPassword, resetPassword, updateProfile, changePassword };
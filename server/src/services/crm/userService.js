const User = require('../../models/User');
const AppError = require('../../utils/AppError');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listUsers = async (organizationId, { page = 1, limit = 20, search } = {}) => {
  const filter = { organization: organizationId };
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
};

const createUser = async (organizationId, { name, email, password, role }) => {
  if (await User.exists({ email })) throw new AppError('An account with this email already exists.', 409);
  return User.create({ organization: organizationId, name, email, password, role: role || 'sales_rep' });
};

const updateUser = async (organizationId, actingUser, userId, { name, role, isActive }) => {
  // Filtering by organization means an admin can never touch another organization's users.
  const user = await User.findOne({ _id: userId, organization: organizationId });
  if (!user) throw new AppError('User not found.', 404);

  const isSelf = user._id.equals(actingUser._id);
  if (isSelf && ((role !== undefined && role !== 'admin') || isActive === false)) {
    throw new AppError('You cannot remove your own admin access or deactivate yourself.', 400);
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();
  return user;
};

module.exports = { listUsers, createUser, updateUser };
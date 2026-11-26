const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/crm/userService');

exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const data = await userService.listUsers(req.organizationId, { page, limit, search });
  res.json({ success: true, data });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await userService.createUser(req.organizationId, { name, email, password, role });
  res.status(201).json({ success: true, data: { user } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;
  const user = await userService.updateUser(req.organizationId, req.user, req.params.id, { name, role, isActive });
  res.json({ success: true, data: { user } });
});
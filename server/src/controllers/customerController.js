const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const customerService = require('../services/crm/customerService');

exports.list = asyncHandler(async (req, res) => {
  const data = await customerService.listCustomers(req.user, req.query);
  res.json({ success: true, data });
});

exports.get = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomer(req.user, req.params.id);
  res.json({ success: true, data });
});

exports.create = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.user, req.body);
  res.status(201).json({ success: true, data: { customer } });
});

exports.update = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.user, req.params.id, req.body);
  res.json({ success: true, data: { customer } });
});

exports.remove = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.user, req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const csv = await customerService.exportCsv(req.user);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="clientiq-customers-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`\uFEFF${csv}`); // BOM so Excel reads UTF-8 correctly
});

exports.importCsv = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Please attach a CSV file in the "file" field.', 400);
  const data = await customerService.importCsv(req.user, req.file.buffer);
  res.json({ success: true, data });
});
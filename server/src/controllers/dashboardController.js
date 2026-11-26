const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/analytics/dashboardService');

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user);
  res.json({ success: true, data });
});
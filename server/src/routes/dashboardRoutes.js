const express = require('express');
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, ctrl.getDashboard); // both roles; data is scoped inside the service

module.exports = router;
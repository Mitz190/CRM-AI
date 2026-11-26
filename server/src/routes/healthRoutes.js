const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    status: 'ok',
    uptime: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
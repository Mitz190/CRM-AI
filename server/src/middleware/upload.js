const multer = require('multer');
const AppError = require('../utils/AppError');

// Memory storage: Render's disk is ephemeral and we only need to parse the file once.
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024, files: 1 }, // 1 MB
  fileFilter: (req, file, cb) => {
    const okName = /\.csv$/i.test(file.originalname);
    const okType = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.mimetype);
    if (!okName || !okType) return cb(new AppError('Only .csv files are allowed.', 400));
    cb(null, true);
  },
});

module.exports = { csvUpload };
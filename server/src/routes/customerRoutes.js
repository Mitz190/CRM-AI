const express = require('express');
const ctrl = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { csvUpload } = require('../middleware/upload');
const v = require('../validators/customerValidators');

const router = express.Router();

router.use(protect);

// Fixed paths must come BEFORE '/:id'
router.get('/export', ctrl.exportCsv);
router.post('/import', csvUpload.single('file'), ctrl.importCsv);

router.get('/', v.listCustomersRules, validate, ctrl.list);
router.post('/', v.createCustomerRules, validate, ctrl.create);
router.get('/:id', v.idRule, validate, ctrl.get);
router.patch('/:id', v.updateCustomerRules, validate, ctrl.update);
router.delete('/:id', authorize('admin'), v.idRule, validate, ctrl.remove);

module.exports = router;
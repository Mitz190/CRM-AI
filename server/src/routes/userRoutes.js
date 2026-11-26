const express = require('express');
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/userValidators');

const router = express.Router();

router.use(protect, authorize('admin')); // every route below is admin-only

router.get('/', v.listUsersRules, validate, ctrl.listUsers);
router.post('/', v.createUserRules, validate, ctrl.createUser);
router.patch('/:id', v.updateUserRules, validate, ctrl.updateUser);

module.exports = router;
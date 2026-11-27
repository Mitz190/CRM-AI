const { body, param, query } = require('express-validator');
const Customer = require('../models/Customer');

const text = (field, max) =>
  body(field).optional({ values: 'falsy' }).isString().withMessage(`${field} must be text`)
    .trim().isLength({ max }).withMessage(`${field} must be at most ${max} characters`);

const sharedRules = [
  body('email').optional({ values: 'falsy' }).isString().trim().isEmail().withMessage('A valid email is required').toLowerCase(),
  text('phone', 30), text('company', 120), text('jobTitle', 80), text('category', 50),
  text('website', 200), text('city', 80), text('country', 80), text('notes', 2000),
  body('status').optional({ values: 'falsy' }).isIn(Customer.STATUSES).withMessage(`Status must be one of: ${Customer.STATUSES.join(', ')}`),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid assignee'),
];

const createCustomerRules = [
  body('name').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 characters)'),
  ...sharedRules,
];

const updateCustomerRules = [
  param('id').isMongoId().withMessage('Invalid customer id'),
  body('name').optional({ values: 'falsy' }).isString().trim().isLength({ min: 1, max: 120 }).withMessage('Name must be 1-120 characters'),
  ...sharedRules,
];

const idRule = [param('id').isMongoId().withMessage('Invalid customer id')];

const listCustomersRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isString().trim().isLength({ max: 50 }),
  query('status').optional({ values: 'falsy' }).isIn(Customer.STATUSES),
  query('assignedTo').optional({ values: 'falsy' })
    .custom((v) => v === 'unassigned' || /^[a-f\d]{24}$/i.test(String(v))).withMessage('Invalid assignedTo filter'),
  query('sort').optional().isIn(Customer.SORT_FIELDS).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

module.exports = { createCustomerRules, updateCustomerRules, idRule, listCustomersRules };
const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('last_name')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user'])
    .withMessage('Role must be admin, manager, or user'),
  handleValidationErrors
];

// Client validation rules
const validateClient = [
  body('company_name')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be 2-255 characters long'),
  body('contact_person')
    .isLength({ min: 2, max: 255 })
    .withMessage('Contact person must be 2-255 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('gst_number')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),
  body('pan_number')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),
  body('pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('company_size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Company size must be one of: 1-10, 11-50, 51-200, 201-500, 500+'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),
  handleValidationErrors
];

// Subscription validation rules
const validateSubscription = [
  body('client_id')
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer'),
  body('plan_id')
    .isInt({ min: 1 })
    .withMessage('Plan ID must be a positive integer'),
  body('start_date')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
    .withMessage('End date must be after start date'),
  body('amount_inr')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('billing_cycle')
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly'),
  body('payment_status')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'failed'])
    .withMessage('Payment status must be paid, pending, overdue, or failed'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'cancelled', 'expired'])
    .withMessage('Status must be active, inactive, suspended, cancelled, or expired'),
  body('auto_renewal')
    .optional()
    .isBoolean()
    .withMessage('Auto renewal must be true or false'),
  body('payment_method')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Payment method must be 2-50 characters long'),
  handleValidationErrors
];

// Plan validation rules
const validatePlan = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Plan name must be 2-100 characters long'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('price_inr')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('billing_cycle')
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly'),
  body('max_users')
    .isInt({ min: -1 })
    .withMessage('Max users must be a positive integer or -1 for unlimited'),
  body('max_clients')
    .isInt({ min: -1 })
    .withMessage('Max clients must be a positive integer or -1 for unlimited'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('module_access')
    .optional()
    .isObject()
    .withMessage('Module access must be an object'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Is active must be true or false'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+:(asc|desc)$/)
    .withMessage('Sort must be in format field:direction (e.g., name:asc)'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid ISO date'),
  query('end_date')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) <= new Date(req.query.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
    .withMessage('End date must be after start date'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateClient,
  validateSubscription,
  validatePlan,
  validateId,
  validatePagination,
  validateDateRange,
  handleValidationErrors
};
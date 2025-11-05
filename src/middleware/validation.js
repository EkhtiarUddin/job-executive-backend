const { body, validationResult, param } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('role')
    .optional()
    .isIn(['EMPLOYER', 'SEEKER'])
    .withMessage('Role must be either EMPLOYER or SEEKER'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('company')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters long'),
  body('salary')
    .trim()
    .notEmpty()
    .withMessage('Salary is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('type')
    .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE', 'HYBRID'])
    .withMessage('Invalid job type'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('requirements')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Requirements must be at least 10 characters long'),
  handleValidationErrors
];

const applicationValidation = [
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Cover letter must be at least 10 characters long'),
  handleValidationErrors
];

const idValidation = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('ID is required'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  jobValidation,
  applicationValidation,
  idValidation,
  handleValidationErrors
};

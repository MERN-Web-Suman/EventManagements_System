// middleware/validate.js - Request Validation Middleware
const { validationResult, body, param, query } = require('express-validator');

// Run validation and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const otpValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
];

// Event validators
const eventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location.venue').notEmpty().withMessage('Venue is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
];

// Booking validators
const bookingValidator = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
];

// Feedback validators
const feedbackValidator = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 500 }),
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  otpValidator,
  eventValidator,
  bookingValidator,
  feedbackValidator,
};

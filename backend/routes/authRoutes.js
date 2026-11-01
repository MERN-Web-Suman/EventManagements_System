// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator, otpValidator, validate } = require('../middleware/validate');

router.post('/register', registerValidator, validate, register);
router.post('/verify-otp', otpValidator, validate, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

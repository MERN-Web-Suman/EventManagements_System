// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { sendPaymentVerificationOTP, createOrder, verifyPayment, getRazorpayKey } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/key', protect, getRazorpayKey);
router.post('/send-otp', protect, sendPaymentVerificationOTP);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;

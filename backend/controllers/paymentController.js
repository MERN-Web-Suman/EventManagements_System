// controllers/paymentController.js - Razorpay Payment Controller
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { generateOTP, getOTPExpiry, isOTPValid } = require('../utils/otpService');
const { sendPaymentOTP, sendTicketConfirmation } = require('../utils/emailService');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { ApiError, successResponse } = require('../utils/apiResponse');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * @desc  Send payment OTP before booking
 * @route POST /api/payments/send-otp
 * @access Private
 */
const sendPaymentVerificationOTP = async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError('Event not found', 404);

  const user = await User.findById(req.user.id);
  const otp = generateOTP();

  user.paymentOtp = { code: otp, expiresAt: getOTPExpiry(5) };
  await user.save();

  await sendPaymentOTP(user.email, user.name, otp, event.title);

  successResponse(res, 'Payment OTP sent to your email');
};

/**
 * @desc  Create Razorpay order
 * @route POST /api/payments/create-order
 * @access Private
 */
const createOrder = async (req, res) => {
  const { eventId, quantity, otp } = req.body;

  // Validate payment OTP
  const user = await User.findById(req.user.id);
  if (!isOTPValid(user.paymentOtp, otp)) {
    throw new ApiError('Invalid or expired payment OTP', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError('Event not found', 404);
  if (event.status === 'cancelled') throw new ApiError('Event is cancelled', 400);
  if (event.availableSeats < quantity) {
    throw new ApiError(`Only ${event.availableSeats} seats available`, 400);
  }

  const totalAmount = event.price * quantity;
  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: totalAmount * 100, // Razorpay uses paise
    currency: 'INR',
    receipt: `festiva_${Date.now()}`,
    notes: { eventId: eventId.toString(), userId: req.user.id.toString(), quantity: quantity.toString() },
  });

  // Clear payment OTP after use
  user.paymentOtp = undefined;
  await user.save();

  successResponse(res, 'Order created', {
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      event: { title: event.title, date: event.date, location: event.location },
      user: { name: user.name, email: user.email, phone: user.phone },
    },
  });
};

/**
 * @desc  Verify payment and confirm booking
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId, quantity } = req.body;

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError('Payment verification failed. Invalid signature.', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError('Event not found', 404);

  const user = await User.findById(req.user.id);
  const totalAmount = event.price * quantity;

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    event: eventId,
    quantity,
    totalAmount,
    paymentStatus: 'completed',
    paymentId: razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    status: 'confirmed',
  });

  // Update available seats
  await Event.findByIdAndUpdate(eventId, { $inc: { bookedSeats: quantity } });

  // Generate PDF ticket
  const pdfBuffer = await generateTicketPDF(booking, user, event);

  // Send confirmation email with PDF
  await sendTicketConfirmation(user.email, user.name, booking, event, pdfBuffer);

  successResponse(res, 'Payment verified! Ticket confirmed 🎟️', {
    data: {
      booking: await Booking.findById(booking._id).populate('event', 'title date time location image'),
      ticketNumber: booking.ticketNumber,
    },
  });
};

/**
 * @desc  Get Razorpay key
 * @route GET /api/payments/key
 * @access Private
 */
const getRazorpayKey = async (req, res) => {
  successResponse(res, 'Key fetched', { data: { keyId: process.env.RAZORPAY_KEY_ID } });
};

module.exports = { sendPaymentVerificationOTP, createOrder, verifyPayment, getRazorpayKey };

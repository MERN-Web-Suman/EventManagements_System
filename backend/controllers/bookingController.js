// controllers/bookingController.js - Booking Controller
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { ApiError, successResponse, paginationMeta } = require('../utils/apiResponse');

/**
 * @desc  Get user's bookings
 * @route GET /api/bookings/my
 * @access Private
 */
const getMyBookings = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookings, total] = await Promise.all([
    Booking.find({ user: req.user.id })
      .populate('event', 'title date time location image category status price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments({ user: req.user.id }),
  ]);

  successResponse(res, 'Bookings fetched', {
    data: { bookings, pagination: paginationMeta(total, page, limit) },
  });
};

/**
 * @desc  Get single booking by ID
 * @route GET /api/bookings/:id
 * @access Private
 */
const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event')
    .populate('user', 'name email phone');

  if (!booking) throw new ApiError('Booking not found', 404);

  // Users can only see their own bookings
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
    throw new ApiError('Not authorized', 403);
  }

  successResponse(res, 'Booking fetched', { data: { booking } });
};

/**
 * @desc  Cancel a booking
 * @route PATCH /api/bookings/:id/cancel
 * @access Private
 */
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError('Booking not found', 404);

  if (booking.user.toString() !== req.user.id) {
    throw new ApiError('Not authorized to cancel this booking', 403);
  }
  if (booking.status === 'cancelled') {
    throw new ApiError('Booking already cancelled', 400);
  }

  // Check if event is in future (allow cancellation up to 24h before)
  const event = await Event.findById(booking.event);
  const hoursToEvent = (new Date(event.date) - new Date()) / (1000 * 60 * 60);
  if (hoursToEvent < 24) {
    throw new ApiError('Cannot cancel booking within 24 hours of event', 400);
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  booking.paymentStatus = 'refunded';
  await booking.save();

  // Restore seats
  await Event.findByIdAndUpdate(booking.event, { $inc: { bookedSeats: -booking.quantity } });

  successResponse(res, 'Booking cancelled. Refund will be processed in 5-7 business days.');
};

/**
 * @desc  Admin: Get all bookings
 * @route GET /api/bookings
 * @access Admin
 */
const getAllBookings = async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = {};

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('user', 'name email phone')
      .populate('event', 'title date location price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments(query),
  ]);

  successResponse(res, 'All bookings fetched', {
    data: { bookings, pagination: paginationMeta(total, page, limit) },
  });
};

module.exports = { getMyBookings, getBooking, cancelBooking, getAllBookings };

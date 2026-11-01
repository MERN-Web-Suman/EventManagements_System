// controllers/feedbackController.js - Feedback & Reviews Controller
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { ApiError, successResponse, paginationMeta } = require('../utils/apiResponse');

/**
 * @desc  Submit feedback for an event
 * @route POST /api/feedback
 * @access Private
 */
const submitFeedback = async (req, res) => {
  const { eventId, rating, comment } = req.body;

  // Check if user has a confirmed booking for this event
  const booking = await Booking.findOne({
    user: req.user.id, event: eventId, status: 'confirmed',
  });
  if (!booking) {
    throw new ApiError('You can only review events you have attended', 403);
  }

  // Check if already reviewed
  const existing = await Feedback.findOne({ user: req.user.id, event: eventId });
  if (existing) throw new ApiError('You have already reviewed this event', 400);

  const feedback = await Feedback.create({
    user: req.user.id, event: eventId, booking: booking._id, rating, comment,
  });

  await feedback.populate('user', 'name avatar');

  successResponse(res, 'Feedback submitted! Thank you 🙏', { data: { feedback } }, 201);
};

/**
 * @desc  Get feedback for an event
 * @route GET /api/feedback/event/:eventId
 * @access Public
 */
const getEventFeedback = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [feedbacks, total] = await Promise.all([
    Feedback.find({ event: req.params.eventId, isVisible: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Feedback.countDocuments({ event: req.params.eventId, isVisible: true }),
  ]);

  successResponse(res, 'Feedback fetched', {
    data: { feedbacks, pagination: paginationMeta(total, page, limit) },
  });
};

/**
 * @desc  Admin: Get all feedback
 * @route GET /api/feedback
 * @access Admin
 */
const getAllFeedback = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [feedbacks, total] = await Promise.all([
    Feedback.find()
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Feedback.countDocuments(),
  ]);

  successResponse(res, 'All feedback fetched', {
    data: { feedbacks, pagination: paginationMeta(total, page, limit) },
  });
};

/**
 * @desc  Admin: Toggle feedback visibility
 * @route PATCH /api/feedback/:id/toggle
 * @access Admin
 */
const toggleFeedbackVisibility = async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new ApiError('Feedback not found', 404);
  feedback.isVisible = !feedback.isVisible;
  await feedback.save();
  successResponse(res, `Feedback ${feedback.isVisible ? 'shown' : 'hidden'}`);
};

/**
 * @desc  Delete feedback (Admin)
 * @route DELETE /api/feedback/:id
 * @access Admin
 */
const deleteFeedback = async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) throw new ApiError('Feedback not found', 404);
  successResponse(res, 'Feedback deleted');
};

module.exports = {
  submitFeedback, getEventFeedback, getAllFeedback, toggleFeedbackVisibility, deleteFeedback,
};

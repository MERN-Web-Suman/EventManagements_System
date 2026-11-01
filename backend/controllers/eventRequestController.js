// controllers/eventRequestController.js - User Event Request Controller
const EventRequest = require('../models/EventRequest');
const { ApiError, successResponse, paginationMeta } = require('../utils/apiResponse');

/**
 * @desc  User: Submit event request
 * @route POST /api/event-requests
 * @access Private
 */
const submitRequest = async (req, res) => {
  const request = await EventRequest.create({ ...req.body, user: req.user.id });
  successResponse(res, 'Event request submitted! Admin will review it soon 📬', { data: { request } }, 201);
};

/**
 * @desc  User: Get own requests
 * @route GET /api/event-requests/my
 * @access Private
 */
const getMyRequests = async (req, res) => {
  const requests = await EventRequest.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
  successResponse(res, 'Requests fetched', { data: { requests } });
};

/**
 * @desc  Admin: Get all event requests
 * @route GET /api/event-requests
 * @access Admin
 */
const getAllRequests = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = status ? { status } : {};

  const [requests, total] = await Promise.all([
    EventRequest.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    EventRequest.countDocuments(query),
  ]);

  successResponse(res, 'Event requests fetched', {
    data: { requests, pagination: paginationMeta(total, page, limit) },
  });
};

/**
 * @desc  Admin: Update request status
 * @route PATCH /api/event-requests/:id/status
 * @access Admin
 */
const updateRequestStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  const request = await EventRequest.findByIdAndUpdate(
    req.params.id,
    { status, adminNote },
    { new: true }
  ).populate('user', 'name email');

  if (!request) throw new ApiError('Request not found', 404);
  successResponse(res, `Request ${status}`, { data: { request } });
};

module.exports = { submitRequest, getMyRequests, getAllRequests, updateRequestStatus };

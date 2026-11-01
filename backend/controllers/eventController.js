// controllers/eventController.js - Event CRUD Controller
const Event = require('../models/Event');
const { ApiError, successResponse, paginationMeta } = require('../utils/apiResponse');

/**
 * @desc  Get all events (with search, filter, pagination)
 * @route GET /api/events
 * @access Public
 */
const getEvents = async (req, res) => {
  const {
    page = 1, limit = 9, search, category, status = 'upcoming',
    city, minPrice, maxPrice, sortBy = 'date', sortOrder = 'asc',
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }
  if (category && category !== 'All') query.category = category;
  if (status && status !== 'all') query.status = status;
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [events, total] = await Promise.all([
    Event.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
    Event.countDocuments(query),
  ]);

  successResponse(res, 'Events fetched', {
    data: { events, pagination: paginationMeta(total, page, limit) },
  });
};

/**
 * @desc  Get single event
 * @route GET /api/events/:id
 * @access Public
 */
const getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) throw new ApiError('Event not found', 404);
  successResponse(res, 'Event fetched', { data: { event } });
};

/**
 * @desc  Get featured events
 * @route GET /api/events/featured
 * @access Public
 */
const getFeaturedEvents = async (req, res) => {
  const events = await Event.find({ featured: true, status: 'upcoming' })
    .sort({ date: 1 }).limit(6).lean();
  successResponse(res, 'Featured events fetched', { data: { events } });
};

/**
 * @desc  Create event (Admin)
 * @route POST /api/events
 * @access Admin
 */
const createEvent = async (req, res) => {
  const eventData = { ...req.body, organizer: req.user.id };

  // If image uploaded via cloudinary middleware
  if (req.file) {
    eventData.image = { url: req.file.path, publicId: req.file.filename };
  }

  const event = await Event.create(eventData);
  successResponse(res, 'Event created successfully 🎉', { data: { event } }, 201);
};

/**
 * @desc  Update event (Admin)
 * @route PUT /api/events/:id
 * @access Admin
 */
const updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!event) throw new ApiError('Event not found', 404);
  successResponse(res, 'Event updated', { data: { event } });
};

/**
 * @desc  Delete event (Admin)
 * @route DELETE /api/events/:id
 * @access Admin
 */
const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError('Event not found', 404);
  await event.deleteOne();
  successResponse(res, 'Event deleted');
};

/**
 * @desc  Upload event image (Admin)
 * @route POST /api/events/:id/image
 * @access Admin
 */
const uploadEventImage = async (req, res) => {
  if (!req.file) throw new ApiError('No image uploaded', 400);
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { image: { url: req.file.path, publicId: req.file.filename } },
    { new: true }
  );
  if (!event) throw new ApiError('Event not found', 404);
  successResponse(res, 'Image uploaded', { data: { event } });
};

/**
 * @desc  Upload event video (Admin)
 * @route POST /api/events/:id/video
 * @access Admin
 */
const uploadEventVideo = async (req, res) => {
  if (!req.file) throw new ApiError('No video uploaded', 400);
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { 'video.recorded': { url: req.file.path, publicId: req.file.filename } },
    { new: true }
  );
  if (!event) throw new ApiError('Event not found', 404);
  successResponse(res, 'Video uploaded', { data: { event } });
};

/**
 * @desc  Set live stream URL (Admin)
 * @route PATCH /api/events/:id/livestream
 * @access Admin
 */
const setLiveStream = async (req, res) => {
  const { url, isLive } = req.body;
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { 'video.liveStream': { url, isLive } },
    { new: true }
  );
  if (!event) throw new ApiError('Event not found', 404);
  successResponse(res, `Live stream ${isLive ? 'started' : 'stopped'}`, { data: { event } });
};

module.exports = {
  getEvents, getEvent, getFeaturedEvents, createEvent,
  updateEvent, deleteEvent, uploadEventImage, uploadEventVideo, setLiveStream,
};

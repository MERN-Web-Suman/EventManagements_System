// backend/routes/streamingRoutes.js
// Main backend ke streaming endpoints
// Admin stream key banata hai, streaming server event status update karta hai

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Event = require('../models/Event');
const { successResponse, ApiError } = require('../utils/apiResponse');
const axios = require('axios');

const STREAM_SECRET = process.env.STREAM_SECRET || 'festiva_stream_secret_2024';
const STREAM_SERVER = process.env.STREAM_SERVER_URL || 'http://localhost:3001';

/**
 * @desc  Admin — Create stream key for an event
 * @route POST /api/streaming/create-key
 * @access Admin
 */
router.post('/create-key', protect, adminOnly, async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) throw new ApiError('Event ID required', 400);

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError('Event not found', 404);

  // Ask streaming server to generate a key
  const { data } = await axios.post(`${STREAM_SERVER}/api/stream/create`, {
    eventId, title: event.title,
  }, {
    headers: { 'x-stream-secret': STREAM_SECRET },
  });

  const { streamKey, rtmpUrl, hlsUrl } = data.data;

  // Save stream key + HLS URL on event
  await Event.findByIdAndUpdate(eventId, {
    'video.liveStream.streamKey': streamKey,
    'video.liveStream.rtmpUrl': rtmpUrl,
    'video.liveStream.hlsUrl': hlsUrl,
    'video.liveStream.isLive': false,
  });

  successResponse(res, 'Stream key created', {
    data: {
      streamKey,
      rtmpUrl,
      hlsUrl,
      obsSettings: {
        server: rtmpUrl,
        streamKey,
        instructions: [
          'Open OBS Studio',
          'Go to Settings → Stream',
          'Service: Custom',
          `Server: ${rtmpUrl}`,
          `Stream Key: ${streamKey}`,
          'Click OK → Start Streaming',
        ],
      },
    },
  });
});

/**
 * @desc  Streaming server — update event live status (internal call)
 * @route POST /api/streaming/event-live
 * @access Internal (stream secret only)
 */
router.post('/event-live', async (req, res) => {
  const secret = req.headers['x-stream-secret'];
  if (secret !== STREAM_SECRET) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { streamKey, isLive } = req.body;

  await Event.findOneAndUpdate(
    { 'video.liveStream.streamKey': streamKey },
    { 'video.liveStream.isLive': isLive }
  );

  successResponse(res, `Event live status updated: ${isLive}`);
});

/**
 * @desc  Get stream info for an event
 * @route GET /api/streaming/event/:eventId
 * @access Public
 */
router.get('/event/:eventId', async (req, res) => {
  const event = await Event.findById(req.params.eventId)
    .select('title video.liveStream video.recorded');
  if (!event) throw new ApiError('Event not found', 404);

  successResponse(res, 'Stream info fetched', {
    data: { stream: event.video?.liveStream, recorded: event.video?.recorded },
  });
});

/**
 * @desc  Get all live streams right now
 * @route GET /api/streaming/live
 * @access Public
 */
router.get('/live', async (req, res) => {
  const events = await Event.find({ 'video.liveStream.isLive': true })
    .select('title image video.liveStream date location category');
  successResponse(res, 'Live events fetched', { data: { events } });
});

module.exports = router;

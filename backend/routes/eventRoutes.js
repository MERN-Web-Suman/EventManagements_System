// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, getFeaturedEvents, createEvent,
  updateEvent, deleteEvent, uploadEventImage, uploadEventVideo, setLiveStream,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../config/cloudinary');
const { eventValidator, validate } = require('../middleware/validate');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/:id', getEvent);

router.post('/', protect, adminOnly, eventValidator, validate, createEvent);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);
router.post('/:id/image', protect, adminOnly, uploadImage.single('image'), uploadEventImage);
router.post('/:id/video', protect, adminOnly, uploadVideo.single('video'), uploadEventVideo);
router.patch('/:id/livestream', protect, adminOnly, setLiveStream);

module.exports = router;

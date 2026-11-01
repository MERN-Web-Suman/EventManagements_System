// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { submitFeedback, getEventFeedback, getAllFeedback, toggleFeedbackVisibility, deleteFeedback } = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');
const { feedbackValidator, validate } = require('../middleware/validate');

router.post('/', protect, feedbackValidator, validate, submitFeedback);
router.get('/event/:eventId', getEventFeedback);
router.get('/', protect, adminOnly, getAllFeedback);
router.patch('/:id/toggle', protect, adminOnly, toggleFeedbackVisibility);
router.delete('/:id', protect, adminOnly, deleteFeedback);

module.exports = router;

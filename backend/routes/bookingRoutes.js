// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { getMyBookings, getBooking, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.get('/', protect, adminOnly, getAllBookings);

module.exports = router;

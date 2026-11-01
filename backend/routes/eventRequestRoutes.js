// routes/eventRequestRoutes.js
const express = require('express');
const router = express.Router();
const { submitRequest, getMyRequests, getAllRequests, updateRequestStatus } = require('../controllers/eventRequestController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitRequest);
router.get('/my', protect, getMyRequests);
router.get('/', protect, adminOnly, getAllRequests);
router.patch('/:id/status', protect, adminOnly, updateRequestStatus);

module.exports = router;

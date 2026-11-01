// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueGraph, getAllUsers, getRecentActivity } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/revenue-graph', getRevenueGraph);
router.get('/users', getAllUsers);
router.get('/recent-activity', getRecentActivity);

module.exports = router;

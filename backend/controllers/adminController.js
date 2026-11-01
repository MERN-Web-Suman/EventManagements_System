// controllers/adminController.js - Admin Dashboard Controller
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc  Admin dashboard stats
 * @route GET /api/admin/stats
 * @access Admin
 */
const getDashboardStats = async (req, res) => {
  const [
    totalUsers, totalEvents, totalBookings,
    revenueData, pendingBookings, completedBookings, cancelledBookings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Event.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Booking.countDocuments({ paymentStatus: 'pending' }),
    Booking.countDocuments({ paymentStatus: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const totalPaidClients = revenueData[0]?.count || 0;

  successResponse(res, 'Dashboard stats fetched', {
    data: {
      totalUsers, totalEvents, totalBookings, totalRevenue,
      totalPaidClients, pendingBookings, completedBookings, cancelledBookings,
    },
  });
};

/**
 * @desc  Revenue graph data (last 12 months)
 * @route GET /api/admin/revenue-graph
 * @access Admin
 */
const getRevenueGraph = async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const data = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Fill in missing months with 0
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthName = d.toLocaleString('default', { month: 'short' });

    const found = data.find((r) => r._id.year === year && r._id.month === month);
    months.push({
      month: `${monthName} ${year}`,
      revenue: found?.revenue || 0,
      bookings: found?.bookings || 0,
    });
  }

  successResponse(res, 'Revenue graph data fetched', { data: { graph: months } });
};

/**
 * @desc  Get all users (Admin)
 * @route GET /api/admin/users
 * @access Admin
 */
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = { role: 'user' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    User.countDocuments(query),
  ]);

  successResponse(res, 'Users fetched', { data: { users, total } });
};

/**
 * @desc  Get recent activity (Admin)
 * @route GET /api/admin/recent-activity
 * @access Admin
 */
const getRecentActivity = async (req, res) => {
  const [recentBookings, recentUsers] = await Promise.all([
    Booking.find({ paymentStatus: 'completed' })
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    User.find({ role: 'user' }).select('name email createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  successResponse(res, 'Recent activity fetched', {
    data: { recentBookings, recentUsers },
  });
};

module.exports = { getDashboardStats, getRevenueGraph, getAllUsers, getRecentActivity };

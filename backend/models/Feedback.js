// models/Feedback.js - Feedback/Review Schema
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One review per user per event
feedbackSchema.index({ user: 1, event: 1 }, { unique: true });

// Update event average rating after save
feedbackSchema.post('save', async function () {
  const Event = mongoose.model('Event');
  const stats = await this.constructor.aggregate([
    { $match: { event: this.event } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Event.findByIdAndUpdate(this.event, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

// models/EventRequest.js - User Event Request Schema
const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventTitle: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education', 'Health', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    preferredDate: {
      type: Date,
    },
    preferredLocation: {
      type: String,
    },
    expectedAttendees: {
      type: Number,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventRequest', eventRequestSchema);

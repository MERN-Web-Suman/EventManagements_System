// models/Booking.js - Booking Schema
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      default: () => `FEST-${uuidv4().substring(0, 8).toUpperCase()}`,
    },
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
    quantity: {
      type: Number,
      required: true,
      min: [1, 'At least 1 ticket required'],
      max: [10, 'Cannot book more than 10 tickets at once'],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },
    cancellationReason: String,
    cancelledAt: Date,
    attendees: [
      {
        name: String,
        email: String,
        phone: String,
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ ticketNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

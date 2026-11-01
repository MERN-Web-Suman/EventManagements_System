// // models/Event.js - Event Schema
// const mongoose = require('mongoose');

// const eventSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, 'Event title is required'],
//       trim: true,
//       maxlength: [100, 'Title cannot exceed 100 characters'],
//     },
//     description: {
//       type: String,
//       required: [true, 'Description is required'],
//       maxlength: [2000, 'Description cannot exceed 2000 characters'],
//     },
//     category: {
//       type: String,
//       required: [true, 'Category is required'],
//       enum: ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education', 'Health', 'Other'],
//     },
//     date: {
//       type: Date,
//       required: [true, 'Event date is required'],
//     },
//     endDate: {
//       type: Date,
//     },
//     time: {
//       type: String,
//       required: [true, 'Event time is required'],
//     },
//     location: {
//       venue: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String },
//       address: { type: String },
//     },
//     price: {
//       type: Number,
//       required: [true, 'Price is required'],
//       min: [0, 'Price cannot be negative'],
//     },
//     totalSeats: {
//       type: Number,
//       required: [true, 'Total seats is required'],
//       min: [1, 'At least 1 seat required'],
//     },
//     bookedSeats: {
//       type: Number,
//       default: 0,
//     },
//     image: {
//       url: { type: String, default: '' },
//       publicId: { type: String, default: '' },
//     },
//     video: {
//       recorded: {
//         url: { type: String, default: '' },
//         publicId: { type: String, default: '' },
//       },
//       liveStream: {
//         url: { type: String, default: '' },
//         isLive: { type: Boolean, default: false },
//       },
//     },
//     tags: [String],
//     status: {
//       type: String,
//       enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
//       default: 'upcoming',
//     },
//     organizer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     featured: {
//       type: Boolean,
//       default: false,
//     },
//     averageRating: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5,
//     },
//     totalReviews: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// // Index for search & filter
// eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
// eventSchema.index({ category: 1, date: 1, status: 1 });

// // Virtual: available seats
// eventSchema.virtual('availableSeats').get(function () {
//   return this.totalSeats - this.bookedSeats;
// });

// eventSchema.set('toJSON', { virtuals: true });

// module.exports = mongoose.model('Event', eventSchema);















// backend/models/Event.js - Updated with full streaming fields
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String, required: true,
      enum: ['Music','Technology','Sports','Art','Food','Business','Comedy','Education','Health','Other'],
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, required: true },
    location: {
      venue: { type: String, required: true },
      city:  { type: String, required: true },
      state: { type: String },
      address: { type: String },
    },
    price: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    bookedSeats: { type: Number, default: 0 },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    video: {
      recorded: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
        duration: { type: Number },
        uploadedAt: { type: Date },
      },
      liveStream: {
        isLive:       { type: Boolean, default: false },
        streamKey:    { type: String, default: '' },
        rtmpUrl:      { type: String, default: '' },
        hlsUrl:       { type: String, default: '' },
        startedAt:    { type: Date },
        endedAt:      { type: Date },
        peakViewers:  { type: Number, default: 0 },
        recordingPath:{ type: String, default: '' },
      },
    },
    tags: [String],
    status: {
      type: String,
      enum: ['upcoming','ongoing','completed','cancelled'],
      default: 'upcoming',
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    featured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, date: 1, status: 1 });
eventSchema.virtual('availableSeats').get(function () { return this.totalSeats - this.bookedSeats; });
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);

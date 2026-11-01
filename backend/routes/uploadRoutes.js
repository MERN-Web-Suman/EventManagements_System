// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage, uploadVideo } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/auth');
const { successResponse, ApiError } = require('../utils/apiResponse');

// Upload image
router.post('/image', protect, adminOnly, uploadImage.single('image'), async (req, res) => {
  if (!req.file) throw new ApiError('No image uploaded', 400);
  successResponse(res, 'Image uploaded', {
    data: { url: req.file.path, publicId: req.file.filename },
  });
});

// Upload video
router.post('/video', protect, adminOnly, uploadVideo.single('video'), async (req, res) => {
  if (!req.file) throw new ApiError('No video uploaded', 400);
  successResponse(res, 'Video uploaded', {
    data: { url: req.file.path, publicId: req.file.filename },
  });
});

module.exports = router;

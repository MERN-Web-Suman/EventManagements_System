// controllers/authController.js - Authentication Controller
const User = require('../models/User');
const { generateOTP, getOTPExpiry, isOTPValid } = require('../utils/otpService');
const { sendVerificationOTP } = require('../utils/emailService');
const { ApiError, successResponse } = require('../utils/apiResponse');

/**
 * @desc  Register new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  const { name, email, password, phone, adminKey } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError('Email already registered', 400);
    }
    // Resend OTP if not verified
    const otp = generateOTP();
    existingUser.name = name;
    existingUser.otp = { code: otp, expiresAt: getOTPExpiry(10) };
    await existingUser.save();
    await sendVerificationOTP(email, name, otp);
    return successResponse(res, 'OTP resent to your email. Please verify.', {}, 200);
  }

  // Determine role
  let role = 'user';
  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
    role = 'admin';
  }

  // Generate OTP
  const otp = generateOTP();

  // Create user (unverified)
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    isVerified: false,
    otp: { code: otp, expiresAt: getOTPExpiry(10) },
  });

  // Send OTP email
  await sendVerificationOTP(email, name, otp);

  successResponse(res, 'Registration successful! Please verify your email with the OTP sent.', {
    data: { userId: user._id, email: user.email },
  }, 201);
};

/**
 * @desc  Verify email OTP
 * @route POST /api/auth/verify-otp
 * @access Public
 */
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError('User not found', 404);

  if (user.isVerified) throw new ApiError('Email already verified', 400);

  if (!isOTPValid(user.otp, otp)) {
    throw new ApiError('Invalid or expired OTP', 400);
  }

  // Mark as verified
  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  const token = user.generateToken();

  successResponse(res, 'Email verified successfully! Welcome to FESTIVA 🎉', {
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
};

/**
 * @desc  Resend OTP
 * @route POST /api/auth/resend-otp
 * @access Public
 */
const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError('User not found', 404);
  if (user.isVerified) throw new ApiError('Email already verified', 400);

  const otp = generateOTP();
  user.otp = { code: otp, expiresAt: getOTPExpiry(10) };
  await user.save();

  await sendVerificationOTP(email, user.name, otp);

  successResponse(res, 'OTP resent successfully');
};

/**
 * @desc  Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError('Invalid credentials', 401);

  if (!user.isVerified) {
    throw new ApiError('Please verify your email before logging in', 403);
  }

  const token = user.generateToken();

  successResponse(res, 'Login successful', {
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    },
  });
};

/**
 * @desc  Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  successResponse(res, 'Profile fetched', { data: { user } });
};

/**
 * @desc  Update profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone },
    { new: true, runValidators: true }
  );
  successResponse(res, 'Profile updated', { data: { user } });
};

module.exports = { register, verifyOTP, resendOTP, login, getMe, updateProfile };

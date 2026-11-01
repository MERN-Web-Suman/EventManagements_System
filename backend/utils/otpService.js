// utils/otpService.js - OTP Generation & Validation
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiry time (minutes from now)
 */
const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if OTP is valid
 */
const isOTPValid = (otpObj, inputOTP) => {
  if (!otpObj || !otpObj.code || !otpObj.expiresAt) return false;
  if (new Date() > new Date(otpObj.expiresAt)) return false;
  return otpObj.code === inputOTP;
};

module.exports = { generateOTP, getOTPExpiry, isOTPValid };

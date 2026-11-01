// utils/apiResponse.js - Standardized API Response Helpers

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Build pagination metadata
 */
const paginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

module.exports = { ApiError, successResponse, errorResponse, paginationMeta };

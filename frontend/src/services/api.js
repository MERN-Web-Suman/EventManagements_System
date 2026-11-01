// src/services/api.js - Axios API Service
import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('festiva_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('festiva_token');
      localStorage.removeItem('festiva_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth Services ─────────────────────────────────────────────
export const authService = {
  register: (data) => API.post('/auth/register', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ─── Event Services ────────────────────────────────────────────
export const eventService = {
  getEvents: (params) => API.get('/events', { params }),
  getEvent: (id) => API.get(`/events/${id}`),
  getFeaturedEvents: () => API.get('/events/featured'),
  createEvent: (data) => API.post('/events', data),
  updateEvent: (id, data) => API.put(`/events/${id}`, data),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  uploadImage: (id, formData) =>
    API.post(`/events/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo: (id, formData) =>
    API.post(`/events/${id}/video`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  setLiveStream: (id, data) => API.patch(`/events/${id}/livestream`, data),
};

// ─── Booking Services ──────────────────────────────────────────
export const bookingService = {
  getMyBookings: (params) => API.get('/bookings/my', { params }),
  getBooking: (id) => API.get(`/bookings/${id}`),
  cancelBooking: (id, data) => API.patch(`/bookings/${id}/cancel`, data),
  getAllBookings: (params) => API.get('/bookings', { params }),
};

// ─── Payment Services ──────────────────────────────────────────
export const paymentService = {
  getRazorpayKey: () => API.get('/payments/key'),
  sendPaymentOTP: (data) => API.post('/payments/send-otp', data),
  createOrder: (data) => API.post('/payments/create-order', data),
  verifyPayment: (data) => API.post('/payments/verify', data),
};

// ─── Feedback Services ─────────────────────────────────────────
export const feedbackService = {
  submitFeedback: (data) => API.post('/feedback', data),
  getEventFeedback: (eventId, params) => API.get(`/feedback/event/${eventId}`, { params }),
  getAllFeedback: (params) => API.get('/feedback', { params }),
  toggleVisibility: (id) => API.patch(`/feedback/${id}/toggle`),
  deleteFeedback: (id) => API.delete(`/feedback/${id}`),
};

// ─── Admin Services ────────────────────────────────────────────
export const adminService = {
  getDashboardStats: () => API.get('/admin/stats'),
  getRevenueGraph: () => API.get('/admin/revenue-graph'),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  getRecentActivity: () => API.get('/admin/recent-activity'),
};

// ─── Event Request Services ────────────────────────────────────
export const eventRequestService = {
  submitRequest: (data) => API.post('/event-requests', data),
  getMyRequests: () => API.get('/event-requests/my'),
  getAllRequests: (params) => API.get('/event-requests', { params }),
  updateStatus: (id, data) => API.patch(`/event-requests/${id}/status`, data),
};

export default API;

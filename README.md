# 🎊 FESTIVA — Event Management System

> **Production-ready full-stack MERN application** for discovering, booking, and managing events with Razorpay payments, PDF tickets, email OTP verification, live streaming, and a powerful admin dashboard.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schemas](#database-schemas)
- [API Endpoints](#api-endpoints)
- [Setup Guide](#setup-guide)
- [Environment Variables](#environment-variables)

---

## ✨ Features

### 👤 User Features
- **Signup/Login** with JWT authentication
- **Email OTP Verification** on signup (Nodemailer)
- **Browse Events** with search, filter by category/price, sort, pagination
- **Ticket Booking** with Razorpay payment gateway
- **OTP before payment** — extra security layer
- **PDF Ticket** auto-generated and emailed after payment
- **User Dashboard** — view all bookings, status, ticket numbers
- **Submit Feedback/Reviews** (with star rating)
- **Request Events** — users can request admin to organize events
- **Cancel Bookings** (up to 24 hours before event)

### 🎟️ Booking Flow
```
User clicks Book Now
  → Payment OTP sent to email
  → User enters OTP
  → Razorpay payment gateway opens
  → Payment successful
  → PDF ticket generated
  → Confirmation email with PDF sent
  → Booking shown in User Dashboard
```

### 🛠️ Admin Features
- **Dashboard** with revenue stats, total users, paid clients, pending payments
- **Revenue Graph** — 12-month line chart (Recharts)
- **Event Management** — Create, Edit, Delete events with image/video upload (Cloudinary)
- **Booking Management** — View all bookings with filters
- **Event Requests** — Review/Approve/Reject user requests
- **Feedback Management** — View, hide, delete reviews
- **User Management** — View all registered users

### 🎥 Media
- **Cloudinary** for image and video upload
- **Live stream URL** support per event
- **Recorded video** upload per event

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS, React Router v6 |
| State | React Context API |
| HTTP Client | Axios (with interceptors) |
| Charts | Recharts |
| Icons | React Icons |
| Toasts | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Payments | Razorpay |
| File Storage | Cloudinary |
| PDF Generation | PDFKit |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |

---

## 📁 Project Structure

```
festiva/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── authController.js  # Register, login, OTP, profile
│   │   ├── eventController.js # CRUD events, media upload
│   │   ├── bookingController.js
│   │   ├── paymentController.js  # Razorpay integration
│   │   ├── feedbackController.js
│   │   ├── adminController.js    # Stats, graphs, users
│   │   └── eventRequestController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect, adminOnly, isVerified
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validate.js        # express-validator rules
│   ├── models/
│   │   ├── User.js            # User schema + JWT methods
│   │   ├── Event.js           # Event schema with media
│   │   ├── Booking.js         # Booking + ticket number
│   │   ├── Feedback.js        # Reviews with avg rating update
│   │   └── EventRequest.js    # User-submitted event requests
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── eventRequestRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── emailService.js    # OTP, payment OTP, ticket emails
│   │   ├── otpService.js      # Generate + validate OTP
│   │   ├── pdfGenerator.js    # PDFKit ticket generator
│   │   └── apiResponse.js     # Standard response helpers
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.js
    │   │   │   ├── Footer.js
    │   │   │   ├── LoadingSpinner.js
    │   │   │   └── SkeletonCard.js
    │   │   ├── events/
    │   │   │   └── EventCard.js
    │   │   └── admin/
    │   │       └── AdminLayout.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Events.js
    │   │   ├── EventDetail.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── VerifyOTP.js
    │   │   ├── user/
    │   │   │   ├── UserDashboard.js
    │   │   │   ├── MyBookings.js
    │   │   │   └── MyRequests.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminEvents.js
    │   │       ├── AdminEventForm.js
    │   │       ├── AdminBookings.js
    │   │       ├── AdminFeedback.js
    │   │       ├── AdminRequests.js
    │   │       └── AdminUsers.js
    │   ├── services/
    │   │   └── api.js         # All Axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

## 🗄️ Database Schemas

### User
| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name (required) |
| email | String | Unique, lowercase |
| password | String | bcrypt hashed, select:false |
| phone | String | Optional |
| role | Enum | user / admin |
| isVerified | Boolean | Email verified flag |
| otp | Object | { code, expiresAt } — signup OTP |
| paymentOtp | Object | { code, expiresAt } — booking OTP |

### Event
| Field | Type | Description |
|-------|------|-------------|
| title | String | Event name |
| description | String | Max 2000 chars |
| category | Enum | Music, Tech, Sports, etc. |
| date / endDate | Date | Event dates |
| time | String | Display time |
| location | Object | { venue, city, state, address } |
| price | Number | 0 for free |
| totalSeats / bookedSeats | Number | Seat tracking |
| image | Object | { url, publicId } — Cloudinary |
| video | Object | { recorded: {url, publicId}, liveStream: {url, isLive} } |
| status | Enum | upcoming / ongoing / completed / cancelled |
| featured | Boolean | Show on homepage |
| averageRating / totalReviews | Number | Auto-updated by Feedback post hook |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| ticketNumber | String | Auto-generated FEST-XXXXXXXX |
| user / event | ObjectId | References |
| quantity | Number | 1–10 |
| totalAmount | Number | price × quantity |
| paymentStatus | Enum | pending / completed / failed / refunded |
| paymentId | String | Razorpay payment ID |
| razorpayOrderId | String | For signature verification |
| status | Enum | confirmed / cancelled / pending |

### Feedback
| Field | Type | Description |
|-------|------|-------------|
| user / event / booking | ObjectId | References |
| rating | Number | 1–5 |
| comment | String | Max 500 chars |
| isVisible | Boolean | Admin can hide |
> **Note:** Post-save hook automatically updates Event's `averageRating` and `totalReviews`

### EventRequest
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Who requested |
| eventTitle | String | Requested event name |
| category | Enum | Same as Event |
| description | String | Details |
| preferredDate / preferredLocation | Mixed | Optional |
| status | Enum | pending / reviewed / approved / rejected |
| adminNote | String | Admin's response |

---

## 🔌 API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user, send OTP |
| POST | `/verify-otp` | Public | Verify email OTP |
| POST | `/resend-otp` | Public | Resend OTP |
| POST | `/login` | Public | Login, get JWT |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update profile |

### Events `/api/events`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all events (search, filter, paginate) |
| GET | `/featured` | Public | Get featured events |
| GET | `/:id` | Public | Get single event |
| POST | `/` | Admin | Create event |
| PUT | `/:id` | Admin | Update event |
| DELETE | `/:id` | Admin | Delete event |
| POST | `/:id/image` | Admin | Upload event image |
| POST | `/:id/video` | Admin | Upload event video |
| PATCH | `/:id/livestream` | Admin | Set live stream |

### Payments `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/key` | Private | Get Razorpay key |
| POST | `/send-otp` | Private | Send payment OTP |
| POST | `/create-order` | Private | Create Razorpay order (requires OTP) |
| POST | `/verify` | Private | Verify payment + confirm booking |

### Bookings `/api/bookings`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/my` | Private | Get my bookings |
| GET | `/:id` | Private | Get booking detail |
| PATCH | `/:id/cancel` | Private | Cancel booking |
| GET | `/` | Admin | Get all bookings |

### Feedback `/api/feedback`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Submit review |
| GET | `/event/:eventId` | Public | Get event reviews |
| GET | `/` | Admin | Get all reviews |
| PATCH | `/:id/toggle` | Admin | Toggle visibility |
| DELETE | `/:id` | Admin | Delete review |

### Admin `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Dashboard stats |
| GET | `/revenue-graph` | Admin | 12-month revenue chart |
| GET | `/users` | Admin | All users |
| GET | `/recent-activity` | Admin | Recent bookings + signups |

### Event Requests `/api/event-requests`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Submit request |
| GET | `/my` | Private | My requests |
| GET | `/` | Admin | All requests |
| PATCH | `/:id/status` | Admin | Update status |

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for Nodemailer)
- Razorpay account
- Cloudinary account

### Step 1 — Clone & Install

```bash
# Clone or extract project
cd festiva

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/festiva

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=FESTIVA <your_gmail@gmail.com>

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLIENT_URL=http://localhost:3000
ADMIN_SECRET_KEY=festiva_admin_2024
```

### Step 3 — Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Step 4 — Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate a password for "Mail"
5. Use that 16-digit password as `EMAIL_PASS`

### Step 5 — Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

### Step 6 — Create Admin Account
Register normally but include the `adminKey` field:
```json
{
  "name": "Admin User",
  "email": "admin@festiva.com",
  "password": "admin123",
  "adminKey": "festiva_admin_2024"
}
```

### Step 7 — Test Razorpay (Test Mode)
- Use test card: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- OTP: `1234` (Razorpay test)

---

## 🎨 UI Features
- **Dark theme** with orange gradient accents
- **Glassmorphism** cards with backdrop blur
- **Loading skeletons** for all data-fetching states
- **Toast notifications** for all actions
- **Animated cards** on hover (lift + shadow)
- **OTP input** with auto-focus and paste support
- **Responsive** — mobile, tablet, desktop
- **Admin sidebar** collapses on mobile

---

## 🔒 Security Features
- JWT with 7-day expiry
- Rate limiting on all API routes (15 min windows)
- Stricter rate limiting on auth routes (10 req/15min)
- Helmet for HTTP security headers
- bcrypt password hashing (12 rounds)
- Razorpay signature verification
- Role-based access control (user/admin)
- Input validation on all endpoints

---

## 📦 Production Deployment

### Backend (Railway/Render/Heroku)
```bash
cd backend
npm start  # uses node server.js
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the /build folder
```

### MongoDB Atlas
Replace `MONGO_URI` with your Atlas connection string.

---

*Built with ❤️ for event lovers | FESTIVA © 2026*





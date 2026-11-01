// // src/App.js - Main App with Routing
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';

// // Pages
// import Home from './pages/Home';
// import Events from './pages/Events';
// import EventDetail from './pages/EventDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import VerifyOTP from './pages/VerifyOTP';

// // User pages
// import UserDashboard from './pages/user/UserDashboard';
// import MyBookings from './pages/user/MyBookings';
// import MyRequests from './pages/user/MyRequests';

// // Admin pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminEvents from './pages/admin/AdminEvents';
// import AdminEventForm from './pages/admin/AdminEventForm';
// import AdminBookings from './pages/admin/AdminBookings';
// import AdminFeedback from './pages/admin/AdminFeedback';
// import AdminRequests from './pages/admin/AdminRequests';
// import AdminUsers from './pages/admin/AdminUsers';

// // Components
// import Navbar from './components/common/Navbar';
// import Footer from './components/common/Footer';
// import LoadingSpinner from './components/common/LoadingSpinner';

// // Protected Route wrapper
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
//   return children;
// };

// const AppRoutes = () => {
//   const { isAdmin } = useAuth();

//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen">
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Home />} />
//           <Route path="/events" element={<Events />} />
//           <Route path="/events/:id" element={<EventDetail />} />

//           {/* Auth */}
//           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
//           <Route path="/verify-otp" element={<VerifyOTP />} />

//           {/* User */}
//           <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
//           <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
//           <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />

//           {/* Admin */}
//           <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
//           <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
//           <Route path="/admin/events/new" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/events/edit/:id" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
//           <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><AdminFeedback /></ProtectedRoute>} />
//           <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />
//           <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>
//       <Footer />
//     </>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3500,
//             style: {
//               background: '#1a1a2e',
//               color: '#fff',
//               border: '1px solid rgba(255,107,53,0.3)',
//               borderRadius: '12px',
//               fontFamily: 'DM Sans, sans-serif',
//             },
//             success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
//             error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
//           }}
//         />
//         <AppRoutes />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;












// // for solution
// // src/App.js - Main App with Routing
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';

// // Pages
// import Home from './pages/Home';
// import Events from './pages/Events';
// import EventDetail from './pages/EventDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import VerifyOTP from './pages/VerifyOTP';

// // User pages
// import UserDashboard from './pages/user/UserDashboard';
// import MyBookings from './pages/user/MyBookings';
// import MyRequests from './pages/user/MyRequests';

// // Admin pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminEvents from './pages/admin/AdminEvents';
// import AdminEventForm from './pages/admin/AdminEventForm';
// import AdminBookings from './pages/admin/AdminBookings';
// import AdminFeedback from './pages/admin/AdminFeedback';
// import AdminRequests from './pages/admin/AdminRequests';
// import AdminUsers from './pages/admin/AdminUsers';

// // Components
// import Navbar from './components/common/Navbar';
// import Footer from './components/common/Footer';
// import LoadingSpinner from './components/common/LoadingSpinner';

// // Protected Route wrapper
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
//   return children;
// };

// const AppRoutes = () => {
//   const location = useLocation();

//   // Admin pages have their own layout with sidebar — hide global Navbar & Footer
//   const isAdminRoute = location.pathname.startsWith('/admin');

//   return (
//     <>
//       {/* Only show Navbar & Footer on non-admin pages */}
//       {!isAdminRoute && <Navbar />}

//       <main className="min-h-screen">
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Home />} />
//           <Route path="/events" element={<Events />} />
//           <Route path="/events/:id" element={<EventDetail />} />

//           {/* Auth */}
//           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
//           <Route path="/verify-otp" element={<VerifyOTP />} />

//           {/* User */}
//           <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
//           <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
//           <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />

//           {/* Admin */}
//           <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
//           <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
//           <Route path="/admin/events/new" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/events/edit/:id" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
//           <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><AdminFeedback /></ProtectedRoute>} />
//           <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />
//           <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>

//       {/* Footer bhi admin pages par nahi dikhega */}
//       {!isAdminRoute && <Footer />}
//     </>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3500,
//             style: {
//               background: '#1a1a2e',
//               color: '#fff',
//               border: '1px solid rgba(255,107,53,0.3)',
//               borderRadius: '12px',
//               fontFamily: 'DM Sans, sans-serif',
//             },
//             success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
//             error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
//           }}
//         />
//         <AppRoutes />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
















// // src/App.js - Main App with Routing
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';

// // Pages
// import Home from './pages/Home';
// import Events from './pages/Events';
// import EventDetail from './pages/EventDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import VerifyOTP from './pages/VerifyOTP';

// // User pages
// import UserDashboard from './pages/user/UserDashboard';
// import MyBookings from './pages/user/MyBookings';
// import MyRequests from './pages/user/MyRequests';

// // Admin pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminEvents from './pages/admin/AdminEvents';
// import AdminEventForm from './pages/admin/AdminEventForm';
// import AdminBookings from './pages/admin/AdminBookings';
// import AdminFeedback from './pages/admin/AdminFeedback';
// import AdminRequests from './pages/admin/AdminRequests';
// import AdminUsers from './pages/admin/AdminUsers';

// // Components
// import Navbar from './components/common/Navbar';
// import Footer from './components/common/Footer';
// import LoadingSpinner from './components/common/LoadingSpinner';

// // Protected Route wrapper
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, isAdmin, loading } = useAuth();
//   if (loading) return <LoadingSpinner />;
//   if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
//   return children;
// };

// const AppRoutes = () => {
//   const location = useLocation();

//   // Admin pages have their own layout with sidebar — hide global Navbar & Footer
//   const isAdminRoute = location.pathname.startsWith('/admin');

//   return (
//     <>
//       {/* Only show Navbar & Footer on non-admin pages */}
//       {!isAdminRoute && <Navbar />}

//       <main className="min-h-screen">
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Home />} />
//           <Route path="/events" element={<Events />} />
//           <Route path="/events/:id" element={<EventDetail />} />

//           {/* Auth */}
//           <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//           <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
//           <Route path="/verify-otp" element={<VerifyOTP />} />

//           {/* User */}
//           <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
//           <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
//           <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />

//           {/* Admin */}
//           <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
//           <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
//           <Route path="/admin/events/new" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/events/edit/:id" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
//           <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
//           <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><AdminFeedback /></ProtectedRoute>} />
//           <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />
//           <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>

//       {/* Footer bhi admin pages par nahi dikhega */}
//       {!isAdminRoute && <Footer />}
//     </>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3500,
//             style: {
//               background: '#1a1a2e',
//               color: '#fff',
//               border: '1px solid rgba(255,107,53,0.3)',
//               borderRadius: '12px',
//               fontFamily: 'DM Sans, sans-serif',
//             },
//             success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
//             error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
//           }}
//         />
//         <AppRoutes />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;



















// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import LiveWatch from './pages/live/LiveWatch';

import UserDashboard from './pages/user/UserDashboard';
import MyBookings from './pages/user/MyBookings';
import MyRequests from './pages/user/MyRequests';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminBookings from './pages/admin/AdminBookings';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminRequests from './pages/admin/AdminRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStreamManager from './pages/admin/AdminStreamManager';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/live" element={<LiveWatch />} />

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/events/new" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
          <Route path="/admin/events/edit/:id" element={<ProtectedRoute adminOnly><AdminEventForm /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><AdminFeedback /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/stream" element={<ProtectedRoute adminOnly><AdminStreamManager /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1a2e', color: '#fff',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '12px', fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

// // src/components/admin/AdminLayout.js
// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import {
//   FiGrid, FiCalendar, FiBookOpen, FiMessageSquare,
//   FiUsers, FiSend, FiLogOut, FiMenu, FiX
// } from 'react-icons/fi';
// import { HiSparkles } from 'react-icons/hi';

// const navItems = [
//   { to: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
//   { to: '/admin/events', label: 'Events', icon: FiCalendar },
//   { to: '/admin/bookings', label: 'Bookings', icon: FiBookOpen },
//   { to: '/admin/requests', label: 'Requests', icon: FiSend },
//   { to: '/admin/feedback', label: 'Feedback', icon: FiMessageSquare },
//   { to: '/admin/users', label: 'Users', icon: FiUsers },
// ];

// const AdminLayout = ({ children, title }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleLogout = () => { logout(); navigate('/'); };

//   const isActive = (item) =>
//     item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

//   const Sidebar = () => (
//     <div className="flex flex-col h-full">
//       <div className="p-5 border-b border-white/10">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center">
//             <HiSparkles className="text-white text-sm" />
//           </div>
//           <div>
//             <span className="font-display font-black text-lg gradient-text">FESTIVA</span>
//             <p className="text-xs text-gray-500">Admin Panel</p>
//           </div>
//         </div>
//       </div>

//       <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
//         {navItems.map((item) => (
//           <Link
//             key={item.to}
//             to={item.to}
//             onClick={() => setSidebarOpen(false)}
//             className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
//               isActive(item)
//                 ? 'bg-orange-gradient text-white shadow-lg shadow-primary-500/20'
//                 : 'text-gray-400 hover:text-white hover:bg-white/8'
//             }`}
//           >
//             <item.icon size={16} />
//             {item.label}
//           </Link>
//         ))}
//       </nav>

//       <div className="p-3 border-t border-white/10">
//         <button onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
//           <FiLogOut size={16} /> Logout
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-dark-900 overflow-hidden">
//       {/* Desktop Sidebar */}
//       <div className="hidden lg:flex w-56 flex-shrink-0 bg-dark-800 border-r border-white/5 flex-col">
//         <Sidebar />
//       </div>

//       {/* Mobile Sidebar */}
//       {sidebarOpen && (
//         <div className="lg:hidden fixed inset-0 z-50">
//           <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
//           <div className="absolute left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-white/5">
//             <Sidebar />
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top bar */}
//         <header className="bg-dark-800 border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg glass text-gray-400">
//               <FiMenu size={18} />
//             </button>
//             <h1 className="font-display font-bold text-xl text-white">{title}</h1>
//           </div>
//           <div className="flex items-center gap-2">
//             <Link to="/" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 glass rounded-lg transition-all">
//               View Site
//             </Link>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;














// // src/components/admin/AdminLayout.js
// // Sirf Admin pages use karte hain is layout ko.
// // Iske andar ek dedicated AdminNavbar hai — bina logo ke, clean top bar.
// // Main Navbar (Navbar.js) admin routes par render nahi hota (App.js mein control hai).

// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import {
//   FiGrid, FiCalendar, FiBookOpen, FiMessageSquare,
//   FiUsers, FiSend, FiLogOut, FiMenu, FiX,
//   FiBell, FiSettings, FiChevronDown, FiExternalLink
// } from 'react-icons/fi';
// import { HiSparkles } from 'react-icons/hi';

// const navItems = [
//   { to: '/admin',           label: 'Dashboard', icon: FiGrid,         exact: true },
//   { to: '/admin/events',    label: 'Events',    icon: FiCalendar },
//   { to: '/admin/bookings',  label: 'Bookings',  icon: FiBookOpen },
//   { to: '/admin/requests',  label: 'Requests',  icon: FiSend },
//   { to: '/admin/feedback',  label: 'Feedback',  icon: FiMessageSquare },
//   { to: '/admin/users',     label: 'Users',     icon: FiUsers },
// ];

// // ─── Admin-only Top Navbar (bina logo ke) ────────────────────────────────────
// // Yeh component sirf AdminLayout ke andar use hota hai.
// // Main Navbar.js se bilkul alag hai — koi conflict nahi.
// const AdminNavbar = ({ title, onMenuClick }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [profileOpen, setProfileOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   return (
//     <header className="bg-dark-800 border-b border-white/5 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 relative z-30">

//       {/* Left — mobile menu button + page title */}
//       <div className="flex items-center gap-3">
//         {/* Mobile hamburger */}
//         <button
//           onClick={onMenuClick}
//           className="lg:hidden p-1.5 rounded-lg glass text-gray-400 hover:text-white transition-colors"
//         >
//           <FiMenu size={18} />
//         </button>

//         {/* Page title */}
//         <h1 className="font-display font-bold text-lg text-white tracking-tight">
//           {title}
//         </h1>
//       </div>

//       {/* Right — actions + profile */}
//       <div className="flex items-center gap-2">

//         {/* View Site button */}
//         <Link
//           to="/"
//           className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-gray-400 hover:text-white transition-all"
//         >
//           <FiExternalLink size={12} /> View Site
//         </Link>

//         {/* Notification bell (decorative / future use) */}
//         <button className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors">
//           <FiBell size={16} />
//           <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
//         </button>

//         {/* Profile dropdown */}
//         <div className="relative">
//           <button
//             onClick={() => setProfileOpen(!profileOpen)}
//             className="flex items-center gap-2 px-2.5 py-1.5 glass rounded-xl hover:border-primary-500/30 transition-all"
//           >
//             {/* Avatar */}
//             <div className="w-7 h-7 rounded-full bg-orange-gradient flex items-center justify-center flex-shrink-0">
//               <span className="text-white text-xs font-bold">
//                 {user?.name?.[0]?.toUpperCase()}
//               </span>
//             </div>
//             {/* Name — desktop only */}
//             <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
//               {user?.name?.split(' ')[0]}
//             </span>
//             <FiChevronDown
//               size={13}
//               className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
//             />
//           </button>

//           {/* Dropdown */}
//           {profileOpen && (
//             <>
//               {/* Backdrop */}
//               <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />

//               <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden z-20 animate-slide-down">
//                 {/* User info */}
//                 <div className="p-3 border-b border-white/10">
//                   <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
//                   <p className="text-xs text-gray-400 truncate">{user?.email}</p>
//                   <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full font-medium">
//                     Admin
//                   </span>
//                 </div>

//                 {/* Actions */}
//                 <div className="p-1.5">
//                   <Link
//                     to="/"
//                     onClick={() => setProfileOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/8 rounded-xl transition-all"
//                   >
//                     <FiExternalLink size={14} /> View Public Site
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
//                   >
//                     <FiLogOut size={14} /> Logout
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// // ─── Sidebar ─────────────────────────────────────────────────────────────────
// const Sidebar = ({ onClose }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   const handleLogout = () => { logout(); navigate('/'); };

//   const isActive = (item) =>
//     item.exact
//       ? location.pathname === item.to
//       : location.pathname.startsWith(item.to);

//   return (
//     <div className="flex flex-col h-full">
//       {/* Brand — sidebar mein logo + FESTIVA rahega */}
//       <div className="p-5 border-b border-white/10 flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center shadow-lg">
//             <HiSparkles className="text-white text-sm" />
//           </div>
//           <div>
//             <span className="font-display font-black text-lg gradient-text leading-none">FESTIVA</span>
//             <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
//           </div>
//         </div>
//         {/* Mobile close button */}
//         {onClose && (
//           <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors">
//             <FiX size={18} />
//           </button>
//         )}
//       </div>

//       {/* Nav links */}
//       <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
//         {navItems.map((item) => (
//           <Link
//             key={item.to}
//             to={item.to}
//             onClick={onClose}
//             className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
//               isActive(item)
//                 ? 'bg-orange-gradient text-white shadow-lg shadow-primary-500/20'
//                 : 'text-gray-400 hover:text-white hover:bg-white/8'
//             }`}
//           >
//             <item.icon size={16} />
//             {item.label}
//           </Link>
//         ))}
//       </nav>

//       {/* Logout at bottom */}
//       <div className="p-3 border-t border-white/10">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
//         >
//           <FiLogOut size={16} /> Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// // ─── Main AdminLayout ─────────────────────────────────────────────────────────
// const AdminLayout = ({ children, title }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-dark-900 overflow-hidden">

//       {/* ── Desktop Sidebar (always visible on lg+) ── */}
//       <div className="hidden lg:flex w-56 flex-shrink-0 bg-dark-800 border-r border-white/5 flex-col">
//         <Sidebar />
//       </div>

//       {/* ── Mobile Sidebar (overlay) ── */}
//       {sidebarOpen && (
//         <div className="lg:hidden fixed inset-0 z-50">
//           {/* Dim backdrop */}
//           <div
//             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             onClick={() => setSidebarOpen(false)}
//           />
//           {/* Slide-in panel */}
//           <div className="absolute left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-white/5 animate-slide-down">
//             <Sidebar onClose={() => setSidebarOpen(false)} />
//           </div>
//         </div>
//       )}

//       {/* ── Main content area ── */}
//       <div className="flex-1 flex flex-col overflow-hidden">

//         {/* Admin-only Navbar — bina logo ke, sirf yahan use hoti hai */}
//         <AdminNavbar
//           title={title}
//           onMenuClick={() => setSidebarOpen(true)}
//         />

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;




















// src/components/admin/AdminLayout.js
// Sirf Admin pages use karte hain is layout ko.
// Iske andar ek dedicated AdminNavbar hai — bina logo ke, clean top bar.
// Main Navbar (Navbar.js) admin routes par render nahi hota (App.js mein control hai).

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiCalendar, FiBookOpen, FiMessageSquare,
  FiUsers, FiSend, FiLogOut, FiMenu, FiX, FiRadio,
  FiBell, FiSettings, FiChevronDown, FiExternalLink
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const navItems = [
  { to: '/admin',           label: 'Dashboard', icon: FiGrid,         exact: true },
  { to: '/admin/events',    label: 'Events',    icon: FiCalendar },
  { to: '/admin/bookings',  label: 'Bookings',  icon: FiBookOpen },
  { to: '/admin/requests',  label: 'Requests',  icon: FiSend },
  { to: '/admin/feedback',  label: 'Feedback',  icon: FiMessageSquare },
  { to: '/admin/users',     label: 'Users',     icon: FiUsers },
  { to: '/admin/stream',    label: 'Live Stream', icon: FiRadio },
];

// ─── Admin-only Top Navbar (bina logo ke) ────────────────────────────────────
// Yeh component sirf AdminLayout ke andar use hota hai.
// Main Navbar.js se bilkul alag hai — koi conflict nahi.
const AdminNavbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-dark-800 border-b border-white/5 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 relative z-30">

      {/* Left — mobile menu button + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg glass text-gray-400 hover:text-white transition-colors"
        >
          <FiMenu size={18} />
        </button>

        {/* Page title */}
        <h1 className="font-display font-bold text-lg text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right — actions + profile */}
      <div className="flex items-center gap-2">

        {/* View Site button */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-gray-400 hover:text-white transition-all"
        >
          <FiExternalLink size={12} /> View Site
        </Link>

        {/* Notification bell (decorative / future use) */}
        <button className="relative p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors">
          <FiBell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 glass rounded-xl hover:border-primary-500/30 transition-all"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-orange-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            {/* Name — desktop only */}
            <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <FiChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />

              <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden z-20 animate-slide-down">
                {/* User info */}
                <div className="p-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full font-medium">
                    Admin
                  </span>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/8 rounded-xl transition-all"
                  >
                    <FiExternalLink size={14} /> View Public Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  return (
    <div className="flex flex-col h-full">
      {/* Brand — sidebar mein logo + FESTIVA rahega */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center shadow-lg">
            <HiSparkles className="text-white text-sm" />
          </div>
          <div>
            <span className="font-display font-black text-lg gradient-text leading-none">FESTIVA</span>
            <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item)
                ? 'bg-orange-gradient text-white shadow-lg shadow-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/8'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

// ─── Main AdminLayout ─────────────────────────────────────────────────────────
const AdminLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">

      {/* ── Desktop Sidebar (always visible on lg+) ── */}
      <div className="hidden lg:flex w-56 flex-shrink-0 bg-dark-800 border-r border-white/5 flex-col">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar (overlay) ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Dim backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Slide-in panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-white/5 animate-slide-down">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Admin-only Navbar — bina logo ke, sirf yahan use hoti hai */}
        <AdminNavbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

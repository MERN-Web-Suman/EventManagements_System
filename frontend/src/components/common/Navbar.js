// src/components/common/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiX, FiCalendar, FiUser, FiLogOut,
  FiBookOpen, FiSettings, FiSend
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Events', to: '/events', icon: <FiCalendar /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center shadow-lg">
              <HiSparkles className="text-white text-sm" />
            </div>
            <span className="font-display font-800 text-xl tracking-tight">
              <span className="gradient-text font-bold">FESTIVA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-primary-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'text-primary-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <FiSettings /> Admin
              </Link>
            )}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-primary-500/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden animate-slide-down">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      {!isAdmin && (
                        <>
                          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <FiUser size={14} /> Dashboard
                          </Link>
                          <Link to="/my-bookings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <FiBookOpen size={14} /> My Bookings
                          </Link>
                          <Link to="/my-requests" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <FiSend size={14} /> My Requests
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-orange-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl glass text-gray-300 hover:text-white"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="glass rounded-2xl p-4 mt-2 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  {link.icon} {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <FiSettings /> Admin Panel
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <>
                      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <FiUser /> Dashboard
                      </Link>
                      <Link to="/my-bookings" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <FiBookOpen /> My Bookings
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 text-center px-3 py-2.5 text-sm glass rounded-xl text-gray-300">Login</Link>
                  <Link to="/register" className="flex-1 text-center px-3 py-2.5 text-sm bg-orange-gradient text-white font-semibold rounded-xl">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

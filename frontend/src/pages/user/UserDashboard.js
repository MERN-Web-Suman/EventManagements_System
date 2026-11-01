// src/pages/user/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService, eventRequestService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FiCalendar, FiBookOpen, FiSend, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, to, color }) => (
  <Link to={to} className="glass rounded-2xl p-5 hover:border-primary-500/30 transition-all group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      <Icon className="text-white" size={18} />
    </div>
    <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm flex items-center gap-1">
      {label} <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          bookingService.getMyBookings({ limit: 3 }),
          eventRequestService.getMyRequests(),
        ]);
        setBookings(bRes.data.data.bookings);
        setRequests(rRes.data.data.requests);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-gradient flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={FiBookOpen} label="My Bookings" value={bookings.length} to="/my-bookings" color="bg-orange-gradient" />
          <StatCard icon={HiSparkles} label="Confirmed" value={confirmed} to="/my-bookings" color="bg-purple-gradient" />
          <StatCard icon={FiSend} label="My Requests" value={requests.length} to="/my-requests" color="bg-green-500" />
        </div>

        {/* Recent Bookings */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-white">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-primary-400 text-sm hover:underline flex items-center gap-1">
              View all <FiArrowRight size={13} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiCalendar size={32} className="mx-auto mb-3 opacity-40" />
              <p>No bookings yet. <Link to="/events" className="text-primary-400 hover:underline">Find events →</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b._id} className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-dark-700 overflow-hidden flex-shrink-0">
                    {b.event?.image?.url
                      ? <img src={b.event.image.url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🎉</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{b.event?.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {b.event?.date ? format(new Date(b.event.date), 'MMM d, yyyy') : ''} • #{b.ticketNumber}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    b.status === 'confirmed' ? 'bg-green-500/20 text-green-400'
                    : b.status === 'cancelled' ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/events" className="glass rounded-2xl p-5 hover:border-primary-500/30 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-gradient flex items-center justify-center">🎪</div>
            <div>
              <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">Explore Events</p>
              <p className="text-gray-400 text-xs">Discover new experiences</p>
            </div>
            <FiArrowRight className="ml-auto text-gray-600 group-hover:text-primary-400 transition-colors" />
          </Link>
          <Link to="/my-requests" className="glass rounded-2xl p-5 hover:border-primary-500/30 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-gradient flex items-center justify-center">📬</div>
            <div>
              <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">Request an Event</p>
              <p className="text-gray-400 text-xs">Tell us what you want</p>
            </div>
            <FiArrowRight className="ml-auto text-gray-600 group-hover:text-primary-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, sub, color, bgColor }) => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={color} size={20} />
      </div>
    </div>
    <div className="font-display font-black text-2xl text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
    {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">₹{payload[0]?.value?.toLocaleString()}</p>
      <p className="text-gray-400 text-xs">{payload[1]?.value} bookings</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [graph, setGraph] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, gRes, aRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRevenueGraph(),
          adminService.getRecentActivity(),
        ]);
        setStats(sRes.data.data);
        setGraph(gRes.data.data.graph);
        setActivity(aRes.data.data);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          color="text-green-400" bgColor="bg-green-500/15" />
        <StatCard icon={FiUsers} label="Total Users" value={stats?.totalUsers || 0}
          color="text-blue-400" bgColor="bg-blue-500/15" />
        <StatCard icon={FiCalendar} label="Total Events" value={stats?.totalEvents || 0}
          color="text-purple-400" bgColor="bg-purple-500/15" />
        <StatCard icon={FiCheckCircle} label="Paid Clients" value={stats?.totalPaidClients || 0}
          color="text-primary-400" bgColor="bg-primary-500/15" />
        <StatCard icon={FiClock} label="Pending Payments" value={stats?.pendingBookings || 0}
          color="text-yellow-400" bgColor="bg-yellow-500/15" />
        <StatCard icon={FiTrendingUp} label="Cancelled" value={stats?.cancelledBookings || 0}
          color="text-red-400" bgColor="bg-red-500/15" />
      </div>

      {/* Revenue Chart */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display font-bold text-xl text-white mb-6">Revenue (Last 12 Months)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graph}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#ff6b35" strokeWidth={2.5}
                fill="url(#revGrad)" dot={{ fill: '#ff6b35', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg text-white mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {activity?.recentBookings?.slice(0, 6).map((b) => (
              <div key={b._id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {b.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{b.user?.name}</p>
                  <p className="text-gray-400 text-xs truncate">{b.event?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-400 text-sm font-bold">₹{b.totalAmount?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{format(new Date(b.createdAt), 'MMM d')}</p>
                </div>
              </div>
            ))}
            {(!activity?.recentBookings?.length) && (
              <p className="text-gray-500 text-sm text-center py-4">No recent bookings</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display font-bold text-lg text-white mb-4">New Users</h2>
          <div className="space-y-3">
            {activity?.recentUsers?.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                  <p className="text-gray-400 text-xs truncate">{u.email}</p>
                </div>
                <p className="text-gray-500 text-xs flex-shrink-0">{format(new Date(u.createdAt), 'MMM d')}</p>
              </div>
            ))}
            {(!activity?.recentUsers?.length) && (
              <p className="text-gray-500 text-sm text-center py-4">No new users</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

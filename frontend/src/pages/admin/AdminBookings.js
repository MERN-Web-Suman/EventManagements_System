// src/pages/admin/AdminBookings.js
import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import { FiSearch, FiHash, FiCalendar, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatusBadge = ({ status, type = 'booking' }) => {
  const bookingMap = {
    confirmed: 'bg-green-500/15 text-green-400',
    cancelled: 'bg-red-500/15 text-red-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
  };
  const paymentMap = {
    completed: 'bg-green-500/15 text-green-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    failed: 'bg-red-500/15 text-red-400',
    refunded: 'bg-blue-500/15 text-blue-400',
  };
  const map = type === 'payment' ? paymentMap : bookingMap;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-500/15 text-gray-400'}`}>
      {status}
    </span>
  );
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bookingService.getAllBookings({
        page, limit: 15,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });
      setBookings(data.data.bookings);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return (
    <AdminLayout title="Bookings">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-dark-800 text-white rounded-xl px-4 py-2 text-sm border border-white/10 input-glow">
          <option value="">All Statuses</option>
          {['confirmed', 'pending', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="bg-dark-800 text-white rounded-xl px-4 py-2 text-sm border border-white/10 input-glow">
          <option value="">All Payments</option>
          {['completed', 'pending', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {pagination.total !== undefined && (
          <span className="text-gray-400 text-sm self-center">Total: <span className="text-white font-semibold">{pagination.total}</span></span>
        )}
      </div>

      {loading ? <LoadingSpinner fullScreen={false} /> : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🎟️</div>
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Ticket #', 'User', 'Event', 'Date', 'Qty', 'Amount', 'Status', 'Payment'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary-400 text-xs font-semibold">{b.ticketNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{b.user?.name}</p>
                        <p className="text-gray-500 text-xs">{b.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-sm max-w-[160px] truncate">{b.event?.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        {format(new Date(b.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm text-center">{b.quantity}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold text-sm">₹{b.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} type="payment" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-gray-400 text-sm">Page {page} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                  className="px-3 py-1.5 glass rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                  className="px-3 py-1.5 glass rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;

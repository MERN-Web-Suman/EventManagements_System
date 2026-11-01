// src/pages/user/MyBookings.js
import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiHash, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: 'bg-green-500/15 text-green-400 border border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
    pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  const { _id, ticketNumber, event, quantity, totalAmount, status, paymentStatus, createdAt } = booking;
  const canCancel = status === 'confirmed' && event?.date &&
    (new Date(event.date) - new Date()) > 24 * 60 * 60 * 1000;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-primary-500/20 transition-all">
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="sm:w-36 h-32 sm:h-auto bg-dark-700 flex-shrink-0">
          {event?.image?.url
            ? <img src={event.image.url} alt={event.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">🎉</div>
          }
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-display font-bold text-white text-lg leading-tight">{event?.title || 'Event'}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <FiHash size={12} className="text-primary-400" />
                <span className="text-primary-400 font-mono text-sm font-semibold">{ticketNumber}</span>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
            {event?.date && (
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} className="text-primary-400" />
                {format(new Date(event.date), 'EEE, MMM d, yyyy')}
              </span>
            )}
            {event?.location && (
              <span className="flex items-center gap-1.5">
                <FiMapPin size={13} className="text-primary-400" />
                {event.location.venue}, {event.location.city}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-sm">
              <div className="glass rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Tickets</span>
                <div className="font-bold text-white">{quantity}</div>
              </div>
              <div className="glass rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Paid</span>
                <div className="font-bold text-white">₹{totalAmount?.toLocaleString()}</div>
              </div>
              <div className="glass rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Payment</span>
                <div className={`font-bold text-sm ${paymentStatus === 'completed' ? 'text-green-400' : paymentStatus === 'refunded' ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {paymentStatus}
                </div>
              </div>
            </div>

            {canCancel && (
              <button
                onClick={() => onCancel(_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all"
              >
                <FiXCircle size={13} /> Cancel Booking
              </button>
            )}
          </div>

          <p className="text-gray-600 text-xs mt-3">Booked on {format(new Date(createdAt), 'MMM d, yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bookingService.getMyBookings({ page, limit: 10 });
      setBookings(data.data.bookings);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? Refund in 5-7 business days.')) return;
    try {
      await bookingService.cancelBooking(id, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">My Bookings</h1>
          <p className="text-gray-400 mt-1">All your event tickets in one place</p>
        </div>

        {loading ? <LoadingSpinner fullScreen={false} /> : bookings.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="font-display font-semibold text-xl text-white mb-2">No bookings yet</h3>
            <p>Book your first event ticket to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => <BookingCard key={b._id} booking={b} onCancel={handleCancel} />)}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
              className="flex items-center gap-1 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40">
              <FiChevronLeft /> Prev
            </button>
            <span className="text-gray-400 text-sm">Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
              className="flex items-center gap-1 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40">
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

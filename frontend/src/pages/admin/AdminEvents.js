// src/pages/admin/AdminEvents.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiUsers, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventService.getEvents({
        page, limit: 12, search: search || undefined,
        status: status !== 'all' ? status : undefined,
      });
      setEvents(data.data.events);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <AdminLayout title="Events Management">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search events..."
              className="bg-dark-800 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2 text-sm border border-white/10 input-glow w-56" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-dark-800 text-white rounded-xl px-4 py-2 text-sm border border-white/10 input-glow">
            {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <Link to="/admin/events/new"
          className="flex items-center gap-2 px-5 py-2 bg-orange-gradient text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg">
          <FiPlus /> New Event
        </Link>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner fullScreen={false} /> : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🎪</div>
          <p className="text-lg">No events found</p>
          <Link to="/admin/events/new" className="mt-3 inline-block text-primary-400 hover:underline">Create your first event →</Link>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Event', 'Date', 'Location', 'Seats', 'Price', 'Status', 'Rating', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0">
                          {ev.image?.url
                            ? <img src={ev.image.url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🎉</div>
                          }
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium max-w-[180px] truncate">{ev.title}</p>
                          <p className="text-gray-500 text-xs">{ev.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm whitespace-nowrap flex items-center gap-1">
                        <FiCalendar size={11} className="text-primary-400" />
                        {format(new Date(ev.date), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{ev.location?.city}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm flex items-center gap-1">
                        <FiUsers size={11} className="text-primary-400" />
                        {ev.bookedSeats}/{ev.totalSeats}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold text-sm">{ev.price === 0 ? 'FREE' : `₹${ev.price.toLocaleString()}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ev.status === 'upcoming' ? 'bg-green-500/15 text-green-400'
                        : ev.status === 'ongoing' ? 'bg-blue-500/15 text-blue-400'
                        : ev.status === 'completed' ? 'bg-gray-500/15 text-gray-400'
                        : 'bg-red-500/15 text-red-400'
                      }`}>{ev.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {ev.totalReviews > 0 ? (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <FiStar size={11} /> {ev.averageRating}
                        </span>
                      ) : <span className="text-gray-600 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/events/edit/${ev._id}`}
                          className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-all">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(ev._id, ev.title)}
                          className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-gray-400 text-sm">
                {pagination.total} total • Page {page} of {pagination.totalPages}
              </span>
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

export default AdminEvents;

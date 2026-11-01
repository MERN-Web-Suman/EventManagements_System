// src/pages/admin/AdminRequests.js
import React, { useState, useEffect, useCallback } from 'react';
import { eventRequestService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiMessageSquare, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  reviewed: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
};

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [noteModal, setNoteModal] = useState(null); // { id, action }
  const [adminNote, setAdminNote] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventRequestService.getAllRequests({
        page, limit: 10, status: statusFilter || undefined,
      });
      setRequests(data.data.requests);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await eventRequestService.updateStatus(id, { status, adminNote });
      setRequests(requests.map(r =>
        r._id === id ? { ...r, status, adminNote } : r
      ));
      toast.success(`Request ${status}!`);
      setNoteModal(null);
      setAdminNote('');
    } catch (err) { toast.error(err.message); }
  };

  const openNoteModal = (req, action) => {
    setNoteModal({ id: req._id, action });
    setAdminNote('');
  };

  return (
    <AdminLayout title="Event Requests">
      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-display font-bold text-lg text-white mb-4 capitalize">
              {noteModal.action} Request
            </h3>
            <textarea
              value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Admin note (optional)..."
              rows={3}
              className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm border border-white/10 input-glow resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus(noteModal.id, noteModal.action)}
                className={`flex-1 py-2.5 font-semibold rounded-xl text-sm transition-all ${
                  noteModal.action === 'approved'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : noteModal.action === 'rejected'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-orange-gradient text-white hover:opacity-90'
                }`}
              >
                Confirm {noteModal.action}
              </button>
              <button onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 glass text-gray-300 font-semibold rounded-xl text-sm hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-dark-800 text-white rounded-xl px-4 py-2 text-sm border border-white/10 input-glow">
          <option value="">All Requests</option>
          {['pending', 'reviewed', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {pagination.total !== undefined && (
          <span className="text-gray-400 text-sm self-center">
            Total: <span className="text-white font-semibold">{pagination.total}</span>
          </span>
        )}
      </div>

      {loading ? <LoadingSpinner fullScreen={false} /> : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📬</div>
          <p>No event requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {req.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{req.user?.name}</p>
                    <p className="text-gray-500 text-xs">{req.user?.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status]}`}>
                  {req.status}
                </span>
              </div>

              <div className="mb-3">
                <h3 className="font-display font-bold text-white text-lg">{req.eventTitle}</h3>
                <span className="text-xs text-primary-400 font-medium">{req.category}</span>
              </div>

              <p className="text-gray-300 text-sm mb-3 leading-relaxed">{req.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                {req.preferredDate && (
                  <span className="flex items-center gap-1">
                    <FiCalendar size={11} className="text-primary-400" />
                    {format(new Date(req.preferredDate), 'MMM d, yyyy')}
                  </span>
                )}
                {req.preferredLocation && (
                  <span className="flex items-center gap-1">
                    <FiMapPin size={11} className="text-primary-400" />
                    {req.preferredLocation}
                  </span>
                )}
                {req.expectedAttendees && (
                  <span className="flex items-center gap-1">
                    <FiUsers size={11} className="text-primary-400" />
                    ~{req.expectedAttendees} attendees
                  </span>
                )}
              </div>

              {req.message && (
                <div className="bg-dark-800 rounded-xl p-3 mb-3 flex gap-2">
                  <FiMessageSquare size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm">{req.message}</p>
                </div>
              )}

              {req.adminNote && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-3">
                  <p className="text-blue-400 text-xs font-semibold mb-1">Your Note:</p>
                  <p className="text-gray-300 text-sm">{req.adminNote}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-gray-600 text-xs">
                  Submitted {format(new Date(req.createdAt), 'MMM d, yyyy')}
                </span>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => openNoteModal(req, 'reviewed')}
                      className="px-3 py-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-500/25 transition-all">
                      Mark Reviewed
                    </button>
                    <button onClick={() => openNoteModal(req, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-xl text-xs font-semibold hover:bg-green-500/25 transition-all">
                      <FiCheck size={12} /> Approve
                    </button>
                    <button onClick={() => openNoteModal(req, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold hover:bg-red-500/25 transition-all">
                      <FiX size={12} /> Reject
                    </button>
                  </div>
                )}

                {req.status === 'reviewed' && (
                  <div className="flex gap-2">
                    <button onClick={() => openNoteModal(req, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-xl text-xs font-semibold hover:bg-green-500/25 transition-all">
                      <FiCheck size={12} /> Approve
                    </button>
                    <button onClick={() => openNoteModal(req, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold hover:bg-red-500/25 transition-all">
                      <FiX size={12} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                className="px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40">← Prev</button>
              <span className="text-gray-400 text-sm">Page {page} of {pagination.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                className="px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRequests;

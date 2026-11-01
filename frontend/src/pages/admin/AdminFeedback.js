// src/pages/admin/AdminFeedback.js
import React, { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await feedbackService.getAllFeedback({ page, limit: 15 });
      setFeedbacks(data.data.feedbacks);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleToggle = async (id) => {
    try {
      await feedbackService.toggleVisibility(id);
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, isVisible: !f.isVisible } : f));
      toast.success('Visibility toggled');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      setFeedbacks(feedbacks.filter(f => f._id !== id));
      toast.success('Feedback deleted');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <AdminLayout title="Feedback & Reviews">
      {loading ? <LoadingSpinner fullScreen={false} /> : feedbacks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <p>No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className={`glass rounded-2xl p-5 transition-all ${!fb.isVisible ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {fb.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{fb.user?.name}</p>
                    <p className="text-gray-500 text-xs">{fb.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!fb.isVisible && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Hidden</span>}
                  <button onClick={() => handleToggle(fb._id)}
                    className={`p-1.5 rounded-lg transition-all ${fb.isVisible ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'}`}>
                    {fb.isVisible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(fb._id)}
                    className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-gray-400 text-xs">for <span className="text-primary-400">{fb.event?.title}</span></span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{fb.comment}</p>
                <p className="text-gray-600 text-xs mt-2">{format(new Date(fb.createdAt), 'MMM d, yyyy HH:mm')}</p>
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
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

export default AdminFeedback;

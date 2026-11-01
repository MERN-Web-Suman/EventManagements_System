// src/pages/user/MyRequests.js
import React, { useState, useEffect } from 'react';
import { eventRequestService } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiSend, FiPlus, FiX } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education', 'Health', 'Other'];

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    reviewed: 'bg-blue-500/15 text-blue-400',
    approved: 'bg-green-500/15 text-green-400',
    rejected: 'bg-red-500/15 text-red-400',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    eventTitle: '', category: 'Music', description: '',
    preferredDate: '', preferredLocation: '', expectedAttendees: '', message: '',
  });

  useEffect(() => {
    eventRequestService.getMyRequests()
      .then(({ data }) => setRequests(data.data.requests))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await eventRequestService.submitRequest(form);
      setRequests([data.data.request, ...requests]);
      setShowForm(false);
      setForm({ eventTitle: '', category: 'Music', description: '', preferredDate: '', preferredLocation: '', expectedAttendees: '', message: '' });
      toast.success('Request submitted! Admin will review it soon 📬');
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Event Requests</h1>
            <p className="text-gray-400 mt-1">Request admin to organize an event</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-gradient text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg"
          >
            {showForm ? <><FiX /> Cancel</> : <><FiPlus /> New Request</>}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-8 animate-slide-down">
            <h2 className="font-display font-bold text-xl text-white mb-5">Submit Event Request</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'eventTitle', label: 'Event Title', placeholder: 'What event do you want?', full: true },
                { name: 'preferredLocation', label: 'Preferred Location', placeholder: 'City or venue' },
                { name: 'expectedAttendees', label: 'Expected Attendees', placeholder: 'Approx. number' },
              ].map(({ name, label, placeholder, full }) => (
                <div key={name} className={full ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">{label}</label>
                  <input type={name === 'expectedAttendees' ? 'number' : 'text'} name={name} value={form[name]}
                    onChange={handleChange} placeholder={placeholder} required={name === 'eventTitle'}
                    className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50" />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full bg-dark-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Preferred Date</label>
                <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange}
                  className="w-full bg-dark-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow" />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                  placeholder="Describe the event you want to organize..."
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow resize-none" />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Additional Message (optional)</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={2}
                  placeholder="Any other information for the admin..."
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow resize-none" />
              </div>

              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm shadow-lg">
                  <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📬</div>
            <h3 className="font-display font-semibold text-xl text-white mb-2">No requests yet</h3>
            <p>Tell us what event you want to attend!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display font-bold text-white">{req.eventTitle}</h3>
                    <span className="text-xs text-gray-400">{req.category}</span>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{req.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                  {req.preferredDate && <span>📅 {format(new Date(req.preferredDate), 'MMM d, yyyy')}</span>}
                  {req.preferredLocation && <span>📍 {req.preferredLocation}</span>}
                  {req.expectedAttendees && <span>👥 ~{req.expectedAttendees} attendees</span>}
                </div>
                {req.adminNote && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mt-3">
                    <p className="text-blue-400 text-xs font-semibold mb-1">Admin Response:</p>
                    <p className="text-gray-300 text-sm">{req.adminNote}</p>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-3">Submitted {format(new Date(req.createdAt), 'MMM d, yyyy')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;

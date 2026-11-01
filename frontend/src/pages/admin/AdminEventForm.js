// src/pages/admin/AdminEventForm.js
// BUG FIX: FormInput & FormSelect defined OUTSIDE AdminEventForm to prevent
// re-render on every keystroke causing input to remount and lose focus.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { FiUpload, FiSave, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education', 'Health', 'Other'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const initForm = {
  title: '', description: '', category: 'Music', date: '', endDate: '',
  time: '', price: '', totalSeats: '',
  'location.venue': '', 'location.city': '', 'location.state': '', 'location.address': '',
  tags: '', status: 'upcoming', featured: false,
  'video.liveStream.url': '', 'video.liveStream.isLive': false,
};

// ─────────────────────────────────────────────────────────────────────────────
// KEY FIX: These helper components are declared at MODULE level (outside the
// page component). If they were inside AdminEventForm, React would create a
// brand-new component type on every state update → the old input unmounts and
// a new one mounts → keyboard focus is lost after every single character.
// ─────────────────────────────────────────────────────────────────────────────
const FormInput = ({ label, name, type = 'text', placeholder, required, value, onChange }) => (
  <div>
    <label className="text-xs font-medium text-gray-400 mb-1.5 block">
      {label}{required && ' *'}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, required, options }) => (
  <div>
    <label className="text-xs font-medium text-gray-400 mb-1.5 block">
      {label}{required && ' *'}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-dark-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
    >
      {options.map(o => (
        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
      ))}
    </select>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const AdminEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(initForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getEvent(id);
        const ev = data.data.event;
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Music',
          date: ev.date?.substring(0, 10) || '',
          endDate: ev.endDate?.substring(0, 10) || '',
          time: ev.time || '',
          price: ev.price ?? '',
          totalSeats: ev.totalSeats || '',
          'location.venue': ev.location?.venue || '',
          'location.city': ev.location?.city || '',
          'location.state': ev.location?.state || '',
          'location.address': ev.location?.address || '',
          tags: ev.tags?.join(', ') || '',
          status: ev.status || 'upcoming',
          featured: ev.featured || false,
          'video.liveStream.url': ev.video?.liveStream?.url || '',
          'video.liveStream.isLive': ev.video?.liveStream?.isLive || false,
        });
        if (ev.image?.url) setImagePreview(ev.image.url);
      } catch {
        toast.error('Event not found');
        navigate('/admin/events');
      } finally {
        setFetching(false);
      }
    };
    fetchEvent();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildEventData = () => ({
    title: form.title,
    description: form.description,
    category: form.category,
    date: form.date,
    endDate: form.endDate || undefined,
    time: form.time,
    price: Number(form.price),
    totalSeats: Number(form.totalSeats),
    location: {
      venue: form['location.venue'],
      city: form['location.city'],
      state: form['location.state'],
      address: form['location.address'],
    },
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    status: form.status,
    featured: form.featured,
    video: {
      liveStream: {
        url: form['video.liveStream.url'],
        isLive: form['video.liveStream.isLive'],
      },
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let eventId = id;
      if (isEdit) {
        await eventService.updateEvent(id, buildEventData());
        toast.success('Event updated! ✅');
      } else {
        const { data } = await eventService.createEvent(buildEventData());
        eventId = data.data.event._id;
        toast.success('Event created! 🎉');
      }
      if (imageFile && eventId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await eventService.uploadImage(eventId, formData);
        toast.success('Image uploaded!');
      }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout title="Edit Event">
        <div className="text-gray-400 py-10 text-center">Loading event...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Event' : 'Create Event'}>
      <div className="max-w-3xl">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Events
        </button>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-6">

          {/* Image Upload */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">Event Image</label>
            <div className={`border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
              imagePreview ? 'border-primary-500/30' : 'border-white/10 hover:border-white/20'
            }`}>
              {imagePreview ? (
                <div className="relative h-48">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white text-sm">
                      <FiUpload size={14} /> Change Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-10 cursor-pointer">
                  <FiUpload size={28} className="text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload event image</p>
                  <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP • Max 10MB</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Event Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
                maxLength={100}
                className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
              />
            </div>
            <FormSelect label="Category" name="category" value={form.category} onChange={handleChange} required options={CATEGORIES} />
            <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} required options={STATUSES} />
            <FormInput label="Start Date" name="date" type="date" value={form.date} onChange={handleChange} required />
            <FormInput label="Time" name="time" placeholder="e.g. 6:00 PM" value={form.time} onChange={handleChange} required />
            <FormInput label="Price (₹)" name="price" type="number" placeholder="0 for free" value={form.price} onChange={handleChange} required />
            <FormInput label="Total Seats" name="totalSeats" type="number" placeholder="e.g. 100" value={form.totalSeats} onChange={handleChange} required />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your event..."
              className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 resize-none transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-white/10">📍 Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Venue *" name="location.venue" placeholder="e.g. Indira Gandhi Arena" value={form['location.venue']} onChange={handleChange} required />
              <FormInput label="City *" name="location.city" placeholder="e.g. Mumbai" value={form['location.city']} onChange={handleChange} required />
              <FormInput label="State" name="location.state" placeholder="e.g. Maharashtra" value={form['location.state']} onChange={handleChange} />
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Full Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={form['location.address']}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tags & Media */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-white/10">🎬 Tags & Media</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="e.g. music, outdoor, family"
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Live Stream URL</label>
                <input
                  type="url"
                  name="video.liveStream.url"
                  value={form['video.liveStream.url']}
                  onChange={handleChange}
                  placeholder="https://youtube.com/live/..."
                  className="w-full bg-dark-800 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">⭐ Featured Event</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" name="video.liveStream.isLive" checked={form['video.liveStream.isLive']} onChange={handleChange} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">🔴 Is Live Now</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-orange-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-primary-500/20 text-sm"
            >
              <FiSave size={14} />
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="px-6 py-3 glass text-gray-300 font-semibold rounded-xl hover:text-white transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEventForm;

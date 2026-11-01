// src/pages/admin/AdminStreamManager.js
// Admin yahan se event ke liye stream key banata hai aur OBS settings dekhta hai
import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiKey, FiCopy, FiPlay, FiSquare, FiRadio,
  FiMonitor, FiCheck, FiVideo
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CopyField = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white break-all">
          {value}
        </div>
        <button
          onClick={copy}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
            copied ? 'bg-green-500/20 text-green-400' : 'glass text-gray-400 hover:text-white'
          }`}
        >
          {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
        </button>
      </div>
    </div>
  );
};

const AdminStreamManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [streamInfo, setStreamInfo] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getEvents({ status: 'upcoming', limit: 50 })
      .then(({ data }) => setEvents(data.data.events))
      .finally(() => setLoading(false));
  }, []);

  const createStreamKey = async () => {
    if (!selectedEvent) { toast.error('Please select an event'); return; }
    setCreating(true);
    try {
      const { data } = await API.post('/streaming/create-key', { eventId: selectedEvent });
      setStreamInfo(data.data);
      toast.success('Stream key created! Configure OBS with these settings.');
    } catch (err) {
      toast.error(err.message || 'Failed to create stream key');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <AdminLayout title="Stream Manager"><LoadingSpinner fullScreen={false} /></AdminLayout>;

  return (
    <AdminLayout title="Live Stream Manager">
      <div className="max-w-2xl space-y-6">

        {/* Step 1 */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
            <h2 className="font-display font-bold text-lg text-white">Select Event & Generate Stream Key</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Select Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-dark-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow"
              >
                <option value="">-- Choose an event --</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={createStreamKey}
              disabled={creating || !selectedEvent}
              className="flex items-center gap-2 px-6 py-3 bg-orange-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm shadow-lg"
            >
              <FiKey size={15} />
              {creating ? 'Creating...' : 'Generate Stream Key'}
            </button>
          </div>
        </div>

        {/* Step 2 — OBS Settings */}
        {streamInfo && (
          <div className="glass rounded-2xl p-6 border border-primary-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <h2 className="font-display font-bold text-lg text-white">Configure OBS Studio</h2>
            </div>

            <div className="space-y-4">
              <CopyField label="RTMP Server URL (paste in OBS → Settings → Stream → Server)" value={streamInfo.rtmpUrl} />
              <CopyField label="Stream Key (paste in OBS → Settings → Stream → Stream Key)" value={streamInfo.streamKey} />
              <CopyField label="HLS Playback URL (for viewers)" value={streamInfo.hlsUrl} />
            </div>

            {/* OBS Screenshot guide */}
            <div className="mt-5 bg-dark-900 rounded-xl p-4 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiMonitor size={15} className="text-primary-400" /> OBS Studio Setup Steps
              </h3>
              <ol className="space-y-2">
                {[
                  'Open OBS Studio on your computer',
                  'Go to File → Settings → Stream',
                  'Set Service to: Custom...',
                  `Paste Server URL above`,
                  `Paste Stream Key above`,
                  'Click Apply → OK',
                  'Set up your scenes/sources in OBS',
                  'Click "Start Streaming" button',
                  'Your stream will appear live on the website!',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Step 3 */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
            <h2 className="font-display font-bold text-lg text-white">Go Live!</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-800 rounded-xl p-4 text-center">
              <FiRadio size={24} className="text-red-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold">Press "Start Streaming"</p>
              <p className="text-gray-500 text-xs mt-1">in OBS Studio</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-4 text-center">
              <FiPlay size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold">Viewers watch live</p>
              <p className="text-gray-500 text-xs mt-1">on event page</p>
            </div>
          </div>
        </div>

        {/* Step 4 — Recording note */}
        <div className="glass rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <FiVideo size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">Auto-Recording</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your stream is <strong className="text-white">automatically recorded</strong> on the server
                as soon as you start. When you stop streaming, the recording is saved and
                can be accessed from the event's video section. No manual steps needed!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStreamManager;

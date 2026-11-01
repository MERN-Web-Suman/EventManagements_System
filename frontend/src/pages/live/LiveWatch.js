// src/pages/live/LiveWatch.js
// Complete YouTube-jaisa live watch page
// Features: HLS player, live chat, viewers, likes, share, recorded video fallback
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { eventService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import HLSPlayer from '../../components/live/HLSPlayer';
import LiveChat from '../../components/live/LiveChat';
import { ViewerCount, LikeButton, ShareButton } from '../../components/live/LiveStats';
import { format } from 'date-fns';
import {
  FiArrowLeft, FiCalendar, FiMapPin,
  FiVideo, FiPlay, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STREAM_SERVER = process.env.REACT_APP_STREAM_SERVER || 'http://localhost:3001';

const LiveWatch = () => {
  const { id } = useParams();                // event ID
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamLive, setStreamLive] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const socketRef = useRef(null);

  // ── Fetch event ───────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await eventService.getEvent(id);
        setEvent(data.data.event);
        setStreamLive(data.data.event?.video?.liveStream?.isLive || false);
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  // ── Socket connection ─────────────────────────────────────
  useEffect(() => {
    if (!event?.video?.liveStream?.streamKey) return;

    const streamKey = event.video.liveStream.streamKey;
    const socket = io(STREAM_SERVER, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // Join stream room
    socket.emit('join:stream', {
      streamKey,
      token: localStorage.getItem('festiva_token') || null,
    });

    // Stream events
    socket.on('stream:started', () => {
      setStreamLive(true);
      toast.success('🔴 Stream is LIVE!');
    });

    socket.on('stream:ended', () => {
      setStreamLive(false);
      toast('Stream ended. Recorded video will be available soon.', { icon: '📼' });
    });

    socket.on('viewers:update', ({ count }) => {
      setViewerCount(count);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [event?.video?.liveStream?.streamKey]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const { title, description, date, time, location, category, image } = event;
  const liveStream = event.video?.liveStream;
  const recorded = event.video?.recorded;
  const hasLiveStream = !!liveStream?.hlsUrl;
  const hasRecording = !!recorded?.url;

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      {/* Float hearts CSS */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Back */}
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Event
        </Link>

        <div className={`flex gap-6 ${chatOpen ? 'flex-col lg:flex-row' : ''}`}>

          {/* ── Left: Player + Info ─────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Player */}
            {hasLiveStream && streamLive ? (
              <HLSPlayer
                hlsUrl={liveStream.hlsUrl}
                isLive={true}
                poster={image?.url}
              />
            ) : hasLiveStream && !streamLive ? (
              // Stream key exists but not live yet
              <div
                className="relative w-full bg-dark-800 rounded-xl flex items-center justify-center"
                style={{ aspectRatio: '16/9' }}
              >
                {image?.url && (
                  <img src={image.url} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-20" />
                )}
                <div className="relative text-center px-6">
                  <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                    <FiVideo size={28} className="text-primary-400" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Stream Starting Soon</h3>
                  <p className="text-gray-400 text-sm">The broadcaster will go live shortly. Stay tuned!</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-red-400">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-sm font-medium">Waiting for stream...</span>
                  </div>
                </div>
              </div>
            ) : hasRecording ? (
              // Show recording if no live stream
              <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  src={recorded.url}
                  controls
                  poster={image?.url}
                  className="w-full h-full"
                  style={{ objectFit: 'contain' }}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-dark-800/80 text-gray-300 text-xs px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <FiPlay size={10} /> Recorded
                  </span>
                </div>
              </div>
            ) : (
              // No stream at all
              <div
                className="w-full bg-dark-800 rounded-xl flex items-center justify-center"
                style={{ aspectRatio: '16/9' }}
              >
                <div className="text-center px-6">
                  <FiAlertCircle size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No stream available for this event yet.</p>
                </div>
              </div>
            )}

            {/* Stream controls row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3 flex-wrap">
                {streamLive && <ViewerCount count={viewerCount} />}
                {streamLive && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    LIVE NOW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LikeButton socket={socketRef.current} streamKey={liveStream?.streamKey} />
                <ShareButton />
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="px-3 py-2 glass rounded-full text-xs text-gray-300 hover:text-white transition-all"
                >
                  {chatOpen ? 'Hide Chat' : 'Show Chat 💬'}
                </button>
              </div>
            </div>

            {/* Event info */}
            <div className="mt-5 glass rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="px-2.5 py-0.5 bg-primary-500/15 text-primary-400 rounded-full text-xs font-medium flex-shrink-0">
                  {category}
                </span>
                {streamLive && (
                  <span className="px-2.5 py-0.5 bg-red-500/15 text-red-400 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                    🔴 LIVE
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-2xl text-white mb-3">{title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <FiCalendar size={13} className="text-primary-400" />
                  {format(new Date(date), 'EEE, MMM d, yyyy')} • {time}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={13} className="text-primary-400" />
                  {location?.venue}, {location?.city}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{description}</p>
            </div>

            {/* Recorded video section (after stream ends) */}
            {!streamLive && hasRecording && hasLiveStream && (
              <div className="mt-4 glass rounded-2xl p-4">
                <h3 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
                  <FiVideo size={16} className="text-primary-400" /> Stream Recording
                </h3>
                <p className="text-gray-400 text-sm">Watch the full recorded stream below.</p>
              </div>
            )}
          </div>

          {/* ── Right: Live Chat ────────────────────────────── */}
          {chatOpen && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-20 h-[600px] lg:h-[calc(100vh-120px)]">
                <LiveChat
                  socket={socketRef.current}
                  streamKey={liveStream?.streamKey}
                  currentUser={user}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveWatch;

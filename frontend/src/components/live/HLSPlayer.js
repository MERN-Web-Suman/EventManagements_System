// src/components/live/HLSPlayer.js
// HLS stream player — hls.js library use karta hai (no YouTube needed)
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  FiVolume2, FiVolumeX, FiMaximize2, FiMinimize2,
  FiPlay, FiPause, FiSettings
} from 'react-icons/fi';

const HLSPlayer = ({ hlsUrl, isLive = true, poster = '' }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [quality, setQuality] = useState('Auto');
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState('');
  const [showQuality, setShowQuality] = useState(false);
  const [levels, setLevels] = useState([]);
  const controlsTimer = useRef(null);

  // ── Init HLS ──────────────────────────────────────────────
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;
    setError('');
    setBuffering(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        videoRef.current.play().catch(() => {});
        setBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Stream connection failed. Retrying...');
          setTimeout(() => {
            hls.startLoad();
            setError('');
          }, 3000);
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => setBuffering(false));

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoRef.current.src = hlsUrl;
      videoRef.current.play().catch(() => {});
      setBuffering(false);
    } else {
      setError('Your browser does not support HLS streaming.');
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [hlsUrl]);

  // ── Controls auto-hide ────────────────────────────────────
  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  // ── Handlers ──────────────────────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const toggleMute = () => {
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    videoRef.current.volume = v;
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const setQualityLevel = (idx) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = idx; // -1 = Auto
      setQuality(idx === -1 ? 'Auto' : `${levels[idx]?.height}p`);
    }
    setShowQuality(false);
  };

  // ── Live badge click → jump to live edge ─────────────────
  const jumpToLive = () => {
    if (videoRef.current && hlsRef.current) {
      videoRef.current.currentTime = videoRef.current.duration - 0.1;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => setShowControls(false)}
      onMouseEnter={() => setShowControls(true)}
      onClick={togglePlay}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        muted={muted}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center px-6">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-white font-semibold mb-1">Stream Unavailable</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* LIVE badge top-left */}
      {isLive && !error && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); jumpToLive(); }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full transition-colors"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        <div className="relative p-3 space-y-2">
          {/* Bottom controls row */}
          <div className="flex items-center gap-3">

            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
              {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-primary-500 cursor-pointer"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Quality selector */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQuality(!showQuality)}
                  className="flex items-center gap-1 text-white text-xs hover:text-primary-400 transition-colors"
                >
                  <FiSettings size={15} /> {quality}
                </button>
                {showQuality && (
                  <div className="absolute bottom-8 right-0 bg-dark-800 border border-white/10 rounded-xl overflow-hidden shadow-xl w-24">
                    <button
                      onClick={() => setQualityLevel(-1)}
                      className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Auto
                    </button>
                    {levels.map((l, i) => (
                      <button
                        key={i}
                        onClick={() => setQualityLevel(i)}
                        className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {l.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
              {fullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HLSPlayer;

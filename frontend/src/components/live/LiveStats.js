// src/components/live/LiveStats.js
// Viewers count + Like button + share — YouTube jaisa
import React, { useState, useEffect } from 'react';
import { FiEye, FiHeart, FiShare2, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ── Floating heart animation ──────────────────────────────────────────────────
const FloatingHeart = ({ id, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  const left = 40 + Math.random() * 20;
  return (
    <div
      className="absolute pointer-events-none select-none text-2xl"
      style={{
        bottom: '10px', left: `${left}%`,
        animation: 'floatUp 2s ease-out forwards',
      }}
    >
      ❤️
    </div>
  );
};

// ── Viewer count ─────────────────────────────────────────────────────────────
export const ViewerCount = ({ count = 0 }) => (
  <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
    <FiEye size={14} className="text-primary-400" />
    <span className="text-white text-sm font-semibold">
      {count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
    </span>
    <span className="text-gray-400 text-xs">watching</span>
  </div>
);

// ── Like button ───────────────────────────────────────────────────────────────
export const LikeButton = ({ socket, streamKey }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onLike = () => {
      setLikeCount(c => c + 1);
      const id = Date.now() + Math.random();
      setHearts(h => [...h, id]);
    };
    socket.on('stream:like', onLike);
    return () => socket.off('stream:like', onLike);
  }, [socket]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    socket?.emit('stream:like', { streamKey });
  };

  const removeHeart = (id) => setHearts(h => h.filter(x => x !== id));

  return (
    <div className="relative">
      {/* Floating hearts */}
      {hearts.map(id => (
        <FloatingHeart key={id} id={id} onDone={() => removeHeart(id)} />
      ))}

      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
          liked
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : 'glass text-gray-300 hover:text-red-400 hover:border-red-500/30'
        }`}
      >
        <FiHeart size={15} className={liked ? 'fill-red-400' : ''} />
        {likeCount > 0 && <span>{likeCount}</span>}
        {liked ? 'Liked' : 'Like'}
      </button>
    </div>
  );
};

// ── Share button ──────────────────────────────────────────────────────────────
export const ShareButton = () => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Watch Live on FESTIVA', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied! 🔗');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-gray-300 hover:text-white transition-all"
    >
      <FiShare2 size={15} /> Share
    </button>
  );
};

// CSS for floating hearts — add to index.css
// @keyframes floatUp {
//   0%   { transform: translateY(0) scale(1); opacity: 1; }
//   100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
// }

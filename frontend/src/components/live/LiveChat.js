// src/components/live/LiveChat.js
import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { format } from 'date-fns';

const COLORS = [
  'text-pink-400','text-blue-400','text-green-400','text-yellow-400',
  'text-purple-400','text-orange-400','text-cyan-400','text-red-400',
];

const getUserColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const LiveChat = ({ socket, streamKey, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Socket listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages(prev => [...prev.slice(-199), msg]); // keep last 200
    };

    const onHistory = (history) => {
      setMessages(history);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:history', onHistory);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:history', onHistory);
    };
  }, [socket]);

  // ── Auto scroll ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !streamKey) return;
    socket.emit('chat:message', { streamKey, message: input.trim() });
    setInput('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <FiMessageCircle size={16} className="text-primary-400" />
        <span className="font-display font-semibold text-white text-sm">Live Chat</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm text-center py-8">
            <HiSparkles size={28} className="mb-2 text-gray-600" />
            <p>Chat is empty</p>
            <p className="text-xs mt-1">Be the first to say something!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.userId && msg.userId === currentUser?.id;
          const color = getUserColor(msg.user);

          return (
            <div
              key={msg.id || i}
              className={`flex gap-2 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                isMe ? 'bg-orange-gradient text-white' : 'bg-dark-700 text-gray-300'
              }`}>
                {msg.user?.[0]?.toUpperCase()}
              </div>

              <div className={`flex-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`flex items-baseline gap-1.5 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-xs font-semibold ${isMe ? 'text-primary-400' : color}`}>
                    {isMe ? 'You' : msg.user}
                  </span>
                  {msg.isGuest && (
                    <span className="text-xs text-gray-600">(guest)</span>
                  )}
                </div>
                <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-primary-500/20 text-white rounded-tr-sm'
                    : 'bg-dark-700 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={currentUser ? 'Type a message...' : 'Join to chat...'}
            maxLength={300}
            className="flex-1 bg-dark-900 text-white placeholder-gray-600 rounded-xl px-3 py-2 text-sm border border-white/10 focus:border-primary-500/40 outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 bg-orange-gradient rounded-xl flex items-center justify-center text-white hover:opacity-90 disabled:opacity-30 transition-all flex-shrink-0"
          >
            <FiSend size={14} />
          </button>
        </div>
        {!currentUser && (
          <p className="text-center text-xs text-gray-600 mt-2">
            <a href="/login" className="text-primary-400 hover:underline">Login</a> to send messages
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveChat;

// streaming/streamServer.js
// ─────────────────────────────────────────────────────────────────────────────
// FESTIVA Live Streaming Server
// Flow: OBS → RTMP (port 1935) → FFmpeg → HLS (port 8000) → React Player
//       Socket.IO (port 3001) → Live chat, viewers, stream events
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const NodeMediaServer = require('node-media-server');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// ── Ensure media directories exist ──────────────────────────────────────────
const HLS_PATH = process.env.HLS_PATH || './media/live';
const REC_PATH = process.env.RECORDINGS_PATH || './media/recordings';
[HLS_PATH, REC_PATH].forEach(p => fs.mkdirSync(p, { recursive: true }));

// ── Connect MongoDB ──────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ Streaming server connected to MongoDB');
});

// Simple stream schema to track active streams
const StreamSession = mongoose.model('StreamSession', new mongoose.Schema({
  streamKey: { type: String, required: true, unique: true },
  eventId:   { type: String },
  title:     { type: String, default: 'Live Stream' },
  startedAt: { type: Date, default: Date.now },
  endedAt:   { type: Date },
  isLive:    { type: Boolean, default: true },
  viewers:   { type: Number, default: 0 },
  peakViewers: { type: Number, default: 0 },
  recordingPath: { type: String },
  hlsUrl:    { type: String },
  chatMessages: [{ user: String, message: String, time: Date }],
}, { timestamps: true }));

// ── Node Media Server config ─────────────────────────────────────────────────
const nmsConfig = {
  rtmp: {
    port: parseInt(process.env.RTMP_PORT) || 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: parseInt(process.env.HTTP_PORT) || 8000,
    mediaroot: './media',
    allow_origin: '*',
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeepSegments: 3,
        dash: false,
        // Auto-record each stream
        rec: true,
        recPath: REC_PATH,
      },
    ],
  },
};

const nms = new NodeMediaServer(nmsConfig);

// ── Active streams tracker (in-memory) ──────────────────────────────────────
const activeStreams = new Map();
// Map<streamKey, { viewers: Set<socketId>, session: StreamSession }>

// ── Express + Socket.IO ──────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Serve HLS/recording files statically
app.use('/media', express.static('./media'));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

// ── NMS Event Hooks ──────────────────────────────────────────────────────────
nms.on('prePublish', async (id, StreamPath, args) => {
  // StreamPath = /live/<streamKey>
  const streamKey = StreamPath.split('/')[2];
  console.log(`\n📡 Stream starting: key=${streamKey}`);

  // Validate stream key against DB
  const session = await StreamSession.findOne({ streamKey }).catch(() => null);
  if (!session) {
    // Auto-create session for any valid key (or reject — your choice)
    await StreamSession.create({
      streamKey,
      title: `Live Stream`,
      hlsUrl: `http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamKey}/index.m3u8`,
    });
  }
});

nms.on('postPublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  console.log(`\n🔴 Stream LIVE: ${streamKey}`);

  // Update session
  await StreamSession.findOneAndUpdate({ streamKey }, {
    isLive: true,
    startedAt: new Date(),
    hlsUrl: `http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamKey}/index.m3u8`,
  });

  activeStreams.set(streamKey, { viewers: new Set(), chatHistory: [] });

  // Notify all connected clients
  io.to(`stream:${streamKey}`).emit('stream:started', {
    streamKey,
    hlsUrl: `http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamKey}/index.m3u8`,
    startedAt: new Date(),
  });

  // Notify main backend to update event status
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/streaming/event-live`, {
      streamKey, isLive: true,
    }, { headers: { 'x-stream-secret': process.env.STREAM_SECRET } });
  } catch (e) { console.log('Backend notify failed (ok if not configured yet)'); }
});

nms.on('donePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  console.log(`\n⏹️  Stream ENDED: ${streamKey}`);

  const stream = activeStreams.get(streamKey);
  const viewerCount = stream?.viewers?.size || 0;

  // Update session
  await StreamSession.findOneAndUpdate({ streamKey }, {
    isLive: false,
    endedAt: new Date(),
    viewers: viewerCount,
  });

  // Notify viewers
  io.to(`stream:${streamKey}`).emit('stream:ended', { streamKey });

  activeStreams.delete(streamKey);

  // Update recording path — NMS saves as: ./media/recordings/<streamKey>-<timestamp>.flv
  // We rename/move it for easier access
  setTimeout(async () => {
    const files = fs.readdirSync(REC_PATH).filter(f => f.startsWith(streamKey));
    if (files.length > 0) {
      const recFile = files[files.length - 1];
      await StreamSession.findOneAndUpdate({ streamKey }, {
        recordingPath: `/media/recordings/${recFile}`,
      });
      console.log(`📼 Recording saved: ${recFile}`);
    }
  }, 3000);

  // Notify main backend
  try {
    await axios.post(`${process.env.BACKEND_URL}/api/streaming/event-live`, {
      streamKey, isLive: false,
    }, { headers: { 'x-stream-secret': process.env.STREAM_SECRET } });
  } catch (e) {}
});

// ── Socket.IO Events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  let currentStreamKey = null;
  let currentUser = null;

  // Join a stream room
  socket.on('join:stream', async ({ streamKey, token }) => {
    // Decode user from JWT (optional — guests allowed)
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = { id: decoded.id, name: decoded.name || 'Viewer' };
      } catch { currentUser = null; }
    }

    currentStreamKey = streamKey;
    socket.join(`stream:${streamKey}`);

    // Add to viewers
    if (!activeStreams.has(streamKey)) {
      activeStreams.set(streamKey, { viewers: new Set(), chatHistory: [] });
    }
    activeStreams.get(streamKey).viewers.add(socket.id);

    const viewerCount = activeStreams.get(streamKey).viewers.size;

    // Update peak viewers in DB
    await StreamSession.findOneAndUpdate(
      { streamKey },
      { $max: { peakViewers: viewerCount } }
    );

    // Send viewer count to everyone in room
    io.to(`stream:${streamKey}`).emit('viewers:update', { count: viewerCount });

    // Send chat history to new joiner
    const history = activeStreams.get(streamKey).chatHistory || [];
    socket.emit('chat:history', history);

    // Check if stream is currently live
    const session = await StreamSession.findOne({ streamKey });
    if (session?.isLive) {
      socket.emit('stream:started', {
        streamKey,
        hlsUrl: session.hlsUrl,
        startedAt: session.startedAt,
      });
    }

    console.log(`👤 Viewer joined ${streamKey} — total: ${viewerCount}`);
  });

  // Chat message
  socket.on('chat:message', async ({ streamKey, message }) => {
    if (!streamKey || !message?.trim()) return;
    if (message.length > 300) return; // spam protection

    const userName = currentUser?.name || `Guest_${socket.id.substring(0, 4)}`;
    const chatMsg = {
      id: `${Date.now()}_${socket.id}`,
      user: userName,
      userId: currentUser?.id || null,
      message: message.trim(),
      time: new Date(),
      isGuest: !currentUser,
    };

    // Save to history (keep last 100)
    if (activeStreams.has(streamKey)) {
      const hist = activeStreams.get(streamKey).chatHistory;
      hist.push(chatMsg);
      if (hist.length > 100) hist.shift();
    }

    // Broadcast to everyone in stream room
    io.to(`stream:${streamKey}`).emit('chat:message', chatMsg);

    // Persist to DB (async, don't await)
    StreamSession.findOneAndUpdate(
      { streamKey },
      { $push: { chatMessages: { $each: [{ user: userName, message: message.trim(), time: new Date() }], $slice: -200 } } }
    ).catch(() => {});
  });

  // Like event
  socket.on('stream:like', ({ streamKey }) => {
    io.to(`stream:${streamKey}`).emit('stream:like', {
      userId: currentUser?.id || socket.id,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentStreamKey && activeStreams.has(currentStreamKey)) {
      activeStreams.get(currentStreamKey).viewers.delete(socket.id);
      const count = activeStreams.get(currentStreamKey).viewers.size;
      io.to(`stream:${currentStreamKey}`).emit('viewers:update', { count });
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── REST API ─────────────────────────────────────────────────────────────────

// Get stream info
app.get('/api/stream/:streamKey', async (req, res) => {
  const { streamKey } = req.params;
  const session = await StreamSession.findOne({ streamKey });
  if (!session) return res.status(404).json({ success: false, message: 'Stream not found' });

  const liveData = activeStreams.get(streamKey);
  res.json({
    success: true,
    data: {
      ...session.toJSON(),
      currentViewers: liveData?.viewers?.size || 0,
    },
  });
});

// Create stream key (admin calls this)
app.post('/api/stream/create', async (req, res) => {
  const secret = req.headers['x-stream-secret'];
  if (secret !== process.env.STREAM_SECRET) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const { eventId, title } = req.body;
  const streamKey = `${eventId || 'stream'}_${Date.now()}`;

  const session = await StreamSession.create({ streamKey, eventId, title });
  res.json({
    success: true,
    data: {
      streamKey,
      rtmpUrl: `rtmp://localhost:${process.env.RTMP_PORT || 1935}/live`,
      hlsUrl: `http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamKey}/index.m3u8`,
    },
  });
});

// Get all past streams (recordings)
app.get('/api/streams', async (req, res) => {
  const streams = await StreamSession.find().sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: { streams } });
});

// Get live streams
app.get('/api/streams/live', async (req, res) => {
  const streams = await StreamSession.find({ isLive: true });
  res.json({ success: true, data: { streams } });
});

// ── Start servers ─────────────────────────────────────────────────────────────
nms.run();

const STREAM_PORT = parseInt(process.env.STREAM_PORT) || 3001;
httpServer.listen(STREAM_PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║        🎬 FESTIVA Streaming Server               ║
╠══════════════════════════════════════════════════╣
║  RTMP  (OBS connects here) : port ${process.env.RTMP_PORT || 1935}          ║
║  HLS   (video stream)      : port ${process.env.HTTP_PORT || 8000}          ║
║  API + Socket.IO           : port ${STREAM_PORT}          ║
╠══════════════════════════════════════════════════╣
║  OBS Settings:                                   ║
║  Server : rtmp://YOUR_IP:1935/live               ║
║  Key    : your_stream_key                        ║
╚══════════════════════════════════════════════════╝
  `);
});

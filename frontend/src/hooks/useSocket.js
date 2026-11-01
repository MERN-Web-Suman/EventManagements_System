// src/hooks/useSocket.js
// Socket.IO connection hook — live stream ke liye
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const STREAM_SERVER = process.env.REACT_APP_STREAM_SERVER || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef(null);

  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(STREAM_SERVER, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
    }
    return socketRef.current;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return { getSocket, disconnect };
};

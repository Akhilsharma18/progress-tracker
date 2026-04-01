import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket(subjectId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!subjectId) return;

    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    socketRef.current.emit('join-subject', subjectId);

    return () => {
      socketRef.current?.emit('leave-subject', subjectId);
      socketRef.current?.disconnect();
    };
  }, [subjectId]);

  return socketRef.current;
}

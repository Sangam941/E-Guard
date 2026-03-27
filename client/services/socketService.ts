import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export interface SOSAlert {
  id: string;
  userId: string;
  location: { lat: number; lng: number };
  timestamp: Date;
  silentMode?: boolean;
}

export const socketService = {
  connect() {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Join as a monitor listener (receiver)
  joinMonitor() {
    if (!socket) this.connect();
    socket?.emit('join-monitor');
  },

  // Join as a sender (SOS trigger)
  joinAsSender(userId: string) {
    if (!socket) this.connect();
    socket?.emit('join-sender', userId);
  },

  // Listen for SOS alerts
  onSOSAlert(callback: (alert: SOSAlert) => void) {
    socket?.on('sos-alert', callback);
  },

  // Stop listening for SOS alerts
  offSOSAlert() {
    socket?.off('sos-alert');
  },

  getSocket() {
    return socket;
  },
};

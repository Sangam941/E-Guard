import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

let io: SocketIOServer | null = null;

export interface SOSAlert {
  id: string;
  userId: string;
  location: { lat: number; lng: number };
  timestamp: Date;
  silentMode?: boolean;
}

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client joins as a monitor listener
    socket.on('join-monitor', () => {
      socket.join('monitors');
      console.log(`[Socket.IO] Client ${socket.id} joined monitors room`);
    });

    // Client joins as SOS sender
    socket.on('join-sender', (userId: string) => {
      socket.join(`sender-${userId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined as sender: ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

// Broadcast SOS alert to all monitor listeners
export function broadcastSOSAlert(alert: SOSAlert) {
  if (!io) return;
  io.to('monitors').emit('sos-alert', alert);
  console.log(`[Socket.IO] SOS alert broadcast: ${alert.id}`);
}

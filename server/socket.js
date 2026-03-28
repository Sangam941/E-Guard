import { Server } from 'socket.io';
import { getDistanceFromLatLonInKm } from './utils/geo.js';

let io;
// active users mapping: socketId -> { userId, latitude, longitude }
const activeUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://e-guard-pokm-git-main-malang-code-innovators.vercel.app'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id); 

    // 1. REAL-TIME LOCATION STREAM
    socket.on('updateLocation', (data) => {
      const { userId, name, latitude, longitude } = data;
      if (userId && latitude && longitude) {
        activeUsers.set(socket.id, { userId, name: name || 'Unknown', latitude, longitude });
      }
    });

    // 2. SOS BUTTON INTEGRATION
    socket.on('triggerSOS', (data) => {
      const { userId, latitude, longitude } = data;
      console.log(`SOS Triggered by User ${userId} at [${latitude}, ${longitude}]`);
      
      const helpersNearby = [];

      // 3. BACKEND SOCKET LOGIC - Loop through connected users and find those < 5km
      activeUsers.forEach((userLoc, socketId) => {
        // Skip the exact tab/device that pressed the button
        if (socketId === socket.id) return;

        // Demo Mode: We allow the same User ID to receive it on a different tab
        // if (userLoc.userId === userId) return;

        const distance = getDistanceFromLatLonInKm(latitude, longitude, userLoc.latitude, userLoc.longitude);
        if (distance <= 5.0) {
          // emit "receiveSOS" to those users
          io.to(socketId).emit('receiveSOS', {
            victimId: userId,
            latitude,
            longitude,
            distance: distance.toFixed(2)
          });
          helpersNearby.push({ userId: userLoc.userId, name: userLoc.name, distance: distance.toFixed(2) });
        }
      });

      socket.emit('detectedHelpers', helpersNearby);
    });

    // 5. ACCEPT / REJECT FLOW
    socket.on('acceptSOS', (data) => {
      const { helperId, victimId, helperLat, helperLng } = data;
      console.log(`User ${helperId} accepted SOS from ${victimId}`);
      
      // Find victim's socket(s) and notify them that help is on the way
      activeUsers.forEach((userLoc, socketId) => {
        if (userLoc.userId === victimId) {
          io.to(socketId).emit('helperAssigned', { helperId, helperLat, helperLng });
        }
      });
    });

    socket.on('rejectSOS', (data) => {
      const { helperId, victimId } = data;
      console.log(`User ${helperId} rejected SOS from ${victimId}`);
      
      activeUsers.forEach((userLoc, socketId) => {
        if (userLoc.userId === victimId) {
          io.to(socketId).emit('helperRejected', { helperId });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket client disconnected:', socket.id);
      activeUsers.delete(socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

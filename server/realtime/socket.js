const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const locationService = require('../services/locationService');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // ==================== MIDDLEWARE ====================
  /**
   * Authentication Middleware
   * Verifies JWT token from handshake auth
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.user = decoded;
      socket.userId = decoded.id || decoded.userId;
      socket.userRole = decoded.role || 'user';
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ==================== CONNECTION & SETUP ====================
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const role = socket.userRole;

    console.log(`[Socket.IO] User ${userId} connected with role ${role}`);

    // User joins their own room (for multi-device sync)
    socket.join(`user:${userId}`);

    // Admin joins monitoring room
    if (role === 'admin') {
      socket.join('admin:dashboard');
      console.log(`[Socket.IO] Admin ${userId} joined admin:dashboard`);
    }

    // ==================== SOS LIFECYCLE EVENTS ====================

    /**
     * sos:start - Initiates emergency broadcast
     */
    socket.on('sos:start', async (data) => {
      try {
        console.log(`[SOS:START] User ${userId} triggered SOS`);

        // Extract contact IDs from data (should be sent from frontend)
        const notifiedContactIds = data.contactIds || [];

        // Create SOS session in database
        const sosSession = await locationService.startSOSSession(userId, notifiedContactIds);

        // Register this device
        await locationService.registerDevice(userId, socket.id, socket.handshake.headers['user-agent']);

        // Build broadcast payload
        const broadcastPayload = {
          sosSessionId: sosSession._id,
          userId,
          userName: data.userName || 'Unknown User',
          startTime: sosSession.startTime,
          reason: data.reason || 'Emergency Alert'
        };

        // Broadcast to all user's devices
        socket.to(`user:${userId}`).emit('sos:started', broadcastPayload);

        // Join contacts into a room and broadcast
        if (notifiedContactIds.length > 0) {
          notifiedContactIds.forEach(contactId => {
            socket.to(`user:${contactId}`).emit('emergency:alert', {
              ...broadcastPayload,
              message: 'An emergency alert has been triggered'
            });
          });
        }

        // Broadcast to admin dashboard
        io.to('admin:dashboard').emit('sos:started', {
          ...broadcastPayload,
          contactsNotified: notifiedContactIds.length
        });

        // Acknowledge to sender
        socket.emit('sos:started_confirmed', { sosSessionId: sosSession._id });
      } catch (error) {
        console.error('[SOS:START] Error:', error);
        socket.emit('error', { message: 'Failed to start SOS', error: error.message });
      }
    });

    /**
     * sos:location_update - Receives and broadcasts live location
     * Expects: { lat, lng, accuracy, sosSessionId }
     */
    socket.on('sos:location_update', async (locationData) => {
      try {
        // Update location in database
        const updatedSession = await locationService.updateSOSLocation(userId, locationData);

        if (!updatedSession) {
          socket.emit('error', { message: 'No active SOS session' });
          return;
        }

        // Build broadcast payload
        const broadcastPayload = {
          sosSessionId: updatedSession._id,
          userId,
          location: {
            lat: locationData.lat,
            lng: locationData.lng,
            accuracy: locationData.accuracy
          },
          timestamp: new Date()
        };

        // Broadcast to user's other devices
        socket.to(`user:${userId}`).emit('sos:location_update', broadcastPayload);

        // Broadcast to notified contacts
        updatedSession.notifiedContacts.forEach(contactId => {
          socket.to(`user:${contactId}`).emit('sos:location_update', broadcastPayload);
        });

        // Broadcast to admin dashboard
        io.to('admin:dashboard').emit('sos:location_update', broadcastPayload);
      } catch (error) {
        console.error('[SOS:LOCATION_UPDATE] Error:', error);
        socket.emit('error', { message: 'Failed to update location', error: error.message });
      }
    });

    /**
     * sos:stop - Ends emergency broadcast
     */
    socket.on('sos:stop', async (data) => {
      try {
        console.log(`[SOS:STOP] User ${userId} stopped SOS`);

        const sosSession = await locationService.endSOSSession(userId, data.reason || 'User cancelled');

        // Unregister device
        await locationService.unregisterDevice(userId, socket.id);

        // Build broadcast payload
        const broadcastPayload = {
          sosSessionId: sosSession._id,
          userId,
          endTime: sosSession.endTime,
          duration: sosSession.duration,
          reason: data.reason || 'SOS cancelled'
        };

        // Broadcast to all user's devices
        socket.to(`user:${userId}`).emit('sos:stopped', broadcastPayload);

        // Broadcast to notified contacts
        sosSession.notifiedContacts.forEach(contactId => {
          socket.to(`user:${contactId}`).emit('sos:stopped', broadcastPayload);
        });

        // Broadcast to admin
        io.to('admin:dashboard').emit('sos:stopped', broadcastPayload);
      } catch (error) {
        console.error('[SOS:STOP] Error:', error);
        socket.emit('error', { message: 'Failed to stop SOS', error: error.message });
      }
    });

    /**
     * subscribe:contacts - User subscribes to listen to their contacts' emergencies
     * Expects: { contactIds: ['id1', 'id2', ...] }
     */
    socket.on('subscribe:contacts', (data) => {
      try {
        const contactIds = data.contactIds || [];
        contactIds.forEach(contactId => {
          socket.join(`emergency:contact:${contactId}`);
        });
        console.log(`[SUBSCRIBE:CONTACTS] User ${userId} subscribed to ${contactIds.length} contacts`);
        socket.emit('subscribed:contacts', { count: contactIds.length });
      } catch (error) {
        console.error('[SUBSCRIBE:CONTACTS] Error:', error);
      }
    });

    /**
     * unsubscribe:contacts - User unsubscribes from contacts
     */
    socket.on('unsubscribe:contacts', (data) => {
      try {
        const contactIds = data.contactIds || [];
        contactIds.forEach(contactId => {
          socket.leave(`emergency:contact:${contactId}`);
        });
        console.log(`[UNSUBSCRIBE:CONTACTS] User ${userId} unsubscribed from ${contactIds.length} contacts`);
      } catch (error) {
        console.error('[UNSUBSCRIBE:CONTACTS] Error:', error);
      }
    });

    /**
     * request:sos_history - Fetch SOS session history for a user
     */
    socket.on('request:sos_history', async (data) => {
      try {
        const limit = data.limit || 20;
        const skip = data.skip || 0;
        const history = await locationService.getSOSHistory(userId, limit, skip);
        socket.emit('sos_history', { history });
      } catch (error) {
        console.error('[REQUEST:SOS_HISTORY] Error:', error);
        socket.emit('error', { message: 'Failed to fetch SOS history', error: error.message });
      }
    });

    /**
     * request:sos_details - Fetch details of a specific SOS session
     */
    socket.on('request:sos_details', async (data) => {
      try {
        const sosSessionId = data.sosSessionId;
        const details = await locationService.getSOSSessionDetails(sosSessionId);
        socket.emit('sos_details', { details });
      } catch (error) {
        console.error('[REQUEST:SOS_DETAILS] Error:', error);
        socket.emit('error', { message: 'Failed to fetch SOS details', error: error.message });
      }
    });

    /**
     * heartbeat - Keep connection alive (optional)
     */
    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack', { timestamp: new Date() });
    });

    // ==================== DISCONNECT ====================
    socket.on('disconnect', async () => {
      try {
        console.log(`[Socket.IO] User ${userId} disconnected`);
        // Clean up: unregister device if SOS was active
        await locationService.unregisterDevice(userId, socket.id);
      } catch (error) {
        console.error('[DISCONNECT] Error:', error);
      }
    });

    // ==================== ERROR HANDLING ====================
    socket.on('error', (error) => {
      console.error(`[Socket.IO Error] User ${userId}:`, error);
    });
  });

  return io;
}

module.exports = initializeSocket;

# E-Guard AI Real-Time Emergency Broadcasting System

## Architecture Overview

### Technology Stack
- **Backend**: Node.js with Express
- **Real-Time Communication**: Socket.IO with Redis Adapter (for scalability)
- **Database**: MongoDB (for SOS session history)
- **Frontend**: Next.js with React
- **Geolocation**: Browser Geolocation API

## System Flow

### 1. SOS Activation Flow
```
User presses SOS Button
    ↓
GPS Permission Request
    ↓
Frontend connects to Socket.IO server with JWT
    ↓
Emit 'sos:start' event with contact IDs
    ↓
Backend creates SOS session in database
    ↓
Backend registers device and joins rooms
    ↓
Broadcast 'sos:started' to:
  - User's other devices (room:user_{id})
  - Trusted contacts (room:emergency:contact_{id})
  - Admin dashboard (room:admin:dashboard)
```

### 2. Location Update Flow
```
Browser watchPosition fires
    ↓
Location buffered in frontend
    ↓
Every 3 seconds: emit 'sos:location_update'
    ↓
Backend updates SOS session with new location
    ↓
Broadcast location to:
  - User's other devices
  - Trusted contacts
  - Admin dashboard
    ↓
All receivers update map marker in real-time
```

### 3. SOS Deactivation Flow
```
User clicks "Cancel SOS" or session times out
    ↓
Emit 'sos:stop' event
    ↓
Backend finalizes SOS session:
  - Set status to 'resolved'
  - Calculate duration
  - Store final path
    ↓
Broadcast 'sos:stopped' to all rooms
    ↓
Clear GPS tracking on frontend
    ↓
Redirect to summary page
```

## Real-Time Event Structure

### Client → Server Events

#### `sos:start`
```json
{
  "contactIds": ["contact_id_1", "contact_id_2"],
  "userName": "John Doe",
  "reason": "Emergency Alert"
}
```

#### `sos:location_update`
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "accuracy": 10.5
}
```

#### `sos:stop`
```json
{
  "reason": "User cancelled"
}
```

#### `subscribe:contacts`
```json
{
  "contactIds": ["contact_id_1", "contact_id_2"]
}
```

### Server → Client Events

#### `sos:started_confirmed`
```json
{
  "sosSessionId": "60d5ec49c1234567890abc12"
}
```

#### `sos:location_update`
```json
{
  "sosSessionId": "60d5ec49c1234567890abc12",
  "userId": "user_id",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "accuracy": 10.5
  },
  "timestamp": "2024-03-28T10:30:45Z"
}
```

#### `sos:stopped`
```json
{
  "sosSessionId": "60d5ec49c1234567890abc12",
  "userId": "user_id",
  "endTime": "2024-03-28T10:45:00Z",
  "duration": 915,
  "reason": "User cancelled"
}
```

## Database Schema

### SOS Session Model
```
{
  userId: ObjectId,
  status: "active" | "resolved" | "cancelled",
  startTime: DateTime,
  endTime: DateTime,
  reason: String,
  notifiedContacts: [ObjectId],
  locationPath: [
    {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: DateTime
    }
  ],
  lastLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: DateTime
  },
  devices: [
    {
      deviceId: String,
      userAgent: String,
      connectedAt: DateTime,
      disconnectedAt: DateTime
    }
  ],
  duration: Number (in seconds),
  isEmergency: Boolean,
  timestamps: {
    createdAt: DateTime,
    updatedAt: DateTime
  }
}
```

## Implementation Details

### Backend Services

#### Location Service (`server/services/locationService.js`)
- `startSOSSession(userId, notifiedContactIds)` - Create new SOS session
- `updateSOSLocation(userId, locationData)` - Add location point to path
- `endSOSSession(userId, reason)` - Finalize SOS session
- `getActiveSOSSession(userId)` - Fetch current active session
- `getSOSHistory(userId, limit, skip)` - Fetch SOS history
- `registerDevice(userId, deviceId, userAgent)` - Register device for multi-device sync
- `unregisterDevice(userId, deviceId)` - Unregister device on disconnect

#### Socket.IO Server (`server/realtime/socket.js`)
- Authentication middleware with JWT verification
- Room management for multi-device and contact broadcasting
- Event handlers for SOS lifecycle (start, location_update, stop)
- Automatic cleanup on disconnect

### Frontend Components

#### useSOSTracking Hook (`client/hooks/useSOSTracking.ts`)
- Socket.IO connection management
- GPS tracking using `navigator.geolocation.watchPosition()`
- Location buffering and periodic emission
- Event listeners for incoming SOS events
- Automatic reconnection handling

#### LiveMap Component (`client/components/LiveMap.tsx`)
- Real-time map rendering
- Location point visualization
- Distance and waypoint tracking
- Zoom controls
- Live tracking status indicator

## Production Best Practices

### 1. Security

#### Authentication & Authorization
```javascript
// JWT-based authentication for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = decoded;
  next();
});
```

#### Encrypted Transport
- Use `https://` and `wss://` (WebSocket Secure) in production
- Enable CORS only for trusted origins
- Implement rate limiting on Socket.IO events

#### Authorization Checks
- Verify user can only track/receive updates for their own contacts
- Admin can only view assigned SOS events
- Implement role-based access control (RBAC)

### 2. Scalability

#### Horizontal Scaling with Redis
```javascript
// Redis adapter for Socket.IO (added in production)
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

#### Load Balancing
- Use sticky sessions to maintain Socket.IO connection affinity
- Deploy multiple Node.js instances behind a load balancer
- Use Redis for session persistence

#### Database Optimization
```javascript
// Batch location updates to prevent write bottlenecks
// Save every 30 seconds instead of every 3 seconds
const locationBatch = [];
setTimeout(() => {
  if (locationBatch.length > 0) {
    SOSSession.updateOne(
      { _id: sosSessionId },
      { $push: { locationPath: { $each: locationBatch } } }
    );
    locationBatch = [];
  }
}, 30000);
```

### 3. Battery Optimization (Frontend)

#### Efficient GPS Tracking
```javascript
// watchPosition is more battery-efficient than setInterval
navigator.geolocation.watchPosition(
  callback,
  error,
  {
    enableHighAccuracy: true,  // Use GPS instead of cell tower triangulation
    timeout: 5000,             // Timeout after 5s if no signal
    maximumAge: 0              // Don't use cached position
  }
);
```

#### Adaptive Update Frequency
```javascript
// Send updates only when location changes significantly
const significantDistanceThreshold = 50; // meters

if (calculateDistance(lastLocation, newLocation) > significantDistanceThreshold) {
  socket.emit('sos:location_update', newLocation);
}
```

### 4. Reconnection & Offline Handling

#### Frontend Reconnection Logic
```javascript
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Queue locations if offline
socket.on('disconnect', () => {
  localStorage.setItem('offlineLocations', JSON.stringify(locationBuffer));
});

socket.on('connect', () => {
  const offlineLocations = JSON.parse(localStorage.getItem('offlineLocations'));
  if (offlineLocations) {
    offlineLocations.forEach(loc => socket.emit('sos:location_update', loc));
  }
});
```

#### Push Notifications for Offline Contacts
```javascript
// When SOS starts, send FCM/APNs notification
// This wakes up the app even if it's in the background
async function notifyOfflineContacts(contactIds) {
  const tokens = await getUserFCMTokens(contactIds);
  await sendPushNotifications(tokens, {
    title: 'Emergency Alert',
    message: 'A contact needs your help',
    data: { sosSessionId, userId }
  });
}
```

### 5. SOS History & Playback

#### Storing Session Data
```javascript
// Full path is stored in database
// Can be replayed on a map for analysis/training

const sosSession = await SOSSession.findById(sosSessionId);
// sosSession.locationPath contains all waypoints with timestamps
```

#### Playback Implementation
```javascript
// Animate historical path on map
async function playbackSOS(sosSessionId) {
  const session = await SOSSession.findById(sosSessionId);
  
  for (const point of session.locationPath) {
    updateMapMarker(point.latitude, point.longitude);
    await sleep(1000); // 1 second per waypoint in playback
  }
}
```

## Deployment Considerations

### Environment Variables Required
```env
# Backend
JWT_SECRET=your_secret_key
DB_URI=mongodb://localhost:27017/egGuard
REDIS_URL=redis://localhost:6379
CLIENT_URL=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

### Docker Deployment Example
```dockerfile
# Backend Dockerfile
FROM node:18
WORKDIR /app
COPY server package*.json ./
RUN npm ci --production
EXPOSE 5000
CMD ["node", "index.js"]
```

### Monitoring & Logging
```javascript
// Log all Socket.IO events for debugging
io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.userId}`);
  
  socket.onAny((event, data) => {
    console.log(`[Event] ${event}:`, JSON.stringify(data).substring(0, 100));
  });
});
```

## Performance Metrics

### Expected Performance
- **Location Update Latency**: < 200ms (p95)
- **Map Marker Update**: < 500ms (p95)
- **Concurrent Users**: 10,000+ with Redis adapter
- **Location Points Storage**: ~1MB per 24-hour SOS session

### Monitoring Metrics
- Active SOS sessions
- Location update frequency
- Socket.IO connection count
- Database write latency
- Memory usage

## Testing Checklist

- [ ] GPS permission handling
- [ ] Multi-device location sync
- [ ] Contact notification delivery
- [ ] Admin dashboard real-time updates
- [ ] Network disconnection recovery
- [ ] Location history storage
- [ ] SOS session cleanup
- [ ] Security & authorization
- [ ] Scalability with multiple concurrent SOS events
- [ ] Battery consumption under sustained tracking

## Future Enhancements

1. **WebRTC Integration**: Direct peer-to-peer voice/video for emergencies
2. **Audio Streaming**: Live audio recording from user's device
3. **Predictive Analytics**: ML-based emergency detection
4. **Blockchain Logging**: Immutable audit trail of SOS events
5. **IoT Integration**: Smart device alerts (smartwatch, car integration)
6. **Offline Maps**: Cache map tiles for areas without connectivity
7. **Emergency Services API**: Direct integration with 911/local authorities
8. **Social Sharing**: One-click emergency alert sharing

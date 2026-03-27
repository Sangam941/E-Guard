# Real-Time Emergency Broadcasting - Setup Guide

## Installation & Configuration

### Step 1: Environment Variables

Create `.env` files in both `server/` and `client/` directories.

**`server/.env`**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DB_URI=mongodb://localhost:27017/egGuard
DB_NAME=egGuard

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Redis (Optional - required for production scalability)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# CORS
CLIENT_URL=http://localhost:3000

# Geolocation
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Logging
LOG_LEVEL=info
```

**`client/.env.local`**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Environment
NEXT_PUBLIC_ENV=development
```

### Step 2: Update Server Entry Point

The `server/index.js` has been updated to initialize Socket.IO. Make sure your HTTP server is properly configured:

```javascript
import http from 'http';
import initializeSocket from './realtime/socket.js';

const server = http.createServer(app);
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`E-Guard server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});
```

### Step 3: Update User Store

Your `useStore.ts` needs to include authentication context for the real-time hooks:

```typescript
// In store/useStore.ts, ensure these are exported:
export const useStore = create((set) => ({
  user: null,
  isSOSActive: false,
  
  activateSOS: () => set({ isSOSActive: true }),
  deactivateSOS: () => set({ isSOSActive: false }),
  
  // ... other store methods
}));
```

### Step 4: Update useStore to Include User Info

```typescript
// store/useStore.ts
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContacts?: string[];
}

export const useStore = create((set, get) => ({
  user: null as User | null,
  setUser: (user: User) => set({ user }),
  // ... rest of store
}));
```

### Step 5: Verify Database Connection

Ensure MongoDB is running and the SOS session model can be created:

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/egGuard"

# You should see: egGuard>
```

### Step 6: Redis Setup (for Production)

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

## Testing the Implementation

### Test 1: Local Development

```bash
# Terminal 1: Start Backend
cd server
npm run dev
# Expected: "Socket.IO server initialized"

# Terminal 2: Start Frontend
cd client
npm run dev
# Navigate to http://localhost:3000/sos
```

### Test 2: SOS Trigger Test

1. Navigate to `/sos` page
2. Allow geolocation permission
3. Hold SOS button for 1 second
4. You should be redirected to `/sos/details`
5. Check browser console for Socket.IO logs

### Test 3: Multi-Device Sync

1. Open the application in two different browser windows
2. Log in with the same user account in both windows
3. Trigger SOS in one window
4. The other window should receive real-time location updates

### Test 4: Contact Notification

1. Set up test contacts in the database
2. Trigger SOS with contact IDs
3. Monitor backend logs to verify broadcast events

## Monitoring & Debugging

### Backend Logs

```javascript
// Enable detailed Socket.IO logging
// Add to server/realtime/socket.js

const io = new Server(server, {
  debug: true,
  logger: console,
  // ...
});
```

### Frontend Debugging

```javascript
// In browser console
localStorage.setItem('debug', 'socket.io-client:*');
// Reload page to see Socket.IO debug logs
```

### Database Inspection

```javascript
// Check active SOS sessions
db.sossessions.find({ status: 'active' })

// Check SOS history for a user
db.sossessions.find({ userId: ObjectId('user_id') }).sort({ startTime: -1 })

// View location path for a session
db.sossessions.findOne({ _id: ObjectId('session_id') }).locationPath
```

## API Endpoints

### User Authentication
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/verify
```

### Contacts Management
```
GET /api/contacts
POST /api/contacts
DELETE /api/contacts/:id
```

### SOS History (REST API - for non-real-time queries)
```
GET /api/sos/history
GET /api/sos/:sessionId
POST /api/sos/:sessionId/playback
```

## Troubleshooting

### Issue: "Authentication error: No token provided"
**Solution**: Ensure `authToken` is stored in localStorage after login:
```javascript
localStorage.setItem('authToken', token);
```

### Issue: Socket.IO connection fails
**Solution**: Check CORS configuration in `server/realtime/socket.js`:
```javascript
cors: {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true
}
```

### Issue: GPS permission denied
**Solution**: 
- Use HTTPS in production (required for Geolocation API)
- Check browser privacy settings
- Grant location permission manually

### Issue: High latency between location updates
**Solution**:
- Check network connection (should be < 200ms)
- Verify Socket.IO is using WebSocket (not polling)
- Check browser DevTools: Network > WS

### Issue: Locations not persisting in database
**Solution**:
- Verify MongoDB connection
- Check database write permissions
- Monitor MongoDB logs for write errors
- Check free disk space

## Performance Tuning

### Reduce Battery Consumption
```javascript
// Increase update interval from 3 to 5 seconds
setInterval(() => {
  socket.emit('sos:location_update', latestLocation);
}, 5000); // 5 seconds instead of 3
```

### Batch Database Writes
```javascript
// Instead of writing every update, batch them
const updateBatchSize = 10;
let locationBuffer = [];

socket.on('sos:location_update', (data) => {
  locationBuffer.push(data);
  if (locationBuffer.length >= updateBatchSize) {
    saveBatch(locationBuffer);
    locationBuffer = [];
  }
});
```

### Scale Horizontally
```bash
# Use PM2 cluster mode
pm2 start server/index.js -i max

# Or use load balancer with sticky sessions
# upstream backend {
#   server 127.0.0.1:5000;
#   server 127.0.0.1:5001;
#   keepalive 64;
# }
```

## Security Hardening

### 1. Rate Limiting
```javascript
// Add rate limiting to Socket.IO events
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.use('/api/', limiter);
```

### 2. Input Validation
```javascript
// Validate location data
socket.on('sos:location_update', (data) => {
  if (!isValidCoordinates(data.lat, data.lng)) {
    return socket.emit('error', { message: 'Invalid coordinates' });
  }
  // Process update
});
```

### 3. Use HTTPS/WSS
```env
# In production, always use secure protocols
CLIENT_URL=https://yourdomain.com
# Socket.IO will automatically use wss:// protocol
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas or on-premises database set up
- [ ] Redis cache configured
- [ ] HTTPS/SSL certificates installed
- [ ] CORS origins configured for production domain
- [ ] Rate limiting enabled
- [ ] Error logging configured (e.g., Sentry)
- [ ] Health check endpoint working
- [ ] Database backups automated
- [ ] Monitoring and alerting set up (e.g., DataDog, New Relic)
- [ ] Load balancer configured with sticky sessions
- [ ] PM2 or systemd service configured
- [ ] Database indexes created
- [ ] Security audit completed
- [ ] Performance testing done

## Production Deployment Example (Docker)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy application
COPY . .

# Expose ports
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server/index.js"]
```

```bash
# Build and run
docker build -t egguard-server .
docker run -p 5000:5000 --env-file .env egguard-server
```

## Next Steps

1. **Implement Emergency Contacts UI**: Build UI for managing emergency contacts
2. **Add Admin Dashboard**: Create dashboard to monitor active SOS events
3. **Implement Audio Recording**: Stream audio during SOS
4. **Add Offline Support**: Cache locations and sync when online
5. **Implement Playback**: Allow SOS path replay for analysis
6. **Add Notifications**: Email/SMS alerts for emergency contacts
7. **Integrate with Emergency Services**: Connect to 911/local authorities

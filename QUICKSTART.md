# Quick Start Guide - Real-Time Emergency Broadcasting

## 5-Minute Setup

### 1. Install Dependencies (Already Done)
```bash
npm install socket.io socket.io-client @socket.io/redis-adapter redis
```

### 2. Create Environment Files

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
DB_URI=mongodb://localhost:27017/egGuard
CLIENT_URL=http://localhost:3000
```

**`client/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend
cd client
npm run dev
```

### 4. Test the Flow

1. Go to http://localhost:3000/sos
2. Allow geolocation permission
3. Hold the red SOS button for 1 second
4. View real-time location tracking on the details page

---

## What Was Implemented

### Backend Files Created
✅ `/server/models/SOSSession.js` - Database schema
✅ `/server/services/locationService.js` - Business logic
✅ `/server/realtime/socket.js` - WebSocket server
✅ `/server/index.js` - Updated with Socket.IO initialization

### Frontend Files Created
✅ `/client/hooks/useSOSTracking.ts` - GPS + WebSocket hook
✅ `/client/components/LiveMap.tsx` - Real-time map display
✅ `/client/app/sos/page.tsx` - Updated SOS trigger
✅ `/client/app/sos/details/page.tsx` - Updated details with live tracking

### Documentation Files
✅ `REALTIME_EMERGENCY_BROADCASTING.md` - Architecture & best practices
✅ `SETUP_GUIDE.md` - Detailed setup instructions
✅ `SOCKET_IO_API_REFERENCE.md` - API documentation

---

## Key Features

### ✅ Real-Time GPS Tracking
- Browser Geolocation API for accurate location
- Sends updates every 3 seconds
- Automatic reconnection handling

### ✅ Multi-Device Synchronization
- Same user on multiple devices receives updates simultaneously
- Device registration and tracking

### ✅ Contact Broadcasting
- Trusted contacts instantly notified
- Real-time map updates for contacts
- Contact status: RECEIVED / DELIVERING / DISPATCHED

### ✅ Admin Dashboard Support
- Admin room for system-wide monitoring
- All SOS events visible to admins

### ✅ Persistent Storage
- Full location path stored in MongoDB
- SOS session history available
- Playback capability

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ WebSocket (Socket.IO)
       │
┌──────▼─────────────────┐
│  Node.js + Express     │
│  Socket.IO Server      │
│ (Real-time Handler)    │
└──────┬─────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │             │             │             │
┌──────▼──┐  ┌──────▼──┐  ┌──────▼──┐  ┌──────▼──┐
│MongoDB  │  │ Rooms   │  │  User   │  │  Admin  │
│ Storage │  │(Broadcast)│ │ Devices │  │Dashboard│
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## Usage Example

### Trigger SOS

```typescript
import { useSOSTracking } from '@/hooks/useSOSTracking';

function EmergencyPage() {
  const { startTracking, stopTracking } = useSOSTracking(token);

  const handleSOS = () => {
    startTracking(
      ['contact_id_1', 'contact_id_2'],  // Contact IDs
      'John Doe',                         // User name
      'Medical Emergency'                 // Reason
    );
  };

  const handleCancel = () => {
    stopTracking('User cancelled');
  };

  return (
    <>
      <button onClick={handleSOS}>Start SOS</button>
      <button onClick={handleCancel}>Cancel SOS</button>
    </>
  );
}
```

### Receive Location Updates

```typescript
import { useSOSTracking } from '@/hooks/useSOSTracking';

function ContactDashboard() {
  const { socket, state } = useSOSTracking(token);

  useEffect(() => {
    if (socket) {
      socket.on('sos:location_update', (data) => {
        console.log('Location:', data.location);
        // Update map marker
      });
    }
  }, [socket]);

  return (
    <LiveMap
      socket={socket}
      isTracking={state.isTracking}
      currentLocation={state.currentLocation}
    />
  );
}
```

---

## Real-Time Event Flow

```
1. User presses SOS button
   ↓
2. Frontend emits 'sos:start' event
   ↓
3. Backend creates SOS session in database
   ↓
4. Backend broadcasts 'sos:started' to:
   - User's other devices
   - Notified contacts
   - Admin dashboard
   ↓
5. Frontend starts GPS tracking via watchPosition()
   ↓
6. Every 3 seconds: emit 'sos:location_update'
   ↓
7. Backend broadcasts location to:
   - User's other devices
   - Notified contacts
   - Admin dashboard
   ↓
8. All receivers update map markers in real-time
   ↓
9. User clicks "Cancel SOS"
   ↓
10. Frontend emits 'sos:stop'
    ↓
11. Backend finalizes session
    ↓
12. Broadcast 'sos:stopped' to all
```

---

## Database Schema

```
SOS Session
├── userId (user triggering SOS)
├── status (active / resolved / cancelled)
├── startTime
├── endTime
├── reason
├── notifiedContacts (array of contact IDs)
├── locationPath (array of GPS points)
├── lastLocation
├── devices (array of connected devices)
└── duration (in seconds)
```

---

## Performance Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Location update latency | < 200ms | p95 |
| Map marker update | < 500ms | p95 |
| Concurrent users | 10,000+ | With Redis adapter |
| Location points/session | 1,000-3,000 | 1 per 2-3 seconds |
| Storage per session | ~2MB | For 2-hour SOS session |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket fails to connect | Check CORS in `socket.js` |
| No location updates | Check GPS permission & accuracy |
| Database errors | Verify MongoDB is running |
| High latency | Check network connection |
| Memory leak | Clear listeners in useEffect cleanup |

---

## Next Steps

1. **Add Emergency Contacts UI**
   - UI to select/manage contacts
   - Contact status display

2. **Implement Admin Dashboard**
   - Real-time SOS monitoring
   - Active location tracking
   - Historical playback

3. **Add Notifications**
   - Push notifications (FCM/APNs)
   - Email/SMS alerts
   - Sound & vibration

4. **Enhanced Map Features**
   - Google Maps integration
   - Route history visualization
   - Heat maps for high-risk areas

5. **Audio/Video Streaming**
   - Live audio recording
   - Video feed from device
   - Ambient recording

---

## Support & Resources

### Documentation
- 📖 `REALTIME_EMERGENCY_BROADCASTING.md` - Full architecture
- 📋 `SETUP_GUIDE.md` - Detailed setup
- 🔌 `SOCKET_IO_API_REFERENCE.md` - API docs

### Code Files
- 🔧 `/server/realtime/socket.js` - Backend implementation
- ⚙️ `/server/services/locationService.js` - Business logic
- 🪝 `/client/hooks/useSOSTracking.ts` - Frontend hook
- 🗺️ `/client/components/LiveMap.tsx` - Map component

### External Resources
- [Socket.IO Docs](https://socket.io/docs/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Next.js Docs](https://nextjs.org/docs)

---

## Questions & Issues

For issues with the implementation:

1. Check browser console for Socket.IO errors
2. Check server logs for backend errors
3. Verify MongoDB connection
4. Test with `curl` or Postman
5. Enable debug logging (see SETUP_GUIDE.md)

Happy coding! 🚀

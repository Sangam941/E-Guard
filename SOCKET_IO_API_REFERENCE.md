# Real-Time Socket.IO API Reference

## Socket.IO Connection

### Connecting to the Server

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## Client → Server Events

### Event: `sos:start`
**Description**: Initiates an emergency broadcast when SOS is triggered

**Request Payload**:
```typescript
{
  contactIds: string[];        // Array of contact user IDs to notify
  userName: string;            // Name of the user triggering SOS
  reason: string;              // Reason for emergency (optional)
}
```

**Example**:
```javascript
socket.emit('sos:start', {
  contactIds: ['contact_1', 'contact_2'],
  userName: 'John Doe',
  reason: 'Medical Emergency'
});
```

**Response**:
- Server emits `sos:started_confirmed` with `sosSessionId`
- Server broadcasts `sos:started` to relevant rooms

---

### Event: `sos:location_update`
**Description**: Sends updated GPS coordinates every 2-5 seconds

**Request Payload**:
```typescript
{
  lat: number;         // Latitude (-90 to 90)
  lng: number;         // Longitude (-180 to 180)
  accuracy: number;    // GPS accuracy in meters
}
```

**Example**:
```javascript
socket.emit('sos:location_update', {
  lat: 40.7128,
  lng: -74.0060,
  accuracy: 10.5
});
```

**Constraints**:
- Only valid during active SOS session
- Sent every 3 seconds from frontend
- Coordinates stored in database

---

### Event: `sos:stop`
**Description**: Terminates the emergency broadcast

**Request Payload**:
```typescript
{
  reason: string;      // Reason for stopping (optional)
}
```

**Example**:
```javascript
socket.emit('sos:stop', {
  reason: 'User cancelled'
});
```

**Response**:
- Server emits `sos:stopped` to all listeners
- GPS tracking stops on all devices
- SOS session finalized in database

---

### Event: `subscribe:contacts`
**Description**: Subscribe to emergency alerts from specific contacts

**Request Payload**:
```typescript
{
  contactIds: string[];  // Array of contact IDs to monitor
}
```

**Example**:
```javascript
socket.emit('subscribe:contacts', {
  contactIds: ['contact_1', 'contact_2', 'contact_3']
});
```

**Response**:
- Server acknowledges with `subscribed:contacts`
- User joins rooms for each contact
- Receives their future SOS events

---

### Event: `unsubscribe:contacts`
**Description**: Unsubscribe from emergency alerts

**Request Payload**:
```typescript
{
  contactIds: string[];  // Array of contact IDs
}
```

**Example**:
```javascript
socket.emit('unsubscribe:contacts', {
  contactIds: ['contact_1']
});
```

---

### Event: `request:sos_history`
**Description**: Retrieve SOS session history for the current user

**Request Payload**:
```typescript
{
  limit: number;   // Number of records (default: 20)
  skip: number;    // Number of records to skip for pagination (default: 0)
}
```

**Example**:
```javascript
socket.emit('request:sos_history', {
  limit: 20,
  skip: 0
});
```

**Response**:
- Server emits `sos_history` with array of SOS sessions

---

### Event: `request:sos_details`
**Description**: Get detailed information about a specific SOS session

**Request Payload**:
```typescript
{
  sosSessionId: string;  // ID of the SOS session
}
```

**Example**:
```javascript
socket.emit('request:sos_details', {
  sosSessionId: '60d5ec49c1234567890abc12'
});
```

**Response**:
- Server emits `sos_details` with full session data including location path

---

### Event: `heartbeat`
**Description**: Keep the connection alive (optional)

**Example**:
```javascript
socket.emit('heartbeat');
```

**Response**:
- Server responds with `heartbeat_ack` and timestamp

---

## Server → Client Events

### Event: `sos:started`
**Description**: Broadcast when an SOS is initiated

**Payload**:
```typescript
{
  sosSessionId: string;      // Unique session identifier
  userId: string;            // ID of user who triggered SOS
  userName: string;          // Name of the user
  startTime: ISO8601;        // UTC timestamp of SOS start
  reason: string;            // Emergency reason
  contactsNotified: number;  // Count of notified contacts (admin only)
}
```

**Example Reception**:
```javascript
socket.on('sos:started', (data) => {
  console.log(`Emergency alert from ${data.userName} at ${data.startTime}`);
  // Show alert notification
  // Update UI with SOS status
});
```

---

### Event: `sos:location_update`
**Description**: Real-time location update during active SOS

**Payload**:
```typescript
{
  sosSessionId: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  timestamp: ISO8601;
}
```

**Example Reception**:
```javascript
socket.on('sos:location_update', (data) => {
  // Update map marker with new location
  updateMapMarker(data.location.lat, data.location.lng);
  
  // Update accuracy indicator
  updateAccuracyDisplay(data.location.accuracy);
});
```

---

### Event: `sos:stopped`
**Description**: Broadcast when SOS is deactivated

**Payload**:
```typescript
{
  sosSessionId: string;
  userId: string;
  endTime: ISO8601;
  duration: number;          // Duration in seconds
  reason: string;
}
```

**Example Reception**:
```javascript
socket.on('sos:stopped', (data) => {
  console.log(`SOS ended. Duration: ${data.duration} seconds`);
  // Clear map markers
  // Show summary
  // Update contact list status
});
```

---

### Event: `emergency:alert`
**Description**: Alert for contact when user they follow triggers SOS

**Payload**:
```typescript
{
  sosSessionId: string;
  userId: string;
  userName: string;
  startTime: ISO8601;
  message: string;
}
```

**Example Reception**:
```javascript
socket.on('emergency:alert', (data) => {
  // Show urgent notification
  showNotification(`${data.userName} needs help!`, {
    urgent: true,
    sound: true
  });
});
```

---

### Event: `sos_history`
**Description**: Response to `request:sos_history` event

**Payload**:
```typescript
{
  history: [
    {
      _id: string;
      userId: ObjectId;
      status: 'active' | 'resolved' | 'cancelled';
      startTime: ISO8601;
      endTime: ISO8601;
      reason: string;
      notifiedContacts: ObjectId[];
      duration: number;
      lastLocation: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: ISO8601;
      };
    }
  ];
}
```

---

### Event: `sos_details`
**Description**: Response to `request:sos_details` event

**Payload**:
```typescript
{
  details: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    status: 'active' | 'resolved' | 'cancelled';
    startTime: ISO8601;
    endTime: ISO8601;
    reason: string;
    notifiedContacts: Array<{
      _id: string;
      name: string;
      email: string;
      phone: string;
    }>;
    locationPath: [
      {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: ISO8601;
      }
    ];
    lastLocation: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: ISO8601;
    };
    devices: [
      {
        deviceId: string;
        userAgent: string;
        connectedAt: ISO8601;
        disconnectedAt: ISO8601;
      }
    ];
    duration: number;
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

---

### Event: `sos:started_confirmed`
**Description**: Confirmation that SOS was successfully initiated

**Payload**:
```typescript
{
  sosSessionId: string;  // Use this ID for subsequent operations
}
```

---

### Event: `subscribed:contacts`
**Description**: Confirmation of subscription to contacts

**Payload**:
```typescript
{
  count: number;  // Number of contacts subscribed to
}
```

---

### Event: `error`
**Description**: Error occurred during operation

**Payload**:
```typescript
{
  message: string;  // Error description
  error: string;    // Error details
}
```

**Example Reception**:
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  // Show error to user
  showError(data.message);
});
```

---

### Event: `heartbeat_ack`
**Description**: Acknowledge heartbeat

**Payload**:
```typescript
{
  timestamp: ISO8601;  // Server timestamp
}
```

---

## Error Codes

### Authentication Errors
- **401**: Invalid or expired JWT token
- **403**: User not authorized for this action

### Validation Errors
- **400**: Invalid coordinates or data format
- **422**: Missing required fields

### State Errors
- **409**: Action conflicts with current state (e.g., stopping non-active SOS)
- **404**: Resource not found (e.g., invalid sosSessionId)

### Server Errors
- **500**: Internal server error
- **503**: Service unavailable

---

## Rooms and Broadcasting

### User Room
**Format**: `user:{userId}`
- **Purpose**: Multi-device synchronization
- **Members**: All devices of a single user
- **Events**: `sos:started`, `sos:location_update`, `sos:stopped`

### Contact Room
**Format**: `emergency:contact:{userId}`
- **Purpose**: Notify contacts of emergency
- **Members**: Contacts subscribed to the user
- **Events**: `emergency:alert`, `sos:location_update`, `sos:stopped`

### Admin Room
**Format**: `admin:dashboard`
- **Purpose**: System-wide monitoring
- **Members**: Admin users only
- **Events**: All SOS events

---

## Rate Limiting

**Location Update Limit**: 1 per 1 second (3-5 second intervals recommended)
**Event Emission Limit**: 100 events per minute
**Connection Limit**: 5 connections per user

---

## Best Practices

1. **Always include error handling**:
```javascript
socket.on('error', handleError);
```

2. **Implement reconnection logic**:
```javascript
socket.on('disconnect', () => {
  // Queue locations locally
  // Attempt to reconnect
});
```

3. **Clean up listeners**:
```javascript
useEffect(() => {
  socket.on('sos:location_update', handler);
  return () => {
    socket.off('sos:location_update', handler);
  };
}, [socket]);
```

4. **Validate incoming data**:
```javascript
socket.on('sos:location_update', (data) => {
  if (!isValidCoordinates(data.lat, data.lng)) {
    // Reject update
    return;
  }
  // Process update
});
```

5. **Use acknowledgments for critical operations**:
```javascript
socket.emit('sos:start', data, (response) => {
  if (response.success) {
    console.log('SOS started with ID:', response.sosSessionId);
  }
});
```

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

interface SOSTrackingState {
  isTracking: boolean;
  currentLocation: Location | null;
  error: string | null;
  sosSessionId: string | null;
}

export function useSOSTracking(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SOSTrackingState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    sosSessionId: null
  });

  const watchIdRef = useRef<number | null>(null);
  const locationBufferRef = useRef<Location[]>([]);
  const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setState(prev => ({ ...prev, error: 'Connection error: ' + error.message }));
    });

    newSocket.on('sos:started_confirmed', (data) => {
      console.log('SOS confirmed with session ID:', data.sosSessionId);
      setState(prev => ({
        ...prev,
        sosSessionId: data.sosSessionId
      }));
    });

    newSocket.on('error', (data) => {
      console.error('Socket error:', data);
      setState(prev => ({ ...prev, error: data.message }));
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Start SOS tracking
  const startTracking = useCallback(
    (contactIds: string[] = [], userName: string = 'User', reason: string = 'Emergency') => {
      if (!socketRef.current || !navigator.geolocation) {
        setState(prev => ({ ...prev, error: 'Socket.IO or Geolocation not available' }));
        return;
      }

      setState(prev => ({ ...prev, isTracking: true, error: null }));

      // Emit SOS start event to backend
      socket.emit('sos:start', {
        contactIds,
        userName,
        reason
      });

      // Get initial location and start watching
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          setState(prev => ({ ...prev, currentLocation: location }));
          locationBufferRef.current.push(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setState(prev => ({
            ...prev,
            error: `GPS Error: ${error.message}`
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      watchIdRef.current = watchId;

      // Send location updates every 3 seconds (configurable)
      sendIntervalRef.current = setInterval(() => {
        if (locationBufferRef.current.length > 0 && socketRef.current) {
          // Send the latest location
          const latestLocation = locationBufferRef.current[locationBufferRef.current.length - 1];
          socketRef.current.emit('sos:location_update', latestLocation);
        }
      }, 3000); // Send every 3 seconds
    },
    []
  );

  // Stop SOS tracking
  const stopTracking = useCallback(
    (reason: string = 'User cancelled') => {
      // Stop watching position
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Clear send interval
      if (sendIntervalRef.current !== null) {
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
      }

      // Clear location buffer
      locationBufferRef.current = [];

      // Emit SOS stop event
      if (socketRef.current) {
        socketRef.current.emit('sos:stop', { reason });
      }

      setState(prev => ({
        ...prev,
        isTracking: false,
        sosSessionId: null
      }));
    },
    []
  );

  // Listen for incoming SOS events (for contacts/admins)
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('sos:started', (data) => {
      console.log('SOS started by:', data.userId);
    });

    socket.on('sos:location_update', (data) => {
      console.log('Location update received:', data);
    });

    socket.on('sos:stopped', (data) => {
      console.log('SOS stopped:', data);
    });

    return () => {
      socket.off('sos:started');
      socket.off('sos:location_update');
      socket.off('sos:stopped');
    };
  }, []);

  return {
    startTracking,
    stopTracking,
    state,
    socketRef
  };
}

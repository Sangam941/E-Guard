'use client';

import React, { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useSOSStore } from '@/store/useSOSStore';
import { AlertTriangle, MapPin, X, Check, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const { setLiveHelpers, updateHelperStatus, removeHelper } = useSOSStore();
  const [incomingSOS, setIncomingSOS] = useState<any>(null);
  const [helperLocation, setHelperLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket.connected) socket.disconnect();
      return;
    }

    const userId = (user as any)._id || (user as any).email || sessionId;

    socket.connect();

    // Default fallback location to ensure integration works even if browser permissions are denied
    const defaultLat = 40.7128;
    const defaultLng = -74.0060;
    setHelperLocation({ lat: defaultLat, lng: defaultLng });
    socket.emit('updateLocation', {
      userId,
      name: (user as any)?.name || 'Unknown Helper',
      latitude: defaultLat,
      longitude: defaultLng
    });

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setHelperLocation({ lat: latitude, lng: longitude });
        
        socket.emit('updateLocation', {
          userId,
          name: (user as any)?.name || 'Unknown Helper',
          latitude,
          longitude
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    // Listen for incoming SOS from others
    socket.on('receiveSOS', (data) => {
      console.log('Received SOS alert:', data);
      setIncomingSOS(data);
    });

    // Receive initial detected helpers array immediately after SOS
    socket.on('detectedHelpers', (helpers) => {
      setLiveHelpers(helpers.map((h: any) => ({ ...h, status: 'PENDING' })));
    });

    // Listen for helper confirmation
    socket.on('helperAssigned', (data) => {
      toast.success(`Help is on the way! Helper assigned.`);
      updateHelperStatus(data.helperId, 'RESPONDING');
    });

    // Listen for explicit helper rejection
    socket.on('helperRejected', (data) => {
      removeHelper(data.helperId);
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off('receiveSOS');
      socket.off('detectedHelpers');
      socket.off('helperAssigned');
      socket.off('helperRejected');
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  const handleAccept = () => {
    if (!incomingSOS || !helperLocation || !user) return;
    const userId = (user as any)._id || (user as any).email || sessionId;

    socket.emit('acceptSOS', {
      helperId: userId,
      victimId: incomingSOS.victimId,
      helperLat: helperLocation.lat,
      helperLng: helperLocation.lng
    });
    
    toast.success('You have accepted the request. Navigating to victim.', { duration: 4000 });
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${incomingSOS.latitude},${incomingSOS.longitude}`, '_blank');
    setIncomingSOS(null);
  };

  const handleReject = () => {
    if (incomingSOS && user) {
      const userId = (user as any)._id || (user as any).email || sessionId;
      socket.emit('rejectSOS', { helperId: userId, victimId: incomingSOS.victimId });
    }
    setIncomingSOS(null);
  };

  return (
    <>
      {children}
      
      {incomingSOS && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-red-950 border-2 border-red-500 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            <div className="bg-red-600 p-6 flex flex-col items-center text-center">
              <AlertTriangle size={64} className="text-white mb-2 animate-bounce" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">SOS Alert</h2>
              <p className="text-red-100 mt-1 font-medium">Someone nearby needs immediate help!</p>
            </div>
            
            <div className="p-6 bg-gray-900 border-t border-red-500/30">
              <div className="flex items-center gap-3 mb-6 bg-gray-800 p-4 rounded-xl">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Navigation size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Distance from you</p>
                  <p className="text-xl font-bold text-white">{incomingSOS.distance} km away</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { triggerSOS as apiTriggerSOS } from '@/api/sos';
import { useSOSStore } from '@/store/useSOSStore';
import { useAuthStore } from '@/store/useAuthStore';
import { socket } from '@/lib/socket';

export default function SOSPage() {
  const { createSOS } = useSOSStore()
  const { user } = useAuthStore()
  const router = useRouter();
  const { activateSOS } = useStore();
  const [sosTriggered, setSOSTriggered] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const handleMouseDown = () => {
    setProgress(0);
    
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
          setSOSTriggered(true);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      setSOSTriggered(true);
    }, 1000);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
  };

  // Send alert when SOS is triggered
  useEffect(() => {
    if (sosTriggered) {
      createSOS(location.lat, location.lng);
      
      const userId = (user && ((user as any)._id || (user as any).email)) || 'anonymous-' + Math.random().toString(36).substring(7);
      socket.emit('triggerSOS', {
        userId,
        latitude: location.lat,
        longitude: location.lng
      });
      
      router.push('/sos/details');
    }
  }, [sosTriggered, activateSOS, router, location, user]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-12">
          {/* Large Red SOS Button */}
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="relative w-64 h-64 mx-auto mb-8 rounded-full bg-red-600 hover:bg-red-500 transition shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center group"
          >
            {/* Pulsing Background Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-pulse"></div>

            {/* Progress Ring SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.3))' }}>
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeDasharray={`${(progress / 100) * 754} 754`}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            {/* Button Content */}
            <div className="relative z-10 flex flex-col items-center">
              <Shield size={72} className="text-white mb-4" />
              <span className="text-5xl font-bold tracking-widest text-white">SOS</span>
              <span className="text-lg text-white/90 mt-4 font-medium">Hold 1s to trigger</span>
            </div>
          </button>
        </div>

        <p className="text-gray-400 text-2xl mb-4">
          Your location will be shared with emergency contacts
        </p>
        <p className="text-gray-500 text-lg">
          {progress > 0 ? `${Math.round(progress)}% - Hold to complete` : 'Press and hold the button'}
        </p>
      </div>
    </div>
  );
}

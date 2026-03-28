'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSOSStore } from '@/store/useSOSStore';
import { useAuthStore } from '@/store/useAuthStore';
import { socket } from '@/lib/socket';

export default function SOSPage() {
  const { createSOS } = useSOSStore()
  const { user } = useAuthStore()
  const router = useRouter();
  const [sosTriggered, setSOSTriggered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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
    setIsHolding(true);
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
    setIsHolding(false);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    // Only reset progress if SOS wasn't triggered
    if (!sosTriggered) {
      setProgress(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleMouseUp();
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
  }, [sosTriggered, router, location, user]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center w-full max-w-lg flex flex-col items-center justify-center">
        {/* Header Text */}
        <div className="mb-6 sm:mb-10 md:mb-14 order-1">
          <h1 className="text-sm sm:text-base md:text-lg text-gray-400 mb-2 uppercase tracking-wider">Emergency Alert System</h1>
          <p className="text-xs sm:text-sm text-gray-500">Hold the button below for 1 second to send SOS</p>
        </div>

        {/* SOS Button Container */}
        <div className="mb-8 sm:mb-12 md:mb-16 order-2">
          {/* Large Red SOS Button */}
          <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleMouseUp}
            type="button"
            className={`relative w-32 h-32 sm:w-48 md:w-64 sm:h-48 md:h-64 mx-auto rounded-full transition-all shadow-2xl flex flex-col items-center justify-center group focus:outline-none focus:ring-4 focus:ring-red-400/50 touch-none cursor-pointer select-none ${
              isHolding 
                ? 'bg-red-700 scale-95 shadow-red-600/80' 
                : 'bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-red-600/50'
            }`}
          >
            {/* Pulsing Background Ring */}
            <div className={`absolute inset-0 rounded-full opacity-50 animate-pulse ${
              isHolding ? 'border-4 border-red-200' : 'border-2 sm:border-4 border-red-400'
            }`}></div>

            {/* Button Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-1 sm:gap-2">
              <Shield size={28} className="sm:w-10 sm:h-10 md:w-14 md:h-14 text-white" />
              <span className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-widest text-white leading-tight">SOS</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium whitespace-nowrap">
                {isHolding ? `${Math.round(progress)}%` : 'Hold 1s'}
              </span>
            </div>

            {/* Progress Ring SVG */}
            {progress > 0 && (
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" 
                viewBox="0 0 200 200"
                style={{ filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.5))' }}
                preserveAspectRatio="xMidYMid meet"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray={`${(progress / 100) * 565} 565`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Status Text */}
        <div className="order-3 w-full px-2">
          <p className="text-xs sm:text-sm text-gray-400 mb-3">
            Your location will be shared with emergency contacts
          </p>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-mono text-gray-300">
              {progress > 0 ? (
                <span>
                  <span className="text-red-400 font-bold">{Math.round(progress)}%</span>
                  <span className="text-gray-400"> — Keep holding...</span>
                </span>
              ) : (
                <span className="text-gray-400">Press and hold the button to activate SOS</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

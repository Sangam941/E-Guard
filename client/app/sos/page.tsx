'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, MapPin, Share2, Shield } from 'lucide-react';
import { apiService } from '@/services/api';

export default function SOSPage() {
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [isSending, setIsSending] = useState(false);
  const [notifiedContacts, setNotifiedContacts] = useState<any[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [sosTriggered, setSOSTriggered] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get user's current location
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
    
    // Progress bar animation
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

    // Hold timer - 1 second to trigger
    holdTimerRef.current = setTimeout(() => {
      setSOSTriggered(true);
    }, 1000);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
  };

  const handleSOS = async () => {
    setIsSending(true);
    try {
      const response = await apiService.sos.trigger({
        location,
        description: 'Emergency SOS activated',
      });
      setNotifiedContacts(response.notifiedContacts || []);
      setAlertSent(true);
    } catch (error) {
      console.error('Error triggering SOS:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Auto-trigger alert when SOS button hold completes
  useEffect(() => {
    if (sosTriggered && !alertSent && !isSending) {
      handleSOS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sosTriggered]);

  // Step 1: Hold to Trigger Screen
  if (!sosTriggered) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12">
            {/* Large Red SOS Button */}
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              className="relative w-48 h-48 mx-auto mb-8 rounded-full bg-red-600 hover:bg-red-500 transition shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center group"
            >
              {/* Pulsing Background Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-pulse"></div>

              {/* Progress Ring SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.3))' }}>
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray={`${(progress / 100) * 578} 578`}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Button Content */}
              <div className="relative z-10 flex flex-col items-center">
                <Shield size={56} className="text-white mb-2" />
                <span className="text-4xl font-bold tracking-widest text-white">SOS</span>
                <span className="text-sm text-white/90 mt-2 font-medium">Hold 1s to trigger</span>
              </div>
            </button>
          </div>

          <p className="text-gray-400 text-lg mb-4">
            Your location will be shared with emergency contacts
          </p>
          <p className="text-gray-500 text-sm">
            {progress > 0 ? `${Math.round(progress)}% - Hold to complete` : 'Press and hold the button'}
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Emergency Alert Confirmation
  if (!alertSent) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <h1 className="text-6xl font-bold mb-4">
              <span className="text-red-500">EMERGENCY</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Your location will be shared with emergency contacts
            </p>
          </div>

          {/* Map Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="h-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 40% 40%, #22c55e 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MapPin size={32} className="text-green-400" />
                </div>
                <p className="text-sm text-gray-300 mb-2">YOUR LOCATION</p>
                <p className="text-xs text-gray-500 font-mono">
                  GPS: {location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W
                </p>
              </div>
            </div>
          </div>

          {/* Big Red Button */}
          <button
            onClick={handleSOS}
            disabled={isSending}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold py-6 rounded-lg text-2xl transition mb-4 tracking-widest"
          >
            {isSending ? 'SENDING...' : 'SEND EMERGENCY ALERT'}
          </button>

          <button 
            onClick={() => setSOSTriggered(false)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Alert Sent Screen
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-green-400 text-xs font-bold tracking-widest mb-2">● CRITICAL EVENT LIVE</p>
            <h1 className="text-6xl font-bold">ALERT</h1>
            <h2 className="text-5xl font-bold text-white">SENT</h2>
          </div>
          <div className="space-y-3 text-right text-sm">
            <div className="flex items-center justify-end gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">UPLINK</span>
              <span className="text-green-400 font-semibold">SECURE / ACTIVE</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-yellow-400">🎯</span>
              <span className="text-gray-400">DISPATCH</span>
              <span className="text-yellow-400 font-semibold">RESPONDER ASSIGNED</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Map */}
          <div className="col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded overflow-hidden">
                {/* Map Grid Background */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle at 40% 40%, #22c55e 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}></div>

                {/* Map SVG Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#666" strokeWidth="1" />
                  <line x1="100%" y1="0" x2="0" y2="100%" stroke="#666" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="80" fill="none" stroke="#666" strokeWidth="1" opacity="0.3" />
                  <circle cx="50%" cy="50%" r="120" fill="none" stroke="#666" strokeWidth="1" opacity="0.2" />
                </svg>

                {/* Location Marker */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
                      <MapPin size={24} className="text-green-400" />
                    </div>
                    <div className="absolute inset-0 border-2 border-green-400/30 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Distance Marker */}
                <div className="absolute top-12 left-1/3 bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">
                  UNI-4A
                </div>

                {/* Zoom Controls */}
                <div className="absolute right-6 bottom-6 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-lg font-bold">+</button>
                  <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-lg font-bold">−</button>
                </div>
              </div>

              {/* Coordinates */}
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">GPS COORDINATES</p>
                <p className="text-sm font-mono text-green-400 font-bold">{location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W</p>
              </div>
            </div>
          </div>

          {/* Right: Contacts & Status */}
          <div className="col-span-1 space-y-6">
            {/* Notified Contacts */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">
                NOTIFIED CONTACTS <span className="text-green-400">3 ACTIVE</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">👤</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">MARCUS V.</p>
                    <p className="text-xs text-gray-500">EMERGENCY CONTACT</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-400 font-bold">RECEIVED</p>
                    <p className="text-xs text-gray-500">12:14</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">👤</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">ELENA B.</p>
                    <p className="text-xs text-gray-500">EMERGENCY CONTACT</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-400 font-bold">DELIVERING</p>
                    <p className="text-xs text-gray-500">12:15</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">🎯</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">LOCAL AUTHORITIES</p>
                    <p className="text-xs text-gray-500">911 DISPATCH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-400 font-bold">DISPATCHED</p>
                    <p className="text-xs text-gray-500">12:14</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mic Feed */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">MIC FEED - LIVE</h3>
              <div className="flex items-center justify-center gap-1 h-12">
                <div className="w-1 h-6 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-8 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-1 h-7 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4 font-mono">RECORDING IN PROGRESS</p>
            </div>
          </div>
        </div>

        {/* Bottom Info & Buttons */}
        <div className="mt-8 space-y-6">
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
            OBSIDIAN AEGIS PROTOCOL. All data, including audio and GPS tracking, is being encrypted and mirrored to three secure nodes. Local law enforcement has been provided with a temporary access token valid for 120 minutes.
          </p>

          <div className="flex gap-4">
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition font-semibold tracking-widest text-sm">
              SHARE STATUS LINK
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg transition font-semibold tracking-widest text-sm">
              FALSE ALARM / CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

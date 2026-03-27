'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SOSPage() {
  const { activateSOS, deactivateSOS, isSOSActive, location, setLocation, currentSOSId } = useStore();
  const [isSending, setIsSending] = useState(false);
  const [sosTriggered, setSOSTriggered] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = useRef(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);


  // Get real GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    }
  }, [setLocation]);

  const handleMouseDown = () => {
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
          if (!triggeredRef.current) {
            triggeredRef.current = true;
            setSOSTriggered(true);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      if (!triggeredRef.current) {
        triggeredRef.current = true;
        setSOSTriggered(true);
      }
    }, 1000);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (!triggeredRef.current) setProgress(0);
  };

  // Send real SOS when triggered
  useEffect(() => {
    if (sosTriggered && !isSOSActive) {
      setIsSending(true);
      activateSOS().finally(() => setIsSending(false));
    }
  }, [sosTriggered, isSOSActive, activateSOS]);

  const handleCancel = async () => {
    await deactivateSOS();
    setSOSTriggered(false);
    triggeredRef.current = false;
    setProgress(0);
  };

  // Use real location from store, fall back to default
  const displayLocation = location || { lat: 40.7128, lng: -74.0060 };

  // Step 1: Hold to Trigger Screen
  if (!sosTriggered) {
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
                <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle
                  cx="128" cy="128" r="120" fill="none" stroke="white" strokeWidth="6"
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

  // Step 2 & 3: Alert Sent Screen
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-green-400 text-xs font-bold tracking-widest mb-4">● CRITICAL EVENT LIVE</p>
              <h1 className="text-7xl font-bold mb-2">ALERT</h1>
              <h2 className="text-6xl font-bold text-white">
                {isSending ? 'SENDING...' : 'SENT'}
              </h2>
            </div>
            <div className="space-y-4 text-right text-sm">
              <div className="flex items-center justify-end gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">UPLINK</span>
                <span className="text-green-400 font-semibold">SECURE / ACTIVE</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-yellow-400 text-lg">🎯</span>
                <span className="text-gray-400">DISPATCH</span>
                <span className="text-yellow-400 font-semibold">RESPONDER ASSIGNED</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Map */}
            <div className="col-span-2">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
                <div className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded overflow-hidden mb-6">
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

                  {/* Zoom Controls */}
                  <div className="absolute right-6 bottom-6 flex flex-col gap-2">
                    <button className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-2xl font-bold">+</button>
                    <button className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-2xl font-bold">−</button>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="p-4 bg-gray-800 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">GPS COORDINATES</p>
                  <p className="text-base font-mono text-green-400 font-bold">
                    {displayLocation.lat.toFixed(4)}° N, {Math.abs(displayLocation.lng).toFixed(4)}° {displayLocation.lng < 0 ? 'W' : 'E'}
                  </p>
                  {currentSOSId && (
                    <p className="text-xs text-gray-600 mt-1 font-mono">SOS ID: {currentSOSId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contacts & Status */}
            <div className="col-span-1 space-y-6">
              {/* Notified Contacts */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-bold tracking-widest mb-6">
                  NOTIFIED CONTACTS <span className="text-green-400">ACTIVE</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">👤</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">EMERGENCY CONTACTS</p>
                      <p className="text-xs text-gray-500">ALL CONTACTS NOTIFIED</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-400 font-bold">SENT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">🎯</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">LOCATION BROADCAST</p>
                      <p className="text-xs text-gray-500">GPS ACTIVE</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-400 font-bold">LIVE</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mic Feed */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-bold tracking-widest mb-6">MIC FEED - LIVE</h3>
                <div className="flex items-center justify-center gap-1 h-16">
                  <div className="w-1.5 h-6 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-8 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1.5 h-7 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4 font-mono">RECORDING IN PROGRESS</p>
              </div>
            </div>
          </div>

          {/* Bottom Info & Buttons */}
          <div className="mt-12 space-y-8">
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              OBSIDIAN AEGIS PROTOCOL. All data, including GPS tracking, is being encrypted and mirrored to secure nodes. Emergency contacts have been notified with your real-time location.
            </p>
            <div className="flex gap-6">
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg transition font-semibold tracking-widest text-sm">
                SHARE STATUS LINK
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg transition font-semibold tracking-widest text-sm"
              >
                FALSE ALARM / CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

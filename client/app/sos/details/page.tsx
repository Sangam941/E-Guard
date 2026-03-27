'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSOSTracking } from '@/hooks/useSOSTracking';
import LiveMap from '@/components/LiveMap';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function SOSDetailsPage() {
  const router = useRouter();
  const { isSOSActive, deactivateSOS, user } = useStore();
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060, accuracy: 10 });
  
  // Get token from localStorage
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  });

  // Initialize real-time tracking
  const { startTracking, stopTracking, state: sosState, socket } = useSOSTracking(token);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      });
    }
  }, []);

  // Start real-time tracking when SOS is active
  useEffect(() => {
    if (isSOSActive && token && socket && !sosState.isTracking) {
      startTracking([], user?.name || 'User', 'Emergency Alert');
    }
  }, [isSOSActive, token, socket, sosState.isTracking, startTracking, user?.name]);

  // Redirect if no active SOS
  useEffect(() => {
    if (!isSOSActive) {
      if (sosState.isTracking) {
        stopTracking('SOS Deactivated');
      }
      router.push('/sos');
    }
  }, [isSOSActive, router, sosState.isTracking, stopTracking]);

  const handleCancel = async () => {
    stopTracking('User cancelled');
    await deactivateSOS();
    router.push('/sos');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-green-400 text-xs font-bold tracking-widest mb-4">● CRITICAL EVENT LIVE</p>
              <h1 className="text-7xl font-bold mb-2">ALERT</h1>
              <h2 className="text-6xl font-bold text-white">SENT</h2>
            </div>
            <div className="space-y-4 text-right text-sm">
              <div className="flex items-center justify-end gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
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
              <LiveMap
                socket={socket}
                sosSessionId={sosState.sosSessionId}
                isTracking={sosState.isTracking}
                currentLocation={sosState.currentLocation}
                showPath={true}
              />
            </div>

            {/* Right: Contacts & Status */}
            <div className="col-span-1 space-y-6">
              {/* Notified Contacts */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-sm font-bold tracking-widest mb-6">
                  NOTIFIED CONTACTS <span className="text-green-400">3 ACTIVE</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">👤</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">MARCUS V.</p>
                      <p className="text-xs text-gray-500">EMERGENCY CONTACT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-400 font-bold">RECEIVED</p>
                      <p className="text-xs text-gray-500">12:14</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">👤</div>
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
                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">🎯</div>
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
                <h3 className="text-sm font-bold tracking-widest mb-6">MIC FEED - LIVE</h3>
                <div className="flex items-center justify-center gap-1 h-16">
                  <div className="w-1.5 h-6 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-8 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="w-1.5 h-7 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4 font-mono">RECORDING IN PROGRESS</p>
              </div>
            </div>
          </div>

          {/* Bottom Info & Buttons */}
          <div className="mt-12 space-y-8">
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              OBSIDIAN AEGIS PROTOCOL. All data, including audio and GPS tracking, is being encrypted and mirrored to three secure nodes. Local law enforcement has been provided with a temporary access token valid for 120 minutes.
            </p>

            <div className="flex gap-6">
              <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg transition font-bold tracking-widest text-lg">
                STOP SOS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

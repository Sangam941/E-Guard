'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertTriangle, MapPin, X, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { socketService, SOSAlert } from '@/services/socketService';

export default function MonitorPage() {
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAlarm = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Create AudioContext if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Stop any existing alarm
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch {}
        oscillatorRef.current = null;
      }

      // Create oscillator for alarm tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      // Create pulsing alarm effect by modulating frequency
      let high = true;
      alarmIntervalRef.current = setInterval(() => {
        if (oscillatorRef.current && audioContextRef.current) {
          const freq = high ? 800 : 600;
          oscillatorRef.current.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
          high = !high;
        }
      }, 250);
    } catch (error) {
      console.error('Error starting alarm:', error);
    }
  }, [soundEnabled]);

  const stopAlarm = useCallback(() => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
      oscillatorRef.current = null;
    }
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const dismissAlert = useCallback(() => {
    stopAlarm();
    setShowPopup(false);
    setAlert(null);
  }, [stopAlarm]);

  // Play alarm when popup shows
  useEffect(() => {
    if (showPopup && soundEnabled) {
      // Small delay to ensure audio context is ready (browser autoplay policy)
      const timer = setTimeout(() => {
        startAlarm();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopAlarm();
    }
  }, [showPopup, soundEnabled, startAlarm, stopAlarm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAlarm]);

  useEffect(() => {
    // Connect to Socket.IO and join as monitor
    socketService.connect();
    socketService.joinMonitor();

    const socket = socketService.getSocket();
    if (socket) {
      setConnected(socket.connected);
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
    }

    // Listen for SOS alerts
    socketService.onSOSAlert((sosAlert: SOSAlert) => {
      console.log('[Monitor] SOS Alert received:', sosAlert);
      setAlert(sosAlert);
      setShowPopup(true);
    });

    return () => {
      socketService.offSOSAlert();
    };
  }, []);

  // Auto-dismiss after 5 minutes if not acknowledged
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        dismissAlert();
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, dismissAlert]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Status Bar */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {connected ? 'Connected - Listening for SOS' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content - Waiting Screen */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center">
            <AlertTriangle size={48} className="text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">SOS Monitor</h1>
          <p className="text-gray-500 mb-8">
            Waiting for emergency alerts... This page will show a popup and play an alarm sound when an SOS is triggered.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">How it works:</h2>
            <ol className="text-sm text-gray-500 space-y-2">
              <li className="flex gap-3">
                <span className="text-yellow-500 font-bold">1.</span>
                <span>Keep this page open on your phone</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-500 font-bold">2.</span>
                <span>When SOS is triggered on another device, you&apos;ll get a full-screen alert</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-500 font-bold">3.</span>
                <span>An alarm sound will play to notify you</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-500 font-bold">4.</span>
                <span>Tap &quot;Acknowledge&quot; to dismiss the alert</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* SOS Alert Popup Overlay */}
      {showPopup && alert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-pulse">
          {/* Flashing red background effect */}
          <div
            className="absolute inset-0 bg-red-600 animate-ping opacity-20"
            style={{ animationDuration: '1s' }}
          />

          {/* Main popup */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-gray-900 border-2 border-red-500 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20">
            {/* Header */}
            <div className="bg-red-600 p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-wider">SOS ALERT</h2>
              <p className="text-red-100 text-sm mt-1">EMERGENCY SOS TRIGGERED</p>
            </div>

            {/* Alert Details */}
            <div className="p-6 space-y-4">
              {/* Location */}
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-red-500" />
                  <span className="text-sm font-semibold text-gray-300">Location</span>
                </div>
                <p className="text-lg font-mono text-red-400 font-bold">
                  {alert.location.lat.toFixed(6)}° N, {Math.abs(alert.location.lng).toFixed(6)}° W
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Alert ID */}
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                <p className="text-xs text-gray-500">Alert ID</p>
                <p className="text-sm font-mono text-gray-400">{alert.id}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={dismissAlert}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} />
                  ACKNOWLEDGE & DISMISS
                </button>
                <button
                  onClick={() => {
                    // Open location in maps
                    const url = `https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Open in Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

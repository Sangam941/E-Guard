'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, PhoneCall, User, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function FakeCallPage() {
  const { isFakeCallActive, triggerFakeCall, endFakeCall } = useStore();
  const [isAccepted, setIsAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [delayTimer, setDelayTimer] = useState(5);
  const [callerName, setCallerName] = useState('Dad');
  const [callerNumber, setCallerNumber] = useState('+1 (555) 123-4567');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFakeCallActive && !isAccepted && delayTimer > 0) {
      interval = setInterval(() => {
        setDelayTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFakeCallActive, isAccepted, delayTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFakeCallActive && isAccepted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFakeCallActive, isAccepted]);

  const handleAccept = () => setIsAccepted(true);
  const handleReject = () => {
    setIsAccepted(false);
    setCallDuration(0);
    setDelayTimer(5);
    endFakeCall();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Configuration Screen
  if (!isFakeCallActive) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-blue-400 text-xs font-bold tracking-widest mb-4">● ESCALATION PROTOCOL</p>
            <h1 className="text-7xl font-bold mb-2">Fake</h1>
            <h2 className="text-6xl font-bold text-white mb-6">Call</h2>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-12">
            {/* Left: Configuration Form */}
            <div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <PhoneCall className="text-blue-400" />
                  Caller Configuration
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2">CALLER NAME</label>
                    <input
                      type="text"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter caller name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2">PHONE NUMBER</label>
                    <input
                      type="tel"
                      value={callerNumber}
                      onChange={(e) => setCallerNumber(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2">DELAY BEFORE CALL (seconds)</label>
                    <input
                      type="number"
                      defaultValue="5"
                      min="0"
                      max="60"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAccepted(false);
                    setCallDuration(0);
                    setDelayTimer(5);
                    triggerFakeCall(callerName, callerNumber);
                  }}
                  className="w-full mt-8 py-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <PhoneCall className="inline mr-2" size={18} />
                  Trigger Fake Call
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-400" />
                  How it Works
                </h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Phone will ring after your set delay</li>
                  <li>• Choose to accept or decline the call</li>
                  <li>• Gives you a believable excuse to leave</li>
                  <li>• Trigger immediately if in danger</li>
                </ul>
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
                <h3 className="text-xs font-bold tracking-widest mb-8 text-gray-400">CALL PREVIEW</h3>
                
                <div className="flex flex-col items-center justify-center py-16 bg-gray-800 rounded-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-6 border-2 border-blue-500/30">
                    <User className="w-12 h-12 text-blue-400" />
                  </div>
                  
                  <h4 className="text-3xl font-bold text-white mb-2">Dad</h4>
                  <p className="text-gray-400 mb-8">+1 (555) 123-4567</p>
                  
                  <div className="text-center mb-8">
                    <p className="text-sm text-gray-500 mb-2">Status:</p>
                    <p className="text-lg font-bold text-yellow-400">READY TO CALL</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    The call will ring on your device. You can accept or reject. This tool is designed to help you safely exit uncomfortable situations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Incoming Call Screen
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-8">
      {/* Status Badge */}
      <div className="absolute top-8 left-8 flex items-center gap-2 bg-green-600/20 border border-green-600/50 rounded-full px-4 py-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold text-green-400">CALL ACTIVE</span>
      </div>

      {/* Caller Info */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 mb-20">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full flex items-center justify-center border-4 border-blue-500/50 shadow-2xl shadow-blue-500/20">
          <User className="w-20 h-20 text-blue-300" />
        </div>
        
        <div className="text-center">
          <h1 className="text-6xl font-light text-white mb-2">Dad</h1>
          <p className="text-2xl text-gray-400">+1 (555) 123-4567</p>
          
          <div className="mt-8">
            {!isAccepted ? (
              <div>
                <p className="text-xl text-gray-400 mb-4">Incoming call...</p>
                {delayTimer > 0 && (
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                    <Clock size={16} />
                    Ringing in {delayTimer}s
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-lg text-green-400 mb-4">Connected</p>
                <p className="text-4xl font-bold text-white font-mono">{formatTime(callDuration)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center items-center gap-16">
        <button
          onClick={handleReject}
          className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-600/40 transition-colors group"
        >
          <PhoneOff className="w-10 h-10 text-white" />
        </button>

        {!isAccepted && (
          <button
            onClick={handleAccept}
            className="w-24 h-24 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center shadow-lg shadow-green-600/40 transition-colors animate-pulse"
          >
            <Phone className="w-10 h-10 text-white" />
          </button>
        )}
      </div>

      {/* Safety Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          Your location is being shared with emergency contacts during this call.
        </p>
      </div>
    </div>
  );
}

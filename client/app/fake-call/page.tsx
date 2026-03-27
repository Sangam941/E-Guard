'use client';

import React, { useState } from 'react';
import { Phone, User, Zap } from 'lucide-react';
import { apiService } from '@/services/api';

export default function FakeCallPage() {
  const [callerName, setCallerName] = useState('David Chen');
  const [callerRole, setCallerRole] = useState('Work / Urgent');
  const [voiceProfile, setVoiceProfile] = useState('Standard Male');
  const [delayMode, setDelayMode] = useState('INSTANT');
  const [delayTime, setDelayTime] = useState('30s');
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);

  const handleTriggerCall = async () => {
    setIsCalling(true);
    try {
      const response = await apiService.fakeCall.trigger({
        callerId: callerName,
        duration: delayMode === 'INSTANT' ? 0 : parseInt(delayTime),
        theme: voiceProfile,
      });
      setCallActive(true);
    } catch (error) {
      console.error('Error triggering fake call:', error);
    } finally {
      setIsCalling(false);
    }
  };

  if (callActive) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
        <div className="max-w-sm mx-auto text-center">
          {/* Incoming Call Screen */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={48} className="text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{callerName}</h1>
            <p className="text-green-400 text-sm mb-6 font-semibold">Obsidian Aegis Secure Line</p>
            <p className="text-5xl font-bold text-gray-300 mb-8 font-mono">00:23</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setCallActive(false)}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition"
            >
              <Phone size={24} />
            </button>
            <button className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-gray-900 flex items-center justify-center transition font-bold text-2xl">
              ✓
            </button>
          </div>

          <button
            onClick={() => setCallActive(false)}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            End Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Escalation Tool</h1>
          <p className="text-gray-400 text-lg">
            Configure a strategic diversion to exit uncomfortable or unsafe situations. Deploy an authentic mock call with custom identity and timing.
          </p>
        </div>

        {/* Caller Identity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
            <User size={20} /> CALLER IDENTITY
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">DISPLAY NAME</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">VOCAL PROFILE</label>
              <select
                value={voiceProfile}
                onChange={(e) => setVoiceProfile(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-400 transition"
              >
                <option>Standard Male</option>
                <option>Standard Female</option>
                <option>Business Male</option>
                <option>Professional Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">CALL THEME</label>
              <select
                value={callerRole}
                onChange={(e) => setCallerRole(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-400 transition"
              >
                <option>Work / Urgent</option>
                <option>Family / Emergency</option>
                <option>Friend / Social</option>
                <option>Business / Meeting</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incoming Call Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-gray-400 font-semibold mb-4 text-sm">INCOMING CALL PREVIEW</h3>
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
            <p className="text-gray-400 text-sm">Obsidian Aegis Secure Line</p>
          </div>
        </div>

        {/* Delay Timer */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
            <Zap size={20} /> DELAY TIMER
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setDelayMode('INSTANT')}
              className={`py-3 px-4 rounded font-semibold transition ${
                delayMode === 'INSTANT'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              INSTANT
            </button>
            <div className="bg-gray-800 rounded px-4 py-3 flex items-center justify-center">
              <span className="text-gray-300">QUICK EXIT</span>
            </div>
            <div className="bg-gray-800 rounded px-4 py-3 flex items-center justify-center">
              <span className="text-gray-300">2m</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            STRATEGIC TIMING
          </p>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTriggerCall}
          disabled={isCalling}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-4 rounded-lg text-lg transition mb-4"
        >
          {isCalling ? 'INITIATING...' : 'TRIGGER FAKE CALL'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Call will ring for 3 seconds. Accept to engage or let it ring to cancel.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, PhoneCall, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function FakeCallPage() {
  const { isFakeCallActive, triggerFakeCall, endFakeCall } = useStore();
  const [isAccepted, setIsAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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
    endFakeCall();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isFakeCallActive) {
    return (
      <div className="flex flex-col h-full py-6 gap-6 items-center justify-center">
        <div className="bg-[#1e2130] p-6 rounded-3xl border border-[#2d3748] text-center max-w-xs w-full">
          <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneCall className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Fake Call</h2>
          <p className="text-sm text-[#9ca3af] mb-8">
            Trigger a realistic incoming call to help you exit uncomfortable situations safely.
          </p>
          <button
            onClick={() => {
              setIsAccepted(false);
              setCallDuration(0);
              triggerFakeCall();
            }}
            className="w-full py-4 rounded-xl font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors shadow-lg shadow-blue-500/20"
          >
            Trigger Fake Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] bg-[#0f111a] flex flex-col"
      >
        {/* Caller Info */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-32 h-32 bg-[#2d3748] rounded-full flex items-center justify-center border-4 border-[#1e2130] shadow-2xl">
            <User className="w-16 h-16 text-[#9ca3af]" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-light text-white mb-2">Dad</h1>
            <p className="text-lg text-[#9ca3af]">
              {!isAccepted ? 'Incoming call...' : formatTime(callDuration)}
            </p>
          </div>
        </div>

        {/* Call Controls */}
        <div className="pb-20 px-8 flex justify-between items-center max-w-sm mx-auto w-full">
          <button
            onClick={handleReject}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {!isAccepted && (
            <motion.button
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={handleAccept}
              className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
            >
              <Phone className="w-8 h-8 text-white" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

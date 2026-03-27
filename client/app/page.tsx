'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, MessageSquare, PhoneCall, Users, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isSOSActive, activateSOS, isSilentModeActive, toggleSilentMode } = useStore();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // SOS Hold logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isSOSActive) {
      interval = setInterval(() => {
        setProgress((p) => p + 2); // 50 * 20ms = 1000ms (1 second hold)
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isHolding, isSOSActive]);

  useEffect(() => {
    if (progress >= 100 && !isSOSActive) {
      activateSOS();
      router.push('/sos');
    }
  }, [progress, isSOSActive, activateSOS, router]);

  const handlePointerDown = () => setIsHolding(true);
  const handlePointerUp = () => {
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full py-6 gap-8">
      {/* Status Header */}
      <div className="flex items-center justify-between bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSOSActive ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
            {isSOSActive ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="font-semibold text-white">
              {isSOSActive ? 'Emergency Active' : 'System Ready'}
            </h2>
            <p className="text-xs text-[#9ca3af]">
              {isSOSActive ? 'Help is on the way' : 'All systems operational'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={toggleSilentMode}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isSilentModeActive 
              ? 'bg-[#8b5cf6] text-white' 
              : 'bg-[#2d3748] text-[#9ca3af] hover:text-white'
          }`}
        >
          {isSilentModeActive ? 'Silent Mode ON' : 'Silent Mode OFF'}
        </button>
      </div>

      {/* Main SOS Button */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {!isSOSActive && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute w-48 h-48 rounded-full border-2 border-red-500/30"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                  className="absolute w-48 h-48 rounded-full border border-red-500/20"
                />
              </>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          whileTap={{ scale: 0.95 }}
          className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-2xl transition-colors duration-300 ${
            isSOSActive 
              ? 'bg-red-600 shadow-red-600/50' 
              : 'bg-gradient-to-b from-red-500 to-red-600 shadow-red-500/30'
          }`}
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeDasharray="678" // 2 * pi * 108
              strokeDashoffset={678 - (progress / 100) * 678}
              className="transition-all duration-75 ease-linear"
            />
          </svg>

          <ShieldAlert className="w-16 h-16 text-white mb-2" />
          <span className="text-3xl font-black tracking-widest text-white uppercase">SOS</span>
          <span className="text-xs text-white/80 mt-1 font-medium">Hold 1s to trigger</span>
        </motion.button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/live" className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] hover:border-[#8b5cf6]/50 transition-colors group flex flex-col gap-3">
          <div className="bg-[#8b5cf6]/20 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
            <MessageSquare className="w-5 h-5 text-[#8b5cf6] group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Live AI</h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">Voice & Vision Assistant</p>
          </div>
        </Link>

        <Link href="/fake-call" className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] hover:border-[#3b82f6]/50 transition-colors group flex flex-col gap-3">
          <div className="bg-[#3b82f6]/20 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#3b82f6] transition-colors">
            <PhoneCall className="w-5 h-5 text-[#3b82f6] group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Fake Call</h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">Simulate incoming call</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

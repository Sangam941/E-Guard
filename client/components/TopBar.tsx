'use client';

import { Shield, Settings, Mic, Camera } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';

export default function TopBar() {
  const { isSOSActive, isSilentModeActive } = useStore();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#0f111a]/90 backdrop-blur-md border-b border-[#2d3748] pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#8b5cf6] p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">E-Guard AI</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isSilentModeActive && !isSOSActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full text-xs font-semibold"
            >
              <div className="flex gap-1">
                <Mic className="w-3 h-3 animate-pulse" />
                <Camera className="w-3 h-3 animate-pulse" />
              </div>
              REC
            </motion.div>
          )}

          {isSOSActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              SOS ACTIVE
            </div>
          )}
          <button className="p-2 text-[#9ca3af] hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import { Bell, Settings, Menu, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { isSOSActive, isSilentModeActive } = useStore();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden">
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSOSActive ? 'bg-red-600' : 'bg-green-600'}`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">E-Guard AI</h1>
              <p className={`text-xs ${isSOSActive ? 'text-red-400' : 'text-green-400'}`}>
                {isSOSActive ? 'ALERT ACTIVE' : 'SYSTEM ONLINE'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isSilentModeActive && !isSOSActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 text-purple-400 rounded-full text-xs font-semibold border border-purple-600/30">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              RECORDING
            </div>
          )}

          {isSOSActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              SOS ACTIVE
            </div>
          )}

          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>

          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

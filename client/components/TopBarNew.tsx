'use client';

import React from 'react';
import { Bell, Settings, User, Menu } from 'lucide-react';

const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <button onClick={onMenuClick} className="md:hidden p-2">
          <Menu size={24} className="text-gray-400" />
        </button>

        <h1 className="text-xl font-bold text-green-400 md:text-2xl">E-GUARD AI</h1>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition">
            <Settings size={20} className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition">
            <User size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

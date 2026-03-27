'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  MessageSquare,
  Zap,
  Lock,
  MoreVertical,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Smartphone,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: AlertCircle, label: 'SOS', href: '/sos', color: 'text-red-400' },
    { icon: MessageSquare, label: 'CHAT', href: '/assistant', color: 'text-green-400' },
    { icon: Zap, label: 'RECORDING', href: '/live', color: 'text-yellow-400' },
    { icon: Smartphone, label: 'FAKE CALL', href: '/fake-call', color: 'text-blue-400' },
    { icon: Lock, label: 'VAULT', href: '/evidence', color: 'text-purple-400' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 z-50 md:z-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-green-400 text-lg">OBSIDIAN</span>
          </div>
          <button onClick={onClose} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">SENTINEL ONE</span>
          </div>
          <p className="text-xs text-gray-500">Status: Active Monitoring</p>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 border-l-2 border-green-400'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-green-400' : item.color} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 space-y-3">
          <button className="w-full px-4 py-2 bg-green-500 text-black rounded-lg font-semibold text-sm hover:bg-green-400 transition">
            LOCKDOWN
          </button>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full text-gray-400 hover:text-gray-200 transition p-2">
              <HelpCircle size={18} />
              <span className="text-sm">SUPPORT</span>
            </button>
            <button className="flex items-center gap-3 w-full text-gray-400 hover:text-gray-200 transition p-2">
              <Lock size={18} />
              <span className="text-sm">SYSTEM LOG</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

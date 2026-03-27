'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Zap, Mic, Phone, Lock, Settings, LogOut, Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const {logout} = useAuthStore()
  const { isSOSActive } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Zap, label: 'Dashboard', href: '/' },
    { icon: Shield, label: 'SOS', href: '/sos', danger: true },
    { icon: Mic, label: 'Chat', href: '/assistant' },
    { icon: Phone, label: 'Fake Call', href: '/fake-call' },
    { icon: Lock, label: 'Contacts', href: '/contacts' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40
          w-64 h-screen bg-gray-900 border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSOSActive ? 'bg-red-600' : 'bg-green-600'}`}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">E-Guard AI</h1>
            <p className={`text-xs ${isSOSActive ? 'text-red-400' : 'text-green-400'}`}>
              {isSOSActive ? '🔴 ACTIVE' : '🟢 PROTECTED'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  group relative overflow-hidden
                  ${
                    item.danger
                      ? isActive
                        ? 'bg-red-600/30 text-red-300 border border-red-600/60 shadow-lg shadow-red-600/30'
                        : 'bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20'
                      : isActive
                      ? 'bg-green-600/20 text-green-300 border border-green-600/50 shadow-lg shadow-green-600/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/50'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.danger ? 'bg-red-500' : 'bg-green-500'}`}></div>
                )}
                
                <item.icon 
                  size={20} 
                  className={`transition-all duration-200 ${
                    isActive 
                      ? item.danger
                        ? 'scale-125'
                        : 'scale-125'
                      : item.danger
                      ? 'group-hover:scale-110 group-hover:rotate-12'
                      : 'group-hover:scale-110 group-hover:text-green-400'
                  }`}
                />
                <span className={`font-medium transition-all duration-200 ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          {(() => {
            const isSettingsActive = pathname === '/settings';
            return (
              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
                  group relative overflow-hidden
                  ${isSettingsActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-600/50 shadow-lg shadow-purple-600/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/50'
                  }
                `}
              >
                {isSettingsActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                )}
                <Settings 
                  size={20} 
                  className={`transition-all duration-200 ${
                    isSettingsActive 
                      ? 'scale-125'
                      : 'group-hover:scale-110 group-hover:rotate-12 group-hover:text-purple-400'
                  }`}
                />
                <span className={`font-medium transition-all duration-200 ${isSettingsActive ? 'font-bold' : ''}`}>
                  Settings
                </span>
              </Link>
            );
          })()}
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-200 group hover:shadow-lg hover:shadow-red-900/30 hover:border hover:border-red-600/30"
          >
            <LogOut 
              size={20} 
              className="transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12 group-hover:text-red-400"
            />
            <span className="font-medium group-hover:font-bold transition-all duration-200">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Bell, Shield, Lock, Eye, HelpCircle, LogOut, ChevronRight, Moon } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', value: 'Demo User' },
        { icon: Bell, label: 'Emergency Notifications', value: 'On' },
        { icon: Shield, label: 'Safety Preferences', value: 'High' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Lock, label: 'Password & Security', value: '' },
        { icon: Eye, label: 'Privacy Settings', value: '' },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Moon, label: 'Dark Mode', value: 'Always' },
        { icon: HelpCircle, label: 'Support & Feedback', value: '' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 sm:mb-12">
        <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
      </header>

      {/* Settings Sections */}
      <div className="space-y-6 sm:space-y-12 max-w-2xl">
        {sections.map((section, i) => (
          <motion.div 
            key={i} 
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <h2 className="text-xs font-bold uppercase text-gray-400 tracking-widest ml-2 sm:ml-4">{section.title}</h2>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur">
              {section.items.map((item, j) => (
                <motion.button 
                  key={j} 
                  className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/10 transition-colors border-b border-white/5 last:border-none"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center">
                      <item.icon size={18} className="text-gray-300" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-xs sm:text-sm text-gray-400">{item.value}</span>}
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out Button */}
       
      </div>

      {/* Footer */}
     
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, User, Globe, HardDrive } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<{
    notifications: boolean;
    silentMode: boolean;
    locationTracking: boolean;
    dataBackup: boolean;
    language: string;
    theme: string;
  }>({
    notifications: true,
    silentMode: false,
    locationTracking: true,
    dataBackup: true,
    language: 'en',
    theme: 'dark',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-purple-400 text-xs font-bold tracking-widest mb-4">⚙ SYSTEM CONFIGURATION</p>
          <h1 className="text-7xl font-bold mb-2">Settings</h1>
          <p className="text-gray-300 text-lg">Customize your E-Guard AI experience</p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-600/30">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Notifications</h3>
                  <p className="text-gray-400 text-sm">Receive alerts and updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Silent Mode */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600/10 p-3 rounded-lg border border-purple-600/30">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Silent Mode</h3>
                  <p className="text-gray-400 text-sm">Record evidence without alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.silentMode}
                  onChange={() => handleToggle('silentMode')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Location Tracking */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-green-600/10 p-3 rounded-lg border border-green-600/30">
                  <Globe className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Location Tracking</h3>
                  <p className="text-gray-400 text-sm">Enable real-time location sharing</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.locationTracking}
                  onChange={() => handleToggle('locationTracking')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Data Backup */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600/10 p-3 rounded-lg border border-orange-600/30">
                  <HardDrive className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Auto Backup</h3>
                  <p className="text-gray-400 text-sm">Automatically backup your evidence</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dataBackup}
                  onChange={() => handleToggle('dataBackup')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>

          {/* Language */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-600/10 p-3 rounded-lg border border-cyan-600/30">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Language</h3>
                  <p className="text-gray-400 text-sm">Select your preferred language</p>
                </div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors">
              Save Settings
            </button>
            <button className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

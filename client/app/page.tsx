'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Shield, Heart, Zap, Activity, Wifi, Volume2 } from 'lucide-react';
import { apiService } from '@/services/api';

export default function Dashboard() {
  const [sosStatus, setSosStatus] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch SOS status
        const sosData = await apiService.sos.getStatus();
        setSosStatus(sosData);

        // Fetch emergency contacts
        const contactsData = await apiService.contacts.getAll();
        setContacts(contactsData.slice(0, 3)); // Show first 3
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            When <span className="text-green-400">You</span>
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-green-400">Can't.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl">
            Continuous biological monitoring and spatial threat detection. Your digital guardian never sleeps.
          </p>
        </div>

        {/* SOS Button */}
        <Link
          href="/sos"
          className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-lg text-lg transition transform hover:scale-105 mb-12"
        >
          ACTIVATE SOS
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Risk Analysis Card */}
        <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
              <Shield size={20} /> RISK ANALYSIS
            </h3>
          </div>
          <div className="text-5xl font-bold mb-4">24%</div>
          <p className="text-yellow-400 text-sm font-semibold mb-4">THREAT LEVEL</p>
          <p className="text-gray-500 text-sm leading-relaxed">
            "Detection of concerning behavioral activity. Sentinel recommendation: Keep silent recording active."
          </p>
        </div>

        {/* Sentinel AI Card */}
        <div className="col-span-1 md:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-semibold mb-6 flex items-center gap-2">
            <Zap size={20} /> SENTINEL AI
            <span className="ml-auto bg-green-500 text-black px-3 py-1 rounded text-xs font-bold">
              ACTIVE
            </span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-gray-300 text-sm">System operational. Analyzing ambient soundscapes for distress patterns.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <p className="text-gray-500 text-sm">Identity verified via haptic rhythm.</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-12">
        <h3 className="text-green-400 font-semibold mb-6 flex items-center gap-2">
          <Activity size={20} /> LIVE SYSTEM METRICS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-2">LIVE AUDIO FEED</div>
            <div className="text-green-400 font-bold text-lg">ENCRY</div>
            <div className="text-gray-600 text-xs">SECURE</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-2">GPS PRECISION</div>
            <div className="text-green-400 font-bold text-lg">12m</div>
            <div className="text-gray-600 text-xs">RANGE</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-2">NETWORK STRENGTH</div>
            <div className="text-green-400 font-bold text-lg">98%</div>
            <div className="text-gray-600 text-xs">UPLINK</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-2">BIO-SYNC</div>
            <div className="text-green-400 font-bold text-lg">72 BPM</div>
            <div className="text-gray-600 text-xs">RESTING</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-2">STORAGE</div>
            <div className="text-green-400 font-bold text-lg">3.2 GB</div>
            <div className="text-gray-600 text-xs">AVAILABLE</div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-semibold mb-4">EMERGENCY CONTACTS</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div>
                <p className="text-sm font-semibold">Chief Operator</p>
                <p className="text-gray-500 text-xs">Primary Contact</p>
              </div>
              <button className="bg-green-500 text-black p-2 rounded hover:bg-green-400">
                <span>📞</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div>
                <p className="text-sm font-semibold">Security Team B</p>
                <p className="text-gray-500 text-xs">Backup Contact</p>
              </div>
              <button className="bg-green-500 text-black p-2 rounded hover:bg-green-400">
                <span>💬</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div>
                <p className="text-sm font-semibold">Local Authority</p>
                <p className="text-gray-500 text-xs">Emergency Services</p>
              </div>
              <button className="bg-yellow-500 text-black p-2 rounded hover:bg-yellow-400">
                <span>⚙️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Tracking */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 font-semibold mb-4">REAL-TIME SPATIAL TRACKING</h3>
          <div className="bg-gray-800 rounded h-40 flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">GPS: 40.7128° N, 74.0060° W</p>
              <p className="text-green-400 text-xs">Tracking Active</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-500">RECENT</p>
              <p className="text-green-400 font-bold">3 mins</p>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-500">LOGS</p>
              <p className="text-green-400 font-bold">24 hrs</p>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <p className="text-gray-500">VIEW ALL</p>
              <p className="text-gray-400 font-bold">→</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

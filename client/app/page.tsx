'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Activity, MessageSquare, PhoneCall } from 'lucide-react';
import { apiService } from '@/services/api';

export default function Dashboard() {
  const [sosStatus, setSosStatus] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Get actual userId from authentication/context
        const userId = 'user-123'; // Mock userId for now
        
        const sosData = await apiService.sos.getStatus(userId);
        setSosStatus(sosData);

        const contactsData = await apiService.contacts.getAll(userId);
        setContacts(contactsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-4">● INTELLIGENT SAFETY SYSTEM</p>
          <h1 className="text-7xl font-bold mb-2">When</h1>
          <h2 className="text-6xl font-bold text-green-400 mb-6">You Can&apos;t</h2>
          <p className="text-gray-300 text-lg max-w-2xl">
            Continuous biological monitoring and spatial threat detection. Your digital guardian never sleeps.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Left: Hero Section */}
          <div className="col-span-2">
            <div className="bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-600/30 rounded-lg p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center border border-green-600/50">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">System Status</h3>
                  <p className="text-green-400 font-semibold">All Systems Operational</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">ACTIVE MONITORING</p>
                  <p className="text-3xl font-bold text-green-400">24/7</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">RESPONSE TIME</p>
                  <p className="text-3xl font-bold text-green-400">&lt;5s</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Risk Analysis */}
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 h-full">
              <h3 className="text-sm font-bold tracking-widest mb-6">RISK ANALYSIS</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Environmental Risk</span>
                    <span className="text-green-400 font-bold">12%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/12 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Network Security</span>
                    <span className="text-green-400 font-bold">99%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Data Integrity</span>
                    <span className="text-green-400 font-bold">100%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-5 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-xs text-gray-400 mb-3">AUDIO CAPTURE</p>
            <p className="text-2xl font-bold text-green-400">ENCRYPTED</p>
            <p className="text-xs text-gray-600 mt-2">SECURE</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-xs text-gray-400 mb-3">GPS PRECISION</p>
            <p className="text-2xl font-bold text-green-400">12m</p>
            <p className="text-xs text-gray-600 mt-2">RANGE</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-xs text-gray-400 mb-3">NETWORK</p>
            <p className="text-2xl font-bold text-green-400">98%</p>
            <p className="text-xs text-gray-600 mt-2">UPLINK</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-xs text-gray-400 mb-3">BIO-SYNC</p>
            <p className="text-2xl font-bold text-green-400">72</p>
            <p className="text-xs text-gray-600 mt-2">BPM</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-xs text-gray-400 mb-3">STORAGE</p>
            <p className="text-2xl font-bold text-green-400">3.2</p>
            <p className="text-xs text-gray-600 mt-2">GB</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Emergency Contacts */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h3 className="text-lg font-bold mb-6">EMERGENCY CONTACTS</h3>
            <div className="space-y-4">
              {contacts.length > 0 ? (
                contacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700 hover:border-green-600/50 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{contact.name}</p>
                      <p className="text-gray-500 text-sm">{contact.relation}</p>
                    </div>
                    <button className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors">
                      📞
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No emergency contacts added yet.</p>
              )}
              <Link href="/contacts" className="block w-full mt-4 py-2 px-4 text-center text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
                Manage Contacts
              </Link>
            </div>
          </div>

          {/* Real-time Tracking */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h3 className="text-lg font-bold mb-6">REAL-TIME TRACKING</h3>
            <div className="bg-gray-800 rounded-lg p-6 mb-6 h-40 flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <Activity className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400">Location: Active</p>
                <p className="text-gray-500 text-sm">40.7128° N, 74.0060° W</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Update</span>
                <span className="text-green-400 font-bold">Just now</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Accuracy</span>
                <span className="text-green-400 font-bold">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-8">
          <Link href="/live" className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-green-600/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="bg-green-600/10 p-3 rounded-lg border border-green-600/30 group-hover:bg-green-600/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mt-4 mb-2">Live AI Vision</h3>
            <p className="text-gray-400 text-sm">Real-time voice & camera analysis with multi-language support</p>
          </Link>

          <Link href="/fake-call" className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-blue-600/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-600/30 group-hover:bg-blue-600/20 transition-colors">
                <PhoneCall className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mt-4 mb-2">Fake Call</h3>
            <p className="text-gray-400 text-sm">Simulate incoming call to exit uncomfortable situations safely</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

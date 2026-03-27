'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, MapPin, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function SOSPage() {
  const { isSOSActive, deactivateSOS, contacts, location, setLocation } = useStore();
  const router = useRouter();
  const [statusSteps, setStatusSteps] = useState([
    { id: 'location', label: 'Fetching Location...', status: 'loading' },
    { id: 'backend', label: 'Sending Alert to Server...', status: 'pending' },
    { id: 'contacts', label: 'Notifying Contacts...', status: 'pending' },
  ]);

  useEffect(() => {
    if (!isSOSActive) {
      router.push('/');
      return;
    }

    const simulateProcess = async () => {
      // 1. Fetch Location
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 40.7128, lng: -74.0060 }) // Fallback to NYC
      );
      setStatusSteps(prev => prev.map(s => s.id === 'location' ? { ...s, label: 'Location Acquired', status: 'success' } : s));
      setStatusSteps(prev => prev.map(s => s.id === 'backend' ? { ...s, status: 'loading' } : s));

      // 2. Send to Backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatusSteps(prev => prev.map(s => s.id === 'backend' ? { ...s, label: 'Alert Sent Successfully', status: 'success' } : s));
      setStatusSteps(prev => prev.map(s => s.id === 'contacts' ? { ...s, status: 'loading' } : s));

      // 3. Notify Contacts
      await new Promise(resolve => setTimeout(resolve, 2500));
      setStatusSteps(prev => prev.map(s => s.id === 'contacts' ? { ...s, label: `Alert sent to ${contacts.length} contacts`, status: 'success' } : s));
    };

    simulateProcess();
  }, [isSOSActive, router, setLocation, contacts.length]);

  const handleCancel = () => {
    deactivateSOS();
    router.push('/');
  };

  if (!isSOSActive) return null;

  return (
    <div className="flex flex-col h-full py-6 gap-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50"
        >
          <ShieldAlert className="w-12 h-12 text-white" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">SOS Active</h1>
          <p className="text-red-400 text-sm mt-1">Emergency protocols initiated</p>
        </div>
      </div>

      {/* Status List */}
      <div className="bg-[#1e2130] rounded-2xl p-5 border border-[#2d3748] flex flex-col gap-4">
        {statusSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0f111a] border border-[#2d3748]">
              {step.status === 'loading' && <Loader2 className="w-4 h-4 text-[#3b82f6] animate-spin" />}
              {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-[#4b5563]" />}
            </div>
            <span className={`text-sm font-medium ${step.status === 'success' ? 'text-white' : step.status === 'loading' ? 'text-[#3b82f6]' : 'text-[#9ca3af]'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Map Preview (Simulated) */}
      <div className="flex-1 bg-[#1e2130] rounded-2xl border border-[#2d3748] overflow-hidden relative min-h-[200px]">
        {location ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f111a]">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2d3748 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <div className="mt-2 bg-[#1e2130] px-3 py-1 rounded-full text-xs font-mono border border-[#2d3748]">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#9ca3af] animate-spin" />
          </div>
        )}
      </div>

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="w-full py-4 rounded-xl font-bold text-white bg-[#2d3748] hover:bg-[#4b5563] transition-colors flex items-center justify-center gap-2"
      >
        <XCircle className="w-5 h-5" />
        CANCEL SOS
      </button>
    </div>
  );
}

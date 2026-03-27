'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Video, Mic, UploadCloud, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function EvidencePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'uploading' | 'success'>('idle');
  const { addEvidence, evidence } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCapture = async (type: 'photo' | 'video' | 'audio') => {
    setStatus('recording');
    setIsRecording(true);

    // Simulate recording duration
    await new Promise(resolve => setTimeout(resolve, type === 'photo' ? 1000 : 3000));
    
    setIsRecording(false);
    setStatus('uploading');

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Add to store
    addEvidence({
      type,
      url: `simulated-${type}-${Date.now()}.mp4`,
      timestamp: new Date()
    });

    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col h-full py-4 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748]">
        <div className="bg-[#3b82f6]/20 p-2 rounded-full">
          <ShieldCheck className="w-6 h-6 text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="font-bold text-white">Secure Evidence</h1>
          <p className="text-xs text-[#9ca3af]">Data is encrypted and auto-uploaded</p>
        </div>
      </div>

      {/* Capture Controls */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => startCapture('photo')}
          disabled={status !== 'idle'}
          className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] flex flex-col items-center gap-3 hover:border-[#8b5cf6]/50 transition-colors disabled:opacity-50"
        >
          <Camera className="w-6 h-6 text-[#8b5cf6]" />
          <span className="text-xs font-medium text-white">Photo</span>
        </button>
        <button
          onClick={() => startCapture('video')}
          disabled={status !== 'idle'}
          className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] flex flex-col items-center gap-3 hover:border-red-500/50 transition-colors disabled:opacity-50"
        >
          <Video className="w-6 h-6 text-red-500" />
          <span className="text-xs font-medium text-white">Video</span>
        </button>
        <button
          onClick={() => startCapture('audio')}
          disabled={status !== 'idle'}
          className="bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748] flex flex-col items-center gap-3 hover:border-green-500/50 transition-colors disabled:opacity-50"
        >
          <Mic className="w-6 h-6 text-green-500" />
          <span className="text-xs font-medium text-white">Audio</span>
        </button>
      </div>

      {/* Status Area */}
      <div className="bg-[#1e2130] rounded-2xl border border-[#2d3748] p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
        {status === 'idle' && (
          <div className="text-center text-[#9ca3af]">
            <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a capture method above.</p>
            <p className="text-xs mt-1 text-[#8b5cf6]">Your data is safe even if the device is destroyed.</p>
          </div>
        )}

        {status === 'recording' && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-red-500 rounded-full" />
            </motion.div>
            <p className="text-red-500 font-medium animate-pulse">Recording...</p>
          </div>
        )}

        {status === 'uploading' && (
          <div className="w-full flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
            <div className="w-full max-w-[200px] h-2 bg-[#0f111a] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#3b82f6]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-[#3b82f6]">Uploading to secure cloud... {uploadProgress}%</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-green-500 font-medium">Evidence Secured</p>
          </motion.div>
        )}
      </div>

      {/* Recent Evidence List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-[#9ca3af] mb-3 px-1">Recent Evidence</h3>
        <div className="flex flex-col gap-3">
          {evidence.length === 0 ? (
            <p className="text-xs text-[#4b5563] text-center py-4">No evidence captured yet.</p>
          ) : (
            evidence.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1e2130] p-3 rounded-xl border border-[#2d3748]">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2d3748] p-2 rounded-lg">
                    {item.type === 'photo' && <Camera className="w-4 h-4 text-[#9ca3af]" />}
                    {item.type === 'video' && <Video className="w-4 h-4 text-[#9ca3af]" />}
                    {item.type === 'audio' && <Mic className="w-4 h-4 text-[#9ca3af]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{item.type} Capture</p>
                    <p className="text-xs text-[#9ca3af]">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

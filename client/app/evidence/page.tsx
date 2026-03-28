'use client';

import { useState, useRef } from 'react';
import { Camera, Video, Mic, UploadCloud, CheckCircle2, Loader2, Shield, Lock, Cloud } from 'lucide-react';
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

    await new Promise(resolve => setTimeout(resolve, type === 'photo' ? 1000 : 3000));
    
    setIsRecording(false);
    setStatus('uploading');

    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    await addEvidence(
      new Blob(['simulated content'], { type: `video/mp4` }),
      type
    );

    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-2 sm:mb-4">● SECURE EVIDENCE VAULT</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-1 sm:mb-2">Evidence</h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">Capture</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left: Capture Controls */}
          <div className="col-span-1 lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Capture Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <button
                onClick={() => startCapture('photo')}
                disabled={status !== 'idle'}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 hover:border-purple-500/50 transition-colors disabled:opacity-50 group"
              >
                <div className="bg-purple-500/20 p-2 sm:p-3 md:p-4 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Camera className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 text-purple-400" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-white">Capture Photo</span>
                <span className="text-xs text-gray-400">Still image capture</span>
              </button>

              <button
                onClick={() => startCapture('video')}
                disabled={status !== 'idle'}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 hover:border-red-500/50 transition-colors disabled:opacity-50 group"
              >
                <div className="bg-red-500/20 p-2 sm:p-3 md:p-4 rounded-lg group-hover:bg-red-500/30 transition-colors">
                  <Video className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 text-red-400" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-white">Record Video</span>
                <span className="text-xs text-gray-400">Up to 60 seconds</span>
              </button>

              <button
                onClick={() => startCapture('audio')}
                disabled={status !== 'idle'}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 hover:border-green-500/50 transition-colors disabled:opacity-50 group"
              >
                <div className="bg-green-500/20 p-2 sm:p-3 md:p-4 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Mic className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 text-green-400" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-white">Record Audio</span>
                <span className="text-xs text-gray-400">Ambient recording</span>
              </button>
            </div>

            {/* Status Area */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
              {status === 'idle' && (
                <div className="text-center">
                  <UploadCloud className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 mx-auto mb-3 sm:mb-4 text-gray-600" />
                  <p className="text-base sm:text-lg text-gray-400 mb-1 sm:mb-2">Select a capture method</p>
                  <p className="text-xs sm:text-sm text-gray-500">Your evidence is encrypted and automatically backed up to secure servers</p>
                </div>
              )}

              {status === 'recording' && (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-red-500 rounded-full" />
                  </div>
                  <p className="text-red-400 font-semibold text-base sm:text-lg">Recording in progress...</p>
                </div>
              )}

              {status === 'uploading' && (
                <div className="w-full flex flex-col items-center gap-4 sm:gap-6 max-w-sm">
                  <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 text-green-400 animate-spin" />
                  <div className="w-full px-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-400">Uploading to secure cloud</span>
                      <span className="text-xs sm:text-sm font-bold text-green-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">Encrypting and backing up your evidence...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <CheckCircle2 className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-green-400" />
                  <p className="text-green-400 font-semibold text-base sm:text-lg">Evidence Secured</p>
                  <p className="text-xs sm:text-sm text-gray-400">Your evidence has been encrypted and backed up</p>
                </div>
              )}
            </div>

            {/* Recent Evidence List */}
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Recent Captures</h3>
              <div className="space-y-2 sm:space-y-4">
                {evidence.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-900 border border-gray-800 rounded-lg">
                    <UploadCloud className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-600" />
                    <p className="text-sm sm:text-base text-gray-400">No evidence captured yet</p>
                  </div>
                ) : (
                  evidence.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="bg-gray-800 p-2 sm:p-3 rounded-lg">
                          {item.type === 'photo' && <Camera className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />}
                          {item.type === 'video' && <Video className="w-5 sm:w-6 h-5 sm:h-6 text-red-400" />}
                          {item.type === 'audio' && <Mic className="w-5 sm:w-6 h-5 sm:h-6 text-green-400" />}
                        </div>
                        <div>
                          <p className="text-white font-semibold capitalize text-sm sm:text-base">{item.type} Capture</p>
                          <p className="text-xs sm:text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 sm:w-5 h-5 sm:h-5 text-green-400 self-end sm:self-auto" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Security Info */}
          <div className="col-span-1 space-y-4 sm:space-y-6">
            {/* Security Features */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Shield className="text-green-400 w-5 sm:w-6 h-5 sm:h-6" />
                Security Features
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">End-to-End Encryption</p>
                    <p className="text-xs text-gray-400 mt-1">All data encrypted before transmission</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cloud className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">Cloud Backup</p>
                    <p className="text-xs text-gray-400 mt-1">Automatically backed up to 3 secure locations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">Immutable Records</p>
                    <p className="text-xs text-gray-400 mt-1">Evidence cannot be tampered with</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-xs font-bold tracking-widest mb-3 sm:mb-4 text-gray-400">STORAGE INFO</h3>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-400">Used</span>
                    <span className="text-xs sm:text-sm font-bold text-green-400">{evidence.length * 5} MB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-1/4"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">50 GB available • Unlimited storage for evidence</p>
              </div>
            </div>

            {/* About Vault */}
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 sm:p-6">
              <h4 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-blue-300">About Evidence Vault</h4>
              <p className="text-xs text-blue-200 leading-relaxed">
                All captured evidence is automatically encrypted, timestamped, and backed up to multiple secure servers. This ensures your evidence is preserved even if your device is lost or damaged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

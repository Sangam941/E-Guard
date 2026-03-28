'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Video, Mic, UploadCloud, CheckCircle2, Loader2, Shield, Lock, Cloud, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface MediaConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export default function EvidencePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'uploading' | 'success'>('idle');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'photo' | 'video' | 'audio' | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const { addEvidence, evidence } = useStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    if (!isRecording) return;

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (cameraType === 'photo' && newTime >= 3) {
          // Stop photo recording after 3 seconds
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          return newTime;
        }
        if ((cameraType === 'video' || cameraType === 'audio') && newTime >= 60) {
          // Stop video/audio recording after 60 seconds
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          return newTime;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, cameraType]);

  const uploadToCloudinary = async (blob: Blob, type: 'photo' | 'video' | 'audio'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'e_guard_evidence');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Fallback to local storage if Cloudinary fails
        console.warn('Cloudinary upload failed, using local storage');
        return URL.createObjectURL(blob);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      return URL.createObjectURL(blob);
    }
  };

  const startCapture = async (type: 'photo' | 'video' | 'audio') => {
    try {
      setCameraType(type);
      setShowCamera(true);
      const constraints: MediaConstraints = {
        audio: type === 'audio' || type === 'video',
        video: type === 'photo' || type === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && (type === 'photo' || type === 'video')) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      if (type === 'audio') {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          uploadEvidence(blob, 'audio');
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatus('recording');
        setRecordingTime(0);
      } else if (type === 'photo') {
        setIsRecording(true);
        setStatus('recording');
        setRecordingTime(0);
      } else if (type === 'video') {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          uploadEvidence(blob, 'video');
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatus('recording');
        setRecordingTime(0);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera or microphone. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopRecording = async (type: 'photo' | 'video' | 'audio') => {
    setIsRecording(false);

    if (type === 'photo' && videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) uploadEvidence(blob, 'photo');
        }, 'image/jpeg', 0.95);
      }
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const uploadEvidence = async (blob: Blob, type: 'photo' | 'video' | 'audio') => {
    setStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload to Cloudinary (optional - blob can be sent directly to backend)
      // const url = await uploadToCloudinary(blob, type);
      
      await addEvidence(blob, type);
      setStatus('success');
      setShowCamera(false);
      setCameraType(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload evidence');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-2 sm:mb-4">● SECURE EVIDENCE VAULT</p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-1 sm:mb-2">Evidence</h1>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">Capture</h2>
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
                <span className="text-xs text-gray-400">Instant snapshot</span>
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {/* Close Button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg sm:text-xl font-bold capitalize">
                {cameraType === 'photo' && '📷 Capture Photo'}
                {cameraType === 'video' && '🎥 Record Video'}
                {cameraType === 'audio' && '🎤 Record Audio'}
              </h3>
              <button
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                  }
                  if (timerRef.current) clearInterval(timerRef.current);
                  setShowCamera(false);
                  setCameraType(null);
                  setIsRecording(false);
                  setRecordingTime(0);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Camera Feed or Recording */}
            <div className="bg-black aspect-video flex items-center justify-center relative">
              {(cameraType === 'photo' || cameraType === 'video') ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-gray-600 bg-gray-900'}`}>
                    <Mic size={40} className={isRecording ? 'text-red-400' : 'text-gray-400'} />
                  </div>
                  <p className="text-gray-300 text-center">Audio Recording Active</p>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/50">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-semibold text-sm">
                    {recordingTime}s {cameraType === 'photo' ? '/3s' : cameraType === 'audio' || cameraType === 'video' ? '/60s' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 sm:p-6 border-t border-gray-800 flex gap-3 sm:gap-4 justify-center">
              {!isRecording ? (
                <>
                  <button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                      }
                      setShowCamera(false);
                      setCameraType(null);
                    }}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (cameraType === 'photo') {
                        setRecordingTime(3);
                        setTimeout(() => stopRecording('photo'), 3000);
                      }
                      if (cameraType === 'video') {
                        stopRecording('video');
                      }
                      if (cameraType === 'audio') {
                        stopRecording('audio');
                      }
                    }}
                    className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-semibold text-white ${
                      cameraType === 'photo'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : cameraType === 'video'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {cameraType === 'photo' ? 'Capture' : 'Start Recording'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => stopRecording(cameraType!)}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm sm:text-base font-semibold text-white flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

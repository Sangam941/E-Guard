'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, Radio, Loader2, Globe, AlertCircle, Settings } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
];

export default function LiveAssistantPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number>(0);
  
  const nextPlaybackTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);

      const playbackCtx = new AudioContext({ sampleRate: 24000 });
      playbackCtxRef.current = playbackCtx;
      nextPlaybackTimeRef.current = playbackCtx.currentTime;

      const analyser = playbackCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(playbackCtx.destination);
      analyserRef.current = analyser;

      const updateVisualizer = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          visualizerRefs.current.forEach((bar, i) => {
            if (bar) {
              const value = dataArray[i];
              const height = Math.max(4, (value / 255) * 100);
              bar.style.height = `${height}%`;
            }
          });
        }
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const selectedLangName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);

            processor.onaudioprocess = (e) => {
              const channelData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(channelData.length);
              for (let i = 0; i < channelData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, channelData[i])) * 32767;
              }
              
              const buffer = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < buffer.byteLength; i++) {
                binary += String.fromCharCode(buffer[i]);
              }
              const base64 = btoa(binary);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            videoIntervalRef.current = setInterval(() => {
              if (!videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
              const base64 = dataUrl.split(',')[1];
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  video: { data: base64, mimeType: 'image/jpeg' }
                });
              });
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              activeSourcesRef.current = [];
              if (playbackCtxRef.current) {
                nextPlaybackTimeRef.current = playbackCtxRef.current.currentTime;
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playbackCtxRef.current) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768;
              }

              const buffer = playbackCtxRef.current.createBuffer(1, float32.length, 24000);
              buffer.getChannelData(0).set(float32);
              
              const source = playbackCtxRef.current.createBufferSource();
              source.buffer = buffer;
              
              if (analyserRef.current) {
                source.connect(analyserRef.current);
              } else {
                source.connect(playbackCtxRef.current.destination);
              }
              
              if (nextPlaybackTimeRef.current < playbackCtxRef.current.currentTime) {
                nextPlaybackTimeRef.current = playbackCtxRef.current.currentTime;
              }
              
              source.start(nextPlaybackTimeRef.current);
              activeSourcesRef.current.push(source);
              nextPlaybackTimeRef.current += buffer.duration;
              
              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
              };
            }
          },
          onclose: () => {
            stopLiveSession();
          },
          onerror: (err) => {
            console.error('Live API Error:', err instanceof Error ? err.message : String(err));
            setError('Connection lost. Please try again.');
            stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `You are E-Guard, an advanced emergency safety AI. You MUST speak and respond ONLY in ${selectedLangName}. Analyze the user's video feed to understand their surroundings and provide relevant safety advice. Keep your responses concise, calm, and actionable. If you see danger, advise them immediately.`,
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start live session:', err instanceof Error ? err.message : String(err));
      setError('Could not access camera/microphone or connect to AI.');
      setIsConnecting(false);
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    setIsConnected(false);
    setIsConnecting(false);
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (playbackCtxRef.current) playbackCtxRef.current.close();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
    }
  };

  useEffect(() => {
    return () => stopLiveSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-4">● LIVE AI VISION ACTIVE</p>
          <h1 className="text-7xl font-bold mb-2">Live AI</h1>
          <h2 className="text-6xl font-bold text-white mb-6">Vision</h2>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-500 mb-1">Connection Error</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-12">
          {/* Left: Video Feed */}
          <div className="col-span-2">
            <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {/* Video Feed */}
              <div className="relative h-96 bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isConnected ? 'opacity-100' : 'opacity-0'}`}
                />
                <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                
                {/* Overlay when not connected */}
                {!isConnected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 z-10">
                    <Video className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Ready for Live Analysis</h3>
                    <p className="text-gray-400 text-center max-w-xs">
                      Your camera and microphone will enable AI real-time safety guidance
                    </p>
                  </div>
                )}

                {/* Live Indicator */}
                {isConnected && (
                  <div className="absolute top-6 right-6 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 z-20 shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-widest">LIVE</span>
                  </div>
                )}

                {/* Audio Visualizer */}
                {isConnected && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1 h-20 z-20 px-8">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        ref={(el) => { visualizerRefs.current[i] = el; }}
                        className="flex-1 bg-green-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        style={{ height: '4%' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="bg-gray-800 border-t border-gray-700 p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">RESOLUTION</p>
                    <p className="font-semibold">1280×720</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">FRAMERATE</p>
                    <p className="font-semibold">{isConnected ? '30 FPS' : 'Standby'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">CONNECTION</p>
                    <p className={`font-semibold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                      {isConnected ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls & Settings */}
          <div className="col-span-1 space-y-6">
            {/* Language Selection */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4 flex items-center gap-2">
                <Globe className="text-blue-400" />
                Language
              </h3>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isConnected || isConnecting}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">SESSION STATUS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`text-sm font-bold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                    {isConnecting ? 'Connecting...' : isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Audio</span>
                  <span className={`text-sm font-bold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                    {isConnected ? 'Enabled' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Video</span>
                  <span className={`text-sm font-bold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                    {isConnected ? 'Streaming' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!isConnected ? (
              <button
                onClick={startLiveSession}
                disabled={isConnecting}
                className="w-full py-4 rounded-lg font-bold text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Live Session
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopLiveSession}
                className="w-full py-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <MicOff className="w-5 h-5" />
                End Session
              </button>
            )}

            {/* Features List */}
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6">
              <h4 className="text-sm font-bold mb-3 text-blue-300 flex items-center gap-2">
                <Settings size={16} />
                Live Features
              </h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li>✓ Real-time video analysis</li>
                <li>✓ AI safety guidance</li>
                <li>✓ Multi-language support</li>
                <li>✓ Audio transcription</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

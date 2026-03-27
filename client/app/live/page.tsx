'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Video, Radio, Loader2, Globe, ShieldAlert } from 'lucide-react';
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

      // 1. Get Media Stream (Audio + Video)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: {
          facingMode: 'environment', // Prefer back camera for surroundings
          width: { ideal: 640 },
          height: { ideal: 480 },
        }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Setup Audio Capture (16kHz PCM)
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 3. Setup Audio Playback (24kHz PCM)
      const playbackCtx = new AudioContext({ sampleRate: 24000 });
      playbackCtxRef.current = playbackCtx;
      nextPlaybackTimeRef.current = playbackCtx.currentTime;

      // Setup Analyser for Visualizer
      const analyser = playbackCtx.createAnalyser();
      analyser.fftSize = 64; // 32 bins
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

      // 4. Connect to Gemini Live API
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const selectedLangName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);

            // Start sending audio
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

            // Start sending video frames (1 FPS)
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
            // Handle Interruption
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              activeSourcesRef.current = [];
              if (playbackCtxRef.current) {
                nextPlaybackTimeRef.current = playbackCtxRef.current.currentTime;
              }
            }

            // Handle Audio Output
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
    <div className="flex flex-col h-full py-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748]">
        <div className="flex items-center gap-3">
          <div className="bg-[#8b5cf6]/20 p-2 rounded-full">
            <Radio className="w-6 h-6 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="font-bold text-white">Live AI Vision</h1>
            <p className="text-xs text-[#9ca3af]">Real-time voice & camera analysis</p>
          </div>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-[#0f111a] border border-[#2d3748] rounded-xl px-3 py-1.5">
          <Globe className="w-4 h-4 text-[#9ca3af]" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isConnected || isConnecting}
            className="bg-transparent text-xs text-white focus:outline-none disabled:opacity-50 appearance-none"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-[#1e2130]">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-500 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Camera Feed Area */}
      <div className="flex-1 bg-[#1e2130] rounded-2xl border border-[#2d3748] overflow-hidden relative flex flex-col items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isConnected ? 'opacity-100' : 'opacity-0'}`}
        />
        <canvas ref={canvasRef} width={320} height={240} className="hidden" />
        
        {/* Overlay when not connected */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f111a]/80 backdrop-blur-sm z-10 p-6 text-center">
            <Video className="w-12 h-12 text-[#4b5563] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Start Live Analysis</h3>
            <p className="text-sm text-[#9ca3af] max-w-[250px]">
              The AI will use your camera and microphone to understand your surroundings and speak with you in your selected language.
            </p>
          </div>
        )}

        {/* Live Indicator Overlay */}
        {isConnected && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 z-20 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
          </div>
        )}

        {/* Audio Visualizer Overlay */}
        {isConnected && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-16 z-20">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { visualizerRefs.current[i] = el; }}
                className="w-1.5 bg-[#8b5cf6] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                style={{ height: '4%' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        {!isConnected ? (
          <button
            onClick={startLiveSession}
            disabled={isConnecting}
            className="w-full py-4 rounded-xl font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Voice & Vision
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopLiveSession}
            className="w-full py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <MicOff className="w-5 h-5" />
            End Session
          </button>
        )}
      </div>
    </div>
  );
}

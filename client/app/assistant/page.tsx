'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Bot, User, Loader2, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessage as sendChatMessage } from '@/api/chat';
import { useStore } from '@/store/useStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const MOCK_USER_ID = 'mock-user-123';

export default function ChatPage() {
  const { location } = useStore();
  const [chatId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello. I am Sentinel AI, your AI Safety Assistant. If you feel unsafe, tell me your situation and I will provide immediate, actionable guidance. How can I help you right now?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage({
        chatId,
        userId: MOCK_USER_ID,
        message: userInput,
        context: location ? { latitude: location.lat, longitude: location.lng } : undefined,
      });

      const aiText = res.data?.aiMessage || 'I received your message. Please trigger SOS if you are in immediate danger.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: aiText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Chat API error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'I am having trouble connecting to the server. If you are in danger, please call 911 immediately and use the SOS button in the app.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayLocation = location || { lat: 40.7128, lng: -74.0060 };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-green-400 text-xs font-bold tracking-widest mb-4">● SENTINEL AI ENGAGED</p>
          <h1 className="text-7xl font-bold mb-2">Safety</h1>
          <h2 className="text-6xl font-bold text-white mb-6">Guidance</h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Chat Interface */}
          <div className="col-span-2">
            {/* Chat Header */}
            <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Bot className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SENTINEL AI</h3>
                <p className="text-xs text-gray-400">AI-powered emergency guidance • Real-time monitoring active</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-semibold">ONLINE</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 h-96 overflow-y-auto flex flex-col gap-6 mb-8">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>
                    {msg.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`max-w-md rounded-lg px-4 py-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                    <span className="text-xs text-gray-400">Analyzing situation...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your situation..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>

          {/* Right: Location & Info */}
          <div className="col-span-1 space-y-6">
            {/* Current Location */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">CURRENT LOCATION</h3>
              <div className="relative h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded overflow-hidden mb-4">
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle at 40% 40%, #22c55e 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
                      <MapPin size={16} className="text-green-400" />
                    </div>
                    <div className="absolute inset-0 border-2 border-green-400/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">GPS: {displayLocation.lat.toFixed(4)}° N</p>
              <p className="text-xs text-gray-400">{Math.abs(displayLocation.lng).toFixed(4)}° {displayLocation.lng < 0 ? 'W' : 'E'}</p>
            </div>

            {/* Tactical Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">QUICK ACTIONS</h3>
              <div className="space-y-3">
                <a href="/sos" className="block w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition font-semibold text-xs tracking-widest text-center">
                  TRIGGER SOS
                </a>
                <a href="tel:911" className="block w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition font-semibold text-xs tracking-widest border border-gray-700 text-center">
                  CALL 911
                </a>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition font-semibold text-xs tracking-widest border border-gray-700">
                  SHARE LOCATION
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-bold tracking-widest mb-4">SYSTEM STATUS</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">AI Response</span>
                  <span className="text-green-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Location Tracking</span>
                  <span className="text-green-400 font-bold">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Backend</span>
                  <span className="text-green-400 font-bold">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

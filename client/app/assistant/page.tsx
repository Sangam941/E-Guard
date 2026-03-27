'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Phone, Mic, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "I'm walking home through the park. It's darker than usual and I feel a bit uneasy.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060, address: '24th Gas Station' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiService.chat.send(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply || "I've increased monitoring sensitivity. GPS tracking is at max precision.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold">Sentinel AI</h1>
            <p className="text-green-400 text-xs font-semibold">ANALYZING ENVIRONMENT</p>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded transition">
            <span>🔍</span>
          </button>
        </div>

        {/* Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 text-xs text-gray-400">
          SECURITY SESSION INITIALIZED
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md p-4 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-900 border border-green-400/30'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400 font-semibold">SENTINEL</span>
                  </div>
                )}
                <p className="text-sm text-gray-300 leading-relaxed">{msg.text}</p>
                <p className="text-xs text-gray-600 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Location Map Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="h-48 bg-gray-800 rounded flex items-center justify-center mb-3">
            <div className="text-center">
              <MapPin size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{location.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
              </p>
            </div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded text-xs text-gray-400">
            24h Gas Station • 250m ahead • Brightly lit
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            TACTICAL ACTIONS
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded transition">
              <span className="text-lg">📍</span>
              <span className="text-xs text-gray-400">Live Tracking</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded transition">
              <span className="text-lg">📞</span>
              <span className="text-xs text-gray-400">Fake Call</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded transition">
              <span className="text-lg">🎙️</span>
              <span className="text-xs text-gray-400">Record Audio</span>
            </button>
          </div>
        </div>

        {/* Emergency SOS */}
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            ⚠️ EMERGENCY SOS
          </h3>
          <p className="text-sm text-gray-300 mb-3">Hold for 3 seconds to alert local authorities and contacts</p>
          <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded transition">
            *️⃣ EMERGENCY SOS
          </button>
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message or use voice..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-400 transition"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold px-4 py-3 rounded-lg transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

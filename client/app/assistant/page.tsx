'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Shield, Sparkles, User, Bot, AlertCircle, MessageSquare, Zap } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  { icon: AlertCircle, text: 'Safety Tips' },
  { icon: Zap, text: 'Emergency Guide' },
  { icon: MessageSquare, text: 'Ask Something' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your E-Guard AI Safety Assistant. How can I help you stay safe today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customInput) setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messageText,
        config: {
          systemInstruction: "You are E-Guard AI, a safety assistant. Provide short, actionable safety guidance in a calm and professional tone. If the user is in immediate danger, advise them to use the SOS button or call emergency services. Keep responses concise and helpful.",
        },
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I'm sorry, I couldn't process that. Please stay safe.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered an error. Please try again or use the SOS button if you need immediate help.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Enhanced Header */}
      <header className="px-4 pt-4 pb-6 border-b border-white/5 backdrop-blur-xl bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
            <ArrowLeft size={24} className="text-white/70" />
          </Link>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              AI Online
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={24} className="text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-lg text-white">Safety Assistant</h1>
            <p className="text-xs text-white/50 mt-0.5">Always here to help</p>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={cn(
              "flex gap-3",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender === 'ai' && (
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot size={18} className="text-white" />
              </motion.div>
            )}
            
            <div className={cn(
              "max-w-[75%]",
              msg.sender === 'user' && "flex flex-col items-end"
            )}>
              <motion.div
                className={cn(
                  "px-5 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm",
                  msg.sender === 'user' 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg shadow-blue-600/30" 
                    : "bg-white/10 text-white/90 rounded-bl-none border border-white/10 hover:bg-white/15 transition-colors"
                )}>
                <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:m-0">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </motion.div>
              <span className={cn(
                "text-[10px] mt-1.5",
                msg.sender === 'user' ? "text-white/40" : "text-white/30"
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/30">
                <User size={18} className="text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 animate-pulse">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl rounded-bl-none flex gap-2 backdrop-blur-sm shadow-lg shadow-white/5">
              <motion.div 
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div 
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div 
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3 space-y-2"
        >
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold px-1">Quick Options</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(suggestion.text)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-xs text-white/80 font-medium transition-all duration-200 flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <suggestion.icon size={14} />
                <span className="hidden sm:inline">{suggestion.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-6 pt-3 backdrop-blur-xl border-t border-white/5">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your safety concern..."
              className="w-full bg-white/10 border border-white/20 hover:border-white/30 focus:border-blue-500/50 rounded-xl py-4 px-5 text-white placeholder-white/40 focus:outline-none transition-all duration-200 focus:bg-white/15 backdrop-blur-sm"
            />
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={input ? { boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.3)', '0 0 20px 0 rgba(59, 130, 246, 0.1)'] } : {}}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <motion.button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-3 rounded-xl font-semibold transition-all duration-200 shadow-lg",
              input.trim() && !isLoading
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50 cursor-pointer"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </motion.button>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-center text-white/30 mt-3 flex items-center justify-center gap-1.5 font-medium"
        >
          <Sparkles size={11} /> Powered by Gemini AI
        </motion.p>
      </div>
    </div>
  );
}

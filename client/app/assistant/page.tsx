'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Shield, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'Hello. I am your AI Safety Assistant. If you feel unsafe, tell me your situation and I will provide immediate, actionable guidance. How can I help you right now?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are a calm, concise, and highly effective emergency safety assistant. Provide short, actionable steps to keep the user safe. Do not use long paragraphs. Prioritize immediate physical safety. If the situation is life-threatening, advise them to trigger the SOS button or call emergency services immediately.',
        },
      });

      // Combine history into a single prompt for context
      const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `Previous conversation:\n${context}\n\nUser: ${userMessage.content}`;

      const response = await chat.sendMessage({ message: prompt });
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', content: response.text || 'I am unable to process that right now. Please trigger SOS if you are in danger.' },
      ]);
    } catch (error) {
      console.error('Error calling Gemini:', error instanceof Error ? error.message : String(error));
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', content: 'Connection error. Please trigger the SOS button if you need immediate help.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full py-4 gap-4">
      <div className="flex items-center gap-3 bg-[#1e2130] p-4 rounded-2xl border border-[#2d3748]">
        <div className="bg-[#8b5cf6]/20 p-2 rounded-full">
          <Bot className="w-6 h-6 text-[#8b5cf6]" />
        </div>
        <div>
          <h1 className="font-bold text-white">Safety Assistant</h1>
          <p className="text-xs text-[#9ca3af]">AI-powered emergency guidance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#1e2130] rounded-2xl border border-[#2d3748] p-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#3b82f6]' : 'bg-[#8b5cf6]'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-[#3b82f6] text-white rounded-tr-none' : 'bg-[#2d3748] text-white rounded-tl-none'}`}>
              <div className="markdown-body prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#2d3748] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#9ca3af] animate-spin" />
              <span className="text-xs text-[#9ca3af]">Analyzing situation...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your situation..."
          className="flex-1 bg-[#1e2130] border border-[#2d3748] rounded-full px-5 py-3 text-sm text-white placeholder:text-[#9ca3af] focus:outline-none focus:border-[#8b5cf6] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7c3aed] transition-colors shrink-0"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}

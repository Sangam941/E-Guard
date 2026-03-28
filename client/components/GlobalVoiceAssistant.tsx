'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Loader2, Bot, Volume2, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { GoogleGenAI, Type } from '@google/genai';

type AssistantStatus = 'idle' | 'listening' | 'awake' | 'processing' | 'speaking';

export default function GlobalVoiceAssistant() {
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<AssistantStatus>('listening');
  const [transcript, setTranscript] = useState('');
  
  const router = useRouter();
  const { triggerFakeCall, contacts } = useStore();
  
  const recognitionRef = useRef<any>(null);
  const statusRef = useRef<AssistantStatus>('listening');
  const transcriptRef = useRef('');
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => {
      statusRef.current = 'speaking';
      setStatus('speaking');
    };
    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      } else {
        statusRef.current = 'listening';
        setStatus('listening');
        setTranscript('');
        try { recognitionRef.current?.start(); } catch(e){}
      }
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
      else {
        statusRef.current = 'listening';
        setStatus('listening');
        try { recognitionRef.current?.start(); } catch(e){}
      }
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const processCommand = useCallback(async (command: string) => {
    statusRef.current = 'processing';
    setStatus('processing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const contactNames = contacts.map(c => `${c.name} (${c.relation || 'No relation'})`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User command: "${command}"\nAvailable contacts: ${contactNames}`,
        config: {
          systemInstruction: 'You are E-Guard, an AI safety assistant. The user has given a command or asked a question. Call the appropriate tool if they want to navigate, trigger SOS, start a fake call, or call a real contact. If they ask a general question or need advice, answer it helpfully and concisely. Respond naturally, occasionally using "boss" or "sir". Do not use markdown.',
          tools: [{
            functionDeclarations: [
              {
                name: 'navigate',
                description: 'Navigate to a specific page',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    destination: { type: Type.STRING, enum: ['home', 'assistant', 'live', 'evidence', 'contacts', 'fake-call'] }
                  },
                  required: ['destination']
                }
              },
              {
                name: 'trigger_sos',
                description: 'Trigger the emergency SOS alert',
              },
              {
                name: 'trigger_fake_call',
                description: 'Trigger a fake incoming phone call',
              },
              {
                name: 'call_contact',
                description: 'Initiate a real phone call to a saved emergency contact',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    contact_name: { type: Type.STRING, description: 'The name of the contact to call (e.g., Mom, Dad)' }
                  },
                  required: ['contact_name']
                }
              }
            ]
          }],
          temperature: 0.1,
        }
      });

      const call = response.functionCalls?.[0];
      let responseText = response.text || 'Ok boss, task completed.';

      if (call) {
        if (call.name === 'navigate') {
          const dest = (call.args as any).destination;
          const routeMap: Record<string, string> = {
            'home': '/',
            'assistantgit': '/assistant',
            'live': '/live',
            'evidence': '/evidence',
            'contacts': '/contacts',
            'fake-call': '/fake-call'
          }; 
          if (routeMap[dest]) {
            router.push(routeMap[dest]);
            if (!response.text) responseText = `Ok boss, I have redirected you to the ${dest} page.`;
          }
        } else if (call.name === 'trigger_sos') {
          router.push('/sos');
          if (!response.text) responseText = 'Right away sir, triggering the SOS alert now.';
        } else if (call.name === 'trigger_fake_call') {
          triggerFakeCall('Emergency', '+1-555-0000');
          router.push('/fake-call');
          if (!response.text) responseText = 'Ok boss, starting the fake call sequence.';
        } else if (call.name === 'call_contact') {
          const contactName = (call.args as any).contact_name;
          const contact = contacts.find(c => 
            c.name.toLowerCase().includes(contactName.toLowerCase()) || 
            contactName.toLowerCase().includes(c.name.toLowerCase())
          );
          
          if (contact) {
            if (!response.text) responseText = `Calling ${contact.name} now, boss.`;
            window.location.href = `tel:${contact.phone}`;
          } else {
            responseText = `Sorry boss, I couldn't find a contact named ${contactName}.`;
          }
        }
      }

      statusRef.current = 'speaking';
      setStatus('speaking');
      speak(responseText);
      
    } catch (error) {
      console.error('Error processing command:', error instanceof Error ? error.message : String(error));
      statusRef.current = 'speaking';
      setStatus('speaking');
      speak("Sorry boss, I encountered an error processing that command.");
    }
  }, [router, triggerFakeCall, contacts, speak]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        // Set continuous to false. On many browsers, continuous=true causes persistent 'network' errors.
        // We will manually restart it in the onend handler.
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }

          const text = currentTranscript.toLowerCase().trim();
          setTranscript(text);
          transcriptRef.current = text;

          if (statusRef.current === 'listening') {
            // Wake word detection
            const wakeWordMatch = text.match(/hey\s+(e\s*)?guard/i);
            if (wakeWordMatch) {
              const commandAfterWakeWord = text.substring(wakeWordMatch.index! + wakeWordMatch[0].length).trim();
              
              if (commandAfterWakeWord.length > 3) {
                // User said a command right after the wake word (e.g., "Hey E Guard go to home")
                statusRef.current = 'processing';
                setStatus('processing');
                transcriptRef.current = '';
                recognition.stop();
                processCommand(commandAfterWakeWord);
              } else {
                // User just said the wake word, wait for command
                statusRef.current = 'speaking';
                setStatus('speaking');
                transcriptRef.current = '';
                recognition.stop();
                speak("Yes boss?", () => {
                  statusRef.current = 'awake';
                  setStatus('awake');
                  setTranscript('');
                  transcriptRef.current = '';
                  try { recognition.start(); } catch(e){}
                });
              }
            }
          }
        };

        let retryDelay = 300;

        recognition.onend = () => {
          if (isActive && statusRef.current !== 'speaking' && statusRef.current !== 'processing') {
            if (statusRef.current === 'awake' && transcriptRef.current.length > 0) {
              // The user finished speaking their command
              const commandToProcess = transcriptRef.current;
              transcriptRef.current = '';
              setTranscript('');
              processCommand(commandToProcess);
              retryDelay = 300; // Reset delay
            } else {
              // Restart listening after a short delay to prevent tight loops on errors
              setTimeout(() => {
                if (isActive && statusRef.current !== 'speaking' && statusRef.current !== 'processing') {
                  try { recognition.start(); } catch (e) {}
                  retryDelay = 300; // Reset delay on successful start attempt
                }
              }, retryDelay);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
          }
          if (event.error === 'not-allowed') {
            setIsActive(false);
            statusRef.current = 'idle';
            setStatus('idle');
          } else if (event.error === 'network') {
            setTranscript('Network error. Retrying...');
            retryDelay = 2000; // Increase delay for network errors
            // onend will handle the restart
          } else if (event.error === 'no-speech') {
            // Ignore no-speech, it will auto-restart onend
          }
        };

        recognitionRef.current = recognition;
        
        if (isActive) {
          try { recognition.start(); } catch(e){}
        }
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isActive, processCommand, speak]);

  const toggleActive = useCallback(() => {
    if (isActive) {
      if (status === 'listening') {
        // Manual wake fallback if wake word detection is failing
        statusRef.current = 'speaking';
        setStatus('speaking');
        if (recognitionRef.current) recognitionRef.current.stop();
        speak("Yes boss?", () => {
          statusRef.current = 'awake';
          setStatus('awake');
          setTranscript('');
          try { recognitionRef.current?.start(); } catch(e){}
        });
      } else {
        setIsActive(false);
        statusRef.current = 'idle';
        setStatus('idle');
        if (recognitionRef.current) recognitionRef.current.stop();
        window.speechSynthesis?.cancel();
      }
    } else {
      // Prime speech synthesis for mobile browsers
      const primeUtterance = new SpeechSynthesisUtterance('');
      primeUtterance.volume = 0;
      window.speechSynthesis?.speak(primeUtterance);

      setIsActive(true);
      statusRef.current = 'listening';
      setStatus('listening');
      setTranscript('');
      // useEffect will handle starting the recognition
    }
  }, [isActive, status, speak]);

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-[#1e2130] border border-[#2d3748] shadow-2xl rounded-2xl p-4 w-64 origin-bottom-right"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'awake' ? 'bg-green-500/20 text-green-500 animate-pulse' : 
                status === 'listening' ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                'bg-blue-500/20 text-blue-500'
              }`}>
                {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 status === 'speaking' ? <Volume2 className="w-4 h-4" /> :
                 <Mic className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold text-white">
                {status === 'listening' ? 'Say "Hey E Guard"' : 
                 status === 'awake' ? 'Listening for command...' : 
                 status === 'processing' ? 'Processing...' : 
                 status === 'speaking' ? 'Speaking...' : 'Voice Assistant'}
              </span>
            </div>
            <p className="text-sm text-[#9ca3af] min-h-[40px] italic">
              {transcript || (status === 'listening' ? 'Waiting for wake word...' : '')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Wrinkle / Ripple Animation when speaking */}
        {status === 'speaking' && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#8b5cf6] opacity-60 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-0 rounded-full bg-[#8b5cf6] opacity-40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleActive}
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors ${
            isActive 
              ? 'bg-[#8b5cf6] text-white shadow-[#8b5cf6]/50' 
              : 'bg-[#2d3748] text-[#9ca3af] hover:text-white'
          }`}
        >
          {isActive ? <Power className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </motion.button>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HolographicPanel from './HolographicPanel';
import ChatMessageBubble from './ChatMessage';
import { useJarvisStore } from '@/hooks/useJarvisChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { ChatMessage as ChatMessageType, JarvisConfig, Widget } from '@/types/jarvis';

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  const {
    messages,
    isLoading,
    addMessage,
    setIsLoading,
    config,
    setConfig,
    addWidget,
    removeWidget,
  } = useJarvisStore();

  const handleVoiceResult = useCallback((transcript: string) => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  }, []);

  const { isListening, startListening, stopListening, isSupported: voiceInputSupported } = useVoiceRecognition(handleVoiceResult);
  const { isSpeaking, speak, stop: stopSpeaking, isSupported: voiceOutputSupported } = useTextToSpeech();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessageType = {
        id: 'greeting',
        role: 'assistant',
        content: config.personality === 'friday'
          ? "Hey! I'm **Friday**, your AI assistant. All systems are green and I'm ready to roll. What do you need?"
          : "Good day, sir. I am **JARVIS** — Just A Rather Very Intelligent System. All systems are online and functioning within normal parameters. How may I be of service?",
        timestamp: new Date(),
        type: 'text',
      };
      useJarvisStore.setState({ messages: [greeting] });
    }
  }, []);

  async function handleSendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || isLoading) return;

    setInput('');
    addMessage({ role: 'user', content, type: 'text' });
    setIsLoading(true);

    try {
      const currentMessages = useJarvisStore.getState().messages;
      const currentConfig = useJarvisStore.getState().config;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.slice(-10),
          config: currentConfig,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      addMessage({
        role: 'assistant',
        content: data.response || 'I apologize, but I was unable to process that request.',
        type: data.searchResults ? 'search' : data.readResult ? 'read' : 'text',
      });

      // Handle widget actions
      if (data.widgetAction) {
        if (data.widgetAction.type === 'add') {
          const newWidget: Widget = {
            id: `w-${Date.now()}`,
            title: data.widgetAction.widgetType === 'chart' ? 'Data Chart' :
              data.widgetAction.widgetType === 'stat' ? 'Statistics' : 'Info Panel',
            type: data.widgetAction.widgetType as Widget['type'],
            data: data.widgetAction.widgetType === 'chart'
              ? { points: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10) }
              : data.widgetAction.widgetType === 'stat'
                ? { value: Math.floor(Math.random() * 100), unit: '%', trend: 'up' }
                : { text: 'New information panel' },
          };
          addWidget(newWidget);
        } else if (data.widgetAction.type === 'remove') {
          removeWidget('');
        }
      }

      // Auto-speak if enabled
      if (currentConfig.autoSpeak && data.response) {
        speak(data.response);
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered a communication error. The uplink may be experiencing interference. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePersonality = () => {
    const newPersonality = config.personality === 'jarvis' ? 'friday' : 'jarvis';
    setConfig({ personality: newPersonality });
    addMessage({
      role: 'system',
      content: `Switched to ${newPersonality === 'jarvis' ? 'JARVIS' : 'FRIDAY'} mode`,
    });
  };

  return (
    <HolographicPanel
      title={config.personality === 'jarvis' ? 'J.A.R.V.I.S' : 'F.R.I.D.A.Y'}
      glowColor={config.personality === 'jarvis' ? 'rgba(0,229,255,0.3)' : 'rgba(123,97,255,0.3)'}
      noPadding
      className="flex h-full flex-col"
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-3 flex items-center gap-2 text-xs text-cyan-400/70"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{config.personality === 'jarvis' ? 'Processing...' : 'Thinking...'}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.personality === 'jarvis' ? 'Command line ready, sir...' : 'What do you need?'}
            className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-cyan-500/40 focus:bg-white/[0.07]"
            disabled={isLoading}
          />

          {/* Voice input button */}
          {voiceInputSupported && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? stopListening : startListening}
              className={`rounded-md p-2 transition-colors ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </motion.button>
          )}

          {/* Voice output button */}
          {voiceOutputSupported && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  setConfig({ autoSpeak: !config.autoSpeak });
                }
              }}
              className={`rounded-md p-2 transition-colors ${
                isSpeaking || config.autoSpeak
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30'
              }`}
              title={config.autoSpeak ? 'Auto-speak ON (click to disable)' : 'Enable auto-speak'}
            >
              {isSpeaking ? <Square className="h-4 w-4" /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </motion.button>
          )}

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="rounded-md bg-cyan-500/20 p-2 text-cyan-400 border border-cyan-500/30 transition-colors hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Bottom controls */}
        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
          <button
            onClick={togglePersonality}
            className="hover:text-cyan-400 transition-colors"
          >
            {config.personality === 'jarvis' ? '🔄 Switch to FRIDAY' : '🔄 Switch to JARVIS'}
          </button>
          <span>•</span>
          <span>AI: {config.aiProvider.name}</span>
          {isListening && <span className="text-red-400">● REC</span>}
          {config.autoSpeak && <span className="text-cyan-400">● AUTO-SPEAK</span>}
        </div>
      </div>
    </HolographicPanel>
  );
}

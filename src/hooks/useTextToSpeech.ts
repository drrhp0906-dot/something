'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // SSR-safe: starts as false on both server and client hydration, then
  // becomes true (if supported) inside useEffect — avoids React #418.
  const [isSupported, setIsSupported] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      // Auto-select a good English voice
      if (!selectedVoiceRef.current && available.length > 0) {
        const preferred = available.find(v =>
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || available.find(v => v.lang.startsWith('en'));

        if (preferred) {
          selectedVoiceRef.current = preferred;
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown for speech
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/[-*]\s/g, '')
      .replace(/__\w+__/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    selectedVoiceRef.current = voice;
  }, []);

  return { isSpeaking, speak, stop, isSupported, voices, setVoice };
}

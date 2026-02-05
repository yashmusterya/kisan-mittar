import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseVoiceOutputOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceOutputReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  error: string | null;
}

const langCodes: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
};

export const useVoiceOutput = (options: UseVoiceOutputOptions = {}): UseVoiceOutputReturn => {
  const { language } = useLanguage();
  const { 
    rate = 0.85, // Slower rate for farmer-friendly speech
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError 
  } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const findVoice = useCallback((langCode: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find exact match
    let voice = voices.find(v => v.lang === langCode);
    
    // Try to find partial match (e.g., 'hi' for 'hi-IN')
    if (!voice) {
      const baseLang = langCode.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(baseLang));
    }
    
    // Fallback to default
    return voice || voices[0] || null;
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      const errorMsg = 'Speech synthesis is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setError(null);

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = langCodes[language] || 'en-IN';
    
    // Wait for voices to load if needed
    const setVoice = () => {
      const voice = findVoice(langCode);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = langCode;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        const errorMsg = `Speech error: ${event.error}`;
        setError(errorMsg);
        setIsSpeaking(false);
        onError?.(errorMsg);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Chrome needs voices to be loaded first
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  }, [isSupported, language, rate, pitch, volume, onStart, onEnd, onError, findVoice]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    error,
  };
};

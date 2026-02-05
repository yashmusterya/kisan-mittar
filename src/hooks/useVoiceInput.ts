import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  autoStop?: boolean;
  silenceTimeout?: number;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

const langCodes: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
};

// Type definitions for Web Speech API
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionType, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionType, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionType, ev: SpeechRecognitionErrorEventType) => void) | null;
  onresult: ((this: SpeechRecognitionType, ev: SpeechRecognitionEventType) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const { language } = useLanguage();
  const { onResult, onError, autoStop = true, silenceTimeout = 3000 } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Accumulate all final transcripts during a session
  const accumulatedTranscriptRef = useRef<string>('');
  const hasCalledResultRef = useRef<boolean>(false);
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Call onResult with the accumulated transcript when stopping
      if (accumulatedTranscriptRef.current.trim() && onResult && !hasCalledResultRef.current) {
        hasCalledResultRef.current = true;
        onResult(accumulatedTranscriptRef.current.trim());
      }
    }
  }, [clearSilenceTimer, onResult]);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    if (autoStop && isListening) {
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, silenceTimeout);
    }
  }, [autoStop, isListening, silenceTimeout, clearSilenceTimer, stopListening]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError(null);
    setTranscript('');
    accumulatedTranscriptRef.current = '';
    hasCalledResultRef.current = false;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    
    recognition.lang = langCodes[language] || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      resetSilenceTimer();
      
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Accumulate final transcripts
          accumulatedTranscriptRef.current += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show accumulated + interim for display
      const displayTranscript = (accumulatedTranscriptRef.current + interimTranscript).trim();
      setTranscript(displayTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setError(errorMessage);
      onError?.(errorMessage);
      setIsListening(false);
      clearSilenceTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
      
      // Call onResult when recognition ends naturally (e.g., silence timeout)
      if (accumulatedTranscriptRef.current.trim() && onResult && !hasCalledResultRef.current) {
        hasCalledResultRef.current = true;
        onResult(accumulatedTranscriptRef.current.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language, onResult, onError, resetSilenceTimer, clearSilenceTimer]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    error,
  };
};

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus, Loader2, Sprout, User, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import VoiceButton from '@/components/voice/VoiceButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

const CACHE_KEY = 'kisaanmitra_ai_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  response: string;
  timestamp: number;
}

const Chat = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice hooks
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useVoiceOutput({
    rate: 0.85,
    onError: (error) => console.error('TTS error:', error),
  });

  const { isListening, isSupported: sttSupported, startListening, stopListening, transcript } = useVoiceInput({
    onResult: (result) => {
      setInput(result);
      // Auto-send after voice input
      setTimeout(() => handleSend(result), 500);
    },
    onError: (error) => toast.error(error),
    silenceTimeout: 2500,
  });

  // Cache helpers
  const getCachedResponse = (question: string): string | null => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const key = `${language}:${question.toLowerCase().trim()}`;
      const entry: CacheEntry | undefined = cache[key];
      
      if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.response;
      }
      return null;
    } catch {
      return null;
    }
  };

  const setCachedResponse = (question: string, response: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const key = `${language}:${question.toLowerCase().trim()}`;
      cache[key] = { response, timestamp: Date.now() };
      
      // Keep only last 50 entries
      const entries = Object.entries(cache);
      if (entries.length > 50) {
        const sorted = entries.sort((a, b) => 
          (b[1] as CacheEntry).timestamp - (a[1] as CacheEntry).timestamp
        );
        const trimmed = Object.fromEntries(sorted.slice(0, 50));
        localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    } catch {
      // Ignore cache errors
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update input when transcript changes during listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const handleSend = async (messageToSend?: string) => {
    const userMessage = (messageToSend || input).trim();
    if (!userMessage || loading) return;

    setInput('');
    setLoading(true);
    stopSpeaking(); // Stop any ongoing speech

    // Add user message to UI immediately (optimistic update)
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userMessage }]);

    // Check cache first
    const cachedResponse = getCachedResponse(userMessage);
    if (cachedResponse) {
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: cachedResponse }]);
      setLoading(false);
      
      // Speak the cached response
      if (voiceEnabled && ttsSupported) {
        speak(cachedResponse);
      }
      return;
    }

    try {
      // Call the AI edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: userMessage, 
          language,
          context: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      const aiResponse = data?.response || 'Sorry, I could not process your request. Please try again.';

      // Cache the response
      setCachedResponse(userMessage, aiResponse);

      // Add AI message to UI
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: aiResponse }]);

      // Speak the response
      if (voiceEnabled && ttsSupported) {
        speak(aiResponse);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      
      // Handle rate limit errors
      if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (errorMessage.includes('402') || errorMessage.includes('Payment')) {
        toast.error('AI service temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to get response. Please try again.');
      }
      
      // Add error message to chat
      const errorMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { 
        id: errorMsgId, 
        role: 'assistant', 
        content: language === 'hi' 
          ? '⚠️ क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
          : language === 'mr'
          ? '⚠️ माफ करा, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.'
          : '⚠️ Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoicePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sprout className="w-6 h-6 text-primary" />
          {t('chat.title')}
        </h1>
        
        {/* Voice toggle */}
        {ttsSupported && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoice}
            className={voiceEnabled ? 'text-primary' : 'text-muted-foreground'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('chat.title')}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              {language === 'en' && 'Ask me about crops, soil, pests, weather, or any farming question!'}
              {language === 'hi' && 'फसलों, मिट्टी, कीटों, मौसम या किसी भी खेती के सवाल के बारे में पूछें!'}
              {language === 'mr' && 'पिके, माती, कीटक, हवामान किंवा शेतीबद्दल काहीही विचारा!'}
            </p>
            
            {/* Voice hint */}
            {sttSupported && (
              <p className="text-sm text-muted-foreground">
                {t('voice.tapToSpeak')} 🎤
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sprout className="w-4 h-4 text-primary" />
              </div>
            )}
            <Card
              className={`p-3 max-w-[80%] ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card'
                }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-primary" />
            </div>
            <Card className="p-3 bg-card">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-muted/50 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
          <AlertCircle className="w-3 h-3" />
          {t('chat.disclaimer')}
        </p>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 items-end">
          {/* Voice Button */}
          {sttSupported && (
            <VoiceButton
              isListening={isListening}
              isSpeaking={isSpeaking}
              isSupported={sttSupported}
              onPress={handleVoicePress}
              size="md"
            />
          )}
          
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <ImagePlus className="w-5 h-5" />
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? t('voice.listening') : t('chat.placeholder')}
            className="min-h-[44px] max-h-32 resize-none flex-1"
            rows={1}
            disabled={isListening}
          />
          
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

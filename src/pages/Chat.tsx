import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus, Loader2, Sprout, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

const SimAgronomist = (query: string, lang: string): string => {
  const q = query.toLowerCase();

  // Simple keyword matching for prototype
  if (q.includes('weather') || q.includes('rain') || q.includes('mausam')) {
    return lang === 'hi'
      ? 'स्थानीय मौसम की स्थिति खेती के लिए अनुकूल लग रही है। हालांकि, कृपया बारिश के पूर्वानुमान के लिए स्थानीय अपडेट देखें।'
      : 'The local weather conditions seem favorable for farming. However, please check local updates for rain forecasts.';
  }

  if (q.includes('wheat') || q.includes('gehu')) {
    return lang === 'hi'
      ? 'गेहूं की बुवाई के लिए तापमान 20-25 डिग्री सेल्सियस आदर्श है। सुनिश्चित करें कि मिट्टी में पर्याप्त नमी हो।'
      : 'For wheat sowing, a temperature of 20-25°C is ideal. Ensure the soil has adequate moisture.';
  }

  if (q.includes('pest') || q.includes('insect') || q.includes('keeda')) {
    return lang === 'hi'
      ? 'कीटों के नियंत्रण के लिए, पहले नीम आधारित कीटनाशकों का प्रयास करें। यदि संक्रमण गंभीर है, तो किसी कृषि विशेषज्ञ से सलाह लें।'
      : 'For pest control, try neem-based pesticides first. If the infestation is severe, consult an agricultural expert.';
  }

  return lang === 'hi'
    ? 'मैं एक AI किसान मित्र हूँ। कृपया मुझे अपनी फसल या मौसम के बारे में और बताएं ताकि मैं मदद कर सकूं।'
    : 'I am an AI Kisan Mitra. Please tell me more about your crop or weather so I can help better.';
};

const Chat = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createConversation = async () => {
    // For prototype, we might not block on this, but we'll try to save if auth exists
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({ user_id: user.id, title: 'New Conversation' })
        .select()
        .single();
      if (error) return null;
      return data.id;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userMessage }]);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get AI response (Local Logic)
      const aiResponse = SimAgronomist(userMessage, language);

      // Add AI message to UI
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: aiResponse }]);

      // Attempt to save to Supabase asynchronously (don't block UI)
      if (user) {
        createConversation().then(cid => {
          if (cid) {
            supabase.from('ai_messages').insert([
              { conversation_id: cid, role: 'user', content: userMessage },
              { conversation_id: cid, role: 'assistant', content: aiResponse }
            ]);
          }
        });
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response.');
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sprout className="w-6 h-6 text-primary" />
          {t('chat.title')}
        </h1>
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
            <p className="text-muted-foreground max-w-xs mx-auto">
              {language === 'en' && 'Ask me about crops, soil, pests, weather, or any farming question!'}
              {language === 'hi' && 'फसलों, मिट्टी, कीटों, मौसम या किसी भी खेती के सवाल के बारे में पूछें!'}
              {language === 'mr' && 'पिके, माती, कीटक, हवामान किंवा शेतीबद्दल काहीही विचारा!'}
            </p>
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
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-secondary" />
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
      <div className="px-4 py-2 bg-secondary/5 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
          <AlertCircle className="w-3 h-3" />
          {t('chat.disclaimer')}
        </p>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <ImagePlus className="w-5 h-5" />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
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
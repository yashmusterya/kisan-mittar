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
     if (!user) return null;
     
     const { data, error } = await supabase
       .from('ai_conversations')
       .insert({ user_id: user.id, title: 'New Conversation' })
       .select()
       .single();
     
     if (error) {
       console.error('Error creating conversation:', error);
       return null;
     }
     
     return data.id;
   };
 
   const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
     await supabase
       .from('ai_messages')
       .insert({ conversation_id: convId, role, content });
   };
 
   const getAIResponse = async (userMessage: string): Promise<string> => {
     // Call the AI edge function
     const { data, error } = await supabase.functions.invoke('ai-chat', {
       body: { 
         message: userMessage, 
         language,
         context: 'agricultural assistant for Indian farmers'
       },
     });
 
     if (error) {
       throw error;
     }
 
     return data.response;
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
       // Create conversation if needed
       let convId = conversationId;
       if (!convId) {
         convId = await createConversation();
         setConversationId(convId);
       }
 
       // Save user message
       if (convId) {
         await saveMessage(convId, 'user', userMessage);
       }
 
       // Get AI response
       const aiResponse = await getAIResponse(userMessage);
 
       // Add AI message to UI
       const aiMsgId = (Date.now() + 1).toString();
       setMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: aiResponse }]);
 
       // Save AI message
       if (convId) {
         await saveMessage(convId, 'assistant', aiResponse);
       }
 
       // Create farmer query for expert review
       if (user && convId) {
         await supabase.from('farmer_queries').insert({
           user_id: user.id,
           conversation_id: convId,
           question: userMessage,
           ai_response: aiResponse,
           status: 'ai_answered',
         });
       }
     } catch (error) {
       console.error('Error:', error);
       toast.error('Failed to get response. Please try again.');
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
               className={`p-3 max-w-[80%] ${
                 message.role === 'user'
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
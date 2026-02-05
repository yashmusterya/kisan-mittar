 import { useEffect, useState } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Loader2, MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
 
 interface Query {
   id: string;
   question: string;
   ai_response: string | null;
   status: 'pending' | 'ai_answered' | 'expert_verified' | 'flagged';
   created_at: string;
 }
 
 const MyQuestions = () => {
   const { language, t } = useLanguage();
   const { user } = useAuth();
   const [queries, setQueries] = useState<Query[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchQueries = async () => {
       if (!user) return;
 
       const { data, error } = await supabase
         .from('farmer_queries')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false });
 
       if (!error && data) {
         setQueries(data as Query[]);
       }
       setLoading(false);
     };
 
     fetchQueries();
   }, [user]);
 
   const getStatusBadge = (status: Query['status']) => {
     switch (status) {
       case 'pending':
         return (
           <Badge variant="outline" className="flex items-center gap-1">
             <Clock className="w-3 h-3" />
             {t('questions.pending')}
           </Badge>
         );
       case 'ai_answered':
         return (
           <Badge variant="secondary" className="flex items-center gap-1">
             <MessageCircle className="w-3 h-3" />
             {t('questions.aiAnswered')}
           </Badge>
         );
       case 'expert_verified':
         return (
           <Badge className="flex items-center gap-1 bg-primary">
             <CheckCircle className="w-3 h-3" />
             {t('questions.expertVerified')}
           </Badge>
         );
       case 'flagged':
         return (
           <Badge variant="destructive" className="flex items-center gap-1">
             <AlertCircle className="w-3 h-3" />
             {t('expert.flagged')}
           </Badge>
         );
     }
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="p-4 space-y-4">
       {/* Header */}
       <div className="pt-2">
         <h1 className="text-2xl font-bold text-foreground">{t('questions.title')} 📝</h1>
       </div>
 
       {/* Questions List */}
       {queries.length === 0 ? (
         <Card className="p-8 text-center">
           <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
           <p className="text-muted-foreground">{t('questions.noQuestions')}</p>
         </Card>
       ) : (
         <div className="space-y-3">
           {queries.map((query) => (
             <Card key={query.id}>
               <CardContent className="p-4">
                 <div className="flex items-start justify-between gap-2 mb-2">
                   <p className="font-medium text-foreground text-sm flex-1">
                     {query.question}
                   </p>
                   {getStatusBadge(query.status)}
                 </div>
                 
                 {query.ai_response && (
                   <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                     <p className="text-xs text-muted-foreground mb-1">
                       {language === 'en' ? 'AI Response:' : language === 'hi' ? 'AI उत्तर:' : 'AI उत्तर:'}
                     </p>
                     <p className="text-sm text-foreground line-clamp-3">
                       {query.ai_response}
                     </p>
                   </div>
                 )}
                 
                 <p className="text-xs text-muted-foreground mt-3">
                   {new Date(query.created_at).toLocaleDateString(
                     language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN',
                     { day: 'numeric', month: 'short', year: 'numeric' }
                   )}
                 </p>
               </CardContent>
             </Card>
           ))}
         </div>
       )}
     </div>
   );
 };
 
 export default MyQuestions;
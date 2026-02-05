 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Loader2, CheckCircle, Flag, MessageCircle, GraduationCap, LogOut } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface Query {
   id: string;
   question: string;
   ai_response: string | null;
   status: 'pending' | 'ai_answered' | 'expert_verified' | 'flagged';
   created_at: string;
   user_id: string;
 }
 
 const ExpertDashboard = () => {
   const navigate = useNavigate();
   const { language, t } = useLanguage();
   const { profile, signOut } = useAuth();
   const [queries, setQueries] = useState<Query[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeQuery, setActiveQuery] = useState<string | null>(null);
   const [expertAnswer, setExpertAnswer] = useState('');
   const [submitting, setSubmitting] = useState(false);
 
   useEffect(() => {
     if (profile?.role !== 'expert') {
       navigate('/dashboard');
       return;
     }
 
     fetchQueries();
   }, [profile, navigate]);
 
   const fetchQueries = async () => {
     const { data, error } = await supabase
       .from('farmer_queries')
       .select('*')
       .order('created_at', { ascending: false });
 
     if (!error && data) {
       setQueries(data as Query[]);
     }
     setLoading(false);
   };
 
   const handleVerify = async (queryId: string) => {
     setSubmitting(true);
     
     const { error } = await supabase
       .from('farmer_queries')
       .update({ status: 'expert_verified' })
       .eq('id', queryId);
 
     if (error) {
       toast.error('Failed to verify');
     } else {
       toast.success('Verified successfully!');
       await fetchQueries();
     }
     setSubmitting(false);
   };
 
   const handleFlag = async (queryId: string) => {
     setSubmitting(true);
     
     const { error } = await supabase
       .from('farmer_queries')
       .update({ status: 'flagged' })
       .eq('id', queryId);
 
     if (error) {
       toast.error('Failed to flag');
     } else {
       toast.success('Flagged as incorrect');
       await fetchQueries();
     }
     setSubmitting(false);
   };
 
   const handleAddAnswer = async (queryId: string) => {
     if (!expertAnswer.trim() || !profile) return;
     
     setSubmitting(true);
     
     // Add expert answer
     const { error: answerError } = await supabase
       .from('expert_answers')
       .insert({
         query_id: queryId,
         expert_id: profile.user_id,
         answer: expertAnswer,
       });
 
     if (answerError) {
       toast.error('Failed to add answer');
       setSubmitting(false);
       return;
     }
 
     // Update query status
     await supabase
       .from('farmer_queries')
       .update({ status: 'expert_verified' })
       .eq('id', queryId);
 
     toast.success('Expert answer added!');
     setExpertAnswer('');
     setActiveQuery(null);
     await fetchQueries();
     setSubmitting(false);
   };
 
   const handleLogout = async () => {
     await signOut();
     navigate('/');
   };
 
   const pendingQueries = queries.filter(q => q.status === 'ai_answered' || q.status === 'pending');
   const verifiedQueries = queries.filter(q => q.status === 'expert_verified');
   const flaggedQueries = queries.filter(q => q.status === 'flagged');
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   const renderQueryCard = (query: Query, showActions = true) => (
     <Card key={query.id} className="mb-3">
       <CardContent className="p-4">
         <p className="font-medium text-foreground mb-2">{query.question}</p>
         
         {query.ai_response && (
           <div className="p-3 bg-muted/50 rounded-lg mb-3">
             <p className="text-xs text-muted-foreground mb-1">AI Response:</p>
             <p className="text-sm text-foreground">{query.ai_response}</p>
           </div>
         )}
         
         {showActions && (
           <>
             {activeQuery === query.id ? (
               <div className="space-y-3">
                 <Textarea
                   value={expertAnswer}
                   onChange={(e) => setExpertAnswer(e.target.value)}
                   placeholder={language === 'en' ? 'Add your expert answer...' : 'अपना विशेषज्ञ उत्तर जोड़ें...'}
                   rows={3}
                 />
                 <div className="flex gap-2">
                   <Button 
                     onClick={() => handleAddAnswer(query.id)} 
                     disabled={submitting || !expertAnswer.trim()}
                     size="sm"
                   >
                     {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                     {language === 'en' ? 'Submit' : 'जमा करें'}
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => setActiveQuery(null)}
                     size="sm"
                   >
                     {language === 'en' ? 'Cancel' : 'रद्द करें'}
                   </Button>
                 </div>
               </div>
             ) : (
               <div className="flex gap-2 flex-wrap">
                 <Button
                   size="sm"
                   onClick={() => handleVerify(query.id)}
                   disabled={submitting}
                   className="flex items-center gap-1"
                 >
                   <CheckCircle className="w-4 h-4" />
                   {t('expert.verify')}
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   onClick={() => setActiveQuery(query.id)}
                   className="flex items-center gap-1"
                 >
                   <MessageCircle className="w-4 h-4" />
                   {t('expert.addAnswer')}
                 </Button>
                 <Button
                   size="sm"
                   variant="destructive"
                   onClick={() => handleFlag(query.id)}
                   disabled={submitting}
                   className="flex items-center gap-1"
                 >
                   <Flag className="w-4 h-4" />
                   {t('expert.flag')}
                 </Button>
               </div>
             )}
           </>
         )}
         
         <p className="text-xs text-muted-foreground mt-3">
           {new Date(query.created_at).toLocaleDateString('en-IN')}
         </p>
       </CardContent>
     </Card>
   );
 
   return (
     <div className="p-4 space-y-4">
       {/* Header */}
       <div className="pt-2 flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
             <GraduationCap className="w-7 h-7 text-primary" />
             {t('expert.title')}
           </h1>
           <p className="text-muted-foreground text-sm mt-1">
             {profile?.full_name}
           </p>
         </div>
         <Button variant="ghost" size="icon" onClick={handleLogout}>
           <LogOut className="w-5 h-5" />
         </Button>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-3 gap-3">
         <Card className="p-3 text-center">
           <p className="text-2xl font-bold text-primary">{pendingQueries.length}</p>
           <p className="text-xs text-muted-foreground">{t('expert.pendingReview')}</p>
         </Card>
         <Card className="p-3 text-center">
           <p className="text-2xl font-bold text-accent">{verifiedQueries.length}</p>
           <p className="text-xs text-muted-foreground">{t('expert.verified')}</p>
         </Card>
         <Card className="p-3 text-center">
           <p className="text-2xl font-bold text-destructive">{flaggedQueries.length}</p>
           <p className="text-xs text-muted-foreground">{t('expert.flagged')}</p>
         </Card>
       </div>
 
       {/* Tabs */}
       <Tabs defaultValue="pending">
         <TabsList className="w-full">
           <TabsTrigger value="pending" className="flex-1">
             {t('expert.pendingReview')} ({pendingQueries.length})
           </TabsTrigger>
           <TabsTrigger value="verified" className="flex-1">
             {t('expert.verified')}
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="pending" className="mt-4">
           {pendingQueries.length === 0 ? (
             <Card className="p-8 text-center">
               <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
               <p className="text-muted-foreground">
                 {language === 'en' ? 'No pending queries!' : 'कोई लंबित प्रश्न नहीं!'}
               </p>
             </Card>
           ) : (
             pendingQueries.map((q) => renderQueryCard(q))
           )}
         </TabsContent>
 
         <TabsContent value="verified" className="mt-4">
           {verifiedQueries.length === 0 ? (
             <Card className="p-8 text-center">
               <p className="text-muted-foreground">
                 {language === 'en' ? 'No verified queries yet' : 'अभी तक कोई सत्यापित प्रश्न नहीं'}
               </p>
             </Card>
           ) : (
             verifiedQueries.map((q) => renderQueryCard(q, false))
           )}
         </TabsContent>
       </Tabs>
     </div>
   );
 };
 
 export default ExpertDashboard;
 import { Link } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import WeatherCard from '@/components/weather/WeatherCard';
 import WeatherAlert from '@/components/weather/WeatherAlert';
 import { getDailyTip } from '@/data/mockWeather';
 import { MessageCircle, HelpCircle, History, Lightbulb, ChevronRight } from 'lucide-react';
 
 const Dashboard = () => {
   const { language, t } = useLanguage();
   const { profile } = useAuth();
 
   const dailyTip = getDailyTip(language);
 
   const quickActions = [
     {
       to: '/chat',
       icon: MessageCircle,
       label: t('dashboard.askAI'),
       color: 'bg-primary/10 text-primary',
     },
     {
       to: '/faq',
       icon: HelpCircle,
       label: t('dashboard.faqs'),
       color: 'bg-accent/10 text-accent',
     },
     {
       to: '/questions',
       icon: History,
       label: t('dashboard.myQuestions'),
       color: 'bg-secondary/10 text-secondary',
     },
   ];
 
   return (
     <div className="p-4 space-y-6">
       {/* Header */}
       <div className="pt-2">
         <p className="text-muted-foreground">{t('dashboard.greeting')},</p>
         <h1 className="text-2xl font-bold text-foreground">
           {profile?.full_name || 'Farmer'}! 🌾
         </h1>
       </div>
 
       {/* Weather Alert Banner */}
       <WeatherAlert />
 
       {/* Weather Card */}
       <Link to="/weather">
         <WeatherCard />
       </Link>
 
       {/* Quick Actions */}
       <div className="grid grid-cols-3 gap-3">
         {quickActions.map((action) => {
           const Icon = action.icon;
           return (
             <Link key={action.to} to={action.to}>
               <Card className="p-4 text-center hover:shadow-md transition-shadow">
                 <div
                   className={`w-12 h-12 mx-auto rounded-full ${action.color} flex items-center justify-center mb-2`}
                 >
                   <Icon className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-medium">{action.label}</span>
               </Card>
             </Link>
           );
         })}
       </div>
 
       {/* Daily Tip */}
       <Card className="bg-primary/5 border-primary/20">
         <CardContent className="p-4">
           <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
               <Lightbulb className="w-5 h-5 text-primary" />
             </div>
             <div>
               <h3 className="font-semibold text-foreground">{dailyTip.title}</h3>
               <p className="text-sm text-muted-foreground mt-1">{dailyTip.tip}</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Recent Conversations */}
       <div>
         <div className="flex items-center justify-between mb-3">
           <h2 className="font-semibold text-foreground">{t('dashboard.recentChats')}</h2>
           <Link to="/questions" className="text-sm text-primary flex items-center gap-1">
             {t('dashboard.viewAll')}
             <ChevronRight className="w-4 h-4" />
           </Link>
         </div>
         
         <Card className="p-4">
           <div className="text-center text-muted-foreground py-4">
             <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
             <p className="text-sm">
               {language === 'en' && "Start a conversation with AI to see it here"}
               {language === 'hi' && "AI के साथ बातचीत शुरू करें"}
               {language === 'mr' && "AI सोबत संवाद सुरू करा"}
             </p>
             <Button asChild className="mt-3">
               <Link to="/chat">{t('dashboard.askAI')}</Link>
             </Button>
           </div>
         </Card>
       </div>
     </div>
   );
 };
 
 export default Dashboard;
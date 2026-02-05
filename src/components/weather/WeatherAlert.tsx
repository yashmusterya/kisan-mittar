 import { useLanguage, Language } from '@/contexts/LanguageContext';
 import { Card } from '@/components/ui/card';
 import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
 import { getMockWeather } from '@/data/mockWeather';
 
 const WeatherAlert = () => {
   const { language } = useLanguage();
   const weather = getMockWeather();
   
   const alert = weather.alerts[0]; // Show first alert
   
   if (!alert) return null;
 
   const getAlertIcon = (type: string) => {
     switch (type) {
       case 'danger':
         return <AlertCircle className="w-5 h-5" />;
       case 'warning':
         return <AlertTriangle className="w-5 h-5" />;
       default:
         return <Info className="w-5 h-5" />;
     }
   };
 
   const getAlertStyles = (type: string) => {
     switch (type) {
       case 'danger':
         return 'bg-destructive/10 border-destructive/30 text-destructive';
       case 'warning':
         return 'bg-secondary/10 border-secondary/30 text-secondary';
       default:
         return 'bg-accent/10 border-accent/30 text-accent';
     }
   };
 
   return (
     <Card className={`p-4 ${getAlertStyles(alert.type)}`}>
       <div className="flex gap-3">
         <div className="flex-shrink-0 mt-0.5">
           {getAlertIcon(alert.type)}
         </div>
         <div className="flex-1 min-w-0">
           <h4 className="font-semibold text-foreground">
             {alert.title[language as Language]}
           </h4>
           <p className="text-sm text-muted-foreground mt-1">
             {alert.message[language as Language]}
           </p>
           <p className="text-sm font-medium mt-2">
             👉 {alert.action[language as Language]}
           </p>
         </div>
       </div>
     </Card>
   );
 };
 
 export default WeatherAlert;
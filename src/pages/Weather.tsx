 import { useLanguage, Language } from '@/contexts/LanguageContext';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { getMockWeather } from '@/data/mockWeather';
 import { Droplets, Wind, CloudRain, AlertTriangle, Info, AlertCircle } from 'lucide-react';
 
 const Weather = () => {
   const { language, t } = useLanguage();
   const weather = getMockWeather();
 
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
         return 'bg-destructive/10 border-destructive/30';
       case 'warning':
         return 'bg-secondary/10 border-secondary/30';
       default:
         return 'bg-accent/10 border-accent/30';
     }
   };
 
   return (
     <div className="p-4 space-y-6">
       {/* Header */}
       <div className="pt-2">
         <h1 className="text-2xl font-bold text-foreground">{t('dashboard.weather')} 🌤️</h1>
       </div>
 
       {/* Current Weather */}
       <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
         <CardContent className="p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-muted-foreground">{t('weather.today')}</p>
               <div className="flex items-center gap-3 mt-2">
                 <span className="text-6xl">{weather.current.icon}</span>
                 <div>
                   <span className="text-4xl font-bold text-foreground">
                     {weather.current.temp}°C
                   </span>
                   <p className="text-muted-foreground mt-1">
                     {weather.current.condition}
                   </p>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
             <div className="text-center">
               <Droplets className="w-5 h-5 text-accent mx-auto" />
               <p className="text-sm text-muted-foreground mt-1">{t('weather.humidity')}</p>
               <p className="font-semibold">{weather.current.humidity}%</p>
             </div>
             <div className="text-center">
               <Wind className="w-5 h-5 text-accent mx-auto" />
               <p className="text-sm text-muted-foreground mt-1">{t('weather.wind')}</p>
               <p className="font-semibold">{weather.current.wind} km/h</p>
             </div>
             <div className="text-center">
               <CloudRain className="w-5 h-5 text-accent mx-auto" />
               <p className="text-sm text-muted-foreground mt-1">{t('weather.rain')}</p>
               <p className="font-semibold">{weather.current.rainChance}%</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Alerts */}
       <div>
         <h2 className="font-semibold text-foreground mb-3">{t('weather.alerts')}</h2>
         <div className="space-y-3">
           {weather.alerts.map((alert) => (
             <Card key={alert.id} className={`p-4 ${getAlertStyles(alert.type)}`}>
               <div className="flex gap-3">
                 <div className="flex-shrink-0 mt-0.5 text-foreground">
                   {getAlertIcon(alert.type)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-semibold text-foreground">
                     {alert.title[language as Language]}
                   </h4>
                   <p className="text-sm text-muted-foreground mt-1">
                     {alert.message[language as Language]}
                   </p>
                   <p className="text-sm font-medium text-primary mt-2">
                     👉 {alert.action[language as Language]}
                   </p>
                 </div>
               </div>
             </Card>
           ))}
         </div>
       </div>
 
       {/* 5-Day Forecast */}
       <div>
         <h2 className="font-semibold text-foreground mb-3">{t('weather.forecast')}</h2>
         <div className="space-y-3">
           {weather.forecast.map((day, index) => (
             <Card key={index} className="p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">{day.icon}</span>
                   <div>
                     <p className="font-semibold text-foreground">{day.day}</p>
                     <p className="text-sm text-muted-foreground">{day.date}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-semibold text-foreground">
                     {day.high}° / {day.low}°
                   </p>
                   <p className="text-sm text-muted-foreground">{day.condition}</p>
                 </div>
               </div>
               <div className="mt-3 pt-3 border-t border-border">
                 <p className="text-sm text-primary flex items-start gap-2">
                   <span>🌾</span>
                   <span>{day.recommendation}</span>
                 </p>
               </div>
             </Card>
           ))}
         </div>
       </div>
     </div>
   );
 };
 
 export default Weather;
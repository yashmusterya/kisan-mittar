 import { useLanguage } from '@/contexts/LanguageContext';
 import { Card } from '@/components/ui/card';
 import { Droplets, Wind, CloudRain } from 'lucide-react';
 import { getMockWeather } from '@/data/mockWeather';
 
 const WeatherCard = () => {
   const { t } = useLanguage();
   const weather = getMockWeather();
 
   return (
     <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
       <div className="flex items-center justify-between">
         <div>
           <p className="text-sm text-muted-foreground">{t('weather.today')}</p>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-4xl">{weather.current.icon}</span>
             <span className="text-3xl font-bold text-foreground">
               {weather.current.temp}°C
             </span>
           </div>
           <p className="text-sm text-muted-foreground mt-1">
             {weather.current.condition}
           </p>
         </div>
         
         <div className="space-y-2 text-right">
           <div className="flex items-center gap-2 justify-end text-sm">
             <Droplets className="w-4 h-4 text-accent" />
             <span>{weather.current.humidity}%</span>
           </div>
           <div className="flex items-center gap-2 justify-end text-sm">
             <Wind className="w-4 h-4 text-accent" />
             <span>{weather.current.wind} km/h</span>
           </div>
           <div className="flex items-center gap-2 justify-end text-sm">
             <CloudRain className="w-4 h-4 text-accent" />
             <span>{weather.current.rainChance}%</span>
           </div>
         </div>
       </div>
     </Card>
   );
 };
 
 export default WeatherCard;
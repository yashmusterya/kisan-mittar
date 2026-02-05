import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Wind, CloudRain } from 'lucide-react';
import { useWeather, WeatherCurrent } from '@/hooks/useWeather';

interface WeatherCardProps {
  weatherData?: WeatherCurrent;
  loading?: boolean;
}

const WeatherCard = ({ weatherData, loading: externalLoading }: WeatherCardProps) => {
  const { t } = useLanguage();
  const { weather, loading: hookLoading } = useWeather();
  
  const isLoading = externalLoading ?? hookLoading;
  const current = weatherData ?? weather?.current;

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <p className="text-sm text-muted-foreground text-center">
          {t('weather.unavailable') || 'Weather data unavailable'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t('weather.today')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-4xl">{current.icon}</span>
            <span className="text-3xl font-bold text-foreground">
              {current.temp}°C
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {current.condition}
          </p>
        </div>
        
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2 justify-end text-sm">
            <Droplets className="w-4 h-4 text-accent" />
            <span>{current.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 justify-end text-sm">
            <Wind className="w-4 h-4 text-accent" />
            <span>{current.wind} km/h</span>
          </div>
          <div className="flex items-center gap-2 justify-end text-sm">
            <CloudRain className="w-4 h-4 text-accent" />
            <span>{current.rainChance}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;

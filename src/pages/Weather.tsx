import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { Droplets, Wind, CloudRain, AlertTriangle, Info, AlertCircle, MapPin, RefreshCw } from 'lucide-react';

const Weather = () => {
  const { language, t } = useLanguage();
  const { weather, loading, error, userLocation, detectLocation, refresh } = useWeather();

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

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-5 w-5 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                  <Skeleton className="h-5 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-4 space-y-6">
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.weather')} 🌤️</h1>
        </div>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <p className="text-muted-foreground">{error || 'Unable to load weather data'}</p>
            <Button onClick={detectLocation} className="gap-2">
              <MapPin className="w-4 h-4" />
              {t('weather.detectLocation') || 'Detect Location'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.weather')} 🌤️</h1>
          {weather.locationName && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {weather.locationName}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh') || 'Refresh'}
        </Button>
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
      {weather.alerts.length > 0 && (
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
                      {alert.title[language as Language] || alert.title.en}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message[language as Language] || alert.message.en}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      👉 {alert.action[language as Language] || alert.action.en}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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

      {/* Location Button */}
      {!userLocation && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('weather.enableLocation') || 'Enable location for accurate weather'}
            </p>
            <Button onClick={detectLocation} size="sm" variant="outline" className="gap-2">
              <MapPin className="w-4 h-4" />
              {t('weather.detectLocation') || 'Detect'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Weather;

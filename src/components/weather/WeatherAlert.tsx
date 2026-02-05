import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useWeather, WeatherAlert as WeatherAlertType } from '@/hooks/useWeather';

interface WeatherAlertProps {
  alertData?: WeatherAlertType;
  loading?: boolean;
}

const WeatherAlert = ({ alertData, loading: externalLoading }: WeatherAlertProps) => {
  const { language } = useLanguage();
  const { weather, loading: hookLoading } = useWeather();
  
  const isLoading = externalLoading ?? hookLoading;
  const alert = alertData ?? weather?.alerts?.[0];

  // Safe accessor for multilingual alert fields
  const getAlertText = (field: Record<string, string> | string | undefined, fallback: string = ''): string => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    return field[language as Language] || field.en || fallback;
  };
  
  if (isLoading) {
    return (
      <Card className="p-4 bg-accent/10 border-accent/30">
        <div className="flex gap-3">
          <Skeleton className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Card>
    );
  }
  
  if (!alert) return null;

  const getAlertIcon = (type: string | undefined) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type: string | undefined) => {
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
            {getAlertText(alert.title, 'Weather Alert')}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {getAlertText(alert.message, 'Check weather conditions')}
          </p>
          <p className="text-sm font-medium mt-2">
            👉 {getAlertText(alert.action, 'Stay prepared')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default WeatherAlert;

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CloudRain, Sun, Wind, Snowflake, AlertTriangle, Bug } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

interface WeatherAlert {
  id: string;
  alert_type: 'rain' | 'heat_wave' | 'storm' | 'frost' | 'drought' | 'pest_outbreak';
  title_en: string;
  title_hi: string;
  title_mr: string;
  message_en: string;
  message_hi: string;
  message_mr: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string | null;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

const alertIcons: Record<string, React.ElementType> = {
  rain: CloudRain,
  heat_wave: Sun,
  storm: Wind,
  frost: Snowflake,
  drought: Sun,
  pest_outbreak: Bug,
};

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const Alerts = () => {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (alert: WeatherAlert) => {
    const key = `title_${language}` as keyof WeatherAlert;
    return (alert[key] as string) || alert.title_en;
  };

  const getMessage = (alert: WeatherAlert) => {
    const key = `message_${language}` as keyof WeatherAlert;
    return (alert[key] as string) || alert.message_en;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          {t('alerts.title')}
        </h1>
      </div>

      {/* Alerts List */}
      <div className="flex-1 p-4">
        {alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('alerts.noAlerts')}
            description={t('alerts.noAlertsDesc')}
          />
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const AlertIcon = alertIcons[alert.alert_type] || AlertTriangle;
              
              return (
                <Card key={alert.id} className={alert.severity === 'critical' ? 'border-destructive' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${severityColors[alert.severity]}`}>
                          <AlertIcon className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-base">{getTitle(alert)}</CardTitle>
                      </div>
                      <Badge className={severityColors[alert.severity]}>
                        {t(`alerts.severity.${alert.severity}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {getMessage(alert)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {alert.location && (
                        <span>📍 {alert.location}</span>
                      )}
                      <span>{formatTime(alert.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

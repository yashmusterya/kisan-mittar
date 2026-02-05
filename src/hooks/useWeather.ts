import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { detectUserLocation, getIndianSeason, Coordinates } from '@/lib/location';

export interface WeatherCurrent {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  icon: string;
  rainChance: number;
}

export interface WeatherForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  recommendation: string;
}

export interface WeatherAlert {
  id?: string;
  type?: 'info' | 'warning' | 'danger';
  title: Record<string, string> | string;
  message: Record<string, string> | string;
  action: Record<string, string> | string;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  locationName?: string;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  userLocation: Coordinates | null;
  detectLocation: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Cache weather data for 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;
let weatherCache: { data: WeatherData; timestamp: number; coords: string } | null = null;

export function useWeather(): UseWeatherReturn {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const fetchWeatherFromAI = useCallback(async (lat: number, lng: number): Promise<WeatherData> => {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    
    // Check cache
    if (weatherCache && 
        weatherCache.coords === cacheKey && 
        Date.now() - weatherCache.timestamp < CACHE_DURATION) {
      return weatherCache.data;
    }

    const currentDate = new Date();
    const season = getIndianSeason(currentDate);
    const dateStr = currentDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `You are a weather and farming advisor. The user is located at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) in India.
Current date: ${dateStr}
Current season: ${season} season

Based on typical weather patterns for this location and time of year, provide weather information and farming advice.

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "current": {
    "temp": 28,
    "humidity": 65,
    "wind": 12,
    "condition": "Partly Cloudy",
    "icon": "⛅",
    "rainChance": 20
  },
  "forecast": [
    {
      "day": "Tomorrow",
      "date": "Feb 6",
      "high": 30,
      "low": 18,
      "condition": "Sunny",
      "icon": "☀️",
      "recommendation": "Good day for field work and pesticide application"
    }
  ],
  "alerts": [
    {
      "id": "1",
      "type": "info",
      "title": {"en": "Dry Spell Expected", "hi": "शुष्क मौसम की उम्मीद", "mr": "कोरड्या हवामानाची अपेक्षा"},
      "message": {"en": "Next 5 days expected to be dry", "hi": "अगले 5 दिन सूखे रहने की उम्मीद", "mr": "पुढील 5 दिवस कोरडे राहण्याची अपेक्षा"},
      "action": {"en": "Plan irrigation schedule", "hi": "सिंचाई की योजना बनाएं", "mr": "सिंचन वेळापत्रक तयार करा"}
    }
  ],
  "locationName": "Near City Name, State"
}

Provide 5 days of forecast. Use appropriate weather icons (☀️🌤️⛅🌥️☁️🌧️⛈️🌦️). Make recommendations relevant to ${season} season farming in India.`;

    const response = await supabase.functions.invoke('ai-chat', {
      body: {
        message: prompt,
        language: 'en',
        context: [],
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch weather');
    }

    try {
      // Parse AI response - it might have markdown code blocks
      let jsonStr = response.data.response;
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object in response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const rawData = JSON.parse(jsonMatch[0]);
      
      // Normalize and validate the data with safe defaults
      const weatherData: WeatherData = {
        current: {
          temp: rawData.current?.temp ?? 25,
          humidity: rawData.current?.humidity ?? 60,
          wind: rawData.current?.wind ?? 10,
          condition: rawData.current?.condition ?? 'Clear',
          icon: rawData.current?.icon ?? '☀️',
          rainChance: rawData.current?.rainChance ?? 0,
        },
        forecast: Array.isArray(rawData.forecast) ? rawData.forecast.map((f: any, idx: number) => ({
          day: f?.day ?? `Day ${idx + 1}`,
          date: f?.date ?? '',
          high: f?.high ?? 30,
          low: f?.low ?? 20,
          condition: f?.condition ?? 'Clear',
          icon: f?.icon ?? '☀️',
          recommendation: f?.recommendation ?? 'Good conditions for farming',
        })) : [],
        alerts: Array.isArray(rawData.alerts) ? rawData.alerts.map((a: any, idx: number) => ({
          id: a?.id ?? String(idx + 1),
          type: a?.type ?? 'info',
          title: a?.title ?? { en: 'Weather Update' },
          message: a?.message ?? { en: 'Check weather conditions' },
          action: a?.action ?? { en: 'Stay prepared' },
        })) : [],
        locationName: rawData.locationName ?? undefined,
      };
      
      // Cache the result
      weatherCache = {
        data: weatherData,
        timestamp: Date.now(),
        coords: cacheKey,
      };
      
      return weatherData;
    } catch (parseError) {
      console.error('Failed to parse weather response:', response.data?.response);
      throw new Error('Failed to parse weather data');
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await detectUserLocation();
      setUserLocation(location);
      
      // Update profile with location if user is logged in
      if (profile?.user_id) {
        await supabase
          .from('profiles')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
          })
          .eq('user_id', profile.user_id);
      }
      
      const weatherData = await fetchWeatherFromAI(location.latitude, location.longitude);
      setWeather(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id, fetchWeatherFromAI]);

  const refresh = useCallback(async () => {
    // Clear cache to force refresh
    weatherCache = null;
    
    const coords = userLocation || 
      (profile?.latitude && profile?.longitude ? 
        { latitude: profile.latitude, longitude: profile.longitude } : 
        null);
    
    if (coords) {
      setLoading(true);
      try {
        const weatherData = await fetchWeatherFromAI(coords.latitude, coords.longitude);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh weather');
      } finally {
        setLoading(false);
      }
    } else {
      await detectLocation();
    }
  }, [userLocation, profile, fetchWeatherFromAI, detectLocation]);

  // Initial load
  useEffect(() => {
    const loadWeather = async () => {
      // Try to use profile location first
      if (profile?.latitude && profile?.longitude) {
        setUserLocation({
          latitude: profile.latitude,
          longitude: profile.longitude,
        });
        try {
          const weatherData = await fetchWeatherFromAI(profile.latitude, profile.longitude);
          setWeather(weatherData);
          setLoading(false);
          return;
        } catch (err) {
          console.error('Failed to fetch weather with profile location:', err);
        }
      }
      
      // Try browser geolocation
      try {
        const location = await detectUserLocation();
        setUserLocation(location);
        const weatherData = await fetchWeatherFromAI(location.latitude, location.longitude);
        setWeather(weatherData);
      } catch (err) {
        // Use default location (Maharashtra center) as fallback
        const defaultLat = 19.7515;
        const defaultLng = 75.7139;
        setUserLocation({ latitude: defaultLat, longitude: defaultLng });
        try {
          const weatherData = await fetchWeatherFromAI(defaultLat, defaultLng);
          setWeather(weatherData);
        } catch (weatherErr) {
          setError('Unable to load weather data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [profile?.latitude, profile?.longitude, fetchWeatherFromAI]);

  return {
    weather,
    loading,
    error,
    userLocation,
    detectLocation,
    refresh,
  };
}

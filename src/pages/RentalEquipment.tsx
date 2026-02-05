import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Tractor, 
  MapPin, 
  Phone, 
  Search, 
  Navigation,
  Loader2,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Equipment {
  id: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  description_en: string | null;
  description_hi: string | null;
  description_mr: string | null;
  category: string;
  daily_rate: number;
  weekly_rate: number | null;
  image_url: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  is_available: boolean;
  contact_phone: string | null;
}

type Category = 'all' | 'tractor' | 'harvester' | 'sprayer' | 'tiller' | 'seeder' | 'irrigation' | 'other';

const categoryLabels: Record<Category, { en: string; hi: string; mr: string }> = {
  all: { en: 'All', hi: 'सभी', mr: 'सर्व' },
  tractor: { en: 'Tractors', hi: 'ट्रैक्टर', mr: 'ट्रॅक्टर' },
  harvester: { en: 'Harvesters', hi: 'हार्वेस्टर', mr: 'हार्वेस्टर' },
  sprayer: { en: 'Sprayers', hi: 'स्प्रेयर', mr: 'स्प्रेयर' },
  tiller: { en: 'Tillers', hi: 'टिलर', mr: 'टिलर' },
  seeder: { en: 'Seeders', hi: 'सीडर', mr: 'सीडर' },
  irrigation: { en: 'Irrigation', hi: 'सिंचाई', mr: 'सिंचन' },
  other: { en: 'Other', hi: 'अन्य', mr: 'इतर' },
};

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RentalEquipment = () => {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchEquipment();
    
    // Use profile location if available
    if (profile?.latitude && profile?.longitude) {
      setUserLocation({ lat: profile.latitude, lng: profile.longitude });
    }
  }, [profile]);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rental_equipment')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        toast.success(language === 'hi' ? 'स्थान मिल गया' : language === 'mr' ? 'स्थान सापडले' : 'Location detected');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        toast.error(language === 'hi' ? 'स्थान का पता नहीं लगा सका' : language === 'mr' ? 'स्थान सापडले नाही' : 'Could not detect location');
      }
    );
  }, [language]);

  const getName = (item: Equipment): string => {
    const key = `name_${language}` as keyof Equipment;
    return (item[key] as string) || item.name_en;
  };

  const getDescription = (item: Equipment): string | null => {
    const key = `description_${language}` as keyof Equipment;
    return (item[key] as string) || item.description_en;
  };

  // Filter and sort equipment
  const filteredEquipment = equipment
    .filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = getName(item).toLowerCase();
        const location = item.location.toLowerCase();
        return name.includes(query) || location.includes(query);
      }
      return true;
    })
    .map((item) => ({
      ...item,
      distance: userLocation && item.latitude && item.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
        : null,
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const labels = {
    title: { en: 'Rent Equipment', hi: 'उपकरण किराए पर लें', mr: 'उपकरणे भाड्याने घ्या' },
    search: { en: 'Search equipment or location...', hi: 'उपकरण या स्थान खोजें...', mr: 'उपकरणे किंवा स्थान शोधा...' },
    detectLocation: { en: 'Detect Location', hi: 'स्थान पता करें', mr: 'स्थान शोधा' },
    perDay: { en: '/day', hi: '/दिन', mr: '/दिवस' },
    perWeek: { en: '/week', hi: '/सप्ताह', mr: '/आठवडा' },
    kmAway: { en: 'km away', hi: 'किमी दूर', mr: 'किमी दूर' },
    call: { en: 'Call', hi: 'कॉल करें', mr: 'कॉल करा' },
    noEquipment: { en: 'No equipment found', hi: 'कोई उपकरण नहीं मिला', mr: 'कोणतेही उपकरण सापडले नाही' },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Tractor className="w-6 h-6 text-primary" />
            {labels.title[language as keyof typeof labels.title] || labels.title.en}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={detectLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-1" />
            )}
            {labels.detectLocation[language as keyof typeof labels.detectLocation] || labels.detectLocation.en}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={labels.search[language as keyof typeof labels.search] || labels.search.en}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat][language as keyof typeof categoryLabels.all] || categoryLabels[cat].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {userLocation && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {language === 'hi' ? 'स्थान के अनुसार क्रमबद्ध' : language === 'mr' ? 'स्थानानुसार क्रमबद्ध' : 'Sorted by distance'}
          </p>
        )}
      </div>

      {/* Equipment List */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            icon={Tractor}
            title={labels.noEquipment[language as keyof typeof labels.noEquipment] || labels.noEquipment.en}
            description=""
          />
        ) : (
          <div className="space-y-4">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={getName(item)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground truncate">{getName(item)}</h3>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {categoryLabels[item.category as Category]?.[language as 'en' | 'hi' | 'mr'] || item.category}
                      </Badge>
                    </div>

                    {getDescription(item) && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {getDescription(item)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.location}</span>
                      {item.distance !== null && (
                        <span className="text-primary font-medium">
                          ({item.distance.toFixed(1)} {labels.kmAway[language as keyof typeof labels.kmAway] || labels.kmAway.en})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-primary">₹{item.daily_rate}</span>
                        <span className="text-sm text-muted-foreground">{labels.perDay[language as keyof typeof labels.perDay] || labels.perDay.en}</span>
                        {item.weekly_rate && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            (₹{item.weekly_rate}{labels.perWeek[language as keyof typeof labels.perWeek] || labels.perWeek.en})
                          </span>
                        )}
                      </div>

                      {item.contact_phone && (
                        <Button size="sm" asChild>
                          <a href={`tel:${item.contact_phone}`}>
                            <Phone className="w-4 h-4 mr-1" />
                            {labels.call[language as keyof typeof labels.call] || labels.call.en}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalEquipment;

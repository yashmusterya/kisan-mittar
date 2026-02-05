import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import CategoryFilter from '@/components/shop/CategoryFilter';
import CartButton from '@/components/shop/CartButton';
import EmptyState from '@/components/common/EmptyState';
import { useCart } from '@/hooks/useCart';
import { detectUserLocation, calculateDistance, formatDistance, Coordinates } from '@/lib/location';
import { toast } from 'sonner';

type Category = 'all' | 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'irrigation';

interface Product {
  id: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  description_en: string | null;
  description_hi: string | null;
  description_mr: string | null;
  price: number;
  discounted_price: number | null;
  image_url: string | null;
  category: string;
  in_stock: boolean;
  latitude: number | null;
  longitude: number | null;
  seller_location: string | null;
  govt_offer: {
    scheme_code: string;
    discount_percent: number;
    name_en: string;
    name_hi: string;
    name_mr: string;
  } | null;
}

interface ProductWithDistance extends Product {
  distance?: number;
}

const Shop = () => {
  const { t, language } = useLanguage();
  const { addToCart, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          govt_offer:govt_offers (
            scheme_code,
            discount_percent,
            name_en,
            name_hi,
            name_mr
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const location = await detectUserLocation();
      setUserLocation(location);
      toast.success(t('shop.locationDetected') || 'Location detected! Showing nearby products first.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    await addToCart(productId);
    setAddingToCart(null);
  };

  const productsWithDistance: ProductWithDistance[] = useMemo(() => {
    if (!userLocation) return products;
    
    return products.map((product) => {
      if (product.latitude && product.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          product.latitude,
          product.longitude
        );
        return { ...product, distance };
      }
      return product;
    });
  }, [products, userLocation]);

  const filteredProducts = useMemo(() => {
    let filtered = productsWithDistance.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameKey = `name_${language}` as keyof Product;
        const name = ((product[nameKey] as string) || product.name_en).toLowerCase();
        return name.includes(query);
      }

      return true;
    });

    // Sort by distance if location is available
    if (userLocation) {
      filtered = [...filtered].sort((a, b) => {
        // Products with location come first, sorted by distance
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });
    }

    return filtered;
  }, [productsWithDistance, selectedCategory, searchQuery, language, userLocation]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {t('shop.title')}
          </h1>
          <CartButton itemCount={itemCount} />
        </div>

        {/* Location and Search Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('shop.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={userLocation ? 'secondary' : 'outline'}
            size="icon"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            title={t('shop.detectLocation') || 'Detect location'}
          >
            {detectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className={`w-4 h-4 ${userLocation ? 'text-primary' : ''}`} />
            )}
          </Button>
        </div>

        {/* Location Status */}
        {userLocation && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {t('shop.sortedByDistance') || 'Sorted by distance from your location'}
          </p>
        )}

        {/* Categories */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t('shop.noProducts')}
            description={t('shop.tryDifferentSearch')}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                loading={addingToCart === product.id}
                distance={product.distance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import CategoryFilter from '@/components/shop/CategoryFilter';
import CartButton from '@/components/shop/CartButton';
import EmptyState from '@/components/common/EmptyState';
import { useCart } from '@/hooks/useCart';

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
  govt_offer: {
    scheme_code: string;
    discount_percent: number;
    name_en: string;
    name_hi: string;
    name_mr: string;
  } | null;
}

const Shop = () => {
  const { t, language } = useLanguage();
  const { addToCart, itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

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

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    await addToCart(productId);
    setAddingToCart(null);
  };

  const filteredProducts = products.filter((product) => {
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('shop.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

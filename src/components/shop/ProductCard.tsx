import { ShoppingCart, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import GovtBadge from './GovtBadge';

interface Product {
  id: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  description_en?: string;
  description_hi?: string;
  description_mr?: string;
  price: number;
  discounted_price: number | null;
  image_url: string | null;
  category: string;
  in_stock: boolean;
  govt_offer?: {
    scheme_code: string;
    discount_percent: number;
    name_en: string;
    name_hi: string;
    name_mr: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  loading?: boolean;
}

const ProductCard = ({ product, onAddToCart, loading }: ProductCardProps) => {
  const { language, t } = useLanguage();

  const getName = () => {
    const key = `name_${language}` as keyof Product;
    return (product[key] as string) || product.name_en;
  };

  const getGovtOfferName = () => {
    if (!product.govt_offer) return '';
    const key = `name_${language}` as keyof typeof product.govt_offer;
    return (product.govt_offer[key] as string) || product.govt_offer.name_en;
  };

  const hasDiscount = product.discounted_price && product.discounted_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discounted_price!) / product.price) * 100)
    : 0;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={getName()}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Tag className="w-12 h-12" />
          </div>
        )}
        
        {/* Discount badge */}
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </Badge>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">{t('shop.outOfStock')}</Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-3">
        {/* Category */}
        <Badge variant="outline" className="w-fit text-xs mb-2">
          {t(`shop.category.${product.category}`)}
        </Badge>

        {/* Name */}
        <h3 className="font-medium text-sm line-clamp-2 mb-2">{getName()}</h3>

        {/* Govt offer badge */}
        {product.govt_offer && (
          <GovtBadge 
            schemeName={getGovtOfferName()} 
            schemeCode={product.govt_offer.scheme_code}
            className="mb-2"
          />
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-primary">
              ₹{hasDiscount ? product.discounted_price : product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={() => onAddToCart(product.id)}
            disabled={!product.in_stock || loading}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {t('shop.addToCart')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

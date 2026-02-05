import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

const Cart = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { items, loading, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();

  const getProductName = (product: { name_en: string; name_hi: string; name_mr: string }) => {
    const key = `name_${language}` as keyof typeof product;
    return product[key] || product.name_en;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            {t('shop.cart')}
          </h1>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('shop.emptyCart')}
          description={t('shop.emptyCartDesc')}
          actionLabel={t('shop.continueShopping')}
          onAction={() => navigate('/shop')}
        />
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex-1 p-4 space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={getProductName(item.product)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {getProductName(item.product)}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-primary font-bold">
                          ₹{item.product.discounted_price || item.product.price}
                        </span>
                        {item.product.discounted_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{item.product.price}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button */}
            {items.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive"
                onClick={clearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('shop.clearCart')}
              </Button>
            )}
          </div>

          {/* Order Summary */}
          <div className="sticky bottom-16 bg-background border-t border-border p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('shop.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('shop.items')} ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span>₹{getTotal()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>{t('shop.total')}</span>
                  <span className="text-primary">₹{getTotal()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  {t('shop.checkout')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

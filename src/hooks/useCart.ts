import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name_en: string;
    name_hi: string;
    name_mr: string;
    price: number;
    discounted_price: number | null;
    image_url: string | null;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setItemCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name_en,
            name_hi,
            name_mr,
            price,
            discounted_price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Type assertion for the joined data
      const cartItems = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product as unknown as CartItem['product']
      }));

      setItems(cartItems);
      setItemCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });

        if (error) throw error;
      }

      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return false;
    }
  }, [user, fetchCart]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
      return false;
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
      toast.success('Removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      return false;
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
      setItemCount(0);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    }
  }, [user]);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = item.product.discounted_price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }, [items]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    items,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    refetch: fetchCart,
  };
};

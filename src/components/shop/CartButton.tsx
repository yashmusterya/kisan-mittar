import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  itemCount: number;
  className?: string;
}

const CartButton = ({ itemCount, className }: CartButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('relative', className)}
      onClick={() => navigate('/cart')}
      aria-label={`Cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          variant="destructive"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;

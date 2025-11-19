'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/contexts/cart-context';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface CartBadgeProps {
  showLabel?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CartBadge({ 
  showLabel = false, 
  variant = 'ghost',
  size = 'icon',
  className 
}: CartBadgeProps) {
  const { getTotalItems, loading } = useCart();
  const router = useRouter();
  const itemCount = getTotalItems();

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`relative ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {showLabel && <span className="ml-2">Giỏ hàng</span>}
      
      {itemCount > 0 && (
        <Badge 
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
      
      {loading && (
        <span className="absolute inset-0 animate-pulse bg-primary/10 rounded-md" />
      )}
    </Button>
  );
}

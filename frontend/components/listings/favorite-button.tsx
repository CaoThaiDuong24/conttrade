'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Use relative path for API calls
const API_URL = '/api/v1';

export interface FavoriteButtonProps {
  listingId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  initialFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

export function FavoriteButton({
  listingId,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  initialFavorited = false,
  onToggle,
  className = '',
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  // Check if listing is favorited on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [listingId]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsChecking(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/favorites/check/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsFavorited(result.data.isFavorite);
        }
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Chưa đăng nhập',
        description: 'Vui lòng đăng nhập để lưu listing yêu thích',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(
          `${API_URL}/favorites/${listingId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setIsFavorited(false);
          toast({
            title: 'Đã xóa khỏi yêu thích',
            description: 'Listing đã được xóa khỏi danh sách yêu thích',
          });
          onToggle?.(false);
        } else {
          throw new Error(result.error || 'Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const response = await fetch(
          `${API_URL}/favorites`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId }),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setIsFavorited(true);
          toast({
            title: 'Đã thêm vào yêu thích',
            description: 'Listing đã được lưu vào danh sách yêu thích',
          });
          onToggle?.(true);
        } else {
          throw new Error(result.error || 'Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể thực hiện thao tác',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn('relative', className)}
      >
        <Heart className="h-4 w-4 text-muted-foreground" />
        {showText && <span className="ml-2">Đang tải...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'relative transition-all',
        isFavorited && 'text-red-500 hover:text-red-600',
        className
      )}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          isFavorited ? 'fill-current' : ''
        )}
      />
      {showText && (
        <span className="ml-2">
          {isFavorited ? 'Đã lưu' : 'Lưu'}
        </span>
      )}
    </Button>
  );
}

export default FavoriteButton;

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/listings';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface Favorite {
  favoriteId: string;
  favoritedAt: string;
  listing: any;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalFavorites: 0 });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
    fetchStats();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFavorites(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách yêu thích',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/favorites/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/v1/favorites/${listingId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setFavorites((prev) => prev.filter((fav) => fav.listing.id !== listingId));
        setStats((prev) => ({ totalFavorites: prev.totalFavorites - 1 }));
        toast({
          title: 'Đã xóa',
          description: 'Listing đã được xóa khỏi yêu thích',
        });
      } else {
        throw new Error(result.error || 'Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa khỏi yêu thích',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listings Yêu thích</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý danh sách các container listings bạn đã lưu
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-current" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                <p className="text-sm text-muted-foreground">Tổng số yêu thích</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có listing yêu thích</h3>
              <p className="text-muted-foreground mb-6">
                Khám phá các container listings và lưu những cái bạn thích
              </p>
              <Button onClick={() => router.push('/listings')}>
                Khám phá Listings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorites Grid */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.favoriteId} className="relative">
              <ListingCard
                listing={favorite.listing}
                variant="default"
                showActions
                showStatus
                onDelete={() => handleRemoveFavorite(favorite.listing.id)}
              />
              {/* Favorited Date Badge */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Đã lưu: {new Date(favorite.favoritedAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

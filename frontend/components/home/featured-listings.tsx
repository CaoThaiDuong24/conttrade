"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Star, ArrowRight, Zap, MapPin, Calendar } from "lucide-react";
import { fetchListings } from '@/lib/api/listings';
import { API_BASE_URL } from '@/lib/config';
import { ContainerDetailModal } from './container-detail-modal';

// Extended type to include backend response structure
interface BackendListing {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  location_depot_id: string;
  deal_type: string;
  status: string;
  view_count?: number;
  featured?: boolean;
  condition?: string;
  depots?: {
    name: string;
    province: string;
  };
  listing_facets?: Array<{
    key: string;
    value: string;
  }>;
  listing_media?: Array<{
    id: string;
    media_url: string;
    media_type: string;
  }>;
  rating?: number;
}

export function FeaturedListings() {
  const [listings, setListings] = useState<BackendListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [selectedListing, setSelectedListing] = useState<BackendListing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeaturedListings() {
      try {
        setLoading(true);
        console.log('[FeaturedListings] Starting to fetch listings...');
        
        const response = await fetchListings({
          limit: 4,
          sortBy: 'view_count',
          sortOrder: 'desc'
        });

        console.log('[FeaturedListings] Response received:', response);

        if (response.success && response.data?.listings) {
          console.log('[FeaturedListings] Listings data:', response.data.listings);
          // Cast to BackendListing and filter
          const featuredListings = (response.data.listings as any[])
            .filter((listing: any) => listing.status === 'active' || listing.status === 'ACTIVE')
            .slice(0, 4);
          console.log('[FeaturedListings] Filtered listings:', featuredListings);
          setListings(featuredListings);
        } else {
          console.warn('[FeaturedListings] Invalid response format:', response);
        }
      } catch (err) {
        console.error('[FeaturedListings] Error loading featured listings:', err);
        setError('Không thể tải danh sách container');
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedListings();
  }, []);

  // Helper function to get facet value
  const getFacetValue = (listing: BackendListing, key: string): string | undefined => {
    return listing.listing_facets?.find(f => f.key === key)?.value;
  };

  // Helper function to get image URL
  const getImageUrl = (listing: BackendListing): string | null => {
    const firstMedia = listing.listing_media?.[0];
    if (firstMedia?.media_url) {
      // Check if it's a full URL or relative path
      if (firstMedia.media_url.startsWith('http')) {
        return firstMedia.media_url;
      }
      // Relative path - prepend API base URL
      const baseUrl = API_BASE_URL || 'http://localhost:3006';
      return `${baseUrl}${firstMedia.media_url}`;
    }
    return null;
  };

  // Helper function to get badge info based on deal_type and status
  const getBadgeInfo = (listing: BackendListing) => {
    if (listing.featured) {
      return { text: 'HOT', className: 'bg-red-500', icon: Zap };
    }
    if (listing.deal_type === 'RENTAL') {
      return { text: 'Cho thuê', className: 'bg-green-500', icon: null };
    }
    const condition = getFacetValue(listing, 'condition');
    if (condition === 'new') {
      return { text: 'Mới về', className: 'bg-blue-500', icon: null };
    }
    if ((listing.view_count || 0) > 100) {
      return { text: 'Sale 15%', className: 'bg-orange-500', icon: null };
    }
    return null;
  };

  // Helper function to get gradient color based on container type
  const getGradientColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
    ];
    return colors[index % colors.length];
  };

  // Helper function to format price
  const formatPrice = (listing: BackendListing) => {
    const price = listing.price_amount || 0;
    const currency = listing.price_currency || 'USD';
    
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(price);
    }
    
    return `$${price.toLocaleString()}`;
  };

  // Handle view details
  const handleViewDetails = (listing: BackendListing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Container Nổi bật</h2>
              <p className="text-muted-foreground">Các container HOT đang được quan tâm nhiều nhất</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-8 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-10 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Container Nổi bật</h2>
            <p className="text-muted-foreground">Các container HOT đang được quan tâm nhiều nhất</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/listings">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing, index) => {
            const badgeInfo = getBadgeInfo(listing);
            const isRental = listing.deal_type === 'RENTAL';
            const imageUrl = getImageUrl(listing);

            return (
              <Card key={listing.id} className="hover:shadow-xl transition-all group">
                <div className="relative">
                  {imageUrl ? (
                    <div className="aspect-video rounded-t-lg overflow-hidden bg-muted relative">
                      {!imageLoadStates[listing.id] && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                      )}
                      <img 
                        src={imageUrl} 
                        alt={listing.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          imageLoadStates[listing.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setImageLoadStates(prev => ({ ...prev, [listing.id]: true }));
                        }}
                        onError={(e) => {
                          console.error('[FeaturedListings] Image load error:', imageUrl);
                          // Hide broken image
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback gradient
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br ${getGradientColor(index)} flex items-center justify-center">
                                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`aspect-video bg-gradient-to-br ${getGradientColor(index)} rounded-t-lg flex items-center justify-center`}>
                      <Package className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {badgeInfo && (
                    <Badge className={`absolute top-2 right-2 ${badgeInfo.className}`}>
                      {badgeInfo.icon && <badgeInfo.icon className="w-3 h-3 mr-1" />}
                      {badgeInfo.text}
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-1">
                      {listing.title || `${getFacetValue(listing, 'size')} ${getFacetValue(listing, 'type')}`}
                    </CardTitle>
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{listing.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="line-clamp-1">
                    {getFacetValue(listing, 'condition') === 'new' ? 'Mới' : 'Đã qua sử dụng'} - {getFacetValue(listing, 'standard') || 'Standard'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {listing.depots?.province || 'Việt Nam'}
                      </span>
                    </div>
                    {getFacetValue(listing, 'size') && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getFacetValue(listing, 'size')} ft</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(listing)}
                    </span>
                    {isRental && (
                      <span className="text-sm text-muted-foreground">/tháng</span>
                    )}
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary/90"
                    onClick={() => handleViewDetails(listing)}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <ContainerDetailModal
        listing={selectedListing}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </section>
  );
}

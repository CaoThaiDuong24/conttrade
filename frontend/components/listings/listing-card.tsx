'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Share2,
  Package,
} from 'lucide-react';
import { FavoriteButton } from './favorite-button';
import { getDealTypeLabel } from '@/lib/utils/listingStatus';
import { formatListingTitle } from '@/lib/utils/listingTitle';

// Use relative path for API calls
const API_URL = '/api/v1';

export interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price_amount: number;
    price_currency: string;
    deal_type: string;
    status?: string;
    location?: string;
    views?: number;
    created_at?: string;
    listing_media?: Array<{
      id: string;
      media_url: string;
      media_type: string;
    }>;
    depots?: {
      name?: string;
      province?: string;
    };
    specifications?: any;
    // ============ 🆕 QUANTITY FIELDS ============
    total_quantity?: number;
    available_quantity?: number;
    rented_quantity?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  showStatus?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

export function ListingCard({
  listing,
  variant = 'default',
  showActions = false,
  showStatus = false,
  onEdit,
  onDelete,
  onShare,
  className = '',
}: ListingCardProps) {
  const router = useRouter();

  // Get thumbnail image
  const getThumbnail = () => {
    if (listing.listing_media && listing.listing_media.length > 0) {
      const firstMedia = listing.listing_media[0];
      return `${API_URL}${firstMedia.media_url}`;
    }
    return '/placeholder-container.jpg';
  };

  // Format price
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status || !showStatus) return null;

    const configs: Record<string, { label: string; variant: any }> = {
      'DRAFT': { label: 'Nháp', variant: 'secondary' },
      'PENDING_REVIEW': { label: 'Chờ duyệt', variant: 'outline' },
      'ACTIVE': { label: 'Hoạt động', variant: 'default' },
      'SOLD': { label: 'Đã bán', variant: 'default' },
      'REJECTED': { label: 'Bị từ chối', variant: 'destructive' },
      'PAUSED': { label: 'Tạm dừng', variant: 'secondary' },
    };

    const config = configs[status];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('[data-action]')) {
      return;
    }
    router.push(`/listings/${listing.id}`);
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={getThumbnail()}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm line-clamp-1">{formatListingTitle(listing.title, listing)}</h3>
                {getStatusBadge(listing.status)}
              </div>

              <div className="text-lg font-bold text-primary mb-2">
                {formatPrice(listing.price_amount, listing.price_currency)}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {getDealTypeLabel(listing.deal_type)}
                </span>
                {listing.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.views}
                  </span>
                )}
                {/* ============ 🆕 SHOW QUANTITY ============ */}
                {(listing.total_quantity && listing.total_quantity > 1) && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <Package className="h-3 w-3" />
                    SL: {listing.available_quantity ?? listing.total_quantity}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div data-action>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(listing.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(listing.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Card
        className={`hover:shadow-xl transition-all cursor-pointer border-2 border-primary ${className}`}
        onClick={handleClick}
      >
        <div className="relative h-64 bg-gray-100">
          <Image
            src={getThumbnail()}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            {getStatusBadge(listing.status)}
          </div>
          {showActions && (
            <div className="absolute top-3 right-3" data-action>
              <div className="flex gap-1">
                <FavoriteButton
                  listingId={listing.id}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                />
                {onShare && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(listing.id);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-2 line-clamp-2">{formatListingTitle(listing.title, listing)}</h3>
          <div className="text-2xl font-bold text-primary mb-4">
            {formatPrice(listing.price_amount, listing.price_currency)}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{getDealTypeLabel(listing.deal_type)}</span>
            </div>
            {listing.depots && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {listing.depots.name || ''} {listing.depots.province ? `- ${listing.depots.province}` : ''}
                </span>
              </div>
            )}
            {listing.views !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{listing.views} lượt xem</span>
              </div>
            )}
            {/* ============ 🆕 SHOW QUANTITY FOR FEATURED ============ */}
            {(listing.total_quantity && listing.total_quantity > 1) && (
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Package className="h-4 w-4" />
                <span>Số lượng: {listing.available_quantity ?? listing.total_quantity} container</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button className="w-full" onClick={handleClick}>
            Xem chi tiết
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative h-48 bg-gray-100">
        <Image
          src={getThumbnail()}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {showStatus && getStatusBadge(listing.status) && (
          <div className="absolute top-3 left-3">
            {getStatusBadge(listing.status)}
          </div>
        )}
        {showActions && (
          <div className="absolute top-3 right-3" data-action>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(listing.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(listing.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(listing.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{formatListingTitle(listing.title, listing)}</h3>
        <div className="text-xl font-bold text-primary mb-3">
          {formatPrice(listing.price_amount, listing.price_currency)}
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal">
            {getDealTypeLabel(listing.deal_type)}
          </Badge>
          {listing.depots && listing.depots.province && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.depots.province}
            </span>
          )}
          {listing.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views}
            </span>
          )}
          {/* ============ 🆕 SHOW QUANTITY FOR DEFAULT ============ */}
          {(listing.total_quantity && listing.total_quantity > 1) && (
            <Badge variant="secondary" className="font-medium bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Package className="h-3 w-3 mr-1" />
              {listing.available_quantity ?? listing.total_quantity} có sẵn
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingCard;

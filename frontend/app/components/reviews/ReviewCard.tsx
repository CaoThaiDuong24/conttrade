'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, MoreVertical, Flag, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      id: string;
      displayName: string;
      avatar?: string | null;
    };
    order?: {
      id: string;
      orderNumber: string;
      listing?: {
        title: string;
      };
    };
    categories?: {
      productQuality?: number;
      communication?: number;
      delivery?: number;
      valueForMoney?: number;
    };
    tags?: string[];
    recommend?: boolean;
    helpful?: number;
  };
  locale: string;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showOrder?: boolean;
}

export default function ReviewCard({
  review,
  locale,
  onHelpful,
  onReport,
  showOrder = true,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);

  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  const handleHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true);
      setHelpfulCount((prev) => prev + 1);
      onHelpful?.(review.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return t('Xuất sắc', 'Excellent');
    if (rating === 4) return t('Tốt', 'Good');
    if (rating === 3) return t('Bình thường', 'Average');
    if (rating === 2) return t('Kém', 'Poor');
    return t('Rất kém', 'Very Poor');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.reviewer.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {review.reviewer.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">{review.reviewer.displayName}</h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReport?.(review.id)}>
              <Flag className="mr-2 h-4 w-4" />
              {t('Báo cáo đánh giá', 'Report Review')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Order Info (if showOrder) */}
      {showOrder && review.order && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-gray-600">{t('Đơn hàng:', 'Order:')}</span>
            <span className="font-medium text-gray-900">{review.order.orderNumber}</span>
          </div>
          {review.order.listing && (
            <p className="text-sm text-gray-600 mt-1 ml-6">{review.order.listing.title}</p>
          )}
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`font-semibold text-lg ${getRatingColor(review.rating)}`}>
          {review.rating}.0
        </span>
        <span className="text-sm text-gray-500">{getRatingLabel(review.rating)}</span>
      </div>

      {/* Recommend Badge */}
      {review.recommend && (
        <Badge variant="secondary" className="mb-3 bg-green-100 text-green-700">
          <ThumbsUp className="h-3 w-3 mr-1" />
          {t('Giới thiệu', 'Recommended')}
        </Badge>
      )}

      {/* Category Ratings */}
      {review.categories && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {review.categories.productQuality && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Chất lượng', 'Quality')}:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.categories!.productQuality!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {review.categories.communication && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Giao tiếp', 'Communication')}:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.categories!.communication!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {review.categories.delivery && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Vận chuyển', 'Delivery')}:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.categories!.delivery!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {review.categories.valueForMoney && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Giá trị', 'Value')}:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.categories!.valueForMoney!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
      )}

      {/* Footer - Helpful */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleHelpful}
          disabled={isHelpful}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isHelpful
              ? 'text-blue-600 cursor-default'
              : 'text-gray-600 hover:text-blue-600 cursor-pointer'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isHelpful ? 'fill-current' : ''}`} />
          <span>
            {t('Hữu ích', 'Helpful')} ({helpfulCount})
          </span>
        </button>
      </div>
    </div>
  );
}

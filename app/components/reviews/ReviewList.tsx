'use client';

import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Filter } from 'lucide-react';

interface ReviewListProps {
  reviews: Array<{
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
  }>;
  locale: string;
  totalCount?: number;
  onLoadMore?: () => void;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  showOrder?: boolean;
}

export default function ReviewList({
  reviews,
  locale,
  totalCount,
  onLoadMore,
  onHelpful,
  onReport,
  isLoading = false,
  hasMore = false,
  showOrder = true,
}: ReviewListProps) {
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'helpful') {
      return (b.helpful || 0) - (a.helpful || 0);
    }
    return 0;
  });

  if (reviews.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">{t('Chưa có đánh giá nào', 'No reviews yet')}</p>
        <p className="text-gray-400 text-sm mt-2">
          {t('Hãy là người đầu tiên đánh giá', 'Be the first to leave a review')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {t('Lọc và sắp xếp:', 'Filter & Sort:')}
          </span>
        </div>

        {/* Filter by Rating */}
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('Tất cả đánh giá', 'All Ratings')}</SelectItem>
            <SelectItem value="5">⭐⭐⭐⭐⭐ (5 {t('sao', 'stars')})</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ (4 {t('sao', 'stars')})</SelectItem>
            <SelectItem value="3">⭐⭐⭐ (3 {t('sao', 'stars')})</SelectItem>
            <SelectItem value="2">⭐⭐ (2 {t('sao', 'stars')})</SelectItem>
            <SelectItem value="1">⭐ (1 {t('sao', 'star')})</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('Mới nhất', 'Most Recent')}</SelectItem>
            <SelectItem value="oldest">{t('Cũ nhất', 'Oldest')}</SelectItem>
            <SelectItem value="highest">{t('Điểm cao nhất', 'Highest Rated')}</SelectItem>
            <SelectItem value="lowest">{t('Điểm thấp nhất', 'Lowest Rated')}</SelectItem>
            <SelectItem value="helpful">{t('Hữu ích nhất', 'Most Helpful')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Count */}
        {totalCount !== undefined && (
          <div className="ml-auto text-sm text-gray-600">
            {t('Hiển thị', 'Showing')} <strong>{sortedReviews.length}</strong> /{' '}
            <strong>{totalCount}</strong> {t('đánh giá', 'reviews')}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            locale={locale}
            onHelpful={onHelpful}
            onReport={onReport}
            showOrder={showOrder}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button onClick={onLoadMore} disabled={isLoading} variant="outline" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('Đang tải...', 'Loading...')}
              </>
            ) : (
              t('Xem thêm đánh giá', 'Load More Reviews')
            )}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && sortedReviews.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">{t('Đang tải đánh giá...', 'Loading reviews...')}</span>
        </div>
      )}
    </div>
  );
}

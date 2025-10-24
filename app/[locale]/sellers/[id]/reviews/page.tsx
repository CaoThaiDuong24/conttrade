'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReviewStats from '@/app/components/reviews/ReviewStats';
import ReviewList from '@/app/components/reviews/ReviewList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewData {
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    recommendationRate?: number;
    categoryAverages?: {
      productQuality?: number;
      communication?: number;
      delivery?: number;
      valueForMoney?: number;
    };
  };
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
    order: {
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
}

export default function SellerReviewsPage({ params }: { params: { id: string; locale: string } }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = params.locale || 'vi';
  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  useEffect(() => {
    fetchReviews();
  }, [params.id]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/reviews/sellers/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      setData(result.data);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      // TODO: Implement API call to mark review as helpful
      console.log('Mark helpful:', reviewId);
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const handleReport = async (reviewId: string) => {
    try {
      // TODO: Implement API call to report review
      console.log('Report review:', reviewId);
    } catch (err) {
      console.error('Error reporting review:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('Đánh giá từ khách hàng', 'Customer Reviews')}
        </h1>
        <p className="text-gray-600">
          {t(
            'Xem những đánh giá và phản hồi từ khách hàng đã giao dịch',
            'See reviews and feedback from customers who have transacted'
          )}
        </p>
      </div>

      {/* Stats Overview */}
      <ReviewStats stats={data.stats} locale={locale} variant="full" />

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('Tất cả đánh giá', 'All Reviews')} ({data.stats.totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList
            reviews={data.reviews}
            locale={locale}
            totalCount={data.stats.totalReviews}
            onHelpful={handleHelpful}
            onReport={handleReport}
            showOrder={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

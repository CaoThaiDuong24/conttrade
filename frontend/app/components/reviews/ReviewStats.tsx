'use client';

import React from 'react';
import { Star, TrendingUp, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ReviewStatsProps {
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
  locale: string;
  variant?: 'compact' | 'full';
}

export default function ReviewStats({ stats, locale, variant = 'full' }: ReviewStatsProps) {
  const t = (vi: string, en: string) => (locale === 'vi' ? vi : en);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingBarColor = (rating: number) => {
    if (rating === 5) return 'bg-green-500';
    if (rating === 4) return 'bg-blue-500';
    if (rating === 3) return 'bg-yellow-500';
    if (rating === 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        {/* Average Rating */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalReviews} {t('đánh giá', 'reviews')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-8">{rating} ⭐</span>
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Recommendation */}
        {stats.recommendationRate !== undefined && (
          <div className="flex flex-col items-center px-4 border-l border-gray-200">
            <TrendingUp className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-2xl font-bold text-green-600">
              {stats.recommendationRate}%
            </span>
            <p className="text-xs text-gray-500 text-center">{t('Giới thiệu', 'Recommend')}</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            {t('Tổng quan đánh giá', 'Review Overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-2xl text-gray-500">/5</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {stats.totalReviews} {t('đánh giá', 'reviews')}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-medium text-gray-700 mb-3">
                {t('Phân bố đánh giá', 'Rating Distribution')}
              </h4>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 relative">
                      <Progress value={percentage} className={`h-3 ${getRatingBarColor(rating)}`} />
                    </div>
                    <div className="flex items-center gap-2 w-24">
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendation Rate */}
          {stats.recommendationRate !== undefined && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t('Tỷ lệ khách hàng giới thiệu', 'Customer Recommendation Rate')}
                    </p>
                    <p className="text-2xl font-bold text-green-600">{stats.recommendationRate}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {Math.round((stats.recommendationRate / 100) * stats.totalReviews)} /{' '}
                    {stats.totalReviews}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('khách hàng giới thiệu', 'customers recommend')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Averages */}
      {stats.categoryAverages && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Đánh giá theo tiêu chí', 'Category Ratings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.categoryAverages.productQuality !== undefined && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('Chất lượng sản phẩm', 'Product Quality')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.categoryAverages!.productQuality!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRatingColor(
                      stats.categoryAverages.productQuality
                    )}`}
                  >
                    {stats.categoryAverages.productQuality.toFixed(1)}
                  </span>
                </div>
              )}

              {stats.categoryAverages.communication !== undefined && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('Giao tiếp', 'Communication')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.categoryAverages!.communication!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRatingColor(
                      stats.categoryAverages.communication
                    )}`}
                  >
                    {stats.categoryAverages.communication.toFixed(1)}
                  </span>
                </div>
              )}

              {stats.categoryAverages.delivery !== undefined && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('Vận chuyển', 'Delivery')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.categoryAverages!.delivery!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRatingColor(
                      stats.categoryAverages.delivery
                    )}`}
                  >
                    {stats.categoryAverages.delivery.toFixed(1)}
                  </span>
                </div>
              )}

              {stats.categoryAverages.valueForMoney !== undefined && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('Giá trị đồng tiền', 'Value for Money')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(stats.categoryAverages!.valueForMoney!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRatingColor(
                      stats.categoryAverages.valueForMoney
                    )}`}
                  >
                    {stats.categoryAverages.valueForMoney.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Package, Truck, Clock, MessageSquare, Filter, TrendingUp, Award, Layers, ShoppingCart } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface DeliveryReview {
  id: string;
  rating: number;
  comment?: string;
  deliveryQualityRating?: number;
  packagingRating?: number;
  timelinessRating?: number;
  photos?: string[];
  createdAt: string;
  response?: string;
  responseAt?: string;
  deliveryId?: string; // NEW: để phân biệt loại review
  reviewer: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  delivery?: {
    id: string;
    batchNumber: number;
    totalBatches: number;
    deliveryDate?: string;
    deliveredAt?: string;
  };
  order: {
    id: string;
    orderNumber: string;
    listing?: {
      id: string;
      title: string;
    };
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  averageDeliveryQuality: number;
  averagePackaging: number;
  averageTimeliness: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationRate: number;
}

export default function MyReviewsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationContext();
  const [reviews, setReviews] = useState<DeliveryReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewType, setReviewType] = useState<'all' | 'delivery' | 'order'>('all'); // NEW
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<DeliveryReview | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user, selectedFilter, reviewType]); // Thêm reviewType vào dependencies

  const fetchReviews = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('Fetching reviews for user:', user.id, 'filter:', selectedFilter, 'type:', reviewType);
      
      const response = await apiClient.request<{
        reviews: DeliveryReview[];
        stats: ReviewStats;
      }>(
        `/delivery-reviews/user/${user.id}?filter=${selectedFilter}&type=${reviewType}`,
        { method: 'GET' }
      );

      console.log('API Response:', response);

      if (response.data) {
        console.log('Reviews data:', response.data.reviews);
        setReviews(response.data.reviews || []);
        setStats(response.data.stats || null);
      } else {
        showError('Không thể tải đánh giá');
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseClick = (review: DeliveryReview) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) {
      showError('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.request<any>(
        `/delivery-reviews/${selectedReview.id}/response`,
        {
          method: 'PUT',
          body: JSON.stringify({ response: responseText.trim() })
        }
      );

      if (response.status === 200) {
        showSuccess('Đã gửi phản hồi thành công!');
        setShowResponseDialog(false);
        setSelectedReview(null);
        setResponseText('');
        fetchReviews(); // Refresh list
      } else {
        showError('Không thể gửi phản hồi');
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả đánh giá từ khách hàng
        </p>
      </div>

      {/* Review Type Tabs - NEW */}
      <Tabs value={reviewType} onValueChange={(value) => setReviewType(value as 'all' | 'delivery' | 'order')} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Tất cả
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Đánh giá lô hàng
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Đánh giá đơn hàng
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng đánh giá</CardDescription>
              <CardTitle className="text-3xl">{reviews.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {reviewType === 'all' && 'Tất cả đánh giá'}
                  {reviewType === 'delivery' && 'Đánh giá lô hàng'}
                  {reviewType === 'order' && 'Đánh giá đơn hàng'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Đánh giá trung bình</CardDescription>
              <CardTitle className={`text-3xl ${getRatingColor(stats.averageRating)}`}>
                {stats.averageRating.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStars(Math.round(stats.averageRating))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tỷ lệ hài lòng</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {stats.recommendationRate}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Khách hàng đánh giá 4-5 sao</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Chất lượng dịch vụ</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {stats.averageDeliveryQuality.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Đóng gói:</span>
                  <span className="font-medium">{stats.averagePackaging.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Đúng giờ:</span>
                  <span className="font-medium">{stats.averageTimeliness.toFixed(1)}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Phân bố đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{star}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({stats?.totalReviews || 0})
          </TabsTrigger>
          <TabsTrigger value="5">
            5 sao ({stats?.ratingDistribution[5] || 0})
          </TabsTrigger>
          <TabsTrigger value="4">
            4 sao ({stats?.ratingDistribution[4] || 0})
          </TabsTrigger>
          <TabsTrigger value="3">
            3 sao ({stats?.ratingDistribution[3] || 0})
          </TabsTrigger>
          <TabsTrigger value="2">
            2 sao ({stats?.ratingDistribution[2] || 0})
          </TabsTrigger>
          <TabsTrigger value="1">
            1 sao ({stats?.ratingDistribution[1] || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFilter} className="space-y-4 mt-6">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có đánh giá
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedFilter === 'all'
                      ? 'Bạn chưa nhận được đánh giá nào từ khách hàng'
                      : `Không có đánh giá ${selectedFilter} sao`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {review.reviewer.avatar ? (
                            <img
                              src={review.reviewer.avatar}
                              alt={review.reviewer.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {review.reviewer.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{review.reviewer.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {renderStars(review.rating, 'w-5 h-5')}
                        <span className="text-lg font-semibold">{review.rating}/5</span>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {/* Review Type Badge - NEW */}
                      {review.deliveryId ? (
                        <Badge variant="default" className="mb-2 bg-blue-500">
                          <Layers className="h-3 w-3 mr-1" />
                          Đánh giá lô hàng
                        </Badge>
                      ) : (
                        <Badge variant="default" className="mb-2 bg-green-500">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Đánh giá đơn hàng
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="block">
                        Đơn hàng: {review.order.orderNumber}
                      </Badge>
                      
                      {review.delivery && (
                        <p className="text-sm text-muted-foreground">
                          Lô {review.delivery.batchNumber}/{review.delivery.totalBatches}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Detailed Ratings */}
                  {(review.deliveryQualityRating || review.packagingRating || review.timelinessRating) && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      {review.deliveryQualityRating && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4 text-blue-500" />
                            <span>Chất lượng giao hàng</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.deliveryQualityRating)}
                            <span className="text-sm font-medium ml-1">
                              {review.deliveryQualityRating}/5
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {review.packagingRating && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4 text-green-500" />
                            <span>Đóng gói</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.packagingRating)}
                            <span className="text-sm font-medium ml-1">
                              {review.packagingRating}/5
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {review.timelinessRating && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>Đúng giờ</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.timelinessRating)}
                            <span className="text-sm font-medium ml-1">
                              {review.timelinessRating}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                    </div>
                  )}

                  {/* Order Info */}
                  {review.order.listing && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Tin đăng:</span> {review.order.listing.title}
                    </div>
                  )}

                  {/* Response Section */}
                  {review.response ? (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-full">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-green-800">Phản hồi của bạn</span>
                            {review.responseAt && (
                              <p className="text-xs text-green-600">
                                {formatDate(review.responseAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-700 hover:text-green-800 hover:bg-green-100"
                          onClick={() => handleResponseClick(review)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Chỉnh sửa
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 pl-8 leading-relaxed">{review.response}</p>
                      <div className="mt-3 pl-8">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          ✓ Đã phản hồi
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button
                        onClick={() => handleResponseClick(review)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        size="lg"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Phản hồi đánh giá này
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Phản hồi giúp khách hàng biết bạn quan tâm đến ý kiến của họ
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              Gửi phản hồi chân thành và chuyên nghiệp đến khách hàng
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-semibold">{selectedReview.rating}/5</span>
                </div>
                {selectedReview.comment && (
                  <p className="text-sm text-gray-700 italic">"{selectedReview.comment}"</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nội dung phản hồi</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Cảm ơn bạn đã đánh giá. Chúng tôi rất vui vì..."
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {responseText.length}/500 ký tự
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResponseDialog(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={submitting || !responseText.trim()}
            >
              {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

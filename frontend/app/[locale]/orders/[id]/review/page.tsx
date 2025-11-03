"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';

interface OrderInfo {
  id: string;
  order_number: string;
  status: string;
  buyer_id: string;
  seller_id: string;
  buyer: { display_name: string };
  seller: { display_name: string };
  listing: { title: string };
  total: string;
  currency: string;
}

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    productQuality: 0,
    communication: 0,
    deliveryTime: 0,
    packaging: 0
  });
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `/api/v1/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      if (result.success && result.data) {
        const orderData = result.data;
        
        // Check if order is completed
        if (orderData.status !== 'COMPLETED') {
          setError('Chỉ có thể đánh giá đơn hàng đã hoàn tất');
          return;
        }

        // Check if user is buyer or seller
        if (orderData.buyer_id !== user?.id && orderData.seller_id !== user?.id) {
          setError('Bạn không có quyền đánh giá đơn hàng này');
          return;
        }

        setOrder(orderData);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (err: any) {
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleCategoryRating = (category: string, value: number) => {
    setCategories(prev => ({ ...prev, [category]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!order) return;

    try {
      setSubmitting(true);
      setError(null);

      // Determine reviewee (người được đánh giá)
      const revieweeId = order.buyer_id === user?.id 
        ? order.seller_id 
        : order.buyer_id;

      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `/api/v1/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: order.id,
            revieweeId: revieweeId,
            rating: rating,
            comment: comment || null,
            categories: categories,
            recommend: recommend
            // TODO: Upload photos if implemented
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 2000);
      } else {
        setError(result.error || result.message || 'Không thể gửi đánh giá');
      }
    } catch (err: any) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Cảm ơn bạn đã đánh giá!
            </h2>
            <p className="text-green-800">
              Đánh giá của bạn đã được gửi thành công.
            </p>
            <p className="text-sm text-green-700 mt-4">
              Đang chuyển hướng về trang đơn hàng...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revieweeRole = order?.buyer_id === user?.id ? 'seller' : 'buyer';
  const revieweeName = revieweeRole === 'seller' 
    ? order?.seller?.display_name
    : order?.buyer?.display_name;

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đánh giá giao dịch</CardTitle>
          <CardDescription>
            Chia sẻ trải nghiệm của bạn với {revieweeRole === 'seller' ? 'người bán' : 'người mua'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Đơn hàng</p>
                <p className="font-semibold">
                  {order?.order_number || order?.id?.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-700 mt-1">{order?.listing?.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Đối tác</p>
                <p className="font-semibold">{revieweeName}</p>
                <Badge variant="outline" className="mt-1">
                  {revieweeRole === 'seller' ? 'Người bán' : 'Người mua'}
                </Badge>
              </div>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Đánh giá tổng quan <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-4 text-lg font-semibold">
                    {rating}.0
                  </span>
                )}
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Đánh giá chi tiết
              </label>
              
              {revieweeRole === 'seller' && (
                <>
                  <CategoryRating
                    label="Chất lượng sản phẩm"
                    value={categories.productQuality}
                    onChange={(val) => handleCategoryRating('productQuality', val)}
                  />
                  <CategoryRating
                    label="Đóng gói"
                    value={categories.packaging}
                    onChange={(val) => handleCategoryRating('packaging', val)}
                  />
                  <CategoryRating
                    label="Thời gian giao hàng"
                    value={categories.deliveryTime}
                    onChange={(val) => handleCategoryRating('deliveryTime', val)}
                  />
                </>
              )}
              
              <CategoryRating
                label="Giao tiếp"
                value={categories.communication}
                onChange={(val) => handleCategoryRating('communication', val)}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nhận xét của bạn
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về giao dịch này..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 ký tự
              </p>
            </div>

            {/* Photos Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Hình ảnh (tùy chọn)
              </label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={photos.length >= 5}
                />
                <label
                  htmlFor="photo-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Tải lên hình ảnh (tối đa 5 ảnh)
                  </span>
                </label>
              </div>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommend */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bạn có giới thiệu {revieweeRole === 'seller' ? 'người bán' : 'người mua'} này không?
              </label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={recommend === true ? 'default' : 'outline'}
                  onClick={() => setRecommend(true)}
                  className="flex-1"
                >
                  👍 Có
                </Button>
                <Button
                  type="button"
                  variant={recommend === false ? 'default' : 'outline'}
                  onClick={() => setRecommend(false)}
                  className="flex-1"
                >
                  👎 Không
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || rating === 0}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for category rating
function CategoryRating({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded p-3">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

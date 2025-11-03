"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Package, 
  User, 
  Calendar,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';

interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listing: {
    id: string;
    title: string;
    container: {
      sizeFt: number;
      type: string;
      condition: string;
    };
  };
  seller: {
    displayName: string;
    orgUsers: Array<{
      org: {
        name: string;
      };
    }>;
  };
  createdAt: string;
  completedAt: string;
}

interface ReviewForm {
  orderId: string;
  rating: number;
  comment: string;
  categories: {
    productQuality: number;
    communication: number;
    delivery: number;
    valueForMoney: number;
  };
  tags: string[];
  recommend: boolean;
}

export default function NewReviewPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReviewForm>({
    orderId: '',
    rating: 0,
    comment: '',
    categories: {
      productQuality: 0,
      communication: 0,
      delivery: 0,
      valueForMoney: 0
    },
    tags: [],
    recommend: true
  });

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
      setFormData(prev => ({ ...prev, orderId }));
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      
      // Call real API first
      const response = await fetch(`/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ Order detail loaded from API for review:', result.data);
          setOrder(result.data);
          return;
        }
      }
      
      // No fallback - show error for real data only
      console.error('❌ Failed to load order from API:', response.status, response.statusText);
      showError('Không thể tải thông tin đơn hàng từ server. Vui lòng thử lại sau.');
      setOrder(null);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      showError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCategoryChange = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating
      }
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      showError('Vui lòng chọn đánh giá tổng thể');
      return;
    }

    if (!formData.comment.trim()) {
      showError('Vui lòng viết nhận xét');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement API call
      // await apiClient.createReview(formData);
      showSuccess('Đánh giá đã được gửi thành công');
      router.push('/orders');
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, onChange: (rating: number) => void, readonly = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange(star)}
            disabled={readonly}
            className={`p-1 ${!readonly ? 'hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const reviewTags = [
    'Chất lượng tốt',
    'Giao hàng nhanh',
    'Dịch vụ tốt',
    'Giá hợp lý',
    'Đóng gói cẩn thận',
    'Thái độ thân thiện',
    'Sản phẩm đúng mô tả',
    'Liên hệ dễ dàng'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Đánh giá giao dịch</h1>
          <p className="text-muted-foreground">Chia sẻ trải nghiệm của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông tin giao dịch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{order.listing.title}</h3>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {order.listing.container.sizeFt}ft {order.listing.container.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Tình trạng: {order.listing.container.condition}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Người bán: {order.seller.orgUsers[0]?.org.name || order.seller.displayName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Hoàn thành: {new Date(order.completedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Đánh giá tổng thể
                </CardTitle>
                <CardDescription>
                  Bạn có hài lòng với giao dịch này không?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {renderStars(formData.rating, handleRatingChange)}
                  <span className="text-sm text-muted-foreground">
                    {formData.rating > 0 && (
                      <>
                        {formData.rating === 1 && 'Rất không hài lòng'}
                        {formData.rating === 2 && 'Không hài lòng'}
                        {formData.rating === 3 && 'Bình thường'}
                        {formData.rating === 4 && 'Hài lòng'}
                        {formData.rating === 5 && 'Rất hài lòng'}
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Bạn có muốn giới thiệu người bán này không?</Label>
                  <RadioGroup 
                    value={formData.recommend.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recommend: value === 'true' }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="recommend-yes" />
                      <Label htmlFor="recommend-yes" className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        Có
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="recommend-no" />
                      <Label htmlFor="recommend-no" className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        Không
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá chi tiết</CardTitle>
                <CardDescription>
                  Đánh giá từng khía cạnh của giao dịch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Chất lượng sản phẩm</Label>
                    {renderStars(formData.categories.productQuality, (rating) => handleCategoryChange('productQuality', rating))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Giao tiếp</Label>
                    {renderStars(formData.categories.communication, (rating) => handleCategoryChange('communication', rating))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Vận chuyển</Label>
                    {renderStars(formData.categories.delivery, (rating) => handleCategoryChange('delivery', rating))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Giá trị đồng tiền</Label>
                    {renderStars(formData.categories.valueForMoney, (rating) => handleCategoryChange('valueForMoney', rating))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Nhãn đánh giá</CardTitle>
                <CardDescription>
                  Chọn các nhãn mô tả trải nghiệm của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {reviewTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comment */}
            <Card>
              <CardHeader>
                <CardTitle>Nhận xét</CardTitle>
                <CardDescription>
                  Chia sẻ chi tiết về trải nghiệm của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Hãy chia sẻ chi tiết về trải nghiệm của bạn với giao dịch này..."
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="min-h-[150px]"
                  required
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} size="lg">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Hướng dẫn đánh giá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p>• Đánh giá chính xác và công bằng</p>
                  <p>• Không sử dụng ngôn từ xúc phạm</p>
                  <p>• Chia sẻ trải nghiệm thực tế</p>
                  <p>• Giúp người khác đưa ra quyết định</p>
                </div>
              </CardContent>
            </Card>

            {/* Review Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Tác động của đánh giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Giúp người bán cải thiện dịch vụ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Tạo cộng đồng tin cậy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Hỗ trợ người mua quyết định</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900">Về quyền riêng tư</h4>
                    <p className="text-sm text-blue-800">
                      Đánh giá của bạn sẽ được hiển thị công khai. 
                      Thông tin cá nhân sẽ được bảo mật.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

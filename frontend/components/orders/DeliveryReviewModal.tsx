"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Package, Truck, Clock, Camera } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';

interface DeliveryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  batchNumber: number;
  totalBatches: number;
  orderId: string;
  onSuccess?: () => void;
}

export default function DeliveryReviewModal({
  isOpen,
  onClose,
  deliveryId,
  batchNumber,
  totalBatches,
  orderId,
  onSuccess
}: DeliveryReviewModalProps) {
  const { showSuccess, showError } = useNotificationContext();
  
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [deliveryQualityRating, setDeliveryQualityRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      showError('Vui lòng chọn đánh giá từ 1-5 sao');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const response = await fetch(`${apiUrl}/api/v1/delivery-reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deliveryId,
          orderId,
          rating,
          comment: comment.trim() || undefined,
          deliveryQualityRating,
          packagingRating,
          timelinessRating,
          photos: photos.length > 0 ? photos : undefined
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(`Đánh giá Batch ${batchNumber}/${totalBatches} thành công!`);
        onSuccess?.();
        handleClose();
      } else {
        showError(result.error || result.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      showError(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setHoveredRating(0);
    setDeliveryQualityRating(5);
    setPackagingRating(5);
    setTimelinessRating(5);
    setComment('');
    setPhotos([]);
    onClose();
  };

  const renderStars = (
    currentRating: number,
    setCurrentRating: (rating: number) => void,
    hovered: number,
    setHovered: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setCurrentRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hovered || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderDetailedRating = (
    label: string,
    icon: React.ReactNode,
    value: number,
    setValue: (value: number) => void
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium">{label}</Label>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Đánh giá lô giao hàng - Batch {batchNumber}/{totalBatches}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Chia sẻ trải nghiệm của bạn về lô giao hàng này
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              Đánh giá tổng thể 
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              {renderStars(rating, setRating, hoveredRating, setHoveredRating)}
              <span className="text-lg font-semibold">{rating}/5</span>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Đánh giá chi tiết <span className="text-gray-400 text-sm font-normal">(Tùy chọn)</span>
            </Label>
            <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
              {/* Delivery Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-900">Chất lượng giao hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setDeliveryQualityRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= deliveryQualityRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[32px] text-right">
                    {deliveryQualityRating}/5
                  </span>
                </div>
              </div>

              {/* Packaging */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900">Đóng gói</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPackagingRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= packagingRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[32px] text-right">
                    {packagingRating}/5
                  </span>
                </div>
              </div>

              {/* Timeliness */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-900">Đúng giờ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTimelinessRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= timelinessRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[32px] text-right">
                    {timelinessRating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Nhận xét chi tiết (Tùy chọn)
            </Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về lô giao hàng này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Photos - Simple placeholder for now */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Hình ảnh (Tùy chọn)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Thêm hình ảnh để đánh giá chính xác hơn
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Tính năng đang phát triển)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

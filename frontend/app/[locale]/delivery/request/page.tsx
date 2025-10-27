"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  Truck,
  MapPin,
  Calendar,
  Package,
  User,
  Phone,
  ArrowLeft,
  Send,
  DollarSign,
  Clock,
  Info
} from 'lucide-react';

export default function DeliveryRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);

  const orderId = searchParams.get('orderId');

  const [formData, setFormData] = useState({
    orderId: orderId || '',
    pickupAddress: '',
    pickupContact: '',
    pickupPhone: '',
    pickupDate: '',
    pickupTime: '',
    
    deliveryAddress: '',
    deliveryContact: '',
    deliveryPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    
    serviceType: 'standard',
    needsCrane: false,
    specialInstructions: '',
    
    containerCount: 1,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pickupAddress || !formData.deliveryAddress) {
      showError('Vui lòng điền địa chỉ lấy hàng và giao hàng');
      return;
    }

    if (!formData.pickupDate || !formData.deliveryDate) {
      showError('Vui lòng chọn ngày lấy hàng và giao hàng');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Yêu cầu vận chuyển đã được gửi!', 2000);
        
        const path = window.location.pathname;
        const match = path.match(/^\/(vi|en)\b/);
        const locale = match ? match[1] : 'vi';
        
        setTimeout(() => {
          router.push(`/${locale}/delivery`);
        }, 1000);
      } else {
        const error = await response.json();
        showError(error.message || 'Không thể gửi yêu cầu');
      }
    } catch (error) {
      console.error('Delivery request error:', error);
      showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Yêu cầu vận chuyển
          </h1>
          <p className="text-muted-foreground mt-1">
            Đặt lịch vận chuyển container
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lấy hàng</CardTitle>
            <CardDescription>Địa điểm và thời gian lấy container</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">
                <MapPin className="h-4 w-4 inline mr-1" />
                Địa chỉ lấy hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pickupAddress"
                placeholder="Nhập địa chỉ đầy đủ..."
                value={formData.pickupAddress}
                onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupContact">
                  <User className="h-4 w-4 inline mr-1" />
                  Người liên hệ
                </Label>
                <Input
                  id="pickupContact"
                  placeholder="Tên người liên hệ"
                  value={formData.pickupContact}
                  onChange={(e) => handleInputChange('pickupContact', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupPhone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Số điện thoại
                </Label>
                <Input
                  id="pickupPhone"
                  placeholder="0xxx xxx xxx"
                  value={formData.pickupPhone}
                  onChange={(e) => handleInputChange('pickupPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Ngày lấy hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Giờ lấy hàng
                </Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
            <CardDescription>Địa điểm và thời gian giao container</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">
                <MapPin className="h-4 w-4 inline mr-1" />
                Địa chỉ giao hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deliveryAddress"
                placeholder="Nhập địa chỉ đầy đủ..."
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryContact">
                  <User className="h-4 w-4 inline mr-1" />
                  Người nhận hàng
                </Label>
                <Input
                  id="deliveryContact"
                  placeholder="Tên người nhận"
                  value={formData.deliveryContact}
                  onChange={(e) => handleInputChange('deliveryContact', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryPhone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Số điện thoại
                </Label>
                <Input
                  id="deliveryPhone"
                  placeholder="0xxx xxx xxx"
                  value={formData.deliveryPhone}
                  onChange={(e) => handleInputChange('deliveryPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Ngày giao hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Giờ giao hàng
                </Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Options */}
        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Loại dịch vụ</Label>
                <select
                  id="serviceType"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                >
                  <option value="standard">Tiêu chuẩn (3-5 ngày)</option>
                  <option value="express">Nhanh (1-2 ngày)</option>
                  <option value="economy">Tiết kiệm (7-10 ngày)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="containerCount">
                  <Package className="h-4 w-4 inline mr-1" />
                  Số lượng container
                </Label>
                <Input
                  id="containerCount"
                  type="number"
                  min="1"
                  value={formData.containerCount}
                  onChange={(e) => handleInputChange('containerCount', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="needsCrane"
                checked={formData.needsCrane}
                onChange={(e) => handleInputChange('needsCrane', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="needsCrane" className="cursor-pointer">
                Cần cẩu (Crane service) - Phụ thu thêm
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Hướng dẫn đặc biệt</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Ghi chú về địa điểm, yêu cầu đặc biệt..."
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost Estimate */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Ước tính chi phí
            </CardTitle>
            <CardDescription>Chi phí tạm tính, có thể thay đổi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển cơ bản:</span>
              <span className="font-semibold">$500</span>
            </div>
            {formData.needsCrane && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí cẩu:</span>
                <span className="font-semibold">$200</span>
              </div>
            )}
            {formData.serviceType === 'express' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí nhanh:</span>
                <span className="font-semibold">$150</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Tổng cộng (ước tính):</span>
              <span className="font-bold text-blue-600">
                ${(500 + (formData.needsCrane ? 200 : 0) + (formData.serviceType === 'express' ? 150 : 0)).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Đang gửi...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Lưu ý về vận chuyển
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Đặt lịch trước ít nhất 24 giờ</li>
                <li>• Chi phí chính xác sẽ được báo sau khi xác nhận</li>
                <li>• Cần cẩu thêm $200/container tại các địa điểm khó tiếp cận</li>
                <li>• Dịch vụ nhanh có thể yêu cầu phụ phí</li>
                <li>• Bạn sẽ nhận tracking number sau khi xác nhận</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


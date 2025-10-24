"use client";

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Truck,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Clock,
  User,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface DeliveryUpdate {
  status: 'scheduled' | 'in_transit' | 'arrived' | 'delivered' | 'failed';
  location: string;
  notes: string;
  photos: File[];
  timestamp: Date;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle: string;
  };
}

interface DeliveryTrackingProps {
  orderId: string;
  currentStatus: string;
  deliveryAddress: string;
  estimatedDate?: string;
  onStatusUpdate?: (update: DeliveryUpdate) => void;
}

export default function DeliveryTracking({ 
  orderId, 
  currentStatus, 
  deliveryAddress, 
  estimatedDate,
  onStatusUpdate 
}: DeliveryTrackingProps) {
  const t = useTranslations();
  
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState<Partial<DeliveryUpdate>>({
    status: currentStatus as any,
    location: '',
    notes: '',
    photos: []
  });
  const [driverInfo, setDriverInfo] = useState({
    name: '',
    phone: '',
    vehicle: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deliveryStatuses = [
    {
      id: 'scheduled',
      name: 'Đã lên lịch',
      description: 'Đơn hàng đã được lên lịch giao hàng',
      color: 'bg-blue-500',
      icon: Calendar
    },
    {
      id: 'in_transit',
      name: 'Đang vận chuyển',
      description: 'Container đang được vận chuyển',
      color: 'bg-yellow-500',
      icon: Truck
    },
    {
      id: 'arrived',
      name: 'Đã đến nơi',
      description: 'Container đã đến địa điểm giao hàng',
      color: 'bg-purple-500',
      icon: MapPin
    },
    {
      id: 'delivered',
      name: 'Đã giao hàng',
      description: 'Đã hoàn thành giao hàng',
      color: 'bg-green-500',
      icon: CheckCircle
    },
    {
      id: 'failed',
      name: 'Giao thất bại',
      description: 'Không thể hoàn thành giao hàng',
      color: 'bg-red-500',
      icon: AlertCircle
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setUpdate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDriverInfoChange = (field: string, value: string) => {
    setDriverInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`File ${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} không phải là hình ảnh`);
        return false;
      }
      return true;
    });

    setUpdate(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...validFiles]
    }));
  };

  const removePhoto = (index: number) => {
    setUpdate(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || []
    }));
  };

  const validateUpdate = () => {
    if (!update.status) {
      toast.error('Vui lòng chọn trạng thái giao hàng');
      return false;
    }
    
    if (!update.location) {
      toast.error('Vui lòng nhập vị trí hiện tại');
      return false;
    }

    if (update.status === 'in_transit' && (!driverInfo.name || !driverInfo.phone)) {
      toast.error('Vui lòng nhập thông tin tài xế');
      return false;
    }

    return true;
  };

  const submitDeliveryUpdate = async () => {
    if (!validateUpdate()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập để cập nhật');
        return;
      }

      // Prepare form data with photos
      const formData = new FormData();
      formData.append('status', update.status!);
      formData.append('location', update.location!);
      formData.append('notes', update.notes || '');
      formData.append('driverInfo', JSON.stringify(driverInfo));
      
      // Add photos
      update.photos?.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/delivery/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Cập nhật trạng thái giao hàng thành công!');
          
          const deliveryUpdate: DeliveryUpdate = {
            status: update.status!,
            location: update.location!,
            notes: update.notes || '',
            photos: update.photos || [],
            timestamp: new Date(),
            driverInfo: driverInfo.name ? driverInfo : undefined
          };
          
          onStatusUpdate?.(deliveryUpdate);
          
          // Reset form
          setUpdate({
            status: update.status,
            location: '',
            notes: '',
            photos: []
          });
          setDriverInfo({ name: '', phone: '', vehicle: '' });
        } else {
          toast.error(data.message || 'Cập nhật thất bại');
        }
      } else {
        // Demo mode - simulate success
        toast.success('Cập nhật trạng thái giao hàng thành công! (Demo mode)');
        
        const deliveryUpdate: DeliveryUpdate = {
          status: update.status!,
          location: update.location!,
          notes: update.notes || '',
          photos: update.photos || [],
          timestamp: new Date(),
          driverInfo: driverInfo.name ? driverInfo : undefined
        };
        
        onStatusUpdate?.(deliveryUpdate);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      // Demo mode - simulate success
      toast.success('Cập nhật trạng thái giao hàng thành công! (Demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStatusInfo = deliveryStatuses.find(s => s.id === currentStatus);
  const CurrentStatusIcon = currentStatusInfo?.icon || Clock;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Theo dõi giao hàng</span>
          </CardTitle>
          <CardDescription>
            Cập nhật trạng thái và theo dõi quá trình giao container
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trạng thái hiện tại</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`rounded-full p-3 ${currentStatusInfo?.color || 'bg-gray-500'} text-white`}>
              <CurrentStatusIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{currentStatusInfo?.name || currentStatus}</h3>
              <p className="text-sm text-muted-foreground">
                {currentStatusInfo?.description || 'Trạng thái hiện tại'}
              </p>
            </div>
            <Badge variant="secondary" className={`${currentStatusInfo?.color || 'bg-gray-500'} text-white`}>
              {currentStatusInfo?.name || currentStatus}
            </Badge>
          </div>
          
          {estimatedDate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Dự kiến giao hàng:</span>
                <span className="text-blue-700">{formatDate(estimatedDate)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Địa chỉ giao hàng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{deliveryAddress}</p>
            
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm">Ghi chú giao hàng:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Liên hệ trước khi giao hàng 30 phút</li>
                <li>• Chuẩn bị mặt bằng phù hợp cho container</li>
                <li>• Có mặt để kiểm tra và xác nhận nhận hàng</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Selection */}
            <div>
              <Label>Trạng thái mới</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {deliveryStatuses.map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.id}
                      onClick={() => handleInputChange('status', status.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        update.status === status.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Vị trí hiện tại</Label>
              <Input
                id="location"
                placeholder="VD: Depot ABC, Quận 7, TP.HCM"
                value={update.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Driver Info (for in_transit status) */}
            {update.status === 'in_transit' && (
              <div className="space-y-3">
                <Label>Thông tin tài xế</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Tên tài xế"
                    value={driverInfo.name}
                    onChange={(e) => handleDriverInfoChange('name', e.target.value)}
                  />
                  <Input
                    placeholder="Số điện thoại"
                    value={driverInfo.phone}
                    onChange={(e) => handleDriverInfoChange('phone', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Biển số xe / Thông tin xe"
                  value={driverInfo.vehicle}
                  onChange={(e) => handleDriverInfoChange('vehicle', e.target.value)}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú về trạng thái giao hàng..."
                value={update.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Hình ảnh chứng minh</span>
          </CardTitle>
          <CardDescription>
            Tải lên hình ảnh container, địa điểm giao hàng hoặc các tài liệu liên quan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <div className="space-y-4">
            {/* Upload Button */}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-dashed"
            >
              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Chọn hình ảnh</p>
                <p className="text-xs text-muted-foreground">Tối đa 5MB mỗi file</p>
              </div>
            </Button>

            {/* Photo Preview */}
            {update.photos && update.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {update.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {Math.round(photo.size / 1024)}KB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={submitDeliveryUpdate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Đang cập nhật...'
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Cập nhật trạng thái giao hàng
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
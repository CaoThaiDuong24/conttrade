"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, Calendar, Clock, MapPin, Phone, User, Building2, Container } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';

interface BookTransportationDialogProps {
  deliveryId: string;
  container: {
    id: string;
    container_iso_code: string;
  };
  batchNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookTransportationDialog({
  deliveryId,
  container,
  batchNumber,
  isOpen,
  onClose,
  onSuccess
}: BookTransportationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [transportMethod, setTransportMethod] = useState<'self_pickup' | 'logistics' | 'seller_delivers'>('logistics');
  const [logisticsCompany, setLogisticsCompany] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [needsCrane, setNeedsCrane] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [transportationFee, setTransportationFee] = useState('0');

  const { showSuccess, showError } = useNotificationContext();

  const handleSubmit = async () => {
    // Validation
    if (!deliveryAddress.trim()) {
      showError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    if (!deliveryContact.trim()) {
      showError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!deliveryPhone.trim()) {
      showError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!deliveryDate) {
      showError('Vui lòng chọn ngày giao hàng');
      return;
    }
    if (transportMethod === 'logistics' && !logisticsCompany.trim()) {
      showError('Vui lòng nhập tên công ty vận chuyển');
      return;
    }

    // Check date is in the future
    const selectedDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showError('Ngày giao hàng phải là ngày trong tương lai');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `/api/v1/deliveries/${deliveryId}/containers/${container.id}/book-transportation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transportMethod,
            logisticsCompany: transportMethod === 'logistics' ? logisticsCompany : undefined,
            deliveryAddress,
            deliveryContact,
            deliveryPhone,
            deliveryDate,
            deliveryTime,
            needsCrane,
            specialInstructions: specialInstructions || undefined,
            transportationFee: parseFloat(transportationFee) || 0,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book transportation');
      }

      const result = await response.json();
      showSuccess(result.message || 'Đã đặt vận chuyển thành công');
      onSuccess();
    } catch (error: any) {
      console.error('Error booking transportation:', error);
      showError(error.message || 'Failed to book transportation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Đặt vận chuyển container
          </DialogTitle>
          <DialogDescription>
            Container: <span className="font-mono font-semibold">{container.container_iso_code}</span> 
            {' '}(Batch {batchNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transport Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Phương thức vận chuyển</Label>
            <RadioGroup value={transportMethod} onValueChange={(value: any) => setTransportMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="logistics" id="logistics" />
                <Label htmlFor="logistics" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Thuê công ty vận chuyển</span>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="self_pickup" id="self_pickup" />
                <Label htmlFor="self_pickup" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Tự đến lấy hàng</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="seller_delivers" id="seller_delivers" />
                <Label htmlFor="seller_delivers" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Người bán giao hàng</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Logistics Company (if logistics selected) */}
          {transportMethod === 'logistics' && (
            <div className="space-y-2">
              <Label htmlFor="logistics-company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Công ty vận chuyển <span className="text-red-500">*</span>
              </Label>
              <Input
                id="logistics-company"
                placeholder="Ví dụ: Viettel Post, GHTK, Ninja Van..."
                value={logisticsCompany}
                onChange={(e) => setLogisticsCompany(e.target.value)}
              />
            </div>
          )}

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="delivery-address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Địa chỉ giao hàng <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="delivery-address"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Người nhận <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-name"
                placeholder="Họ và tên"
                value={deliveryContact}
                onChange={(e) => setDeliveryContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-phone"
                placeholder="0912345678"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày giao hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Giờ giao hàng
              </Label>
              <Input
                id="delivery-time"
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Yêu cầu đặc biệt</Label>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                id="needs-crane"
                checked={needsCrane}
                onChange={(e) => setNeedsCrane(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="needs-crane" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Container className="h-4 w-4" />
                  <span>Cần cẩu để dỡ container</span>
                </div>
              </Label>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="special-instructions">Ghi chú thêm (không bắt buộc)</Label>
            <Textarea
              id="special-instructions"
              placeholder="Ví dụ: Giao trong giờ hành chính, cần thông báo trước 1 ngày..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* Transportation Fee */}
          <div className="space-y-2">
            <Label htmlFor="transportation-fee">Phí vận chuyển ước tính (VND)</Label>
            <Input
              id="transportation-fee"
              type="number"
              placeholder="0"
              value={transportationFee}
              onChange={(e) => setTransportationFee(e.target.value)}
              min="0"
            />
            <p className="text-xs text-gray-500">
              Đây là phí ước tính, có thể thay đổi tùy theo thực tế
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang xử lý...
              </div>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Xác nhận đặt vận chuyển
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

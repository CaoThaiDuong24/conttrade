'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, User, FileText, Calendar, MapPin } from 'lucide-react';

interface MarkDeliveredFormProps {
  isOpen: boolean;
  orderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function MarkDeliveredForm({ isOpen, orderId, onSuccess, onClose }: MarkDeliveredFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveredAt: new Date().toISOString().slice(0, 16), // datetime-local format
    receivedByName: '',
    driverNotes: '',
    deliveryLocation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.receivedByName.trim()) {
      alert('Vui lòng nhập tên người nhận hàng');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/mark-delivered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveredAt: formData.deliveredAt,
          receivedByName: formData.receivedByName,
          driverNotes: formData.driverNotes || undefined,
          deliveryLocation: formData.deliveryLocation ? { address: formData.deliveryLocation } : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        setFormData({
          deliveredAt: new Date().toISOString().slice(0, 16),
          receivedByName: '',
          driverNotes: '',
          deliveryLocation: ''
        });
      } else {
        alert(result.message || 'Không thể xác nhận giao hàng');
      }
    } catch (error: any) {
      console.error('Error marking delivered:', error);
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            Xác nhận đã giao hàng
          </DialogTitle>
          <DialogDescription>
            Xác nhận container đã được giao đến buyer thành công
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Delivered Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="deliveredAt" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Thời gian giao hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deliveredAt"
              type="datetime-local"
              value={formData.deliveredAt}
              onChange={(e) => setFormData({ ...formData, deliveredAt: e.target.value })}
              required
              className="border-gray-300"
            />
          </div>

          {/* Received By Name */}
          <div className="space-y-2">
            <Label htmlFor="receivedByName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Người nhận hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="receivedByName"
              value={formData.receivedByName}
              onChange={(e) => setFormData({ ...formData, receivedByName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              required
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Tên người đại diện buyer nhận container
            </p>
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <Label htmlFor="deliveryLocation" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Địa điểm giao hàng
            </Label>
            <Input
              id="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
              placeholder="VD: Depot Cát Lái, TP.HCM"
              className="border-gray-300"
            />
          </div>

          {/* Driver Notes */}
          <div className="space-y-2">
            <Label htmlFor="driverNotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Ghi chú (tùy chọn)
            </Label>
            <Textarea
              id="driverNotes"
              value={formData.driverNotes}
              onChange={(e) => setFormData({ ...formData, driverNotes: e.target.value })}
              placeholder="VD: Hàng đã được giao nguyên vẹn, buyer đã ký nhận..."
              rows={3}
              className="border-gray-300 resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-2">
              <div className="text-green-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Buyer sẽ nhận notification ngay sau khi bạn xác nhận</li>
                  <li>Buyer có 7 ngày để kiểm tra và xác nhận nhận hàng</li>
                  <li>Thanh toán sẽ được giải ngân sau khi buyer xác nhận</li>
                  <li>Nếu có vấn đề, buyer có thể báo cáo trong vòng 7 ngày</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xác nhận...
                </span>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận đã giao hàng
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

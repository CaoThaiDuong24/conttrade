'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, FileText, Calendar, Truck } from 'lucide-react';

interface UpdateDeliveryStatusFormProps {
  isOpen: boolean;
  orderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function UpdateDeliveryStatusForm({ isOpen, orderId, onSuccess, onClose }: UpdateDeliveryStatusFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    checkpoint: '',
    eta: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = '/api/v1';

      const response = await fetch(`${API_URL}/orders/${orderId}/update-delivery-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: formData.location || undefined,
          checkpoint: formData.checkpoint || undefined,
          eta: formData.eta || undefined,
          notes: formData.notes || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        setFormData({ location: '', checkpoint: '', eta: '', notes: '' });
      } else {
        alert(result.message || 'Không thể cập nhật trạng thái vận chuyển');
      }
    } catch (error: any) {
      console.error('Error updating delivery status:', error);
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            Cập nhật trạng thái vận chuyển
          </DialogTitle>
          <DialogDescription>
            Cập nhật vị trí hiện tại và thông tin vận chuyển cho người mua
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Current Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Vị trí hiện tại
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: Đang ở Cảng Cát Lái, TP.HCM"
              className="border-gray-300"
            />
          </div>

          {/* Checkpoint */}
          <div className="space-y-2">
            <Label htmlFor="checkpoint" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Điểm đã qua (Checkpoint)
            </Label>
            <Input
              id="checkpoint"
              value={formData.checkpoint}
              onChange={(e) => setFormData({ ...formData, checkpoint: e.target.value })}
              placeholder="VD: Trạm BOT Quốc lộ 1A"
              className="border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Điểm này sẽ được thêm vào lịch sử hành trình
            </p>
          </div>

          {/* Estimated Delivery */}
          <div className="space-y-2">
            <Label htmlFor="eta" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Cập nhật thời gian dự kiến giao hàng
            </Label>
            <Input
              id="eta"
              type="datetime-local"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
              className="border-gray-300"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Ghi chú
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VD: Container đang được kiểm tra hải quan..."
              rows={3}
              className="border-gray-300 resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Người mua sẽ nhận được thông báo ngay khi bạn cập nhật</li>
                  <li>Tất cả thông tin sẽ được lưu trong lịch sử vận chuyển</li>
                  <li>Có thể cập nhật nhiều lần trong quá trình vận chuyển</li>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </span>
              ) : (
                'Cập nhật trạng thái'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

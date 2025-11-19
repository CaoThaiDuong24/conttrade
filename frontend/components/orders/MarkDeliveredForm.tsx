'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, User, FileText, Calendar, MapPin, Package } from 'lucide-react';

interface Container {
  id: string;
  container_iso_code: string;
  status?: string;
  delivered_at?: string | null;
}

interface MarkDeliveredFormProps {
  isOpen: boolean;
  orderId: string;
  deliveryId?: string;  // Optional: if provided, use deliveries API
  containers?: Container[];  // List of containers to choose from
  singleContainerId?: string;  // If provided, only mark this container (no selection UI)
  markAllMode?: boolean;  // If true, mark all containers in list (show list but no checkboxes)
  onSuccess: () => void;
  onClose: () => void;
}

export function MarkDeliveredForm({ isOpen, orderId, deliveryId, containers, singleContainerId, markAllMode, onSuccess, onClose }: MarkDeliveredFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    deliveredAt: new Date().toISOString().slice(0, 16), // datetime-local format
    receivedByName: '',
    driverNotes: '',
    deliveryLocation: ''
  });

  // Auto-select containers when modal opens
  useEffect(() => {
    if (isOpen) {
      if (singleContainerId) {
        // Single container mode: only select this one
        setSelectedContainerIds([singleContainerId]);
      } else if (markAllMode && containers) {
        // Mark all mode: select all undelivered containers
        const undelivered = containers
          .filter(c => !c.delivered_at)
          .map(c => c.id);
        setSelectedContainerIds(undelivered);
      } else if (containers && containers.length > 0) {
        // Multi-container mode: select all undelivered
        const undelivered = containers
          .filter(c => !c.delivered_at)
          .map(c => c.id);
        setSelectedContainerIds(undelivered);
      }
    }
  }, [isOpen, containers, singleContainerId, markAllMode]);

  const toggleContainer = (containerId: string) => {
    setSelectedContainerIds(prev => 
      prev.includes(containerId)
        ? prev.filter(id => id !== containerId)
        : [...prev, containerId]
    );
  };

  const selectAll = () => {
    if (containers) {
      const undelivered = containers
        .filter(c => !c.delivered_at)
        .map(c => c.id);
      setSelectedContainerIds(undelivered);
    }
  };

  const deselectAll = () => {
    setSelectedContainerIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.receivedByName.trim()) {
      alert('Vui lòng nhập tên người nhận hàng');
      return;
    }

    // Check if using multi-container mode
    if (containers && containers.length > 0 && selectedContainerIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 container để xác nhận giao hàng');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = '/api/v1';

      let response;

      // Use deliveries API if deliveryId is provided and containers are selected
      if (deliveryId && containers && containers.length > 0) {
        response = await fetch(`${API_URL}/deliveries/${deliveryId}/mark-delivered`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            deliveredAt: formData.deliveredAt,
            receivedByName: formData.receivedByName,
            driverNotes: formData.driverNotes || undefined,
            deliveryLocation: formData.deliveryLocation ? { address: formData.deliveryLocation } : undefined,
            containerIds: selectedContainerIds
          })
        });
      } else {
        // Fallback to old orders API for single container orders
        response = await fetch(`${API_URL}/orders/${orderId}/mark-delivered`, {
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
      }

      const result = await response.json();

      if (result.success) {
        onSuccess();
        setFormData({
          deliveredAt: new Date().toISOString().slice(0, 16),
          receivedByName: '',
          driverNotes: '',
          deliveryLocation: ''
        });
        setSelectedContainerIds([]);
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
          {/* Container Selection - Only show if multi-container mode with checkboxes */}
          {!singleContainerId && !markAllMode && containers && containers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  Chọn containers để giao <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs"
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    className="text-xs"
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
                {containers.map((container) => {
                  const isDelivered = !!container.delivered_at;
                  const isSelected = selectedContainerIds.includes(container.id);
                  
                  return (
                    <div
                      key={container.id}
                      className={`flex items-center gap-3 p-2 rounded border ${
                        isDelivered 
                          ? 'bg-green-50 border-green-200 opacity-60' 
                          : isSelected
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Checkbox
                        id={`container-${container.id}`}
                        checked={isSelected}
                        disabled={isDelivered}
                        onCheckedChange={() => !isDelivered && toggleContainer(container.id)}
                      />
                      <label
                        htmlFor={`container-${container.id}`}
                        className={`flex-1 text-sm font-medium cursor-pointer ${
                          isDelivered ? 'text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {container.container_iso_code}
                        {isDelivered && (
                          <span className="ml-2 text-xs text-green-600">
                            ✅ Đã giao {new Date(container.delivered_at!).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500">
                Đã chọn: {selectedContainerIds.length}/{containers.filter(c => !c.delivered_at).length} container chưa giao
              </p>
            </div>
          )}

          {/* Single Container Info - Show when single container mode */}
          {singleContainerId && containers && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Container</p>
                  <p className="text-lg font-bold text-blue-700">
                    {containers.find(c => c.id === singleContainerId)?.container_iso_code || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mark All Mode - Show list of containers without checkboxes */}
          {markAllMode && containers && containers.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-600" />
                Containers sẽ được giao ({containers.filter(c => !c.delivered_at).length})
              </Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
                {containers
                  .filter(c => !c.delivered_at)
                  .map((container) => (
                    <div
                      key={container.id}
                      className="flex items-center gap-3 p-2 rounded border bg-blue-50 border-blue-300"
                    >
                      <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {container.container_iso_code}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">Sẽ giao</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

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

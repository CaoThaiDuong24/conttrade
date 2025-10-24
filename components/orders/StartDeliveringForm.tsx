'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Truck, Calendar, FileText, User, MapPin, Phone, Hash, Upload } from 'lucide-react';

interface StartDeliveringFormProps {
  isOpen: boolean;
  orderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function StartDeliveringForm({ isOpen, orderId, onSuccess, onClose }: StartDeliveringFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    carrierName: '',
    trackingNumber: '',
    estimatedDeliveryDate: '',
    estimatedDeliveryTime: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    transportMethod: 'truck',
    route: '',
    notes: '',
    billOfLading: null as File | null,
    loadingPhotos: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

      // Combine date and time for estimatedDelivery
      let estimatedDelivery = undefined;
      if (formData.estimatedDeliveryDate) {
        estimatedDelivery = formData.estimatedDeliveryDate;
        if (formData.estimatedDeliveryTime) {
          estimatedDelivery += `T${formData.estimatedDeliveryTime}`;
        }
      }

      const driverInfo = {
        name: formData.driverName,
        phone: formData.driverPhone,
        vehicleNumber: formData.vehicleNumber
      };

      // TODO: File upload sẽ được implement sau khi backend hỗ trợ multipart/form-data
      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/start-delivering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carrierName: formData.carrierName,
          trackingNumber: formData.trackingNumber,
          estimatedDeliveryDate: estimatedDelivery,
          driverInfo: driverInfo,
          transportMethod: formData.transportMethod,
          route: formData.route,
          notes: formData.notes
          // billOfLading và loadingPhotos sẽ được upload sau
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || 'Không thể bắt đầu vận chuyển');
      }
    } catch (error: any) {
      console.error('Error starting delivery:', error);
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden border-none shadow-2xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center shadow-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  Bắt đầu vận chuyển
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 text-sm">
                  Nhập thông tin carrier và lộ trình để bắt đầu giao hàng cho buyer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Carrier Information */}
            <div className="bg-gradient-to-br from-orange-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thông tin Carrier</h3>
                  <p className="text-xs text-gray-500">Công ty vận chuyển và mã vận đơn</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100/50 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="carrierName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      Tên công ty vận chuyển <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="carrierName"
                      value={formData.carrierName}
                      onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
                      placeholder="VD: ViettelPost, GHTK..."
                      required
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5" />
                      Mã vận đơn
                    </Label>
                    <Input
                      id="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="VD: VTP123456789"
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDeliveryDate" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Ngày giao dự kiến
                    </Label>
                    <Input
                      id="estimatedDeliveryDate"
                      type="date"
                      value={formData.estimatedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDeliveryTime" className="text-sm font-medium text-gray-700">
                      Giờ giao dự kiến
                    </Label>
                    <Input
                      id="estimatedDeliveryTime"
                      type="time"
                      value={formData.estimatedDeliveryTime}
                      onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: e.target.value })}
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thông tin Tài xế</h3>
                  <p className="text-xs text-gray-500">Người lái xe và phương tiện</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="driverName" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Tên tài xế
                    </Label>
                    <Input
                      id="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverPhone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="driverPhone"
                      type="tel"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      placeholder="0912345678"
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Biển số xe
                  </Label>
                  <Input
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    placeholder="VD: 51A-12345"
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thông tin bổ sung</h3>
                  <p className="text-xs text-gray-500">Lộ trình, ghi chú và tài liệu</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transportMethod" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Phương thức vận chuyển
                  </Label>
                  <select
                    id="transportMethod"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={formData.transportMethod}
                    onChange={(e) => setFormData({ ...formData, transportMethod: e.target.value })}
                  >
                    <option value="truck">Xe tải</option>
                    <option value="container_truck">Xe container</option>
                    <option value="flatbed">Xe sàn</option>
                    <option value="crane_truck">Xe cẩu</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Lộ trình (tùy chọn)
                  </Label>
                  <Textarea
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="VD: Depot Cát Lái → Quốc lộ 1A → Bình Dương"
                    rows={2}
                    className="border-gray-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Thông tin thêm về vận chuyển..."
                    rows={2}
                    className="border-gray-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billOfLading" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    Vận đơn / Bill of Lading (tùy chọn)
                  </Label>
                  <Input
                    id="billOfLading"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({ ...formData, billOfLading: file });
                    }}
                    className="cursor-pointer border-gray-200"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loadingPhotos" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    Ảnh lúc xếp hàng (tùy chọn)
                  </Label>
                  <Input
                    id="loadingPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({ ...formData, loadingPhotos: files });
                    }}
                    className="cursor-pointer border-gray-200"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Có thể chọn nhiều ảnh (Max 5MB mỗi ảnh)
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Bắt đầu vận chuyển
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

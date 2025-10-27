import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, Package, Calendar, FileText, MapPin, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

export default function ShipOrderModal({ isOpen, onClose, orderId, onSuccess }: ShipOrderModalProps) {
  const { user } = useAuth();
  const t = useTranslations('workflow.prepareDelivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Container preparation checklist
    containerChecked: false,
    documentsPrepared: false,
    logisticsArranged: false,
    
    // Delivery information
    deliveryMethod: 'depot_pickup', // depot_pickup, direct_delivery, third_party
    depotLocation: '',
    deliveryAddress: '',
    deliveryContact: '',
    deliveryPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    
    // Driver information
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    needsCrane: false,
    
    // Documents
    deliveryOrder: '', // D/O or EDO number
    inspectionReport: '',
    
    // Notes
    specialInstructions: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.containerChecked || !formData.documentsPrepared || !formData.logisticsArranged) {
        setError('Vui lòng hoàn thành tất cả các bước chuẩn bị bắt buộc');
        return;
      }

      if (formData.deliveryMethod === 'depot_pickup' && !formData.depotLocation) {
        setError('Vui lòng nhập địa điểm depot');
        return;
      }

      if (formData.deliveryMethod === 'direct_delivery' && (!formData.deliveryAddress || !formData.deliveryContact || !formData.deliveryPhone)) {
        setError('Vui lòng nhập đầy đủ thông tin giao hàng');
        return;
      }

      if (!formData.deliveryDate || !formData.deliveryTime) {
        setError('Vui lòng chọn ngày và giờ giao hàng');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }

      // Step 1: Create delivery record using API-G01: POST /api/v1/deliveries
      const deliveryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          address: formData.deliveryAddress || formData.depotLocation,
          schedule_at: `${formData.deliveryDate}T${formData.deliveryTime}:00`,
          requirements: {
            deliveryMethod: formData.deliveryMethod,
            deliveryContact: formData.deliveryContact,
            deliveryPhone: formData.deliveryPhone,
            driverName: formData.driverName,
            driverPhone: formData.driverPhone,
            vehicleNumber: formData.vehicleNumber,
            needsCrane: formData.needsCrane,
            specialInstructions: formData.specialInstructions,
            notes: formData.notes,
            containerChecked: formData.containerChecked,
            documentsPrepared: formData.documentsPrepared,
            logisticsArranged: formData.logisticsArranged,
            deliveryOrder: formData.deliveryOrder,
            inspectionReport: formData.inspectionReport
          }
        })
      });

      const deliveryData = await deliveryResponse.json();

      if (!deliveryData.success) {
        setError(deliveryData.message || 'Không thể tạo delivery record');
        return;
      }

      // Step 2: Update order status using API-F03: PUT /api/v1/orders/:id/status
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'PREPARING_DELIVERY' // Must match OrderStatus enum (UPPERCASE)
        })
      });

      const statusData = await statusResponse.json();

      if (!statusData.success) {
        setError(statusData.message || 'Không thể cập nhật trạng thái đơn hàng');
        toast.error('Lỗi cập nhật trạng thái', {
          description: statusData.message || 'Không thể cập nhật trạng thái đơn hàng'
        });
        return;
      }

      // Both API calls successful - Show success notification
      toast.success('Chuẩn bị giao hàng thành công!', {
        description: 'Đơn hàng đã được cập nhật sang trạng thái "Đang chuẩn bị giao hàng". Buyer sẽ nhận được thông báo.',
        duration: 5000
      });
      
      // Call onSuccess callback to refresh data
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        containerChecked: false,
        documentsPrepared: false,
        logisticsArranged: false,
        deliveryMethod: 'depot_pickup',
        depotLocation: '',
        deliveryAddress: '',
        deliveryContact: '',
        deliveryPhone: '',
        deliveryDate: '',
        deliveryTime: '',
        driverName: '',
        driverPhone: '',
        vehicleNumber: '',
        needsCrane: false,
        deliveryOrder: '',
        inspectionReport: '',
        specialInstructions: '',
        notes: ''
      });
    } catch (err: any) {
      console.error('Prepare delivery error:', err);
      setError('Có lỗi xảy ra khi chuẩn bị giao hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Chuẩn bị giao hàng Container
          </DialogTitle>
          <DialogDescription>
            Hoàn thành các bước chuẩn bị để giao container cho khách hàng. Thông tin này sẽ được gửi đến buyer để theo dõi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Preparation Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Checklist chuẩn bị bắt buộc
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="containerChecked"
                  checked={formData.containerChecked}
                  onCheckedChange={(checked) => handleInputChange('containerChecked', checked)}
                />
                <Label htmlFor="containerChecked" className="text-sm">
                  Kiểm tra container theo commit (tình trạng, kích thước, loại)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="documentsPrepared"
                  checked={formData.documentsPrepared}
                  onCheckedChange={(checked) => handleInputChange('documentsPrepared', checked)}
                />
                <Label htmlFor="documentsPrepared" className="text-sm">
                  Chuẩn bị giấy tờ (CSC Plate, Data Plate, kiểm định)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="logisticsArranged"
                  checked={formData.logisticsArranged}
                  onCheckedChange={(checked) => handleInputChange('logisticsArranged', checked)}
                />
                <Label htmlFor="logisticsArranged" className="text-sm">
                  Sắp xếp logistics và thông báo lịch giao cho buyer
                </Label>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Phương thức giao hàng</Label>
            <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange('deliveryMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức giao hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="depot_pickup">Nhận tại Depot</SelectItem>
                <SelectItem value="direct_delivery">Giao hàng trực tiếp</SelectItem>
                <SelectItem value="third_party">Đối tác vận chuyển</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Depot Location */}
          {formData.deliveryMethod === 'depot_pickup' && (
            <div className="space-y-2">
              <Label htmlFor="depotLocation" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa điểm Depot *
              </Label>
              <Input
                id="depotLocation"
                value={formData.depotLocation}
                onChange={(e) => handleInputChange('depotLocation', e.target.value)}
                placeholder="VD: Depot ABC, Quận 7, TP.HCM"
                required
              />
            </div>
          )}

          {/* Direct Delivery Information */}
          {formData.deliveryMethod === 'direct_delivery' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Thông tin giao hàng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ giao hàng *
                  </Label>
                  <Input
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                    placeholder="Địa chỉ chi tiết"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryContact" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Người nhận *
                  </Label>
                  <Input
                    id="deliveryContact"
                    value={formData.deliveryContact}
                    onChange={(e) => handleInputChange('deliveryContact', e.target.value)}
                    placeholder="Tên người nhận"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại người nhận *
                </Label>
                <Input
                  id="deliveryPhone"
                  value={formData.deliveryPhone}
                  onChange={(e) => handleInputChange('deliveryPhone', e.target.value)}
                  placeholder="Số điện thoại"
                  required
                />
              </div>
            </div>
          )}

          {/* Delivery Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày giao hàng *
              </Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Giờ giao hàng *</Label>
              <Select value={formData.deliveryTime} onValueChange={(value) => handleInputChange('deliveryTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00 - 10:00</SelectItem>
                  <SelectItem value="10:00">10:00 - 12:00</SelectItem>
                  <SelectItem value="13:00">13:00 - 15:00</SelectItem>
                  <SelectItem value="15:00">15:00 - 17:00</SelectItem>
                  <SelectItem value="17:00">17:00 - 19:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Driver Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Thông tin tài xế</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Tên tài xế</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  placeholder="Tên tài xế"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">Số điện thoại</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) => handleInputChange('driverPhone', e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Biển số xe</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                  placeholder="Biển số xe"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Chứng từ</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryOrder" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lệnh giao hàng (D/O hoặc EDO)
                </Label>
                <Input
                  id="deliveryOrder"
                  value={formData.deliveryOrder}
                  onChange={(e) => handleInputChange('deliveryOrder', e.target.value)}
                  placeholder="Mã D/O hoặc EDO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspectionReport">Báo cáo kiểm định</Label>
                <Input
                  id="inspectionReport"
                  value={formData.inspectionReport}
                  onChange={(e) => handleInputChange('inspectionReport', e.target.value)}
                  placeholder="Mã báo cáo kiểm định"
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Hướng dẫn đặc biệt
            </Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Hướng dẫn đặc biệt cho việc giao hàng..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ghi chú bổ sung
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ghi chú khác về việc giao hàng..."
              rows={2}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Lưu ý quan trọng:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Đảm bảo container được kiểm tra kỹ lưỡng trước khi giao</li>
              <li>• Chuẩn bị đầy đủ chứng từ cần thiết (CSC, Data Plate, kiểm định)</li>
              <li>• Thông báo chính xác thời gian và địa điểm giao hàng cho buyer</li>
              <li>• Lập EIR (Equipment Interchange Receipt) khi giao container</li>
              <li>• Thanh toán sẽ được giải ngân sau khi buyer xác nhận nhận hàng</li>
            </ul>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang chuẩn bị...
                </div>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Xác nhận chuẩn bị giao hàng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
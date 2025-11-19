import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Package, Calendar, MapPin, User, Phone, AlertCircle, CheckCircle, CheckCircle2, Info, Loader2, DollarSign, Building2, Clock, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import { toast } from 'sonner';

interface Container {
  id: string;
  container_iso_code: string;
  shipping_line?: string;
  manufactured_year?: number;
  delivery_status?: string;
  size?: string;
  type?: string;
}

interface ScheduleDeliveryBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  availableContainers: Container[];
  onSuccess?: () => void;
}

export default function ScheduleDeliveryBatchModal({
  isOpen,
  onClose,
  orderId,
  availableContainers,
  onSuccess
}: ScheduleDeliveryBatchModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [sellerPreparation, setSellerPreparation] = useState<any>(null); // ✅ Thông tin chuẩn bị từ seller
  
  const [deliveryMethod, setDeliveryMethod] = useState<'self_pickup' | 'logistics' | 'seller_delivers'>('logistics');
  const [logisticsCompany, setLogisticsCompany] = useState('');
  
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    deliveryDistrict: '',
    deliveryContact: '',
    deliveryPhone: '',
    deliveryEmail: '',
    deliveryDate: '',
    deliveryTime: '',
    needsCrane: false,
    specialInstructions: '',
    transportationFee: 0
  });

  // Memoize fetch function to prevent infinite loop
  const fetchDeliverySchedule = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/v1/orders/${orderId}/delivery-schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        const scheduled = result.data.summary.scheduled || 0;
        const inTransit = result.data.summary.inTransit || 0;
        const delivered = result.data.summary.delivered || 0;
        const existing = scheduled + inTransit + delivered;
        const remaining = result.data.totalContainers - existing;

        setBatchInfo({
          nextBatchNumber: result.data.deliveryBatches.length + 1,
          totalScheduled: existing,
          remaining: remaining,
          totalContainers: result.data.totalContainers
        });

        // ✅ Lưu thông tin chuẩn bị từ seller
        if (result.data.sellerPreparation) {
          setSellerPreparation(result.data.sellerPreparation);
        }
      }
    } catch (err) {
      console.error('Error fetching delivery schedule:', err);
    }
  }, [orderId]);

  // Fetch existing delivery info to calculate batch number
  useEffect(() => {
    if (isOpen && orderId) {
      fetchDeliverySchedule();
    }
  }, [isOpen, orderId, fetchDeliverySchedule]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedContainerIds([]);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Filter containers that are available for scheduling - Memoize to prevent infinite loop
  const availableForScheduling = useMemo(() => {
    return availableContainers.filter(c => 
      !c.delivery_status || 
      c.delivery_status === 'PENDING_PICKUP' || 
      c.delivery_status === 'AVAILABLE'
    );
  }, [availableContainers]);

  const handleInputChange = useCallback((field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleContainerToggle = useCallback((containerId: string) => {
    setSelectedContainerIds(prev => {
      if (prev.includes(containerId)) {
        return prev.filter(id => id !== containerId);
      } else {
        return [...prev, containerId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedContainerIds.length === availableForScheduling.length) {
      setSelectedContainerIds([]);
    } else {
      setSelectedContainerIds(availableForScheduling.map(c => c.id));
    }
  }, [selectedContainerIds.length, availableForScheduling]);

  // Create stable container IDs array to prevent re-renders
  const availableContainerIds = useMemo(() => 
    availableForScheduling.map(c => c.id), 
    [availableForScheduling]
  );

  const calculateTransportationFee = () => {
    // Phí vận chuyển dựa trên khoảng cách và yêu cầu
    let baseFee = 500000; // 500k VND phí cơ bản
    
    // Self pickup - miễn phí vận chuyển
    if (deliveryMethod === 'self_pickup') {
      baseFee = 0;
    }
    
    if (formData.needsCrane) {
      baseFee += 1000000; // +1M cho cần cẩu
    }
    
    // Phí theo khu vực (chỉ khi dùng logistics)
    if (deliveryMethod === 'logistics') {
      const address = formData.deliveryAddress.toLowerCase();
      const city = formData.deliveryCity.toLowerCase();
      
      if (city.includes('hồ chí minh') || city.includes('tp.hcm') || address.includes('hồ chí minh')) {
        baseFee += 200000; // +200k cho TP.HCM
      } else if (city.includes('hà nội') || address.includes('hà nội')) {
        baseFee += 250000; // +250k cho Hà Nội
      } else {
        baseFee += 500000; // +500k cho tỉnh khác
      }
    }
    
    // Phí cho số lượng container (nhiều container tính gộp)
    const containerCount = selectedContainerIds.length;
    if (containerCount > 1) {
      baseFee = baseFee * containerCount * 0.8; // Giảm 20% khi giao hàng loạt
    }
    
    return baseFee;
  };

  const getMinDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (selectedContainerIds.length === 0) {
        setError('Vui lòng chọn ít nhất 1 container');
        setLoading(false);
        return;
      }

      // Validate theo delivery method
      if (deliveryMethod === 'logistics') {
        if (!formData.deliveryAddress || !formData.deliveryCity) {
          setError('Vui lòng nhập đầy đủ địa chỉ giao hàng');
          setLoading(false);
          return;
        }

        if (!formData.deliveryContact || !formData.deliveryPhone) {
          setError('Vui lòng nhập thông tin người nhận');
          setLoading(false);
          return;
        }

        if (!logisticsCompany) {
          setError('Vui lòng chọn công ty vận chuyển');
          setLoading(false);
          return;
        }
      }

      if (!formData.deliveryDate || !formData.deliveryTime) {
        setError('Vui lòng chọn ngày và giờ ' + (deliveryMethod === 'self_pickup' ? 'đến lấy hàng' : 'giao hàng'));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        setLoading(false);
        return;
      }

      const transportationFee = calculateTransportationFee();

      // Combine address fields
      const fullAddress = deliveryMethod === 'self_pickup' 
        ? 'Tự đến lấy tại depot'
        : `${formData.deliveryAddress}${formData.deliveryDistrict ? ', ' + formData.deliveryDistrict : ''}, ${formData.deliveryCity}`;

      // 🔍 Debug logging
      console.log('📦 Schedule Delivery Payload:', {
        orderId,
        selectedContainerIds,
        containerCount: selectedContainerIds.length,
        deliveryAddress: fullAddress,
        deliveryDate: formData.deliveryDate,
        deliveryMethod,
        logisticsCompany
      });

      // Call schedule-delivery-batch API
      const response = await fetch(`/api/v1/orders/${orderId}/schedule-delivery-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          containerIds: selectedContainerIds,
          deliveryAddress: fullAddress,
          deliveryContact: formData.deliveryContact || user?.fullName || 'N/A',
          deliveryPhone: formData.deliveryPhone || 'N/A',
          deliveryDate: formData.deliveryDate,
          deliveryTime: formData.deliveryTime,
          needsCrane: formData.needsCrane,
          specialInstructions: formData.specialInstructions,
          transportationFee,
          deliveryMethod,
          logisticsCompany: deliveryMethod === 'logistics' ? logisticsCompany : null
        })
      });

      const result = await response.json();

      console.log('📨 API Response:', {
        status: response.status,
        statusText: response.statusText,
        result
      });

      if (!result.success) {
        console.error('❌ API Error:', result);
        setError(result.message || 'Không thể lên lịch giao hàng');
        toast.error('Lỗi', {
          description: result.message || 'Không thể lên lịch giao hàng'
        });
        setLoading(false);
        return;
      }

      // Success
      const batchNum = result.data.delivery.batchNumber;
      const totalBatches = result.data.delivery.totalBatches;
      
      toast.success(
        deliveryMethod === 'self_pickup' 
          ? `Đã đăng ký lịch đến lấy Batch ${batchNum}/${totalBatches}!`
          : `Đã lên lịch giao Batch ${batchNum}/${totalBatches} thành công!`, 
        {
          description: deliveryMethod === 'self_pickup'
            ? `${result.data.containers.length} containers - Vui lòng đến depot đúng giờ đã chọn`
            : `${result.data.containers.length} containers sẽ được giao vào ${new Date(formData.deliveryDate).toLocaleDateString('vi-VN')}`,
          duration: 5000
        }
      );

      // Reset and close
      setSelectedContainerIds([]);
      setFormData({
        deliveryAddress: '',
        deliveryCity: '',
        deliveryDistrict: '',
        deliveryContact: '',
        deliveryPhone: '',
        deliveryEmail: '',
        deliveryDate: '',
        deliveryTime: '',
        needsCrane: false,
        specialInstructions: '',
        transportationFee: 0
      });
      setDeliveryMethod('logistics');
      setLogisticsCompany('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Schedule delivery batch error:', err);
      setError('Có lỗi xảy ra khi lên lịch giao hàng');
      toast.error('Lỗi', {
        description: 'Có lỗi xảy ra khi lên lịch giao hàng'
      });
    } finally {
      setLoading(false);
    }
  };

  // Early return if modal is not open - prevents unnecessary rendering
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden border-none shadow-2xl p-0">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  Lên lịch giao hàng từng đợt (Batch)
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 text-sm">
                  Chọn containers để giao trong đợt này. Bạn có thể tạo nhiều đợt giao hàng khác nhau.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Batch Info Summary */}
            {batchInfo && (
              <Card className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-purple-50 border-indigo-200 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-800">
                        Đợt giao hàng {batchInfo.nextBatchNumber}
                      </span>
                    </div>
                    <div className="text-sm text-indigo-700">
                      Đã lên lịch: {batchInfo.totalScheduled}/{batchInfo.totalContainers} containers
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-indigo-600">
                    Còn lại {batchInfo.remaining} containers chưa lên lịch
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ✅ THÔNG TIN CHUẨN BỊ TỪ SELLER */}
            {sellerPreparation && (
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-300 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-green-900">
                        ✅ Người bán đã chuẩn bị hàng xong
                      </h3>
                      <p className="text-xs text-green-700 mt-0.5">
                        Container đã sẵn sàng và có thể lấy hàng
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-green-200">
                    {/* Địa điểm pickup */}
                    {sellerPreparation.pickupLocation && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            📍 Địa điểm lấy hàng
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {sellerPreparation.pickupLocation.address || 'Chưa có thông tin'}
                          </p>
                          {sellerPreparation.pickupLocation.city && (
                            <p className="text-sm text-gray-600 mt-1">
                              {sellerPreparation.pickupLocation.city}
                              {sellerPreparation.pickupLocation.country && `, ${sellerPreparation.pickupLocation.country}`}
                            </p>
                          )}
                          {(sellerPreparation.pickupLocation.lat && sellerPreparation.pickupLocation.lng) && (
                            <p className="text-xs text-blue-600 mt-1 font-mono">
                              📌 {sellerPreparation.pickupLocation.lat}, {sellerPreparation.pickupLocation.lng}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Người liên hệ */}
                    {(sellerPreparation.pickupContact?.name || sellerPreparation.pickupContact?.phone) && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                        <User className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            👤 Người liên hệ tại depot
                          </p>
                          {sellerPreparation.pickupContact.name && (
                            <p className="text-sm font-medium text-gray-900">
                              {sellerPreparation.pickupContact.name}
                            </p>
                          )}
                          {sellerPreparation.pickupContact.phone && (
                            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              <a href={`tel:${sellerPreparation.pickupContact.phone}`} className="hover:text-green-600 font-medium">
                                {sellerPreparation.pickupContact.phone}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Khung giờ có thể lấy */}
                    {(sellerPreparation.pickupTimeWindow?.from || sellerPreparation.pickupTimeWindow?.to) && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                        <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            ⏰ Khung giờ có thể lấy hàng
                          </p>
                          <div className="space-y-1">
                            {sellerPreparation.pickupTimeWindow.from && (
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">Từ:</span>{' '}
                                {new Date(sellerPreparation.pickupTimeWindow.from).toLocaleString('vi-VN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </p>
                            )}
                            {sellerPreparation.pickupTimeWindow.to && (
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">Đến:</span>{' '}
                                {new Date(sellerPreparation.pickupTimeWindow.to).toLocaleString('vi-VN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ghi chú từ seller */}
                    {sellerPreparation.pickupInstructions && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                            💬 Hướng dẫn từ người bán
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {sellerPreparation.pickupInstructions}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Completion Date */}
                    {sellerPreparation.completedAt && (
                      <div className="text-center pt-2 border-t border-green-200">
                        <p className="text-xs text-green-700">
                          ✅ Hoàn tất chuẩn bị: {new Date(sellerPreparation.completedAt).toLocaleString('vi-VN', {
                            dateStyle: 'full',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Container Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-gray-900">
                  Chọn containers cho đợt này ({selectedContainerIds.length}/{availableForScheduling.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  {selectedContainerIds.length === availableForScheduling.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 bg-gray-50">
                {availableForScheduling.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Không có container nào khả dụng để lên lịch</p>
                  </div>
                ) : (
                  availableForScheduling.map((container) => {
                    const isSelected = selectedContainerIds.includes(container.id);
                    return (
                      <div
                        key={container.id}
                        className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                        onClick={() => handleContainerToggle(container.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleContainerToggle(container.id)}
                            />
                          </div>
                          <Package className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-semibold text-gray-900">{container.container_iso_code}</div>
                            <div className="text-sm text-gray-500">
                              {container.size} {container.type}
                              {container.shipping_line && ` • ${container.shipping_line}`}
                              {container.manufactured_year && ` • ${container.manufactured_year}`}
                            </div>
                          </div>
                        </div>
                        {container.delivery_status && (
                          <Badge variant="outline" className="text-xs">
                            {container.delivery_status}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Phương thức nhận hàng */}
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Phương thức nhận hàng</h3>
                  <p className="text-xs text-gray-500">Chọn cách thức phù hợp nhất với bạn</p>
                </div>
                <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Bắt buộc *</span>
              </div>
              <RadioGroup 
                value={deliveryMethod} 
                onValueChange={(value) => setDeliveryMethod(value as 'self_pickup' | 'logistics' | 'seller_delivers')} 
                className="space-y-3"
              >
                  {/* Self Pickup */}
                  <label className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'self_pickup' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value="self_pickup" id="self_pickup" className="shrink-0" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                      deliveryMethod === 'self_pickup' ? 'bg-green-100 shadow-sm' : 'bg-gray-50'
                    }`}>
                      🚶
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-0.5">Tự đến lấy hàng</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-semibold text-green-600">Miễn phí</span>
                          <span>•</span>
                          <span>Đến depot lấy container</span>
                        </span>
                      </p>
                    </div>
                    {deliveryMethod === 'self_pickup' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Logistics */}
                  <label className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'logistics' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value="logistics" id="logistics" className="shrink-0" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                      deliveryMethod === 'logistics' ? 'bg-blue-100 shadow-sm' : 'bg-gray-50'
                    }`}>
                      🚛
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-0.5">Thuê công ty vận chuyển</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-semibold text-blue-600">Có phí</span>
                          <span>•</span>
                          <span>Logistics đến lấy và giao tận nơi</span>
                        </span>
                      </p>
                    </div>
                    {deliveryMethod === 'logistics' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Seller Delivers */}
                  <label className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'seller_delivers' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value="seller_delivers" id="seller_delivers" className="shrink-0" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                      deliveryMethod === 'seller_delivers' ? 'bg-purple-100 shadow-sm' : 'bg-gray-50'
                    }`}>
                      🤝
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-0.5">Người bán giao hàng</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-semibold text-purple-600">Thương lượng</span>
                          <span>•</span>
                          <span>Seller tự vận chuyển đến địa chỉ của bạn</span>
                        </span>
                      </p>
                    </div>
                    {deliveryMethod === 'seller_delivers' && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>
                </RadioGroup>
            </div>

            {/* Công ty vận chuyển (chỉ hiện khi chọn logistics) */}
            {deliveryMethod === 'logistics' && (
              <div className="space-y-4 bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200 shadow-sm">
                <Label className="text-base font-semibold flex items-center gap-2 text-amber-900">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-amber-700" />
                  </div>
                  <span>Công ty vận chuyển</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="bg-white p-4 rounded-lg border border-amber-100">
                  <Select value={logisticsCompany} onValueChange={setLogisticsCompany}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn công ty vận chuyển" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viettel_post">🟢 Viettel Post - Uy tín, giao nhanh</SelectItem>
                      <SelectItem value="ghn">🔵 Giao Hàng Nhanh (GHN)</SelectItem>
                      <SelectItem value="vnpost">🟡 VNPost - Bưu điện Việt Nam</SelectItem>
                      <SelectItem value="j_t">🔴 J&T Express</SelectItem>
                      <SelectItem value="shopee">🟠 SPX - Shopee Express</SelectItem>
                      <SelectItem value="ninja_van">⚫ Ninja Van</SelectItem>
                      <SelectItem value="best_express">🟣 Best Express</SelectItem>
                      <SelectItem value="other">⚪ Khác (ghi rõ trong ghi chú)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Địa chỉ giao hàng - Chỉ hiện khi không phải tự lấy */}
            {deliveryMethod !== 'self_pickup' && (
              <div className="space-y-4 bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                <Label className="text-base font-semibold flex items-center gap-2 text-green-900">
                  <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-700" />
                  </div>
                  <span>Địa chỉ giao hàng</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="space-y-4 bg-white p-4 rounded-lg border border-green-100">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="text-sm font-medium">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity" className="text-sm font-medium">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deliveryCity"
                        value={formData.deliveryCity}
                        onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                        placeholder="VD: TP.Hồ Chí Minh"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDistrict" className="text-sm font-medium">
                        Quận/Huyện
                      </Label>
                      <Input
                        id="deliveryDistrict"
                        value={formData.deliveryDistrict}
                        onChange={(e) => handleInputChange('deliveryDistrict', e.target.value)}
                        placeholder="VD: Quận 1"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Người nhận - Chỉ hiện khi không phải tự lấy */}
            {deliveryMethod !== 'self_pickup' && (
              <div className="space-y-4 bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm">
                <Label className="text-base font-semibold flex items-center gap-2 text-purple-900">
                  <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-700" />
                  </div>
                  <span>Thông tin người nhận</span>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="space-y-4 bg-white p-4 rounded-lg border border-purple-100">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryContact" className="text-sm font-medium">
                      Họ tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deliveryContact"
                      value={formData.deliveryContact}
                      onChange={(e) => handleInputChange('deliveryContact', e.target.value)}
                      placeholder="Tên người nhận hàng"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryPhone" className="text-sm font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deliveryPhone"
                      value={formData.deliveryPhone}
                      onChange={(e) => handleInputChange('deliveryPhone', e.target.value)}
                      placeholder="0901234567"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryEmail" className="text-sm font-medium">
                    Email (tùy chọn)
                  </Label>
                  <Input
                    id="deliveryEmail"
                    type="email"
                    value={formData.deliveryEmail}
                    onChange={(e) => handleInputChange('deliveryEmail', e.target.value)}
                    placeholder="email@example.com"
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Ngày giờ giao hàng */}
            <div className="space-y-4 bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm">
              <Label className="text-base font-semibold flex items-center gap-2 text-orange-900">
                <div className="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-700" />
                </div>
                <span>{deliveryMethod === 'self_pickup' ? 'Lịch đến lấy hàng' : 'Lịch giao hàng'}</span>
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="space-y-4 bg-white p-4 rounded-lg border border-orange-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate" className="text-sm font-medium">
                      {deliveryMethod === 'self_pickup' ? 'Ngày đến lấy' : 'Ngày giao hàng'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      min={getMinDate()}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime" className="text-sm font-medium">
                      Khung giờ <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.deliveryTime} onValueChange={(value) => handleInputChange('deliveryTime', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn khung giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">🌅 08:00 - 10:00 (Sáng sớm)</SelectItem>
                        <SelectItem value="10:00">☀️ 10:00 - 12:00 (Buổi sáng)</SelectItem>
                        <SelectItem value="13:00">🌤️ 13:00 - 15:00 (Đầu chiều)</SelectItem>
                        <SelectItem value="15:00">⛅ 15:00 - 17:00 (Chiều)</SelectItem>
                        <SelectItem value="17:00">🌆 17:00 - 19:00 (Chiều tối)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Yêu cầu đặc biệt */}
            <div className="space-y-4 bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border border-yellow-200 shadow-sm">
              <Label className="text-base font-semibold flex items-center gap-2 text-yellow-900">
                <div className="w-8 h-8 rounded-lg bg-yellow-200 flex items-center justify-center">
                  <Package className="h-4 w-4 text-yellow-700" />
                </div>
                <span>Yêu cầu đặc biệt</span>
              </Label>
              <div className="space-y-4 bg-white p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors">
                  <Checkbox
                    id="needsCrane"
                    checked={formData.needsCrane}
                    onCheckedChange={(checked) => handleInputChange('needsCrane', checked)}
                    className="h-5 w-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <Label htmlFor="needsCrane" className="text-sm font-medium cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>🏗️ Cần cẩu để bốc xếp container</span>
                      <span className="text-amber-700 font-bold">+1,000,000₫</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Dịch vụ cẩu chuyên dụng để nâng container xuống vị trí mong muốn
                    </p>
                  </Label>
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions" className="text-sm font-medium">
                    Hướng dẫn đặc biệt
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="VD: Cần thông báo trước 30 phút khi đến, địa chỉ khó tìm cần hướng dẫn chi tiết..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Phí vận chuyển */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-700" />
                </div>
                <h4 className="font-bold text-blue-900">Chi tiết phí vận chuyển</h4>
              </div>
              <div className="space-y-3 text-sm bg-white p-4 rounded-lg border border-blue-100">
                {deliveryMethod === 'self_pickup' ? (
                  <div className="text-center py-4">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="font-bold text-green-600 text-lg">MIỄN PHÍ VẬN CHUYỂN</p>
                    <p className="text-sm text-gray-600 mt-1">Bạn tự đến depot lấy hàng</p>
                  </div>
                ) : (
                  <>
                    {deliveryMethod === 'logistics' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">💰 Phí cơ bản (Container):</span>
                          <span className="font-semibold">500,000₫</span>
                        </div>
                        {formData.needsCrane && (
                          <div className="flex justify-between items-center text-amber-700">
                            <span>🏗️ Phí cẩu bốc xếp:</span>
                            <span className="font-semibold">+1,000,000₫</span>
                          </div>
                        )}
                        {formData.deliveryCity && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">🚚 Phí vận chuyển:</span>
                            <span className="font-semibold">
                              {formData.deliveryCity.toLowerCase().includes('hồ chí minh') || 
                               formData.deliveryCity.toLowerCase().includes('tp.hcm')
                                ? '+200,000₫ (TP.HCM)'
                                : formData.deliveryCity.toLowerCase().includes('hà nội')
                                ? '+250,000₫ (Hà Nội)'
                                : '+500,000₫ (Tỉnh khác)'}
                            </span>
                          </div>
                        )}
                        {selectedContainerIds.length > 1 && (
                          <div className="flex justify-between items-center text-green-700">
                            <span>🎁 Giảm giá giao loạt ({selectedContainerIds.length} containers):</span>
                            <span className="font-semibold">-20%</span>
                          </div>
                        )}
                      </>
                    )}
                    {deliveryMethod === 'seller_delivers' && (
                      <div className="text-center py-2">
                        <p className="text-purple-700 font-medium">💬 Phí vận chuyển do Seller tự quyết định</p>
                        <p className="text-sm text-gray-600 mt-1">Vui lòng liên hệ seller để thỏa thuận chi tiết</p>
                      </div>
                    )}
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                      <span className="font-bold text-blue-900 text-base">💵 Tổng cộng:</span>
                      <span className="font-bold text-blue-900 text-xl">
                        {calculateTransportationFee().toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lưu ý quan trọng */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 mb-3">📋 Lưu ý quan trọng</h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    {deliveryMethod === 'self_pickup' ? (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Vui lòng đến đúng địa chỉ depot và khung giờ đã chọn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Mang theo giấy tờ tùy thân và mã đơn hàng để xác nhận</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Chuẩn bị phương tiện vận chuyển phù hợp (xe tải/container truck)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Container sẽ được bàn giao kèm EIR (Equipment Interchange Receipt)</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Phí vận chuyển sẽ được thanh toán online sau khi xác nhận đặt hàng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Tài xế sẽ liên hệ trước 30-60 phút khi đến giao hàng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Vui lòng chuẩn bị giấy tờ tùy thân để xác nhận nhận hàng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Container sẽ được giao kèm EIR (Equipment Interchange Receipt)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Bạn có thể theo dõi vị trí tài xế real-time sau khi xe xuất phát</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed footer with actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 h-12 font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" />
              Hủy bỏ
            </Button>
            <Button 
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              disabled={loading || selectedContainerIds.length === 0}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                <>
                  <Truck className="mr-2 h-5 w-5" />
                  Lên lịch giao hàng ({selectedContainerIds.length} containers)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

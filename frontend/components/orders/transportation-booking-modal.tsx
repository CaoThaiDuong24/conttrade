'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, MapPin, Calendar, User, Phone, DollarSign, AlertCircle, CheckCircle, Package, Clock, Building2, Loader2, Package2, Hash, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import { useToast } from '@/hooks/use-toast';

interface TransportationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

export default function TransportationBookingModal({ isOpen, onClose, orderId, onSuccess }: TransportationBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  
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

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch order data on mount
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderData();
    }
  }, [isOpen, orderId]);

  const fetchOrderData = async () => {
    setOrderLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      
      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setOrderData(result.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setOrderLoading(false);
    }
  };

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

    try {
      // Validate theo delivery method
      if (deliveryMethod === 'logistics') {
        if (!formData.deliveryAddress || !formData.deliveryCity) {
          toast({
            title: 'Lỗi',
            description: 'Vui lòng nhập đầy đủ địa chỉ giao hàng',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (!formData.deliveryContact || !formData.deliveryPhone) {
          toast({
            title: 'Lỗi',
            description: 'Vui lòng nhập thông tin người nhận',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (!logisticsCompany) {
          toast({
            title: 'Lỗi',
            description: 'Vui lòng chọn công ty vận chuyển',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      if (!formData.deliveryDate || !formData.deliveryTime) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn ngày và giờ ' + (deliveryMethod === 'self_pickup' ? 'đến lấy hàng' : 'giao hàng'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng đăng nhập lại',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const transportationFee = calculateTransportationFee();

      // Combine address fields
      const fullAddress = deliveryMethod === 'self_pickup' 
        ? orderData?.listings?.depots?.address || 'Tự đến lấy tại depot'
        : `${formData.deliveryAddress}${formData.deliveryDistrict ? ', ' + formData.deliveryDistrict : ''}, ${formData.deliveryCity}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/book-transportation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryMethod,
          logisticsCompany: deliveryMethod === 'logistics' ? logisticsCompany : null,
          deliveryAddress: fullAddress,
          deliveryContact: formData.deliveryContact || user?.fullName || 'N/A',
          deliveryPhone: formData.deliveryPhone || 'N/A',
          deliveryDate: formData.deliveryDate,
          deliveryTime: formData.deliveryTime,
          needsCrane: formData.needsCrane,
          specialInstructions: formData.specialInstructions,
          transportationFee
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Thành công',
          description: deliveryMethod === 'self_pickup' 
            ? 'Đã đăng ký lịch đến lấy hàng. Vui lòng đến depot đúng giờ đã chọn.'
            : 'Đã đặt vận chuyển thành công. Đối tác vận chuyển sẽ liên hệ với bạn sớm.',
        });
        onSuccess?.();
        onClose();
        // Reset form
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
      } else {
        toast({
          title: 'Lỗi',
          description: data.message || 'Không thể đặt vận chuyển',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Book transportation error:', err);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi đặt vận chuyển',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
                  Sắp xếp vận chuyển Container
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 text-sm">
                  Chọn phương thức và cung cấp thông tin để nhận container của bạn
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          {orderLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-900">Đang tải thông tin</p>
                <p className="text-xs text-gray-500">Vui lòng chờ trong giây lát...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 📋 Thông tin đơn hàng */}
              {orderData && (
                <div className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Package2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Thông tin đơn hàng</h3>
                      <p className="text-xs text-gray-500">Chi tiết container và địa điểm hiện tại</p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order ID</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{orderData.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <p className="text-xs font-semibold text-green-700">
                            {orderData.status === 'ready_for_pickup' || orderData.status === 'READY_FOR_PICKUP' 
                              ? 'Sẵn sàng pickup' 
                              : orderData.status}
                          </p>
                        </div>
                      </div>
                      {(orderData.listings?.container_type || orderData.listings?.containers) && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Container</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {orderData.listings?.containers 
                              ? `${orderData.listings.containers.size_ft}ft ${orderData.listings.containers.type}`
                              : orderData.listings?.container_type}
                          </p>
                        </div>
                      )}
                      {orderData.listings?.containers?.condition && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tình trạng</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {orderData.listings.containers.condition}
                          </p>
                        </div>
                      )}
                      {orderData.listings?.depots && (
                        <div className="col-span-2 pt-3 border-t border-indigo-100 space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Depot hiện tại</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{orderData.listings.depots.name}</p>
                              {orderData.listings.depots.address && (
                                <p className="text-xs text-gray-600 mt-0.5">{orderData.listings.depots.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 🚚 Phương thức nhận hàng */}
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
                <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)} className="space-y-3">
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

            {/* 🏢 Công ty vận chuyển (chỉ hiện khi chọn logistics) */}
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

          {/* 📍 Thông tin giao hàng - Chỉ hiện khi không phải tự lấy */}
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

          {/* Người nhận */}
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

          {/* Lịch giao hàng */}
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
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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
          )}
        </div>

        {/* Fixed footer with actions */}
        {!orderLoading && (
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
                disabled={loading}
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
                    Xác nhận đặt vận chuyển
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

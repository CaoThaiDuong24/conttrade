'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CheckCircle2, MapPin, Phone, User, Clock, Package2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarkReadyFormProps {
  orderId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MarkReadyForm({ orderId, onSuccess, onCancel }: MarkReadyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  
  const [checklist, setChecklist] = useState({
    inspection: false,
    cleaning: false,
    repair: false,
    documentation: false,
    photos: false,
  });

  const [pickupLocation, setPickupLocation] = useState({
    address: '',
    city: '',
    country: '',
    postalCode: '',
    lat: '',
    lng: '',
  });

  const [pickupContact, setPickupContact] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [pickupTimeFrom, setPickupTimeFrom] = useState('');
  const [pickupTimeTo, setPickupTimeTo] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Fetch order data on mount
  useEffect(() => {
    const fetchOrderData = async () => {
      setOrderLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const API_URL = '/api/v1';
        
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const order = result.data;
          setOrderData(order);

          // Pre-fill location from depot/listing if available
          if (order.listings?.depots) {
            const depot = order.listings.depots;
            setPickupLocation({
              address: depot.address || '',
              city: '',
              country: '',
              postalCode: '',
              lat: '',
              lng: '',
            });
          }

          // Pre-fill existing delivery data if available
          if (order.deliveries && order.deliveries.length > 0) {
            const delivery = order.deliveries[0];
            if (delivery.pickup_address) {
              setPickupLocation(prev => ({
                ...prev,
                address: delivery.pickup_address || prev.address,
              }));
            }
          }

          // If already marked ready, show the data
          if (order.ready_date) {
            toast({
              title: 'Thông tin',
              description: `Container đã được đánh dấu sẵn sàng vào ${new Date(order.ready_date).toLocaleString('vi-VN')}`,
            });
          }
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

    fetchOrderData();
  }, [orderId, toast]);

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allChecked = Object.values(checklist).every(v => v);
    if (!allChecked) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng hoàn thành tất cả các mục trong checklist',
      });
      return;
    }

    if (!pickupLocation.address || !pickupLocation.city) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập địa điểm pickup',
      });
      return;
    }

    if (!pickupContact.name || !pickupContact.phone) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập thông tin người liên hệ',
      });
      return;
    }

    if (!pickupTimeFrom || !pickupTimeTo) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn khung giờ pickup',
      });
      return;
    }

    if (new Date(pickupTimeFrom) >= new Date(pickupTimeTo)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Thời gian bắt đầu phải trước thời gian kết thúc',
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Lỗi xác thực',
          description: 'Vui lòng đăng nhập lại',
        });
        setLoading(false);
        return;
      }
      
      const API_URL = '/api/v1';
      
      const response = await fetch(`${API_URL}/orders/${orderId}/mark-ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickupLocation,
          pickupContact,
          pickupTimeWindow: {
            from: pickupTimeFrom,
            to: pickupTimeTo,
          },
          specialInstructions,
          checklist,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark ready');
      }

      toast({
        title: 'Thành công!',
        description: 'Đã đánh dấu container sẵn sàng cho pickup',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error marking ready:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể đánh dấu sẵn sàng. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="relative pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 hover:bg-gray-100"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </Button>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Đánh dấu sẵn sàng pickup
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Hoàn thành checklist và cung cấp thông tin pickup để carrier có thể đến lấy hàng
        </CardDescription>
      </CardHeader>

      {orderLoading ? (
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Order Info Display */}
            {orderData && (
              <div className="space-y-4 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm">
                <Label className="text-base font-semibold flex items-center gap-2 text-indigo-900">
                  <div className="w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center">
                    <Package2 className="h-4 w-4 text-indigo-700" />
                  </div>
                  <span>Thông tin đơn hàng</span>
                </Label>
                <div className="space-y-3 bg-white p-4 rounded-lg border border-indigo-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Order ID:</span>
                      <p className="text-gray-900 font-mono">{orderData.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trạng thái:</span>
                      <p className="text-gray-900 capitalize">
                        {orderData.status === 'preparing_delivery' ? '🔧 Đang chuẩn bị' :
                         orderData.status === 'ready_for_pickup' ? '✅ Sẵn sàng pickup' :
                         orderData.status}
                      </p>
                    </div>
                    {orderData.listings?.containers && (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">Container:</span>
                          <p className="text-gray-900">
                            {orderData.listings.containers.size_ft}ft {orderData.listings.containers.type}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tình trạng:</span>
                          <p className="text-gray-900 capitalize">{orderData.listings.containers.condition}</p>
                        </div>
                        {orderData.listings.containers.serial_no && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Serial:</span>
                            <p className="text-gray-900 font-mono">{orderData.listings.containers.serial_no}</p>
                          </div>
                        )}
                      </>
                    )}
                    {orderData.listings?.depots && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Depot hiện tại:</span>
                        <p className="text-gray-900">
                          📍 {orderData.listings.depots.name}
                          {orderData.listings.depots.address && ` - ${orderData.listings.depots.address}`}
                        </p>
                      </div>
                    )}
                    {orderData.ready_date && (
                      <div className="col-span-2 pt-2 border-t border-indigo-100">
                        <span className="font-medium text-green-700">✅ Đã đánh dấu sẵn sàng:</span>
                        <p className="text-gray-900">
                          {new Date(orderData.ready_date).toLocaleString('vi-VN', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preparation Checklist */}
          <div className="space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <Label className="text-base font-semibold flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package2 className="h-4 w-4 text-blue-600" />
              </div>
              <span>Checklist chuẩn bị</span>
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
              {[
                { key: 'inspection', label: 'Đã kiểm tra tổng thể container' },
                { key: 'cleaning', label: 'Đã làm sạch và khử trùng' },
                { key: 'repair', label: 'Đã sửa chữa các hư hỏng (nếu có)' },
                { key: 'documentation', label: 'Đã chuẩn bị đầy đủ giấy tờ' },
                { key: 'photos', label: 'Đã chụp ảnh hiện trạng' },
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={item.key}
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, [item.key]: checked })
                    }
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <Label
                    htmlFor={item.key}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Location */}
          <div className="space-y-4 bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
            <Label className="text-base font-semibold flex items-center gap-2 text-blue-900">
              <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-700" />
              </div>
              <span>Địa điểm pickup</span>
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="space-y-4 bg-white p-4 rounded-lg border border-blue-100">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Địa chỉ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="VD: 123 Đường Nguyễn Văn Linh"
                  value={pickupLocation.address}
                  onChange={(e) =>
                    setPickupLocation({ ...pickupLocation, address: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="VD: Hồ Chí Minh"
                    value={pickupLocation.city}
                    onChange={(e) =>
                      setPickupLocation({ ...pickupLocation, city: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Quốc gia
                  </Label>
                  <Input
                    id="country"
                    placeholder="VD: Vietnam"
                    value={pickupLocation.country}
                    onChange={(e) =>
                      setPickupLocation({ ...pickupLocation, country: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                    Mã bưu điện
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="700000"
                    value={pickupLocation.postalCode}
                    onChange={(e) =>
                      setPickupLocation({ ...pickupLocation, postalCode: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-sm font-medium text-gray-700">
                    Latitude (optional)
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    placeholder="10.762622"
                    value={pickupLocation.lat}
                    onChange={(e) =>
                      setPickupLocation({ ...pickupLocation, lat: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-sm font-medium text-gray-700">
                    Longitude (optional)
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    placeholder="106.660172"
                    value={pickupLocation.lng}
                    onChange={(e) =>
                      setPickupLocation({ ...pickupLocation, lng: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Contact */}
          <div className="space-y-4 bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm">
            <Label className="text-base font-semibold flex items-center gap-2 text-purple-900">
              <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center">
                <User className="h-4 w-4 text-purple-700" />
              </div>
              <span>Người liên hệ tại địa điểm pickup</span>
            </Label>
            <div className="space-y-4 bg-white p-4 rounded-lg border border-purple-100">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder="VD: Nguyễn Văn A"
                  value={pickupContact.name}
                  onChange={(e) =>
                    setPickupContact({ ...pickupContact, name: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="VD: +84 901 234 567"
                  value={pickupContact.phone}
                  onChange={(e) =>
                    setPickupContact({ ...pickupContact, phone: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                  Email (optional)
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="VD: contact@example.com"
                  value={pickupContact.email}
                  onChange={(e) =>
                    setPickupContact({ ...pickupContact, email: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Pickup Time Window */}
          <div className="space-y-4 bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm">
            <Label className="text-base font-semibold flex items-center gap-2 text-orange-900">
              <div className="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-700" />
              </div>
              <span>Khung giờ pickup</span>
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="space-y-4 bg-white p-4 rounded-lg border border-orange-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeFrom" className="text-sm font-medium text-gray-700">
                    Từ ngày giờ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="timeFrom"
                    type="datetime-local"
                    value={pickupTimeFrom}
                    onChange={(e) => {
                      console.log('✅ FROM:', e.target.value);
                      setPickupTimeFrom(e.target.value);
                    }}
                    min={getMinDateTime()}
                    required
                    className="h-11"
                  />
                  {pickupTimeFrom && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {new Date(pickupTimeFrom).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeTo" className="text-sm font-medium text-gray-700">
                    Đến ngày giờ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="timeTo"
                    type="datetime-local"
                    value={pickupTimeTo}
                    onChange={(e) => {
                      console.log('✅ TO:', e.target.value);
                      setPickupTimeTo(e.target.value);
                    }}
                    min={pickupTimeFrom || getMinDateTime()}
                    required
                    className="h-11"
                  />
                  {pickupTimeTo && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {new Date(pickupTimeTo).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-md">
                <p className="text-xs text-orange-800">
                  💡 <strong>Lưu ý:</strong> Chọn khung giờ phù hợp để carrier có thể sắp xếp lịch trình pickup
                </p>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-3 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <Label htmlFor="instructions" className="text-base font-semibold text-gray-900">
              Ghi chú đặc biệt (tuỳ chọn)
            </Label>
            <Textarea
              id="instructions"
              placeholder="VD: Cần xe nâng, cần appointment trước 24h, container phải được lấy trước 17h..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
              className="resize-none bg-white"
            />
            <p className="text-xs text-gray-500">
              Mọi yêu cầu đặc biệt về thời gian, phương tiện, hoặc quy trình pickup
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center gap-3 border-t bg-gray-50 pt-6">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> Trường bắt buộc
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="min-w-[100px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[180px] shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Xác nhận sẵn sàng
                </>
              )}
            </Button>
          </div>
        </CardFooter>
        </form>
      )}
    </Card>
  );
}

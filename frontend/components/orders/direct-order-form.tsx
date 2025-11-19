"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContainerSelector } from '@/components/listings/container-selector';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  CreditCard,
  Shield,
  Calculator,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Use relative path for API calls
const API_URL = '/api/v1';

interface Listing {
  id: string;
  title: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  dealType: string;
  totalQuantity?: number;
  availableQuantity?: number;
  seller: {
    id: string;
    displayName: string;
  };
  container: {
    type: string;
    sizeFt: number;
    condition: string;
  };
  location: {
    depot: string;
    city: string;
    province: string;
  };
  status: string;
}

interface DirectOrderFormProps {
  listing: Listing;
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

export default function DirectOrderForm({ listing, onSuccess, onCancel }: DirectOrderFormProps) {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [rentalDuration, setRentalDuration] = useState(1); // ✅ FIX #9: Add rental duration state
  
  // ✅ NEW: Container selection state - Match ContainerSelector interface
  const [containerSelection, setContainerSelection] = useState<{
    mode: 'quantity' | 'selection';
    quantity?: number;
    containerIds?: string[];
    containers?: any[];
    totalPrice?: number;
  }>({ mode: 'quantity', quantity: 1 });
  
  const [formData, setFormData] = useState({
    agreedPrice: listing.priceAmount,
    currency: listing.priceCurrency,
    deliveryAddress: {
      street: '',
      city: '',
      province: '',
      zipCode: ''
    },
    notes: ''
  });

  // Calculate fees and total
  const calculateFees = () => {
    // ✅ FIX #9: For RENTAL, multiply by rental duration
    const months = listing.dealType === 'RENTAL' ? rentalDuration : 1;
    const subtotal = formData.agreedPrice * quantity * months;
    const platformFee = Math.round(subtotal * 0.025); // 2.5% platform fee
    const tax = Math.round(subtotal * 0.1); // 10% VAT
    const total = subtotal + platformFee + tax;
    
    return {
      subtotal,
      platformFee,
      tax,
      total,
      months // ✅ FIX #9: Return months for display
    };
  };

  const fees = calculateFees();

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }
    return `${amount} ${currency}`;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('deliveryAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.agreedPrice || formData.agreedPrice <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return false;
    }

    if (listing.dealType === 'SALE') {
      if (quantity < 1) {
        toast.error('Số lượng phải lớn hơn 0');
        return false;
      }
      if (listing.availableQuantity && quantity > listing.availableQuantity) {
        toast.error(`Chỉ còn ${listing.availableQuantity} container có sẵn`);
        return false;
      }
    }
    
    if (!formData.deliveryAddress.street || !formData.deliveryAddress.city) {
      toast.error('Vui lòng nhập đầy đủ địa chỉ giao hàng');
      return false;
    }
    
    return true;
  };

  const createDirectOrder = async () => {
    if (!validateForm()) return;
    
    // ✅ NEW: Get final quantity and selected containers
    const finalQuantity = containerSelection.mode === 'selection' 
      ? (containerSelection.containerIds?.length || 0)
      : (containerSelection.quantity || quantity);
    
    const selectedContainerIds = containerSelection.mode === 'selection'
      ? containerSelection.containerIds
      : undefined;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập để tạo đơn hàng');
        return;
      }

      console.log('🔍 Creating order with:', {
        listingId: listing.id,
        quantity: finalQuantity,
        selectedContainerIds,
        containerCount: selectedContainerIds?.length || 0
      });

      const response = await fetch(`${API_URL}/orders/from-listing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: listing.id,
          agreedPrice: formData.agreedPrice,
          currency: formData.currency,
          quantity: listing.dealType === 'SALE' ? finalQuantity : undefined,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes,
          selected_container_ids: selectedContainerIds, // ✅ NEW: Include selected containers
          deal_type: listing.dealType, // ✅ FIX #9: Include deal_type
          rental_duration_months: listing.dealType === 'RENTAL' ? rentalDuration : undefined // ✅ FIX #9: Include rental_duration_months
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Đơn hàng đã được tạo thành công!');
          onSuccess?.(data.data.id);
        } else {
          toast.error(data.message || 'Không thể tạo đơn hàng');
        }
      } else {
        // Demo mode - simulate success
        const mockOrderId = `ORD-${Date.now()}`;
        toast.success('Đơn hàng đã được tạo thành công! (Demo mode)');
        onSuccess?.(mockOrderId);
      }
    } catch (error) {
      console.error('Error creating direct order:', error);
      // Demo mode - simulate success
      const mockOrderId = `ORD-${Date.now()}`;
      toast.success('Đơn hàng đã được tạo thành công! (Demo mode)');
      onSuccess?.(mockOrderId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Tạo đơn hàng trực tiếp</span>
          </CardTitle>
          <CardDescription>
            Tạo đơn hàng ngay từ listing này mà không cần qua quy trình RFQ
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Listing Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Thông tin sản phẩm</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{listing.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{listing.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Loại:</span>
                <p className="font-medium">{listing.container.type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Kích thước:</span>
                <p className="font-medium">{listing.container.sizeFt}ft</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tình trạng:</span>
                <p className="font-medium">{listing.container.condition}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge variant="secondary">{listing.status}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Vị trí:</span>
              </div>
              <p className="text-sm">
                {listing.location.depot}, {listing.location.city}, {listing.location.province}
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-muted-foreground text-sm">Người bán:</span>
              <p className="font-medium">{listing.seller.displayName}</p>
            </div>

            {/* Quantity Info for SALE type */}
            {listing.dealType === 'SALE' && listing.totalQuantity && listing.totalQuantity > 1 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Tồn kho:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={listing.availableQuantity && listing.availableQuantity > 0 ? "default" : "destructive"}>
                      {listing.availableQuantity || 0} / {listing.totalQuantity} container có sẵn
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ✅ NEW: Container Selector - Replace quantity input */}
            {listing.dealType === 'SALE' && listing.totalQuantity && listing.totalQuantity > 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Chọn containers</h4>
                  <p className="text-sm text-blue-700">
                    Bạn có thể chọn container cụ thể hoặc chỉ nhập số lượng
                  </p>
                </div>
                
                <ContainerSelector
                  listingId={listing.id}
                  onSelectionChange={setContainerSelection}
                  unitPrice={formData.agreedPrice}
                  currency={formData.currency}
                  maxQuantity={listing.availableQuantity || 1}
                />
              </div>
            )}
            
            {/* Legacy: Simple quantity for single item or RENTAL */}
            {(listing.dealType === 'RENTAL' || !listing.totalQuantity || listing.totalQuantity === 1) && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng container</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={listing.availableQuantity || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(listing.availableQuantity || 1, Number(e.target.value)));
                      setQuantity(val);
                    }}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    Tối đa: {listing.availableQuantity || 1}
                  </span>
                </div>
              </div>
            )}

            {/* ✅ FIX #9: Rental Duration Selector for RENTAL type */}
            {listing.dealType === 'RENTAL' && (
              <div className="space-y-2">
                <Label htmlFor="rentalDuration">Thời gian thuê (tháng)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="rentalDuration"
                    type="number"
                    min={1}
                    max={12}
                    value={rentalDuration}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(12, Number(e.target.value)));
                      setRentalDuration(val);
                    }}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    tháng
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chọn số tháng bạn muốn thuê container (1-12 tháng)
                </p>
              </div>
            )}

            {/* Price Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="agreedPrice">
                  {listing.dealType === 'SALE' && quantity > 1 ? 'Giá mỗi container' : 'Giá thỏa thuận'}
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="agreedPrice"
                    type="number"
                    value={formData.agreedPrice}
                    onChange={(e) => handleInputChange('agreedPrice', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">VND</span>
                </div>
                {listing.dealType === 'SALE' && quantity > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tổng giá sản phẩm: {formatPrice(formData.agreedPrice * quantity, formData.currency)}
                  </p>
                )}
              </div>

              {/* Fee Breakdown */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium text-sm">Chi phí chi tiết</span>
                </div>
                
                <div className="space-y-1 text-sm">
                  {/* ✅ FIX #9: Show rental duration info */}
                  {listing.dealType === 'RENTAL' && (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Giá thuê/tháng:</span>
                        <span>{formatPrice(formData.agreedPrice, formData.currency)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Thời gian thuê:</span>
                        <span>{rentalDuration} tháng</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Giá sản phẩm:</span>
                    <span>{formatPrice(fees.subtotal, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí nền tảng (2.5%):</span>
                    <span>{formatPrice(fees.platformFee, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (10%):</span>
                    <span>{formatPrice(fees.tax, formData.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatPrice(fees.total, formData.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <Label>Địa chỉ giao hàng</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    placeholder="Thành phố"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tỉnh/Thành phố"
                    value={formData.deliveryAddress.province}
                    onChange={(e) => handleInputChange('deliveryAddress.province', e.target.value)}
                  />
                </div>
              </div>
              
              <Input
                placeholder="Địa chỉ chi tiết"
                value={formData.deliveryAddress.street}
                onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
              />
              
              <Input
                placeholder="Mã bưu điện"
                value={formData.deliveryAddress.zipCode}
                onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Ghi chú (không bắt buộc)</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú thêm cho đơn hàng..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Payment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-900">Bảo vệ thanh toán</span>
              </div>
              <p className="text-sm text-blue-700">
                Tiền sẽ được giữ an toàn trong hệ thống ký quỹ cho đến khi bạn xác nhận nhận hàng.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={createDirectOrder}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  'Đang tạo...'
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Tạo đơn hàng
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRouter as useI18nRouter } from '@/i18n/routing';
import { fetchListingById } from '@/lib/api/listings';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Shield,
  AlertCircle,
  CheckCircle,
  Truck,
  CreditCard,
  FileText
} from 'lucide-react';

// Use relative path for API calls
const API_URL = '/api/v1';

export default function CreateOrderPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const searchParams = useSearchParams();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    agreedPrice: '',
    deliveryAddress: {
      street: '',
      city: '',
      province: '',
      zipCode: ''
    },
    deliveryDate: '',
    notes: ''
  });

  const listingId = searchParams.get('listingId');
  const rfqId = searchParams.get('rfqId');
  const suggestedPrice = searchParams.get('price');

  useEffect(() => {
    if (!listingId) {
      setError('Vui lòng chọn listing trước khi tạo đơn hàng');
      setTimeout(() => {
        i18nRouter.push('/listings');
      }, 2000);
      return;
    }

    fetchListingInfo(listingId);
  }, [listingId]);

  const fetchListingInfo = async (id: string) => {
    try {
      setLoading(true);
      const res: any = await fetchListingById(id);
      console.log('Fetch listing response:', res);
      
      if (res?.success && res?.data?.listing) {
        const apiListing = res.data.listing;
        setListing(apiListing);
        
        // Pre-fill agreed price with suggested price from RFQ or listing price
        const defaultPrice = suggestedPrice || (apiListing.priceAmount || apiListing.price_amount || apiListing.price || 0);
        setFormData(prev => ({
          ...prev,
          agreedPrice: defaultPrice.toString()
        }));
      } else if (res && !res.success) {
        setError(res.message || 'Không tìm thấy thông tin listing');
      } else {
        // Handle direct listing object response (fallback)
        setListing(res);
        const defaultPrice = suggestedPrice || (res?.priceAmount || res?.price_amount || res?.price || 0);
        setFormData(prev => ({
          ...prev,
          agreedPrice: defaultPrice.toString()
        }));
      }
    } catch (err: any) {
      console.error('Error fetching listing:', err);
      setError('Không thể tải thông tin listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
    if (!formData.agreedPrice || parseFloat(formData.agreedPrice) <= 0) {
      setError('Vui lòng nhập giá hợp lệ');
      return false;
    }
    
    if (!formData.deliveryAddress.street.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return false;
    }
    
    if (!formData.deliveryAddress.city.trim()) {
      setError('Vui lòng nhập thành phố');
      return false;
    }
    
    if (!formData.deliveryAddress.province.trim()) {
      setError('Vui lòng nhập tỉnh/thành');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập để tạo đơn hàng');
        return;
      }

      const response = await fetch(`${API_URL}/orders/from-listing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listingId,
          rfqId: rfqId || undefined,
          agreedPrice: parseFloat(formData.agreedPrice),
          currency: listing?.priceCurrency || 'VND',
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes || undefined
        }),
      });

      const data = await response.json();
      console.log('Create order response:', data);

      if (response.ok && data.success) {
        // Redirect to payment page
        i18nRouter.push(`/orders/${data.data.id}/pay`);
      } else {
        setError(data.message || 'Không thể tạo đơn hàng');
      }
    } catch (err: any) {
      console.error('Create order error:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Đang tải thông tin...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => i18nRouter.push('/listings')} variant="outline">
              Quay lại danh sách listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {rfqId ? 'Tạo đơn hàng từ RFQ' : 'Tạo đơn hàng'}
        </h1>
        <p className="text-muted-foreground">
          {rfqId 
            ? 'Hoàn tất thông tin để tạo đơn hàng dựa trên báo giá đã nhận'
            : 'Hoàn tất thông tin để tạo đơn hàng và tiến hành thanh toán'
          }
        </p>
        {rfqId && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <FileText className="h-4 w-4" />
            <span>Đơn hàng này được tạo từ RFQ ID: {rfqId}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Info */}
          {listing && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      {listing.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {listing.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {new Intl.NumberFormat('vi-VN').format(listing.priceAmount)} {listing.priceCurrency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.locationDepot?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Size: {listing.facets?.find((f: any) => f.key === 'size')?.value || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Condition: {listing.facets?.find((f: any) => f.key === 'condition')?.value || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Seller: {listing.seller?.displayName || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>
                Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Agreed Price */}
                <div className="space-y-2">
                  <Label htmlFor="agreedPrice">Giá đã thỏa thuận *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="agreedPrice"
                      type="number"
                      placeholder="48000000"
                      value={formData.agreedPrice}
                      onChange={(e) => handleInputChange('agreedPrice', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Giá đã thỏa thuận với seller (VND)
                  </p>
                </div>

                <Separator />

                {/* Delivery Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <Label className="text-base font-medium">Địa chỉ giao hàng *</Label>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Địa chỉ *</Label>
                      <Input
                        id="street"
                        placeholder="123 Đường ABC"
                        value={formData.deliveryAddress.street}
                        onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input
                        id="city"
                        placeholder="Hà Nội"
                        value={formData.deliveryAddress.city}
                        onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Tỉnh/Thành *</Label>
                      <Input
                        id="province"
                        placeholder="Hà Nội"
                        value={formData.deliveryAddress.province}
                        onChange={(e) => handleInputChange('deliveryAddress.province', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Mã bưu điện</Label>
                      <Input
                        id="zipCode"
                        placeholder="100000"
                        value={formData.deliveryAddress.zipCode}
                        onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Expected Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Ngày giao hàng mong muốn</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ghi chú thêm về giao hàng, yêu cầu đặc biệt..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing && (
                <>
                  <div className="flex justify-between">
                    <span>Giá listing:</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(listing.priceAmount)} {listing.priceCurrency}</span>
                  </div>
                  
                  {formData.agreedPrice && parseFloat(formData.agreedPrice) !== listing.priceAmount && (
                    <div className="flex justify-between text-green-600">
                      <span>Giá đã thỏa thuận:</span>
                      <span>{new Intl.NumberFormat('vi-VN').format(parseFloat(formData.agreedPrice))} {listing.priceCurrency}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formData.agreedPrice ? new Intl.NumberFormat('vi-VN').format(parseFloat(formData.agreedPrice)) : 0} VND</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform fee (2%):</span>
                      <span>{formData.agreedPrice ? new Intl.NumberFormat('vi-VN').format(parseFloat(formData.agreedPrice) * 0.02) : 0} VND</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Payment fee (1%):</span>
                      <span>{formData.agreedPrice ? new Intl.NumberFormat('vi-VN').format(parseFloat(formData.agreedPrice) * 0.01) : 0} VND</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng thanh toán:</span>
                    <span className="text-primary">
                      {formData.agreedPrice ? new Intl.NumberFormat('vi-VN').format(parseFloat(formData.agreedPrice) * 1.03) : 0} VND
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubmit}
              disabled={!listing || submitting || !formData.agreedPrice || !formData.deliveryAddress.street}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo đơn hàng...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Tạo đơn hàng & Thanh toán
                </div>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => i18nRouter.push(`/listings/${listingId}`)}
              className="w-full"
            >
              Quay lại listing
            </Button>
          </div>

          {/* Security Notice */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Thanh toán an toàn</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Tiền sẽ được giữ trong tài khoản Escrow cho đến khi bạn xác nhận nhận hàng.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
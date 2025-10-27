"use client";

import { useState, useEffect } from 'react';
import { useRouter as useNextRouter, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { useAuth } from '@/components/providers/auth-context';
import { 
  FileText, 
  Calendar,
  Package,
  MapPin,
  ArrowLeft,
  Send,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

export default function CreateRFQPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get token from cookies
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  };
  const [listingId, setListingId] = useState<string | null>(null);
  const [listingInfo, setListingInfo] = useState<any>(null);
  const [loadingListing, setLoadingListing] = useState(false);
  
  const [formData, setFormData] = useState({
    purpose: 'sale' as 'sale' | 'rental',
    quantity: 1,
    needBy: '',
    services: {
      inspection: false,
      repair_estimate: false,
      certification: false,
      delivery_estimate: true,
    }
  });

  // Get listingId from URL params
  useEffect(() => {
    const id = searchParams.get('listingId');
    if (id) {
      setListingId(id);
      // Fetch listing info
      fetchListingInfo(id);
    } else {
      showError('Vui lòng chọn listing trước khi tạo RFQ');
      // Redirect to listings page
      setTimeout(() => {
        const path = window.location.pathname;
        const match = path.match(/^\/(vi|en)\b/);
        const locale = match ? match[1] : 'vi';
        router.push(`/${locale}/listings`);
      }, 2000);
    }
  }, [searchParams, router, showError]);

  const fetchListingInfo = async (id: string) => {
    setLoadingListing(true);
    try {
      const token = getToken();
      const url = `${API_URL}/api/v1/listings/${id}`;
      console.log('Fetching listing info from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Listing data:', data.data);
        const listing = data.data.listing;
        setListingInfo(listing);
        
        // Auto-fill quantity from listing if available
        if (listing) {
          setFormData(prev => ({
            ...prev,
            quantity: 1, // Default 1 container
          }));
        }
      } else {
        console.error('Failed to fetch listing:', response.status);
        showError('Không thể tải thông tin listing');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      showError('Có lỗi khi tải thông tin listing');
    } finally {
      setLoadingListing(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listingId) {
      showError('Không tìm thấy listing ID');
      return;
    }
    
    if (formData.quantity < 1) {
      showError('Số lượng phải lớn hơn 0');
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      
      // Build payload according to backend API schema
      const payload = {
        listing_id: listingId,
        purpose: formData.purpose,
        quantity: formData.quantity,
        need_by: formData.needBy || undefined,
        services: formData.services,
      };
      console.log('Creating RFQ with payload:', payload);
      
      const response = await fetch(`${API_URL}/api/v1/rfqs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Tạo RFQ thành công!');
        
        // Redirect to sent RFQs page
        setTimeout(() => {
          router.push('/rfq/sent');
        }, 1000);
      } else {
        const error = await response.json();
        showError(error.message || 'Tạo RFQ thất bại');
      }
    } catch (error) {
      console.error('Create RFQ error:', error);
      showError('Có lỗi xảy ra khi tạo RFQ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Tạo yêu cầu báo giá (RFQ)
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo yêu cầu báo giá cho container, nhà cung cấp sẽ gửi báo giá cho bạn
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* Listing Info Card */}
      {loadingListing ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ) : listingInfo && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {listingInfo.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {listingInfo.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {new Intl.NumberFormat('vi-VN').format(parseFloat(listingInfo.price_amount || 0))} {listingInfo.price_currency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {listingInfo.depots?.name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{listingInfo.depots.name}</span>
                </div>
              )}
              {listingInfo.containers?.type && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{listingInfo.containers.type} - {listingInfo.containers.size_ft}ft</span>
                </div>
              )}
              {listingInfo.users?.display_name && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-medium">{listingInfo.users.display_name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin yêu cầu báo giá</CardTitle>
            <CardDescription>Điền thông tin chi tiết cho yêu cầu báo giá của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">
                  Mục đích <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.purpose} 
                  onValueChange={(value) => handleInputChange('purpose', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mục đích" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Mua (Purchase)</SelectItem>
                    <SelectItem value="rental">Thuê (Rental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Số lượng container <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  placeholder="Nhập số lượng"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needBy">
                <Calendar className="h-4 w-4 inline mr-1" />
                Ngày cần hàng
              </Label>
              <Input
                id="needBy"
                type="date"
                value={formData.needBy}
                onChange={(e) => handleInputChange('needBy', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Thời điểm bạn cần nhận container (không bắt buộc)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Dịch vụ bổ sung
            </CardTitle>
            <CardDescription>Chọn các dịch vụ bạn muốn yêu cầu báo giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inspection"
                checked={formData.services.inspection}
                onCheckedChange={(checked) => handleServiceChange('inspection', checked as boolean)}
              />
              <Label 
                htmlFor="inspection" 
                className="text-sm font-normal cursor-pointer"
              >
                Kiểm định (Inspection)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="repair_estimate"
                checked={formData.services.repair_estimate}
                onCheckedChange={(checked) => handleServiceChange('repair_estimate', checked as boolean)}
              />
              <Label 
                htmlFor="repair_estimate" 
                className="text-sm font-normal cursor-pointer"
              >
                Báo giá sửa chữa (Repair Estimate)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="certification"
                checked={formData.services.certification}
                onCheckedChange={(checked) => handleServiceChange('certification', checked as boolean)}
              />
              <Label 
                htmlFor="certification" 
                className="text-sm font-normal cursor-pointer"
              >
                Chứng nhận (Certification)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery_estimate"
                checked={formData.services.delivery_estimate}
                onCheckedChange={(checked) => handleServiceChange('delivery_estimate', checked as boolean)}
              />
              <Label 
                htmlFor="delivery_estimate" 
                className="text-sm font-normal cursor-pointer"
              >
                Báo giá vận chuyển (Delivery Estimate)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mục đích:</span>
                <span className="font-semibold">
                  {formData.purpose === 'sale' ? 'Mua (Purchase)' : 'Thuê (Rental)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng container:</span>
                <span className="font-semibold">{formData.quantity}</span>
              </div>
              {formData.needBy && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày cần hàng:</span>
                  <span className="font-semibold">
                    {new Date(formData.needBy).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dịch vụ yêu cầu:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {formData.services.inspection && (
                    <Badge variant="secondary" className="text-xs">Kiểm định</Badge>
                  )}
                  {formData.services.repair_estimate && (
                    <Badge variant="secondary" className="text-xs">Sửa chữa</Badge>
                  )}
                  {formData.services.certification && (
                    <Badge variant="secondary" className="text-xs">Chứng nhận</Badge>
                  )}
                  {formData.services.delivery_estimate && (
                    <Badge variant="secondary" className="text-xs">Vận chuyển</Badge>
                  )}
                  {!Object.values(formData.services).some(v => v) && (
                    <span className="text-sm text-muted-foreground">Không có</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Đang gửi...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gửi yêu cầu
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Cards */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Lưu ý khi tạo RFQ
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• RFQ sẽ được gửi trực tiếp đến seller của listing này</li>
                <li>• Bạn có thể yêu cầu thêm các dịch vụ như kiểm định, sửa chữa, vận chuyển</li>
                <li>• Seller sẽ gửi báo giá cho bạn trong vòng 24-48 giờ</li>
                <li>• RFQ có hiệu lực trong 7 ngày kể từ khi gửi</li>
                <li>• Bạn có thể theo dõi và quản lý RFQ tại trang "RFQ đã gửi"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


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
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
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
  const API_URL = '/api/v1';
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
      const url = `${API_URL}/listings/${id}`;
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
        purpose: listingInfo.deal_type === 'SALE' ? 'PURCHASE' : 'RENTAL', // Lấy từ listing
        quantity: formData.quantity,
        need_by: formData.needBy || undefined,
        services: formData.services,
      };
      console.log('Creating RFQ with payload:', payload);
      
      const response = await fetch(`${API_URL}/rfqs`, {
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Trang chủ</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">RFQ</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Tạo yêu cầu báo giá</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Tạo yêu cầu báo giá (RFQ)
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Tạo yêu cầu báo giá cho container, nhà cung cấp sẽ gửi báo giá cho bạn
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>

      {/* Listing Info Card */}
      {loadingListing ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ) : listingInfo && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge 
                    variant={listingInfo.deal_type === 'SALE' ? 'default' : 'secondary'}
                    className="text-sm font-medium"
                  >
                    {getDealTypeDisplayName(listingInfo.deal_type)}
                  </Badge>
                  {listingInfo.status && (
                    <Badge 
                      variant={
                        listingInfo.status === 'ACTIVE' ? 'default' : 
                        listingInfo.status === 'DRAFT' ? 'secondary' : 
                        listingInfo.status === 'PENDING' ? 'outline' : 
                        'destructive'
                      }
                      className="text-xs uppercase"
                    >
                      {listingInfo.status === 'ACTIVE' ? 'Đang hoạt động' :
                       listingInfo.status === 'DRAFT' ? 'Nháp' :
                       listingInfo.status === 'PENDING' ? 'Chờ duyệt' :
                       listingInfo.status === 'REJECTED' ? 'Từ chối' :
                       listingInfo.status === 'EXPIRED' ? 'Hết hạn' :
                       listingInfo.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white break-words">
                      {listingInfo.title}
                    </h2>
                    {listingInfo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {listingInfo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-1 flex-shrink-0">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
                  <div className="text-xl font-bold text-green-700 dark:text-green-400">
                    {new Intl.NumberFormat('vi-VN').format(parseFloat(listingInfo.price_amount || 0))} {listingInfo.price_currency}
                    {listingInfo.deal_type === 'RENTAL' && listingInfo.rental_unit && (
                      <span className="text-sm font-normal">
                        /{listingInfo.rental_unit === 'MONTH' ? 'tháng' : 
                          listingInfo.rental_unit === 'WEEK' ? 'tuần' : 
                          listingInfo.rental_unit === 'DAY' ? 'ngày' : 
                          listingInfo.rental_unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {listingInfo.depots?.name && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3" />
                      Vị trí
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {listingInfo.depots.name}
                    </span>
                  </div>
                )}
                {listingInfo.containers && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                      <Package className="h-3 w-3" />
                      Container
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {listingInfo.containers.type} - {listingInfo.containers.size_ft}ft
                    </span>
                    {listingInfo.containers.condition && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {listingInfo.containers.condition}
                      </span>
                    )}
                  </div>
                )}
                {listingInfo.users?.display_name && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Seller</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {listingInfo.users.display_name}
                    </span>
                    {listingInfo.users.email && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {listingInfo.users.email}
                      </span>
                    )}
                  </div>
                )}
                {(listingInfo.available_quantity || listingInfo.total_quantity) && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Số lượng</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {listingInfo.available_quantity || listingInfo.total_quantity} có sẵn
                    </span>
                    {listingInfo.total_quantity && listingInfo.available_quantity !== listingInfo.total_quantity && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        /{listingInfo.total_quantity} tổng
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin yêu cầu báo giá</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Điền thông tin chi tiết cho yêu cầu báo giá của bạn
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Hiển thị mục đích từ listing - không cho chỉnh sửa */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mục đích <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base block">
                    {listingInfo?.deal_type ? (
                      listingInfo.deal_type === 'SALE' ? 'Mua (Purchase)' : 'Thuê (Rental)'
                    ) : 'Đang tải...'}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Mục đích được xác định từ loại giao dịch trong tin đăng
                  </p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0 hidden sm:flex">
                  {listingInfo?.deal_type ? getDealTypeDisplayName(listingInfo.deal_type) : ''}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số lượng container <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  placeholder="Nhập số lượng"
                  className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Số lượng container bạn muốn yêu cầu báo giá
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="needBy" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Ngày cần hàng
                </Label>
                <Input
                  id="needBy"
                  type="date"
                  value={formData.needBy}
                  onChange={(e) => handleInputChange('needBy', e.target.value)}
                  className="h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thời điểm bạn cần nhận container (không bắt buộc)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dịch vụ bổ sung</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chọn các dịch vụ bạn muốn yêu cầu báo giá
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label 
                htmlFor="inspection"
                className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <Checkbox
                  id="inspection"
                  checked={formData.services.inspection}
                  onCheckedChange={(checked) => handleServiceChange('inspection', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white block">
                    Kiểm định (Inspection)
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Yêu cầu kiểm tra chất lượng container
                  </p>
                </div>
              </label>

              <label 
                htmlFor="repair_estimate"
                className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <Checkbox
                  id="repair_estimate"
                  checked={formData.services.repair_estimate}
                  onCheckedChange={(checked) => handleServiceChange('repair_estimate', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white block">
                    Báo giá sửa chữa (Repair Estimate)
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Yêu cầu báo giá sửa chữa nếu cần
                  </p>
                </div>
              </label>

              <label 
                htmlFor="certification"
                className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <Checkbox
                  id="certification"
                  checked={formData.services.certification}
                  onCheckedChange={(checked) => handleServiceChange('certification', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white block">
                    Chứng nhận (Certification)
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Yêu cầu các giấy chứng nhận cần thiết
                  </p>
                </div>
              </label>

              <label 
                htmlFor="delivery_estimate"
                className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              >
                <Checkbox
                  id="delivery_estimate"
                  checked={formData.services.delivery_estimate}
                  onCheckedChange={(checked) => handleServiceChange('delivery_estimate', checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white block">
                    Báo giá vận chuyển (Delivery Estimate)
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Yêu cầu báo giá vận chuyển đến địa điểm
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tóm tắt yêu cầu</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Xem lại thông tin trước khi gửi yêu cầu
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mục đích:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {listingInfo?.deal_type ? (
                    <>
                      {listingInfo.deal_type === 'SALE' ? 'Mua' : 'Thuê'} 
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        ({getDealTypeDisplayName(listingInfo.deal_type)})
                      </span>
                    </>
                  ) : 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Số lượng container:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{formData.quantity}</span>
              </div>
              
              {formData.needBy && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ngày cần hàng:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(formData.needBy).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium block mb-3">Dịch vụ yêu cầu:</span>
                <div className="flex flex-wrap gap-2">
                  {formData.services.inspection && (
                    <Badge variant="secondary" className="text-xs px-3 py-1">✓ Kiểm định</Badge>
                  )}
                  {formData.services.repair_estimate && (
                    <Badge variant="secondary" className="text-xs px-3 py-1">✓ Sửa chữa</Badge>
                  )}
                  {formData.services.certification && (
                    <Badge variant="secondary" className="text-xs px-3 py-1">✓ Chứng nhận</Badge>
                  )}
                  {formData.services.delivery_estimate && (
                    <Badge variant="secondary" className="text-xs px-3 py-1">✓ Vận chuyển</Badge>
                  )}
                  {!Object.values(formData.services).some(v => v) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">Không có dịch vụ bổ sung</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="h-12 text-base order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 text-base min-w-full sm:min-w-[200px] bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Đang gửi...
              </div>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Gửi yêu cầu báo giá
              </>
            )}
          </Button>
        </div>
      </form>

        {/* Info Cards */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Lưu ý khi tạo RFQ
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                  <li>• RFQ sẽ được gửi trực tiếp đến seller của listing này</li>
                  <li>• Bạn có thể yêu cầu thêm các dịch vụ như kiểm định, sửa chữa, vận chuyển</li>
                  <li>• Seller sẽ gửi báo giá cho bạn trong vòng 24-48 giờ</li>
                  <li>• RFQ có hiệu lực trong 7 ngày kể từ khi gửi</li>
                  <li>• Bạn có thể theo dõi và quản lý RFQ tại trang "RFQ đã gửi"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


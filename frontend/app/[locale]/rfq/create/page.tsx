"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { ContainerSelector } from '@/components/listings/container-selector';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // ✅ Track if this is the first load
  const [containerSelection, setContainerSelection] = useState<{
    mode: 'quantity' | 'selection';
    quantity?: number;
    containerIds?: string[];
    containers?: any[];
    totalPrice?: number;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: 1,
    needBy: '',
    rentalDurationMonths: 1, // ✅ NEW: Rental duration for RENTAL type
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
        
        // ✅ FIX: Only set default rental duration on initial load, not when user has already changed it
        if (listing && isInitialLoad) {
          setFormData(prev => ({
            ...prev,
            quantity: 1, // Default 1 container
            rentalDurationMonths: listing.min_rental_duration || 1, // ✅ Set default rental duration ONLY on first load
          }));
          setIsInitialLoad(false); // ✅ Mark as loaded
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

  const handleContainerSelection = useCallback((selection: {
    mode: 'quantity' | 'selection';
    quantity?: number;
    containerIds?: string[];
    containers?: any[];
    totalPrice?: number;
  }) => {
    setContainerSelection(selection);
    // Update quantity in form data to reflect selection
    // Luôn cập nhật quantity bất kể mode nào
    const selectedQuantity = selection.quantity || (selection.mode === 'selection' && selection.containerIds ? selection.containerIds.length : 1);
    setFormData(prev => ({ ...prev, quantity: selectedQuantity }));
  }, []);

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

    // ✅ Validate rental duration for RENTAL type
    if (listingInfo?.deal_type === 'RENTAL') {
      const minDuration = listingInfo.min_rental_duration || 1;
      const maxDuration = listingInfo.max_rental_duration || 60;
      const unitLabel = listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị';
      
      if (formData.rentalDurationMonths < minDuration) {
        showError(`Thời gian thuê tối thiểu là ${minDuration} ${unitLabel}`);
        return;
      }
      
      if (formData.rentalDurationMonths > maxDuration) {
        showError(`Thời gian thuê tối đa là ${maxDuration} ${unitLabel}`);
        return;
      }
    }

    // Validate container selection if in selection mode
    if (containerSelection?.mode === 'selection' && (!containerSelection.containerIds || containerSelection.containerIds.length === 0)) {
      showError('Vui lòng chọn ít nhất một container');
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      
      // Build payload according to backend API schema
      const payload: any = {
        listing_id: listingId,
        purpose: listingInfo.deal_type === 'SALE' ? 'PURCHASE' : 'RENTAL', // Lấy từ listing
        quantity: formData.quantity,
        need_by: formData.needBy || undefined,
        services: formData.services,
      };

      // ✅ Add rental_duration_months for RENTAL type
      // Convert from rental_unit to actual months before sending to backend
      if (listingInfo.deal_type === 'RENTAL') {
        const rawValue = formData.rentalDurationMonths;
        let durationInMonths = rawValue;
        
        // Convert based on rental_unit
        switch (listingInfo.rental_unit) {
          case 'YEAR':
            durationInMonths = rawValue * 12;
            break;
          case 'QUARTER':
            durationInMonths = rawValue * 3;
            break;
          case 'MONTH':
            durationInMonths = rawValue;
            break;
          case 'WEEK':
            durationInMonths = Math.round(rawValue / 4.33); // ~4.33 weeks per month
            break;
          case 'DAY':
            durationInMonths = Math.round(rawValue / 30); // ~30 days per month
            break;
          default:
            durationInMonths = rawValue; // Fallback to raw value
        }
        
        payload.rental_duration_months = durationInMonths;
        
        console.log(`✅ Rental duration: ${rawValue} ${listingInfo.rental_unit} → ${durationInMonths} months`);
      }

      // Add selected container ISO codes if user chose specific containers
      if (containerSelection?.mode === 'selection' && containerSelection.containers && containerSelection.containers.length > 0) {
        // Gửi container_iso_code thay vì id
        payload.selected_container_ids = containerSelection.containers.map(c => c.container_iso_code);
      }

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
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
              Trang chủ
            </span>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
              RFQ
            </span>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              Tạo yêu cầu báo giá
            </span>
          </div>
        </nav>

        {/* Listing Info Card */}
        {loadingListing ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
            </div>
          </div>
        ) : listingInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={listingInfo.deal_type === 'SALE' ? 'default' : 'secondary'}
                      className="text-sm font-semibold px-3 py-1"
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
                        className="text-xs uppercase font-semibold px-2.5 py-1"
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

                  {/* Title & Description */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">
                        {listingInfo.title}
                      </h2>
                      {listingInfo.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                          {listingInfo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl px-6 py-4 shadow-sm">
                    <div className="text-center">
                      <div className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide mb-1">
                        Giá niêm yết
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400">
                        {new Intl.NumberFormat('vi-VN').format(parseFloat(listingInfo.price_amount || 0))}
                        <span className="text-lg ml-1">{listingInfo.price_currency}</span>
                        {listingInfo.deal_type === 'RENTAL' && listingInfo.rental_unit && (
                          <div className="text-sm font-medium text-green-600 dark:text-green-500 mt-1">
                            /{listingInfo.rental_unit === 'MONTH' ? 'tháng' : 
                              listingInfo.rental_unit === 'WEEK' ? 'tuần' : 
                              listingInfo.rental_unit === 'DAY' ? 'ngày' : 
                              listingInfo.rental_unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listingInfo.depots?.name && (
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                      <MapPin className="h-3.5 w-3.5" />
                      Vị trí
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {listingInfo.depots.name}
                    </span>
                  </div>
                )}
                {listingInfo.containers && (
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                      <Package className="h-3.5 w-3.5" />
                      Container
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {listingInfo.containers.type} - {listingInfo.containers.size_ft}ft
                    </span>
                    {listingInfo.containers.condition && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {listingInfo.containers.condition}
                      </span>
                    )}
                  </div>
                )}
                {listingInfo.users?.display_name && (
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                      Nhà cung cấp
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {listingInfo.users.display_name}
                    </span>
                    {listingInfo.users.email && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                        {listingInfo.users.email}
                      </span>
                    )}
                  </div>
                )}
                {(listingInfo.available_quantity || listingInfo.total_quantity) && (
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                      Số lượng
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {listingInfo.available_quantity || listingInfo.total_quantity} có sẵn
                    </span>
                    {listingInfo.total_quantity && listingInfo.available_quantity !== listingInfo.total_quantity && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        /{listingInfo.total_quantity} tổng
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Thông tin yêu cầu báo giá
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Điền thông tin chi tiết cho yêu cầu báo giá của bạn
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Hiển thị mục đích từ listing */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  Mục đích <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900 dark:text-white text-base md:text-lg block">
                      {listingInfo?.deal_type ? (
                        listingInfo.deal_type === 'SALE' ? 'Mua (Purchase)' : 'Thuê (Rental)'
                      ) : 'Đang tải...'}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Mục đích được xác định từ loại giao dịch trong tin đăng
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 hidden sm:flex px-3 py-1.5 font-semibold">
                    {listingInfo?.deal_type ? getDealTypeDisplayName(listingInfo.deal_type) : ''}
                  </Badge>
                </div>
              </div>

              {/* Container Selector */}
              {listingId && (
                <div className="pt-2">
                  <ContainerSelector
                    listingId={listingId}
                    maxQuantity={listingInfo?.available_quantity || listingInfo?.total_quantity}
                    onSelectionChange={handleContainerSelection}
                    unitPrice={parseFloat(listingInfo?.price_amount || '0')}
                    currency={listingInfo?.price_currency || 'USD'}
                    dealType={listingInfo?.deal_type || 'SALE'} // ✅ Pass dealType
                  />
                </div>
              )}

              {/* Need by date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="needBy" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Ngày cần hàng
                  </Label>
                  <Input
                    id="needBy"
                    type="date"
                    value={formData.needBy}
                    onChange={(e) => handleInputChange('needBy', e.target.value)}
                    className="h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Thời điểm bạn cần nhận container (không bắt buộc)
                  </p>
                </div>

                {/* ✅ NEW: Rental Duration for RENTAL type */}
                {listingInfo?.deal_type === 'RENTAL' && (
                  <div className="space-y-3">
                    <Label htmlFor="rentalDuration" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Thời gian thuê ({listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : 'tháng'}) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rentalDuration"
                      type="number"
                      min={listingInfo.min_rental_duration || 1}
                      max={listingInfo.max_rental_duration || 60}
                      value={formData.rentalDurationMonths}
                      onChange={(e) => handleInputChange('rentalDurationMonths', Number(e.target.value))}
                      className={`h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg ${
                        formData.rentalDurationMonths < (listingInfo.min_rental_duration || 1) || 
                        formData.rentalDurationMonths > (listingInfo.max_rental_duration || 60)
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Tối thiểu: {listingInfo.min_rental_duration || 1} {listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}</span>
                      <span>Tối đa: {listingInfo.max_rental_duration || 60} {listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}</span>
                    </div>
                    {/* ✅ Show error message if out of range */}
                    {(formData.rentalDurationMonths < (listingInfo.min_rental_duration || 1) || 
                      formData.rentalDurationMonths > (listingInfo.max_rental_duration || 60)) && (
                      <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                          {formData.rentalDurationMonths < (listingInfo.min_rental_duration || 1)
                            ? `Thời gian thuê tối thiểu là ${listingInfo.min_rental_duration || 1} ${listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}`
                            : `Thời gian thuê tối đa là ${listingInfo.max_rental_duration || 60} ${listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}`
                          }
                        </span>
                      </div>
                    )}
                    {/* Price Preview */}
                    {listingInfo.price_amount && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">Giá thuê:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('vi-VN').format(parseFloat(listingInfo.price_amount))} {listingInfo.price_currency}/{listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">Thời gian:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formData.rentalDurationMonths} {listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">Số lượng:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formData.quantity} container
                            </span>
                          </div>
                          <div className="border-t-2 border-blue-300 dark:border-blue-600 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-blue-900 dark:text-blue-300">Tạm tính:</span>
                              <span className="font-bold text-blue-900 dark:text-blue-300 text-lg">
                                {new Intl.NumberFormat('vi-VN').format(
                                  parseFloat(listingInfo.price_amount) * formData.rentalDurationMonths * formData.quantity
                                )} {listingInfo.price_currency}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                              = {new Intl.NumberFormat('vi-VN').format(parseFloat(listingInfo.price_amount))} {listingInfo.price_currency}/{listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : 'tháng'} × {formData.rentalDurationMonths} {listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : 'tháng'} × {formData.quantity} container
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Dịch vụ bổ sung
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chọn các dịch vụ bạn muốn yêu cầu báo giá
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  htmlFor="inspection"
                  className="group flex items-start space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Checkbox
                    id="inspection"
                    checked={formData.services.inspection}
                    onCheckedChange={(checked) => handleServiceChange('inspection', checked as boolean)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                      Kiểm định (Inspection)
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Yêu cầu kiểm tra chất lượng container
                    </p>
                  </div>
                </label>

                <label 
                  htmlFor="repair_estimate"
                  className="group flex items-start space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Checkbox
                    id="repair_estimate"
                    checked={formData.services.repair_estimate}
                    onCheckedChange={(checked) => handleServiceChange('repair_estimate', checked as boolean)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                      Báo giá sửa chữa (Repair Estimate)
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Yêu cầu báo giá sửa chữa nếu cần
                    </p>
                  </div>
                </label>

                <label 
                  htmlFor="certification"
                  className="group flex items-start space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Checkbox
                    id="certification"
                    checked={formData.services.certification}
                    onCheckedChange={(checked) => handleServiceChange('certification', checked as boolean)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                      Chứng nhận (Certification)
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Yêu cầu các giấy chứng nhận cần thiết
                    </p>
                  </div>
                </label>

                <label 
                  htmlFor="delivery_estimate"
                  className="group flex items-start space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <Checkbox
                    id="delivery_estimate"
                    checked={formData.services.delivery_estimate}
                    onCheckedChange={(checked) => handleServiceChange('delivery_estimate', checked as boolean)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                      Báo giá vận chuyển (Delivery Estimate)
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Yêu cầu báo giá vận chuyển đến địa điểm
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Tóm tắt yêu cầu
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Xem lại thông tin trước khi gửi yêu cầu
              </p>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                    Mục đích:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-base">
                    {listingInfo?.deal_type ? (
                      <>
                        {listingInfo.deal_type === 'SALE' ? 'Mua' : 'Thuê'} 
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          ({getDealTypeDisplayName(listingInfo.deal_type)})
                        </span>
                      </>
                    ) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Số lượng container:
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-2xl">
                    {formData.quantity}
                  </span>
                </div>

                {/* ✅ NEW: Show rental duration for RENTAL type */}
                {listingInfo?.deal_type === 'RENTAL' && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Thời gian thuê:
                    </span>
                    <span className="font-bold text-green-700 dark:text-green-400 text-2xl">
                      {formData.rentalDurationMonths} {listingInfo.rental_unit === 'YEAR' ? 'năm' : listingInfo.rental_unit === 'QUARTER' ? 'quý' : listingInfo.rental_unit === 'MONTH' ? 'tháng' : 'đơn vị'}
                    </span>
                  </div>
                )}

                {/* Show selected containers if in selection mode */}
                {containerSelection?.mode === 'selection' && containerSelection.containers && containerSelection.containers.length > 0 && (
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold block mb-4">
                      Containers đã chọn ({containerSelection.containers.length}):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {containerSelection.containers.map((container) => (
                        <div 
                          key={container.id} 
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                        >
                          <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                            {container.container_iso_code}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {container.shipping_line && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-medium">
                                {container.shipping_line}
                              </span>
                            )}
                            {container.manufacturing_year && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-medium">
                                {container.manufacturing_year}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.needBy && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày cần hàng:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {new Date(formData.needBy).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2 mb-4">
                    <CheckSquare className="h-4 w-4" />
                    Dịch vụ yêu cầu:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.inspection && (
                      <Badge variant="secondary" className="text-xs px-3 py-1.5 font-semibold">
                        ✓ Kiểm định
                      </Badge>
                    )}
                    {formData.services.repair_estimate && (
                      <Badge variant="secondary" className="text-xs px-3 py-1.5 font-semibold">
                        ✓ Sửa chữa
                      </Badge>
                    )}
                    {formData.services.certification && (
                      <Badge variant="secondary" className="text-xs px-3 py-1.5 font-semibold">
                        ✓ Chứng nhận
                      </Badge>
                    )}
                    {formData.services.delivery_estimate && (
                      <Badge variant="secondary" className="text-xs px-3 py-1.5 font-semibold">
                        ✓ Vận chuyển
                      </Badge>
                    )}
                    {!Object.values(formData.services).some(v => v) && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic px-2 py-1">
                        Không có dịch vụ bổ sung
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="h-12 text-base font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 border-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-14 text-base font-bold min-w-full sm:min-w-[240px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                  Đang gửi yêu cầu...
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
      </div>
    </div>
  );
}


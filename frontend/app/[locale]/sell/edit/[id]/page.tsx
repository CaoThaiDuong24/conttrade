"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Camera,
  DollarSign,
  MapPin,
  Eye,
  ArrowLeft,
  ArrowRight,
  Check,
  Container,
  FileText,
  Building2,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
  Send,
  Save,
  Info,
  AlertCircle
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useListingFormData } from '@/hooks/useMasterData';
import { getDealTypeDisplayName, isRentalType } from '@/lib/utils/dealType';
import { getConditionDisplayName } from '@/lib/utils/condition';
import { generateListingTitle, generateListingDescription } from '@/lib/utils/listingTitle';
import { fetchDepots } from '@/lib/api/depot';
import { uploadMedia, addMediaToListing } from '@/lib/api/media';
import { ContainerListSection } from '@/components/listings/container-list-section';

// Helper function for rental unit display
function getRentalUnitDisplayName(code: string): string {
  switch (code?.toUpperCase()) {
    case 'DAY':
      return 'Ngày';
    case 'WEEK':
      return 'Tuần';
    case 'MONTH':
      return 'Tháng';
    case 'YEAR':
      return 'Năm';
    default:
      return code || 'N/A';
  }
}

// Helper function to check if listing is approved/active (cannot edit)
function isListingApproved(status: string): boolean {
  const upperStatus = status?.toUpperCase();
  return upperStatus === 'ACTIVE' || upperStatus === 'APPROVED';
}

// Helper function to get status badge color
function getStatusBadgeColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'PENDING_REVIEW':
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'PAUSED':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-300';
  }
}

// Helper function to format currency
function formatCurrency(amount: number | string, currency: string = 'VND'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  const formatted = numAmount.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const currencySymbols: { [key: string]: string } = {
    'VND': '₫',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'CNY': '¥',
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  return currency === 'VND' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

// Helper function to get currency symbol
function getCurrencySymbol(currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'VND': '₫',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'CNY': '¥',
  };
  return currencySymbols[currency] || currency;
}

// Helper function to convert number to Vietnamese text
function numberToVietnameseText(num: number): string {
  if (num === 0) return 'Không';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  
  function readThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const one = n % 10;
    
    let result = '';
    
    if (hundred > 0) {
      result += ones[hundred] + ' trăm';
      if (ten === 0 && one > 0) result += ' lẻ';
    }
    
    if (ten > 1) {
      result += (result ? ' ' : '') + ones[ten] + ' mươi';
      if (one === 1) result += ' mốt';
      else if (one === 5 && ten > 0) result += ' lăm';
      else if (one > 0) result += ' ' + ones[one];
    } else if (ten === 1) {
      result += (result ? ' ' : '') + 'mười';
      if (one === 5) result += ' lăm';
      else if (one > 0) result += ' ' + ones[one];
    } else if (one > 0) {
      result += (result ? ' ' : '') + ones[one];
    }
    
    return result.trim();
  }
  
  let result = '';
  let unitIndex = 0;
  
  while (num > 0) {
    const threeDigits = num % 1000;
    if (threeDigits > 0) {
      const text = readThreeDigits(threeDigits);
      result = text + (units[unitIndex] ? ' ' + units[unitIndex] : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }
  
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

type Step = 'specs' | 'media' | 'pricing' | 'depot' | 'review';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const listingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [depots, setDepots] = useState<any[]>([]);
  const [listingStatus, setListingStatus] = useState<string>('');

  // Load master data
  const {
    dealTypes,
    containerSizes,
    containerTypes,
    qualityStandards,
    currencies,
    rentalUnits,
  } = useListingFormData();

  // Extract data arrays from query results
  const dealTypesData = dealTypes.data || [];
  const currenciesData = currencies.data || [];
  const rentalUnitsData = rentalUnits.data || [];

  // Debug master data
  useEffect(() => {
    if (dealTypesData.length > 0) {
      console.log('=== MASTER DATA DEBUG ===');
      console.log('Deal Types:', dealTypesData);
      console.log('Currencies:', currenciesData);
      console.log('Rental Units:', rentalUnitsData);
    }
  }, [dealTypesData, currenciesData, rentalUnitsData]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dealType: '',
    priceAmount: '',
    priceCurrency: '',
    rentalUnit: '',
    locationDepotId: '',
    locationNotes: '',
  });

  // ============ 🆕 QUANTITY STATE ============
  const [saleQuantity, setSaleQuantity] = useState<number>(1); // Số lượng container cho loại BÁN

  // Facets data
  const [facets, setFacets] = useState({
    size: '',
    type: '',
    standard: '',
    condition: '',
  });

  // Media data
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    loadDepots();
    loadListingData();
  }, [listingId]);

  const loadDepots = async () => {
    try {
      const response = await fetchDepots();
      if (response.success && response.data?.depots) {
        setDepots(response.data.depots);
      }
    } catch (error) {
      console.error('Error loading depots:', error);
    }
  };

  // Handle new image upload
  const handleNewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    fileArray.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi file",
          description: `${file.name} không phải là file ảnh hợp lệ`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: `${file.name} vượt quá 5MB`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    // Check total number of images (max 10)
    const totalImages = existingMedia.length + newImages.length + validFiles.length;
    if (totalImages > 10) {
      toast({
        title: "Quá nhiều ảnh",
        description: "Tối đa 10 ảnh được phép",
        variant: "destructive",
      });
      return;
    }

    setNewImages(prev => [...prev, ...validFiles]);
    setNewImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset input
    event.target.value = '';
  };

  // Remove new image before upload
  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Mark existing media for deletion (delete immediately)
  const handleDeleteExistingMedia = async (mediaId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
        });
        return;
      }

      // Delete immediately from backend
      const response = await fetch(`/api/v1/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        // Remove from local state
        setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
        toast({
          title: "Thành công",
          description: "Đã xóa hình ảnh",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: errorData.message || "Không thể xóa hình ảnh",
        });
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa hình ảnh",
      });
    }
  };

  const loadListingData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/v1/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const listing = data.data.listing;
        
        console.log('=== EDIT PAGE DEBUG ===');
        console.log('Full listing data:', listing);
        console.log('Deal type:', listing.deal_type);
        console.log('Price:', listing.price_amount, listing.price_currency);
        console.log('Facets:', listing.listing_facets);
        console.log('Status:', listing.status);

        // Load status
        setListingStatus(listing.status || '');

        // Load form data
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          dealType: listing.deal_type || '',
          priceAmount: listing.price_amount?.toString() || '',
          priceCurrency: listing.price_currency || '',
          rentalUnit: listing.rental_unit || '',
          locationDepotId: listing.location_depot_id || '',
          locationNotes: listing.location_notes || '',
        });

        // ============ 🆕 LOAD QUANTITY FOR SALE TYPE ============
        if (listing.deal_type === 'SALE') {
          setSaleQuantity(listing.total_quantity || listing.available_quantity || 1);
        }

        // Load facets - xử lý cả snake_case và camelCase
        const listingFacets = listing.listing_facets || [];
        const facetsObj: any = {
          size: '',
          type: '',
          standard: '',
          condition: '',
        };

        if (Array.isArray(listingFacets)) {
          listingFacets.forEach((facet: any) => {
            const key = facet.facet_key || facet.key;
            const value = facet.facet_value || facet.value;
            
            if (key && key in facetsObj) {
              facetsObj[key] = value;
            }
          });
        }
        
        console.log('Parsed facets:', facetsObj);
        setFacets(facetsObj);

        // Load existing media
        const mediaList = listing.listing_media || [];
        console.log('Existing media:', mediaList);
        setExistingMedia(mediaList);
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin tin đăng",
        });
        router.push('/sell/my-listings');
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải thông tin tin đăng",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
        });
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.title?.trim()) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng nhập tiêu đề",
        });
        setSubmitting(false);
        return;
      }

      if (!formData.priceAmount || parseFloat(formData.priceAmount) <= 0) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng nhập giá hợp lệ",
        });
        setSubmitting(false);
        return;
      }

      if (!formData.locationDepotId) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng chọn depot",
        });
        setSubmitting(false);
        return;
      }

      // Step 1: Update listing info
      const priceAmount = parseFloat(formData.priceAmount);
      
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        deal_type: formData.dealType,
        price_amount: priceAmount,
        price_currency: formData.priceCurrency,
        location_depot_id: formData.locationDepotId,
        updated_at: new Date().toISOString(),
      };

      // ============ 🆕 UPDATE QUANTITY FOR SALE TYPE ============
      if (formData.dealType === 'SALE') {
        updateData.total_quantity = saleQuantity;
        updateData.available_quantity = saleQuantity;
      }

      // Add rental_unit for rental deals
      const isRental = formData.dealType === 'RENTAL';
      if (isRental && formData.rentalUnit) {
        updateData.rental_unit = formData.rentalUnit;
      }

      // Note: location_notes field doesn't exist in database schema, removed

      console.log('=== UPDATE LISTING ===');
      console.log('Listing ID:', listingId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      console.log('Price amount:', priceAmount, 'Type:', typeof priceAmount, 'Is valid:', !isNaN(priceAmount));

      const response = await fetch(`/api/v1/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || "Không thể cập nhật tin đăng");
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      // Step 2: Upload new images
      if (newImages.length > 0) {
        setUploadingMedia(true);
        for (const file of newImages) {
          try {
            const uploadResult = await uploadMedia(file);
            if (uploadResult.success) {
              // Link media to listing
              await addMediaToListing(listingId, {
                mediaUrl: uploadResult.data.media.url,
                mediaType: 'IMAGE' as const,
              });
            }
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
          }
        }
        setUploadingMedia(false);
      }

      toast({
        title: "Thành công",
        description: "Cập nhật tin đăng thành công",
      });
      router.push('/sell/my-listings');
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật tin đăng",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const isRental = formData.dealType === 'RENTAL';
  const isApproved = isListingApproved(listingStatus);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            asChild 
            className="mb-4"
          >
            <Link href="/sell/my-listings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chỉnh sửa tin đăng
            </h1>
            <p className="text-gray-600">
              Cập nhật thông tin tin đăng của bạn
            </p>
          </div>
        </div>

        {/* Status Warning - Show if listing is approved */}
        {isApproved && (
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Tin đăng đã được duyệt
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Tin đăng này đã được duyệt và đang hoạt động. Bạn không thể chỉnh sửa các thông tin quan trọng. 
                    Nếu cần thay đổi, vui lòng liên hệ quản trị viên.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeColor(listingStatus)} border`}>
                      {listingStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Đã duyệt'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
                  <CardDescription className="mt-1">
                    Cập nhật tiêu đề và mô tả tin đăng
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Tiêu đề tin đăng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề tin đăng"
                  required
                  disabled={isApproved}
                  className="h-10"
                />
                <p className="text-xs text-gray-500">
                  {formData.title.length}/100 ký tự
                </p>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả chi tiết về container..."
                  rows={6}
                  required
                  disabled={isApproved}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length}/1000 ký tự
                </p>
              </div>

              <Separator />

              {/* Deal Type */}
              <div className="space-y-2">
                <Label htmlFor="dealType" className="text-sm font-medium">
                  Loại giao dịch <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.dealType}
                  onValueChange={(value) => setFormData({ ...formData, dealType: value })}
                  disabled={isApproved}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Chọn loại giao dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealTypesData.map((dt: any) => (
                      <SelectItem key={dt.code} value={dt.code}>
                        {dt.name_vi || dt.name || getDealTypeDisplayName(dt.code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.dealType && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Loại giao dịch hiện tại:</span>{' '}
                      <span className="font-bold">{getDealTypeDisplayName(formData.dealType)}</span>
                      {formData.dealType === 'RENTAL' ? (
                        <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">Cần nhập đơn vị thời gian thuê</span>
                      ) : null}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">Thông tin giá cả</CardTitle>
                  <CardDescription className="mt-1">
                    Thiết lập giá {isRental ? 'thuê' : 'bán'} và đơn vị tiền tệ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Amount */}
                <div className="space-y-2">
                  <Label htmlFor="priceAmount" className="text-sm font-medium">
                    {isRental ? 'Giá thuê' : 'Giá bán'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    value={formData.priceAmount}
                    onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                    placeholder="Nhập giá"
                    required
                    min="0"
                    step="0.01"
                    disabled={isApproved}
                    className="h-10"
                  />
                  {formData.priceAmount && parseFloat(formData.priceAmount) > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-base font-bold text-green-700">
                            {formatCurrency(formData.priceAmount, formData.priceCurrency)}
                            {isRental && formData.rentalUnit && (
                              <span className="text-green-600 font-medium">
                                /{getRentalUnitDisplayName(formData.rentalUnit).toLowerCase()}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 italic mt-1">
                            {numberToVietnameseText(Math.floor(parseFloat(formData.priceAmount)))} {formData.priceCurrency === 'VND' ? 'đồng' : formData.priceCurrency}
                            {formData.priceCurrency === 'VND' && ' chẵn'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="priceCurrency" className="text-sm font-medium">
                    Đơn vị tiền tệ <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.priceCurrency}
                    onValueChange={(value) => setFormData({ ...formData, priceCurrency: value })}
                    disabled={isApproved}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                    </SelectTrigger>
                    <SelectContent>
                      {currenciesData.map((curr: any) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{getCurrencySymbol(curr.code)}</span>
                            <span>{curr.code}</span>
                            <span className="text-gray-500">- {curr.name || curr.name_vi}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.priceCurrency && (
                    <p className="text-xs text-gray-600">
                      Ký hiệu: <span className="font-semibold text-blue-600">{getCurrencySymbol(formData.priceCurrency)}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ============ 🆕 SALE QUANTITY INPUT ============ */}
              {formData.dealType === 'SALE' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="saleQuantity" className="text-sm font-medium">
                      Số lượng container <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="saleQuantity"
                        type="number"
                        min="1"
                        value={saleQuantity}
                        onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
                        placeholder="VD: 10"
                        required
                        className="h-10 pl-10"
                        disabled={isApproved}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Số lượng container có sẵn để bán
                    </p>
                  </div>
                </>
              )}

              {/* Rental Unit */}
              {isRental && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="rentalUnit" className="text-sm font-medium">
                      Đơn vị thời gian thuê <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.rentalUnit}
                      onValueChange={(value) => setFormData({ ...formData, rentalUnit: value })}
                      disabled={isApproved}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn đơn vị thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        {rentalUnitsData.map((unit: any) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name_vi || unit.name || getRentalUnitDisplayName(unit.code)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.rentalUnit && (
                      <p className="text-xs text-gray-600">
                        Đơn vị hiện tại: <span className="font-semibold">{getRentalUnitDisplayName(formData.rentalUnit)}</span>
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">Vị trí lưu trữ</CardTitle>
                  <CardDescription className="mt-1">
                    Chọn depot và thêm ghi chú về vị trí
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Depot */}
              <div className="space-y-2">
                <Label htmlFor="depot" className="text-sm font-medium">
                  Depot <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.locationDepotId}
                  onValueChange={(value) => setFormData({ ...formData, locationDepotId: value })}
                  disabled={isApproved}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Chọn depot" />
                  </SelectTrigger>
                  <SelectContent>
                    {depots.map((depot: any) => (
                      <SelectItem key={depot.id} value={depot.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{depot.name}</span>
                          <span className="text-muted-foreground">- {depot.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Location Notes */}
              <div className="space-y-2">
                <Label htmlFor="locationNotes" className="text-sm font-medium">
                  Ghi chú vị trí <span className="text-gray-500">(tùy chọn)</span>
                </Label>
                <Textarea
                  id="locationNotes"
                  value={formData.locationNotes}
                  onChange={(e) => setFormData({ ...formData, locationNotes: e.target.value })}
                  placeholder="Vd: Kho A, dãy 3, vị trí 15..."
                  rows={3}
                  className="resize-none"
                  disabled={isApproved}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Management Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">Hình ảnh</CardTitle>
                  <CardDescription className="mt-1">
                    Quản lý hình ảnh tin đăng (tối đa 10 ảnh)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Existing Media */}
              {existingMedia.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ảnh hiện có ({existingMedia.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingMedia.map((media: any) => {
                      // Skip if media doesn't have URL
                      if (!media.url && !media.media_url) {
                        return null;
                      }
                      
                      // Use NEXT_PUBLIC_API_URL or empty for relative path
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
                      const mediaUrl = media.url || media.media_url || '';
                      const imageUrl = mediaUrl.startsWith('http') ? mediaUrl : (baseUrl ? `${baseUrl}${mediaUrl}` : mediaUrl);
                      
                      return (
                        <div 
                          key={media.id} 
                          className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                        >
                          <div className="aspect-square">
                            <img
                              src={imageUrl}
                              alt="Listing media"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteExistingMedia(media.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={isApproved}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Xóa ngay
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ảnh mới ({newImages.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-green-300">
                        <div className="aspect-square">
                          <img
                            src={preview}
                            alt={`New image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveNewImage(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="text-xs bg-green-500">
                            Mới
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Thêm ảnh mới {existingMedia.length + newImages.length > 0 && 
                    `(${existingMedia.length + newImages.length}/10)`}
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('new-image-upload')?.click()}
                    disabled={isApproved || existingMedia.length + newImages.length >= 10}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn ảnh
                  </Button>
                  <input
                    id="new-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">
                    Tối đa 5MB mỗi ảnh, định dạng JPG/PNG
                  </p>
                </div>
              </div>

              {uploadingMedia && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Đang upload ảnh mới...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Container Specifications - Read Only */}
          <Card className="shadow-lg border-0 bg-amber-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-amber-600" />
                <div>
                  <CardTitle className="text-xl">Thông số container</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Các thông số này không thể chỉnh sửa
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Kích thước</Label>
                  <Input 
                    value={facets.size} 
                    disabled 
                    className="bg-white/50 border-amber-200/50 text-gray-700 font-medium cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Loại</Label>
                  <Input 
                    value={facets.type} 
                    disabled 
                    className="bg-white/50 border-gray-300 text-gray-700 font-medium cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Tiêu chuẩn</Label>
                  <Input 
                    value={facets.standard} 
                    disabled 
                    className="bg-white/50 border-gray-300 text-gray-700 font-medium cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Tình trạng</Label>
                  <Input 
                    value={facets.condition} 
                    disabled 
                    className="bg-white/50 border-gray-300 text-gray-700 font-medium cursor-not-allowed" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Container List */}
          {listingId && (
            <div className="mb-6">
              <ContainerListSection listingId={listingId} isAdmin={false} />
            </div>
          )}

          {/* Action Buttons - At bottom of form, not sticky */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/sell/my-listings')}
              disabled={submitting}
              className="flex-1 h-11"
            >
              {isApproved ? 'Quay lại' : 'Hủy'}
            </Button>
            {!isApproved && (
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật tin đăng
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Star,
  Truck,
  Shield,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Ruler,
  Box,
  FileText,
  Award,
  MapPinned,
  Hash
} from "lucide-react";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { API_BASE_URL } from '@/lib/config';

interface ContainerDetailModalProps {
  listing: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerDetailModal({ listing, open, onOpenChange }: ContainerDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: 'loading' | 'loaded' | 'error' }>({});
  const router = useRouter();

  if (!listing) return null;

  // Helper to get facet value
  const getFacetValue = (key: string): string | undefined => {
    return listing.listing_facets?.find((f: any) => f.key === key)?.value;
  };

  // Get all images
  const images = listing.listing_media?.map((media: any) => {
    if (media.media_url.startsWith('http')) {
      return media.media_url;
    }
    const baseUrl = API_BASE_URL || 'http://localhost:3006';
    return `${baseUrl}${media.media_url}`;
  }) || [];

  // Format price
  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(amount);
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleImageLoad = (url: string) => {
    setImageLoadStates(prev => ({ ...prev, [url]: 'loaded' }));
  };

  const handleImageError = (url: string) => {
    setImageLoadStates(prev => ({ ...prev, [url]: 'error' }));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const isRental = listing.deal_type === 'RENTAL';
  const size = getFacetValue('size');
  const containerType = getFacetValue('type');
  const containerStandard = getFacetValue('standard');
  const condition = getFacetValue('condition');
  const location = getFacetValue('location') || listing.depots?.name;
  const quantity = listing.total_quantity || listing.available_quantity || getFacetValue('quantity');
  
  // Additional info from listing
  const viewCount = listing.view_count || 0;
  const favoriteCount = listing.favorite_count || 0;
  const publishedDate = listing.published_at ? new Date(listing.published_at) : null;
  const createdDate = listing.created_at ? new Date(listing.created_at) : null;
  
  // User info - API trả về 'users' (số nhiều), fallback về 'user' (số ít)
  const userInfo = listing.users || listing.user;
  
  // Helper to convert codes to Vietnamese names
  const getContainerTypeName = (code: string): string => {
    const types: Record<string, string> = {
      'DRY': 'Container khô',
      'HC': 'Container cao',
      'RF': 'Container lạnh',
      'OT': 'Container mui mở',
      'FR': 'Container sàn phẳng',
      'TNK': 'Container bồn',
      'SPECIAL': 'Container đặc biệt'
    };
    return types[code] || code;
  };
  
  const getStandardName = (code: string): string => {
    const standards: Record<string, string> = {
      'IICL': 'Tiêu chuẩn IICL',
      'CW': 'Tiêu chuẩn CW',
      'WWT': 'Tiêu chuẩn WWT',
      'AS_IS': 'Hiện trạng'
    };
    return standards[code] || code;
  };
  
  const getConditionName = (code: string): string => {
    const conditions: Record<string, string> = {
      'new': 'Mới',
      'used': 'Đã qua sử dụng',
      'refurbished': 'Tân trang',
      'damaged': 'Hư hỏng'
    };
    return conditions[code] || code;
  };

  // Handle request quote
  const handleRequestQuote = () => {
    router.push('/auth/login');
  };

  // Handle buy now
  const handleBuyNow = () => {
    router.push('/auth/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 rounded-full p-2 bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="Đóng"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-white via-blue-50/30 to-white border-b shadow-sm px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-16 line-clamp-2 text-gray-900">
              {listing.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge 
                variant={listing.status === 'ACTIVE' || listing.status === 'active' ? 'default' : 'secondary'}
                className="text-xs font-medium px-3 py-1 shadow-sm"
              >
                {listing.status === 'ACTIVE' || listing.status === 'active' ? '✓ Đang hoạt động' : '⏱ Chờ duyệt'}
              </Badge>
              {listing.rental_available && (
                <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700 bg-emerald-50 px-3 py-1 shadow-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cho thuê
                </Badge>
              )}
              {viewCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">{viewCount.toLocaleString()}</span>
                </div>
              )}
              {favoriteCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{favoriteCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1600px] mx-auto">
            {/* Left Column - Images (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              {images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 group">
                    {imageLoadStates[images[currentImageIndex]] === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <p className="text-sm text-gray-500 font-medium">Đang tải hình ảnh...</p>
                        </div>
                      </div>
                    )}
                    {imageLoadStates[images[currentImageIndex]] === 'error' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-100">
                        <div className="text-center p-6">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                            <Box className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">Không thể tải hình ảnh</p>
                          <p className="text-xs text-gray-400 mt-1">Vui lòng thử lại sau</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={images[currentImageIndex]}
                        alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onLoad={() => handleImageLoad(images[currentImageIndex])}
                        onError={() => handleImageError(images[currentImageIndex])}
                        style={{ display: imageLoadStates[images[currentImageIndex]] === 'loaded' ? 'block' : 'none' }}
                      />
                    )}

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-blue-500/20 group/btn border border-gray-200"
                          aria-label="Previous image"
                        >
                          <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-blue-500/20 group/btn border border-gray-200"
                          aria-label="Next image"
                        >
                          <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/10">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-6 gap-3">
                      {images.slice(0, 6).map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            currentImageIndex === index 
                              ? 'border-blue-600 ring-4 ring-blue-200/50 scale-105 shadow-lg' 
                              : 'border-gray-200 hover:border-blue-400 hover:scale-105 hover:shadow-md'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {currentImageIndex === index && (
                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 via-white to-gray-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-200">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <Box className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-600">Chưa có hình ảnh</p>
                    <p className="text-sm text-gray-400 mt-1">Hình ảnh sẽ được cập nhật sau</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      Mô tả chi tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                      {listing.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Info (1/3 width) */}
            <div className="space-y-4">
              {/* Price Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 mb-3 bg-blue-100 px-4 py-1.5 rounded-full">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Giá {isRental ? 'thuê' : 'bán'}</span>
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                      {formatPrice(listing.price_amount, listing.price_currency)}
                    </div>
                    {isRental && listing.rental_period && (
                      <div className="text-sm font-medium text-gray-600">
                        / {listing.rental_period}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    Thông số kỹ thuật
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-4">
                  {size && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Ruler className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Kích thước</div>
                        <div className="font-bold text-gray-900">{size} feet</div>
                      </div>
                    </div>
                  )}
                  {containerType && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Box className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Loại</div>
                        <div className="font-bold text-gray-900">{getContainerTypeName(containerType)}</div>
                      </div>
                    </div>
                  )}
                  {containerStandard && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Tiêu chuẩn</div>
                        <div className="font-bold text-gray-900">{getStandardName(containerStandard)}</div>
                      </div>
                    </div>
                  )}
                  {condition && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Shield className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Tình trạng</div>
                        <div className="font-bold text-gray-900">{getConditionName(condition)}</div>
                      </div>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <MapPinned className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Vị trí</div>
                        <div className="font-bold text-gray-900">{location}</div>
                      </div>
                    </div>
                  )}
                  {quantity && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Hash className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Số lượng</div>
                        <div className="font-bold text-gray-900">
                          <span className="text-emerald-600">{listing.available_quantity || 0}</span> / {listing.total_quantity || quantity} có sẵn
                        </div>
                      </div>
                    </div>
                  )}
                  {listing.deal_type && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Hình thức</div>
                        <div className="font-bold text-gray-900">
                          {listing.deal_type === 'SALE' ? 'Mua bán' : 
                           listing.deal_type === 'RENTAL' ? 'Cho thuê' :
                           listing.deal_type}
                        </div>
                      </div>
                    </div>
                  )}
                  {publishedDate && (
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Ngày đăng</div>
                        <div className="font-bold text-gray-900">
                          {publishedDate.toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rental Terms */}
              {isRental && (
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <div className="p-2 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      Điều khoản cho thuê
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-sm pt-4">
                    {listing.deposit_required && listing.deposit_amount && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Tiền đặt cọc:</span>
                        <span className="font-bold text-emerald-700">
                          {formatPrice(Number(listing.deposit_amount), listing.deposit_currency || listing.price_currency)}
                        </span>
                      </div>
                    )}
                    {listing.min_rental_duration && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Thời gian tối thiểu:</span>
                        <span className="font-bold text-gray-900">{listing.min_rental_duration} {listing.rental_unit === 'MONTH' ? 'tháng' : listing.rental_unit === 'WEEK' ? 'tuần' : listing.rental_unit === 'DAY' ? 'ngày' : listing.rental_unit?.toLowerCase() || 'ngày'}</span>
                      </div>
                    )}
                    {listing.max_rental_duration && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Thời gian tối đa:</span>
                        <span className="font-bold text-gray-900">{listing.max_rental_duration} {listing.rental_unit === 'MONTH' ? 'tháng' : listing.rental_unit === 'WEEK' ? 'tuần' : listing.rental_unit === 'DAY' ? 'ngày' : listing.rental_unit?.toLowerCase() || 'ngày'}</span>
                      </div>
                    )}
                    {listing.rental_unit && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Chu kỳ thanh toán:</span>
                        <span className="font-bold text-gray-900">
                          Theo {listing.rental_unit === 'MONTH' ? 'tháng' : listing.rental_unit === 'WEEK' ? 'tuần' : listing.rental_unit === 'DAY' ? 'ngày' : listing.rental_unit.toLowerCase()}
                        </span>
                      </div>
                    )}
                    {listing.late_return_fee_amount && (
                      <div className="flex justify-between items-center p-2 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-rose-700 font-medium">Phí trả muộn:</span>
                        <span className="font-bold text-rose-700">
                          {formatPrice(Number(listing.late_return_fee_amount), listing.price_currency)} / {listing.late_return_fee_unit === 'PER_WEEK' ? 'tuần' : listing.late_return_fee_unit === 'PER_DAY' ? 'ngày' : listing.late_return_fee_unit === 'PER_MONTH' ? 'tháng' : listing.late_return_fee_unit?.replace('PER_', '').toLowerCase() || 'ngày'}
                        </span>
                      </div>
                    )}
                    {listing.earliest_available_date && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Sớm nhất:</span>
                        <span className="font-bold text-gray-900">
                          {new Date(listing.earliest_available_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {listing.latest_return_date && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Muộn nhất:</span>
                        <span className="font-bold text-gray-900">
                          {new Date(listing.latest_return_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {listing.auto_renewal_enabled && (
                      <div className="flex items-start gap-2.5 mt-3 p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl border border-emerald-200 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-emerald-900 block mb-1">Tự động gia hạn</span>
                          {listing.renewal_notice_days && (
                            <span className="text-emerald-700 block">• Thông báo trước {listing.renewal_notice_days} ngày</span>
                          )}
                          {listing.renewal_price_adjustment && listing.renewal_price_adjustment !== 0 && (
                            <span className="text-emerald-700 block">• Điều chỉnh giá: {listing.renewal_price_adjustment > 0 ? '+' : ''}{listing.renewal_price_adjustment}%</span>
                          )}
                        </div>
                      </div>
                    )}
                    {listing.total_rental_count && listing.total_rental_count > 0 && (
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-200 p-2 bg-emerald-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Đã cho thuê:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {listing.total_rental_count} lần
                        </span>
                      </div>
                    )}
                    {listing.last_rented_at && (
                      <div className="flex justify-between items-center p-2 hover:bg-emerald-50/50 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">Lần thuê cuối:</span>
                        <span className="font-bold text-gray-900">
                          {new Date(listing.last_rented_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Seller Info */}
              {userInfo && (
                <Card className="shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      Người bán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-indigo-100">
                        {userInfo.username?.[0]?.toUpperCase() || userInfo.full_name?.[0]?.toUpperCase() || userInfo.display_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-base">
                          {userInfo.full_name || userInfo.display_name || userInfo.username}
                        </div>
                        {userInfo.username && (userInfo.full_name || userInfo.display_name) && (
                          <div className="text-xs text-gray-500 mt-0.5">@{userInfo.username}</div>
                        )}
                        <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span className="font-semibold">Đã xác minh</span>
                        </div>
                      </div>
                    </div>
                    {userInfo.email && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="truncate font-medium">{userInfo.email}</span>
                      </div>
                    )}
                    {userInfo.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                        <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                          <Phone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium">{userInfo.phone}</span>
                      </div>
                    )}
                    {listing.orgs && (
                      <div className="flex items-start gap-2.5 text-sm text-gray-700 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                        <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-blue-900">{listing.orgs.org_name || listing.orgs.name}</div>
                          {listing.orgs.tax_id && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">MST: {listing.orgs.tax_id}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Info Card */}
              {(listing.features || listing.specifications) && (
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Đặc điểm nổi bật
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-4">
                    {listing.features && typeof listing.features === 'object' && (
                      <div className="space-y-2">
                        {Object.entries(listing.features).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2.5 text-sm p-2.5 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all duration-200">
                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="sticky bottom-0 z-10 bg-gradient-to-r from-white via-blue-50/30 to-white border-t shadow-lg px-6 py-4">
          <div className="flex gap-3 max-w-[1600px] mx-auto">
            <Button 
              variant="outline" 
              className="h-12 font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md px-10"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12 font-semibold border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-600 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleRequestQuote}
            >
              <FileText className="w-5 h-5 mr-2" />
              Yêu cầu báo giá
            </Button>
            {/* Buy Now Button - Only show for SALE listings, not for RENTAL */}
            {!isRental && (
              <Button 
                className="flex-1 h-12 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={handleBuyNow}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Mua ngay
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

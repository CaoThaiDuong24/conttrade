"use client";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { fetchListingById } from '@/lib/api/listings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
import { getConditionLabel } from '@/lib/utils/condition';
import { getSizeLabel } from '@/lib/utils/containerSize';
import { getStandardLabel } from '@/lib/utils/qualityStandard';
import { getTypeLabel } from '@/lib/utils/containerType';
import { formatListingTitle } from '@/lib/utils/listingTitle';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Eye, 
  Heart, 
  Share2, 
  Flag, 
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ContainerListSection } from '@/components/listings/container-list-section';
// import { ImageGallery } from '@/components/ui/image-gallery'; // Not used yet

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res: any = await fetchListingById(params.id);
        console.log('Listing detail API response:', res);
        
        // Increment view count asynchronously (don't wait for result)
        const apiUrl = '/api/v1';
        fetch(`${apiUrl}/listings/${params.id}/view`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {
          // Silently fail - view count is not critical
          console.warn('Failed to increment view count');
        });
        
        if (ignore) return;
        
        if (res && res.success && res.data && res.data.listing) {
          const apiListing = res.data.listing;
          
          // Map API response to UI format
          setListing({
            id: apiListing.id,
            title: apiListing.title,
            description: apiListing.description || 'Chưa có mô tả',
            price: parseFloat(apiListing.price_amount || apiListing.priceAmount || apiListing.price || 0),
            currency: apiListing.price_currency || apiListing.priceCurrency || apiListing.currency || 'VND',
            dealType: apiListing.deal_type,
            rentalUnit: apiListing.rental_unit,
            size: apiListing.listing_facets?.find((f: any) => f.key === 'size')?.value || 'N/A',
            type: apiListing.listing_facets?.find((f: any) => f.key === 'type')?.value || 'N/A',
            standard: apiListing.listing_facets?.find((f: any) => f.key === 'standard')?.value || 'N/A',
            condition: apiListing.listing_facets?.find((f: any) => f.key === 'condition')?.value || 'N/A',
            location: apiListing.depots?.name || apiListing.location_depot_id || 'N/A',
            depotAddress: apiListing.depots?.address || '',
            views: apiListing.views || 0,
            rating: apiListing.rating || 0,
            reviews: apiListing.reviews_count || apiListing.reviewsCount || 0,
            postedDate: apiListing.created_at ? new Date(apiListing.created_at).toLocaleDateString('vi-VN') : 'N/A',
            featured: apiListing.featured || false,
            // Rental management fields
            totalQuantity: apiListing.total_quantity || 1,
            availableQuantity: apiListing.available_quantity || 1,
            rentedQuantity: apiListing.rented_quantity || 0,
            reservedQuantity: apiListing.reserved_quantity || 0,
            maintenanceQuantity: apiListing.maintenance_quantity || 0,
            minRentalDuration: apiListing.min_rental_duration,
            maxRentalDuration: apiListing.max_rental_duration,
            depositRequired: apiListing.deposit_required || false,
            depositAmount: apiListing.deposit_amount ? parseFloat(apiListing.deposit_amount) : null,
            depositCurrency: apiListing.deposit_currency,
            lateReturnFeeAmount: apiListing.late_return_fee_amount ? parseFloat(apiListing.late_return_fee_amount) : null,
            lateReturnFeeUnit: apiListing.late_return_fee_unit,
            earliestAvailableDate: apiListing.earliest_available_date,
            latestReturnDate: apiListing.latest_return_date,
            autoRenewalEnabled: apiListing.auto_renewal_enabled || false,
            renewalNoticeDays: apiListing.renewal_notice_days || 7,
            renewalPriceAdjustment: apiListing.renewal_price_adjustment ? parseFloat(apiListing.renewal_price_adjustment) : 0,
            images: apiListing.listing_media?.length > 0 
              ? apiListing.listing_media.map((m: any) => {
                  // Use NEXT_PUBLIC_API_URL if available, otherwise relative path
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
                  const fullUrl = m.media_url ? (apiUrl ? `${apiUrl}${m.media_url}` : m.media_url) : null;
                  return {
                    id: m.id,
                    url: fullUrl,
                    type: m.media_type === 'video' ? 'video' : 'image',
                    alt: `${apiListing.title} - Media ${m.sort_order || 1}`
                  };
                }).filter((item: any) => item.url)
              : [],
            specifications: {
              length: apiListing.listing_facets?.find((f: any) => f.key === 'length')?.value || apiListing.containers?.length || 'N/A',
              width: apiListing.listing_facets?.find((f: any) => f.key === 'width')?.value || apiListing.containers?.width || 'N/A',
              height: apiListing.listing_facets?.find((f: any) => f.key === 'height')?.value || apiListing.containers?.height || 'N/A',
              weight: apiListing.listing_facets?.find((f: any) => f.key === 'weight')?.value || apiListing.containers?.weight || 'N/A',
              maxLoad: apiListing.listing_facets?.find((f: any) => f.key === 'max_load')?.value || apiListing.containers?.max_load || 'N/A',
              volume: apiListing.listing_facets?.find((f: any) => f.key === 'volume')?.value || apiListing.containers?.volume || 'N/A',
            },
            seller: {
              name: apiListing.seller?.display_name || apiListing.seller?.email || 'Người bán',
              orgName: apiListing.seller?.org_users?.[0]?.org?.name || apiListing.seller?.organization || ''
            },
            services: apiListing.services || {}
          });
        } else {
          setError('Không tìm thấy tin đăng');
        }
      } catch (err: any) {
        console.error('Error fetching listing detail:', err);
        if (!ignore) {
          setError(err.message || 'Không thể tải thông tin tin đăng');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();
    return () => { ignore = true };
  }, [params.id]);

  // Fetch related listings
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        if (!listing) return;
        
        const apiUrl = '/api/v1';
        const response = await fetch(
          `${apiUrl}/listings?limit=3&status=ACTIVE&exclude=${params.id}`
        );
        const result = await response.json();
        
        if (!ignore && result.success && result.data) {
          setRelatedListings(result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: parseFloat(item.price_amount || 0),
            currency: item.price_currency || 'VND',
            image: item.listing_media?.[0]?.media_url 
              ? `${apiUrl}${item.listing_media[0].media_url}` 
              : '/placeholder.jpg',
            location: item.depots?.name || 'N/A',
          })));
        }
      } catch (error) {
        console.error('Error fetching related listings:', error);
      }
    })();
    return () => { ignore = true };
  }, [listing, params.id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 p-6">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-fit">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <Package className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="flex items-center justify-center py-20 p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="rounded-full bg-red-100 p-6 mb-6 mx-auto w-fit">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Có lỗi xảy ra</h2>
          <p className="text-muted-foreground mb-6">{error || 'Không tìm thấy tin đăng'}</p>
          <Button 
            onClick={() => window.location.href = '/listings'} 
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200">Trang chủ</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200">Tin đăng</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">Chi tiết</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <div className="relative">
                {/* Main Image */}
                <div className="relative h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[currentImageIndex]?.url || '/placeholder.jpg'}
                        alt={listing.images[currentImageIndex]?.alt || listing.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                      
                      {/* Badges overlay */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {listing.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                            ⭐ Nổi bật
                          </Badge>
                        )}
                        <Badge variant={listing.dealType === 'SALE' ? 'default' : 'secondary'} className="shadow-md">
                          {getDealTypeDisplayName(listing.dealType)}
                        </Badge>
                      </div>

                      {/* Image counter */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm shadow-lg">
                          {currentImageIndex + 1}/{listing.images.length}
                        </Badge>
                      </div>

                      {/* Navigation arrows */}
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? listing.images.length - 1 : prev - 1
                            )}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:scale-110"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === listing.images.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:scale-110"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Zoom indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm shadow-lg">
                          🔍 Click để phóng to
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-300 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                          <Eye className="w-10 h-10 text-gray-500" />
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">Chưa có hình ảnh</p>
                        <p className="text-gray-500 text-sm mt-1">Vui lòng liên hệ để xem ảnh thực tế</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {listing.images && listing.images.length > 1 && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-primary/10">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {listing.images.map((image: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                            index === currentImageIndex 
                              ? 'border-primary ring-2 ring-primary/30 shadow-md' 
                              : 'border-gray-200 hover:border-primary/50 shadow-sm'
                          }`}
                        >
                          <img
                            src={image.url || '/placeholder.jpg'}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.jpg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title and Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 leading-tight">{formatListingTitle(listing.title, listing)}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                    <span className="font-medium">{listing.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 shadow-sm">
                    <Heart className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Yêu thích</span>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 shadow-sm">
                    <Share2 className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Chia sẻ</span>
                  </Button>
                </div>
              </div>

              {/* Price and Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                    {new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}
                    {listing.dealType === 'RENTAL' && listing.rentalUnit && (
                      <span className="text-lg font-medium">
                        {listing.rentalUnit === 'MONTH' && ' / tháng'}
                        {listing.rentalUnit === 'WEEK' && ' / tuần'}
                        {listing.rentalUnit === 'DAY' && ' / ngày'}
                      </span>
                    )}
                  </div>
                  <div className="text-primary/80 text-sm font-semibold">
                    Giá {getDealTypeDisplayName(listing.dealType).toLowerCase()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center text-green-700 mb-1">
                    <Eye className="h-5 w-5 mr-2" />
                    <span className="text-2xl lg:text-3xl font-bold">{listing.views}</span>
                  </div>
                  <div className="text-green-600 text-sm font-semibold">Lượt xem</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center text-purple-700 mb-1">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-lg font-bold">{listing.postedDate}</span>
                  </div>
                  <div className="text-purple-600 text-sm font-semibold">Ngày đăng</div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-primary/10 pt-4">
                <h3 className="text-lg font-bold mb-3 text-foreground flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Mô tả
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">{listing.description}</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-bold mb-4 text-foreground flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Kích thước</span>
                    <span className="font-bold text-foreground">{getSizeLabel(listing.size)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Loại</span>
                    <span className="font-bold text-foreground">{getTypeLabel(listing.type)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Tiêu chuẩn</span>
                    <span className="font-bold text-foreground">{getStandardLabel(listing.standard)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Tình trạng</span>
                    <Badge variant="outline" className="font-semibold border-primary/30">{getConditionLabel(listing.condition)}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Chiều dài</span>
                    <span className="font-bold text-foreground">{listing.specifications?.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Chiều rộng</span>
                    <span className="font-bold text-foreground">{listing.specifications?.width}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                    <span className="text-muted-foreground font-medium">Chiều cao</span>
                    <span className="font-bold text-foreground">{listing.specifications?.height}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ 🆕 SALE QUANTITY INFORMATION ============ */}
            {listing.dealType === 'SALE' && (listing.totalQuantity > 1 || listing.availableQuantity > 1) && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-bold mb-4 text-foreground flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Thông tin số lượng
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-primary/80 font-semibold mb-1">Tổng số lượng</div>
                    <div className="text-3xl font-bold text-primary">{listing.totalQuantity}</div>
                    <div className="text-xs text-primary/70 mt-1">container</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-green-600 font-semibold mb-1">Có sẵn</div>
                    <div className="text-3xl font-bold text-green-700">{listing.availableQuantity}</div>
                    <div className="text-xs text-green-500 mt-1">container</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-purple-600 font-semibold mb-1">Trạng thái</div>
                    <div className="text-lg font-bold text-purple-700 flex items-center">
                      {listing.availableQuantity > 0 ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-1.5 flex-shrink-0" />
                          <span>Còn hàng</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 mr-1.5 text-red-700 flex-shrink-0" />
                          <span className="text-red-700">Hết hàng</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {listing.availableQuantity > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-300">
                    <p className="text-sm text-blue-700 flex items-start">
                      <span className="font-bold mr-1.5 text-base">💡</span>
                      <span><span className="font-bold">Gợi ý:</span> Có {listing.availableQuantity} container sẵn sàng để giao ngay. Liên hệ người bán để được tư vấn chi tiết.</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rental Management Information (chỉ hiển thị cho RENTAL) */}
            {listing.dealType === 'RENTAL' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-bold mb-4 text-foreground flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Thông tin quản lý cho thuê
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity Management */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-3">Quản lý số lượng</h4>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                      <span className="text-muted-foreground font-medium">Tổng số</span>
                      <span className="font-bold text-foreground">{listing.totalQuantity} container</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200/50 hover:shadow-sm transition-all duration-200">
                      <span className="text-green-700 font-medium">Có sẵn</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 font-bold">
                        {listing.availableQuantity} container
                      </Badge>
                    </div>
                    {listing.rentedQuantity > 0 && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-blue-700 font-medium">Đang thuê</span>
                        <span className="font-bold text-blue-700">{listing.rentedQuantity}</span>
                      </div>
                    )}
                    {listing.reservedQuantity > 0 && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-amber-700 font-medium">Đã đặt trước</span>
                        <span className="font-bold text-amber-700">{listing.reservedQuantity}</span>
                      </div>
                    )}
                    {listing.maintenanceQuantity > 0 && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-50/50 border border-orange-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-orange-700 font-medium">Đang bảo trì</span>
                        <span className="font-bold text-orange-700">{listing.maintenanceQuantity}</span>
                      </div>
                    )}
                  </div>

                  {/* Duration & Dates */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-3">Thời hạn thuê</h4>
                    
                    {/* ✅ Enhanced Rental Duration Display */}
                    {listing.minRentalDuration && listing.maxRentalDuration && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300 mb-3">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-blue-900">Thời gian thuê linh hoạt</span>
                        </div>
                        <div className="text-center py-2">
                          <div className="text-3xl font-bold text-blue-700">
                            {listing.minRentalDuration} - {listing.maxRentalDuration}
                          </div>
                          <div className="text-sm font-medium text-blue-600 mt-1">
                            {listing.rentalUnit === 'MONTH' ? 'tháng' : listing.rentalUnit === 'DAY' ? 'ngày' : listing.rentalUnit === 'WEEK' ? 'tuần' : listing.rentalUnit?.toLowerCase()}
                          </div>
                          <div className="text-xs text-blue-500 mt-2">
                            Bạn có thể chọn thời gian thuê từ {listing.minRentalDuration} đến {listing.maxRentalDuration} {listing.rentalUnit === 'MONTH' ? 'tháng' : listing.rentalUnit === 'DAY' ? 'ngày' : 'tuần'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {listing.minRentalDuration && !listing.maxRentalDuration && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-muted-foreground font-medium">Tối thiểu</span>
                        <span className="font-bold text-foreground">
                          {listing.minRentalDuration} {listing.rentalUnit === 'MONTH' ? 'tháng' : listing.rentalUnit === 'DAY' ? 'ngày' : 'tuần'}
                        </span>
                      </div>
                    )}
                    {!listing.minRentalDuration && listing.maxRentalDuration && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-muted-foreground font-medium">Tối đa</span>
                        <span className="font-bold text-foreground">
                          {listing.maxRentalDuration} {listing.rentalUnit === 'MONTH' ? 'tháng' : listing.rentalUnit === 'DAY' ? 'ngày' : 'tuần'}
                        </span>
                      </div>
                    )}
                    
                    {listing.earliestAvailableDate && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-muted-foreground font-medium">Sớm nhất giao</span>
                        <span className="font-bold text-foreground">
                          {new Date(listing.earliestAvailableDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {listing.latestReturnDate && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-200/50 hover:shadow-sm transition-all duration-200">
                        <span className="text-muted-foreground font-medium">Muộn nhất trả</span>
                        <span className="font-bold text-foreground">
                          {new Date(listing.latestReturnDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deposit & Fee Policy */}
                {(listing.depositRequired || listing.lateReturnFeeAmount) && (
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-3">Chính sách đặt cọc & phí</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listing.depositRequired && listing.depositAmount && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-amber-800">Yêu cầu đặt cọc</span>
                          </div>
                          <div className="text-2xl font-bold text-amber-700">
                            {new Intl.NumberFormat('vi-VN').format(listing.depositAmount)} {listing.depositCurrency || listing.currency}
                          </div>
                          <p className="text-xs text-amber-600 mt-1 font-medium">Khách hàng phải đặt cọc trước khi thuê</p>
                        </div>
                      )}
                      
                      {listing.lateReturnFeeAmount && (
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-red-800">Phí trả muộn</span>
                          </div>
                          <div className="text-2xl font-bold text-red-700">
                            {listing.lateReturnFeeUnit === 'PERCENTAGE' 
                              ? `${listing.lateReturnFeeAmount}%`
                              : `${new Intl.NumberFormat('vi-VN').format(listing.lateReturnFeeAmount)} ${listing.currency}`
                            }
                            {listing.lateReturnFeeUnit === 'PER_DAY' && <span className="text-sm"> / ngày</span>}
                            {listing.lateReturnFeeUnit === 'PER_WEEK' && <span className="text-sm"> / tuần</span>}
                          </div>
                          <p className="text-xs text-red-600 mt-1 font-medium">Phí phạt khi trả container muộn hạn</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Renewal Policy */}
                {listing.autoRenewalEnabled && (
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-sm transition-all duration-300">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-blue-800">Cho phép gia hạn tự động</p>
                        <p className="text-sm text-blue-600 mt-1 font-medium">
                          Thông báo trước {listing.renewalNoticeDays} ngày
                          {listing.renewalPriceAdjustment !== 0 && (
                            <> • Điều chỉnh giá: {listing.renewalPriceAdjustment > 0 ? '+' : ''}{listing.renewalPriceAdjustment}%</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-primary/10 shadow-md">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {listing.seller?.name?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg text-foreground">{listing.seller?.name}</h4>
                <p className="text-muted-foreground text-sm">{listing.seller?.orgName}</p>
                <div className="flex items-center justify-center mt-3 gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-foreground">{listing.rating}</span>
                  <span className="text-muted-foreground text-sm">({listing.reviews} đánh giá)</span>
                </div>
              </div>
              
              {/* Primary Actions - Main CTAs */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                {/* Buy Now Button - Primary Action for SALE only (not for RENTAL) */}
                {(listing.dealType?.toUpperCase() === 'SALE' || listing.deal_type?.toUpperCase() === 'SALE') && listing.availableQuantity > 0 && (
                  <Button 
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => router.push(`/checkout?listingId=${params.id}&type=direct`)}
                  >
                    <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Mua ngay
                  </Button>
                )}
                
                {/* Add to Cart Button - Secondary Action */}
                <AddToCartButton 
                  listingId={params.id}
                  dealType={listing.dealType}
                  maxQuantity={listing.availableQuantity || 100}
                  hasContainers={listing.totalQuantity > 0}
                  unitPrice={listing.price}
                  currency={listing.currency}
                  minRentalDuration={listing.minRentalDuration || 1}
                  maxRentalDuration={listing.maxRentalDuration || 60}
                  rentalUnit={listing.rentalUnit || 'MONTH'}
                  className="w-full h-13 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                />
              </div>

              {/* Communication Actions */}
              <div className="space-y-2.5 pt-4 pb-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Liên hệ người bán</p>
                
                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  Nhắn tin ngay
                </Button>
                
                <Button className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  Gọi điện thoại
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Yêu cầu đặc biệt</p>
                
                <Button 
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => router.push(`/rfq/create?listingId=${params.id}`)}
                >
                  <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                  Yêu cầu báo giá
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <h4 className="font-bold text-lg mb-4 text-foreground flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Dịch vụ đi kèm
              </h4>
              <div className="space-y-3">
                {listing.services?.repair && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-green-50/50 rounded-lg border border-green-200 hover:shadow-sm transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-green-800 font-semibold text-sm">Sửa chữa & bảo trì</span>
                  </div>
                )}
                {listing.services?.storage && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-blue-800 font-semibold text-sm">Dịch vụ lưu kho</span>
                  </div>
                )}
                {listing.services?.delivery && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg border border-purple-200 hover:shadow-sm transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                    <span className="text-purple-800 font-semibold text-sm">Vận chuyển toàn quốc</span>
                  </div>
                )}
                {listing.services?.insurance && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-orange-50/50 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0" />
                    <span className="text-orange-800 font-semibold text-sm">Bảo hiểm container</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
              <h4 className="font-bold text-lg mb-4 text-foreground flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Vị trí
              </h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{listing.location}</p>
                    <p className="text-muted-foreground text-sm mt-1">{listing.depotAddress}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-36 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors duration-300">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-600 font-semibold text-sm">Bản đồ</span>
                    <p className="text-gray-500 text-xs mt-1">Sẽ cập nhật sớm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container List Section */}
        <div className="mb-8">
          <ContainerListSection listingId={params.id} isAdmin={false} />
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/10 hover:shadow-md transition-shadow duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">Tin đăng liên quan</h3>
              <p className="text-muted-foreground">Khám phá thêm các container khác có thể bạn quan tâm</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedListings.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg overflow-hidden border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => router.push(`/listings/${item.id}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-2 text-foreground line-clamp-2 text-sm group-hover:text-primary transition-colors duration-300">{item.title}</h4>
                    <p className="text-primary font-bold text-lg mb-2">
                      {new Intl.NumberFormat('vi-VN').format(item.price)} {item.currency}
                    </p>
                    <p className="text-muted-foreground text-xs flex items-center mb-3">
                      <MapPin className="h-3 w-3 mr-1 text-primary" />
                      {item.location}
                    </p>
                    <Button size="sm" className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm hover:shadow-md transition-all duration-300">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
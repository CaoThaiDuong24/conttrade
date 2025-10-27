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
  ChevronRight
} from 'lucide-react';
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        fetch(`${apiUrl}/api/v1/listings/${params.id}/view`, { 
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
            images: apiListing.listing_media?.length > 0 
              ? apiListing.listing_media.map((m: any) => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
                  const fullUrl = m.media_url ? `${apiUrl}${m.media_url}` : null;
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
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        const response = await fetch(
          `${apiUrl}/api/v1/listings?limit=3&status=ACTIVE&exclude=${params.id}`
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy tin đăng'}</p>
          <Button onClick={() => window.location.href = '/listings'} className="bg-blue-600 hover:bg-blue-700">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="bg-white border-b rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Trang chủ</span>
          <span>/</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Tin đăng</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chi tiết</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                {/* Main Image */}
                <div className="relative h-[400px] bg-gray-100 overflow-hidden group">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[currentImageIndex]?.url || '/placeholder.jpg'}
                        alt={listing.images[currentImageIndex]?.alt || listing.title}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                      
                      {/* Badges overlay */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {listing.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            ⭐ Nổi bật
                          </Badge>
                        )}
                        <Badge variant={listing.dealType === 'SALE' ? 'default' : 'secondary'}>
                          {getDealTypeDisplayName(listing.dealType)}
                        </Badge>
                      </div>

                      {/* Image counter */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-black/50 text-white border-white/20">
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === listing.images.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Zoom indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                          Click để phóng to
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500 font-medium">Chưa có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {listing.images && listing.images.length > 1 && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {listing.images.map((image: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{formatListingTitle(listing.title, listing)}</h1>
                  <div className="flex items-center text-gray-600 text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{listing.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <Heart className="h-4 w-4 mr-2" />
                    Yêu thích
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Price and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">
                    Giá {getDealTypeDisplayName(listing.dealType).toLowerCase()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center text-green-700">
                    <Eye className="h-5 w-5 mr-2" />
                    <span className="text-2xl font-bold">{listing.views}</span>
                  </div>
                  <div className="text-green-600 text-sm font-medium">Lượt xem</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center text-yellow-700">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-lg font-semibold">{listing.postedDate}</span>
                  </div>
                  <div className="text-yellow-600 text-sm font-medium">Ngày đăng</div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Kích thước</span>
                    <span className="font-semibold text-gray-900">{getSizeLabel(listing.size)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Loại</span>
                    <span className="font-semibold text-gray-900">{getTypeLabel(listing.type)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tiêu chuẩn</span>
                    <span className="font-semibold text-gray-900">{getStandardLabel(listing.standard)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tình trạng</span>
                    <Badge variant="outline" className="font-medium">{getConditionLabel(listing.condition)}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiều dài</span>
                    <span className="font-semibold text-gray-900">{listing.specifications?.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiều rộng</span>
                    <span className="font-semibold text-gray-900">{listing.specifications?.width}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiều cao</span>
                    <span className="font-semibold text-gray-900">{listing.specifications?.height}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <Avatar className="w-16 h-16 mx-auto mb-3 border-4 border-gray-100">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                    {listing.seller?.name?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-lg text-gray-900">{listing.seller?.name}</h4>
                <p className="text-gray-600">{listing.seller?.orgName}</p>
                <div className="flex items-center justify-center mt-3">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-medium text-gray-900">{listing.rating}</span>
                  <span className="text-gray-500 ml-1">({listing.reviews} đánh giá)</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nhắn tin ngay
                </Button>
                <Button variant="outline" className="w-full hover:bg-green-50 hover:text-green-700 hover:border-green-200">
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi điện thoại
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                  onClick={() => router.push(`/rfq/create?listingId=${params.id}`)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Yêu cầu báo giá
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Dịch vụ đi kèm</h4>
              <div className="space-y-3">
                {listing.services?.repair && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-green-800 font-medium text-sm">Sửa chữa & bảo trì</span>
                  </div>
                )}
                {listing.services?.storage && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-blue-800 font-medium text-sm">Dịch vụ lưu kho</span>
                  </div>
                )}
                {listing.services?.delivery && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                    <span className="text-purple-800 font-medium text-sm">Vận chuyển toàn quốc</span>
                  </div>
                )}
                {listing.services?.insurance && (
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                    <span className="text-orange-800 font-medium text-sm">Bảo hiểm container</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Vị trí</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{listing.location}</p>
                    <p className="text-gray-600 text-sm mt-1">{listing.depotAddress}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-32 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-gray-500 font-medium text-sm">Bản đồ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Tin đăng liên quan</h3>
              <p className="text-gray-600">Khám phá thêm các container khác có thể bạn quan tâm</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedListings.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => router.push(`/listings/${item.id}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2 text-gray-900 line-clamp-2 text-sm">{item.title}</h4>
                    <p className="text-blue-600 font-bold text-lg mb-2">
                      {new Intl.NumberFormat('vi-VN').format(item.price)} {item.currency}
                    </p>
                    <p className="text-gray-600 text-xs flex items-center mb-3">
                      <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                      {item.location}
                    </p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
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
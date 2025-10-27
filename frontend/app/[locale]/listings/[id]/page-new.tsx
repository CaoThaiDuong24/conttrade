"use client";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { fetchListingById } from '@/lib/api/listings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Send
} from 'lucide-react';
import { ImageGallery } from '@/components/ui/image-gallery';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res: any = await fetchListingById(params.id);
        console.log('Listing detail API response:', res);
        
        if (ignore) return;
        
        if (res && res.success && res.data && res.data.listing) {
          const apiListing = res.data.listing;
          
          // Map API response to UI format
          setListing({
            id: apiListing.id,
            title: apiListing.title,
            description: apiListing.description || 'Chưa có mô tả',
            price: apiListing.price_amount || 0,
            currency: apiListing.price_currency || 'VND',
            dealType: apiListing.deal_type,
            size: apiListing.listing_facets?.find((f: any) => f.key === 'size')?.value || 'N/A',
            standard: apiListing.listing_facets?.find((f: any) => f.key === 'standard')?.value || 'N/A',
            condition: apiListing.listing_facets?.find((f: any) => f.key === 'condition')?.value || 'N/A',
            location: apiListing.depots?.name || apiListing.location_depot_id || 'N/A',
            depotAddress: apiListing.depots?.address || '',
            views: apiListing.views || 0,
            rating: 4.8, // TODO: Get from reviews
            reviews: 0, // TODO: Get from reviews
            postedDate: apiListing.created_at ? new Date(apiListing.created_at).toLocaleDateString('vi-VN') : 'N/A',
            featured: false,
            images: apiListing.listing_media?.length > 0 
              ? apiListing.listing_media.map((m: any) => {
                  // Temporarily hardcode the base URL
                  const baseUrl = "http://localhost:3006";
                  const fullUrl = m.media_url ? `${baseUrl}${m.media_url}` : null;
                  console.log('🖼️ IMAGE URL DEBUG:', {
                    mediaUrl: m.media_url,
                    baseUrl: baseUrl,
                    fullUrl: fullUrl,
                    envVar: process.env.NEXT_PUBLIC_API_BASE_URL
                  });
                  return {
                    id: m.id,
                    url: fullUrl,
                    type: m.media_type === 'video' ? 'video' : 'image',
                    alt: `${apiListing.title} - Media ${m.sort_order || 1}`
                  };
                }).filter((item: any) => item.url)
              : [],
            specifications: {
              length: apiListing.containers?.length || '6.06m',
              width: apiListing.containers?.width || '2.44m',
              height: apiListing.containers?.height || '2.59m',
              weight: apiListing.containers?.weight || '2,300kg',
              maxLoad: apiListing.containers?.max_load || '28,180kg',
              volume: apiListing.containers?.volume || '33.2m³',
            },
            seller: {
              name: apiListing.seller?.display_name || apiListing.seller?.email || 'Người bán',
              orgName: apiListing.seller?.org_users?.[0]?.org?.name || apiListing.seller?.organization || ''
            },
            services: {
              repair: true,
              storage: true,
              delivery: true,
              insurance: true,
            }
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

  const relatedListings = [
    {
      id: '2',
      title: 'Container 40ft HC - Mới 90%',
      price: 85000000,
      image: '/placeholder.jpg',
      location: 'Depot Hà Nội',
    },
    {
      id: '3',
      title: 'Container 20ft - Cần sửa chữa',
      price: 25000000,
      image: '/placeholder.jpg',
      location: 'Depot Đà Nẵng',
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Trang chủ</span>
            <span>/</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Tin đăng</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Chi tiết</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ImageGallery 
                media={listing.images}
                featured={listing.featured}
                dealType={listing.dealType === 'SALE' ? 'sale' : 'rental'}
                className="rounded-none"
              />
            </div>

            {/* Title and Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      variant={listing.dealType === 'SALE' ? 'default' : 'secondary'}
                      className="text-sm font-medium px-3 py-1"
                    >
                      {listing.dealType === 'SALE' ? 'Bán' : 'Cho thuê'}
                    </Badge>
                    {listing.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                        ⭐ Nổi bật
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{listing.title}</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">Giá {listing.dealType === 'SALE' ? 'bán' : 'thuê'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center text-green-700">
                    <Eye className="h-6 w-6 mr-2" />
                    <span className="text-3xl font-bold">{listing.views}</span>
                  </div>
                  <div className="text-green-600 text-sm font-medium">Lượt xem</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center text-yellow-700">
                    <Calendar className="h-6 w-6 mr-2" />
                    <span className="text-lg font-semibold">{listing.postedDate}</span>
                  </div>
                  <div className="text-yellow-600 text-sm font-medium">Ngày đăng</div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{listing.description}</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Kích thước</span>
                    <span className="font-semibold text-gray-900">{listing.size}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tiêu chuẩn</span>
                    <span className="font-semibold text-gray-900">{listing.standard}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tình trạng</span>
                    <Badge variant="outline" className="font-medium">{listing.condition}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiều dài</span>
                    <span className="font-semibold text-gray-900">{listing.specifications?.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiều rộng</span>
                    <span className="font-semibold text-gray-900">{listing.specifications?.width}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
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
                <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-gray-100">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-xl font-semibold bg-blue-100 text-blue-700">
                    {listing.seller?.name?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-lg text-gray-900">{listing.seller?.name}</h4>
                <p className="text-gray-600">{listing.seller?.orgName}</p>
                <div className="flex items-center justify-center mt-3">
                  <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
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
                <Button variant="outline" className="w-full hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">
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
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-green-800 font-medium">Sửa chữa & bảo trì</span>
                  </div>
                )}
                {listing.services?.storage && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-blue-800 font-medium">Dịch vụ lưu kho</span>
                  </div>
                )}
                {listing.services?.delivery && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                    <span className="text-purple-800 font-medium">Vận chuyển toàn quốc</span>
                  </div>
                )}
                {listing.services?.insurance && (
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
                    <span className="text-orange-800 font-medium">Bảo hiểm container</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Vị trí</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{listing.location}</p>
                    <p className="text-gray-600 text-sm mt-1">{listing.depotAddress}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-40 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-500 font-medium">Bản đồ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Tin đăng liên quan</h3>
            <p className="text-gray-600">Khám phá thêm các container khác có thể bạn quan tâm</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 font-medium">Hình ảnh</span>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold mb-3 text-gray-900 line-clamp-2">{item.title}</h4>
                  <p className="text-blue-600 font-bold text-xl mb-2">
                    {new Intl.NumberFormat('vi-VN').format(item.price)} VND
                  </p>
                  <p className="text-gray-600 text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                    {item.location}
                  </p>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
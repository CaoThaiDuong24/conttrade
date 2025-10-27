"use client";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { fetchListingById } from '@/lib/api/listings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  Package,
  Shield,
  User,
  Wrench,
  Truck
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
              weight: apiListing.containers?.tare_weight || 'N/A',
              capacity: apiListing.containers?.capacity || 'N/A',
              doorWidth: '2.34m',
              doorHeight: '2.28m',
            },
            seller: {
              name: apiListing.users?.display_name || 'N/A',
              avatar: '/placeholder-user.jpg',
              rating: 4.9,
              reviews: 0,
              memberSince: apiListing.users?.created_at ? new Date(apiListing.users.created_at).toLocaleDateString('vi-VN') : 'N/A',
              verified: true,
              orgName: apiListing.users?.org_users?.[0]?.organization?.name || null,
            },
            inspection: {
              available: false, // TODO: Get from inspection records
              lastInspection: null,
              standard: null,
              status: null,
            },
            services: {
              inspection: true,
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
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-red-600 mb-4">{error || 'Không tìm thấy tin đăng'}</p>
            <Button onClick={() => window.location.href = '/listings'} variant="outline">
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="hover:text-primary cursor-pointer">Trang chủ</span>
            <span>/</span>
            <span className="hover:text-primary cursor-pointer">Tin đăng</span>
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
                      className="text-sm font-medium"
                    >
                      {listing.dealType === 'SALE' ? 'Bán' : 'Cho thuê'}
                    </Badge>
                    {listing.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        ⭐ Nổi bật
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{listing.title}</h1>
                  <div className="flex items-center text-gray-600 text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{listing.location}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Yêu thích
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">Giá {listing.dealType === 'SALE' ? 'bán' : 'thuê'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center text-green-600">
                    <Eye className="h-5 w-5 mr-2" />
                    <span className="text-2xl font-bold">{listing.views}</span>
                  </div>
                  <div className="text-green-600 text-sm font-medium">Lượt xem</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="flex items-center text-yellow-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-lg font-semibold">{listing.postedDate}</span>
                  </div>
                  <div className="text-yellow-600 text-sm font-medium">Ngày đăng</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="w-full"
                  onClick={() => router.push(`/orders/create?listingId=${listing.id}`)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mua ngay
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/rfq/create?listingId=${listing.id}`)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Yêu cầu báo giá
                </Button>
              </div>
            </div>

            {/* Details Tabs */}
            <Card>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Mô tả</TabsTrigger>
                  <TabsTrigger value="specifications">Thông số</TabsTrigger>
                  <TabsTrigger value="inspection">Giám định</TabsTrigger>
                  <TabsTrigger value="location">Vị trí</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="p-6">
                  <h3 className="font-semibold mb-4">Mô tả chi tiết</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {listing.description}
                  </p>
                </TabsContent>
                
                <TabsContent value="specifications" className="p-6">
                  <h3 className="font-semibold mb-4">Thông số kỹ thuật</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(listing.specifications as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="inspection" className="p-6">
                  <h3 className="font-semibold mb-4">Thông tin giám định</h3>
                  {listing.inspection.available ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Đã được giám định</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Lần giám định cuối:</span>
                          <span className="ml-2 font-medium">{listing.inspection.lastInspection}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tiêu chuẩn:</span>
                          <span className="ml-2 font-medium">{listing.inspection.standard}</span>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        Xem báo cáo giám định
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>Chưa có thông tin giám định</span>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="location" className="p-6">
                  <h3 className="font-semibold mb-4">Vị trí</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-muted-foreground">Depot:</span>
                      <span className="ml-2 font-medium">{listing.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <span className="ml-2 font-medium">{listing.depotAddress}</span>
                    </div>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Bản đồ sẽ được hiển thị ở đây</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Related Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Tin đăng liên quan</CardTitle>
                <CardDescription>
                  Các container tương tự có thể bạn quan tâm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedListings.map((item) => (
                    <div key={item.id} className="flex space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-20 h-16 bg-muted rounded flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                        <p className="text-lg font-bold text-primary">
                          {item.price.toLocaleString()} VND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người bán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.seller.avatar} alt={listing.seller.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {listing.seller.orgName && (
                      <div className="text-sm text-muted-foreground">
                        {listing.seller.orgName}
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{listing.seller.rating}</span>
                      <span>({listing.seller.reviews} đánh giá)</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/orders/create?listingId=${listing.id}`)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Mua ngay
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/rfq/create?listingId=${listing.id}`)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Yêu cầu báo giá
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Nhắn tin
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Gọi điện
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Dịch vụ kèm theo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(listing.services).map(([service, available]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {service === 'inspection' && <Shield className="h-4 w-4" />}
                      {service === 'repair' && <Wrench className="h-4 w-4" />}
                      {service === 'storage' && <Package className="h-4 w-4" />}
                      {service === 'delivery' && <Truck className="h-4 w-4" />}
                      {service === 'insurance' && <Shield className="h-4 w-4" />}
                      <span className="capitalize">
                        {service === 'inspection' && 'Giám định'}
                        {service === 'repair' && 'Sửa chữa'}
                        {service === 'storage' && 'Lưu kho'}
                        {service === 'delivery' && 'Vận chuyển'}
                        {service === 'insurance' && 'Bảo hiểm'}
                      </span>
                    </div>
                    {available ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Safety Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Lưu ý an toàn</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Luôn giao dịch thông qua nền tảng để được bảo vệ. Không chuyển tiền trực tiếp cho người bán.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
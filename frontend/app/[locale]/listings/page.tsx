"use client";
import { useTranslations } from 'next-intl';
import { fetchListings } from '@/lib/api/listings';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
import { getConditionLabel } from '@/lib/utils/condition';
import { getSizeLabel } from '@/lib/utils/containerSize';
import { getStandardLabel } from '@/lib/utils/qualityStandard';
import { getTypeLabel } from '@/lib/utils/containerType';
import { formatListingTitle } from '@/lib/utils/listingTitle';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Archive,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Shield,
  Send,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ListingsPage() {
  console.log('[DEBUG] ListingsPage component rendered');
  
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        console.log('[Listings Page] Starting fetch with params:', { q, page, limit: itemsPerPage });
        console.log('[Listings Page] User auth status:', user);
        
        setLoading(true);
        setError(null);
        const res = await fetchListings({ q, page, limit: itemsPerPage });
        console.log('[Listings Page] API Response:', res);
        console.log('[Listings Page] Response data:', res.data);
        console.log('[Listings Page] Listings array:', res.data?.listings);
        if (!ignore && res.data) {
          setItems(res.data.listings || []);
          setTotal(res.data.pagination?.total || 0);
          setTotalPages(res.data.pagination?.totalPages || Math.ceil((res.data.pagination?.total || 0) / itemsPerPage));
          console.log('[Listings Page] State updated - items:', res.data.listings?.length, 'total:', res.data.pagination?.total);
        }
      } catch (error: any) {
        console.error('[Listings Page] Fetch listings error:', error);
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setTotalPages(0);
          setError(error.message || 'Không thể tải danh sách tin đăng');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();
    return () => { ignore = true };
  }, [q, page]);

  const handleSearch = () => {
    setQ(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Đang hoạt động</Badge>;
      case 'pending_review':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="default">Đã duyệt</Badge>;
      case 'pending':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'paused':
        return <Badge variant="outline">Tạm dừng</Badge>;
      case 'sold':
        return <Badge variant="destructive">Đã bán</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const dealType = type?.toUpperCase();
    const label = getDealTypeDisplayName(dealType);
    
    // SALE - Bán
    if (dealType === 'SALE') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">{label}</Badge>;
    } 
    // RENTAL - Thuê
    else if (dealType === 'RENTAL') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">{label}</Badge>;
    }
    // Default
    else {
      return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            Tin đăng Container
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Khám phá và tìm kiếm container phù hợp
          </p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Button 
            variant="outline"
            className="flex-1 lg:flex-none hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
          >
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
          {/* Chỉ hiển thị button Đăng tin cho seller/admin */}
          {user?.permissions?.includes('PM-010') && (
            <Button 
              asChild
              className="flex-1 lg:flex-none bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Link href="/sell/new">
                <Plus className="mr-2 h-4 w-4" />
                Đăng tin mới
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder="Tìm kiếm container theo tên, mô tả, vị trí..."
                  className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSearch}
                className="flex-1 lg:flex-none h-11 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </Button>
              <Button 
                variant="outline"
                className="flex-1 lg:flex-none h-11 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Bộ lọc nâng cao</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="border-primary/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <Package className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-muted-foreground mt-6 text-sm">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-6 text-center max-w-md">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-100 transition-colors duration-300"
            >
              <Search className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-6">{items.map((listing) => (
            <Card 
              key={listing.id} 
              className="border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3 flex-wrap">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-200">
                        {formatListingTitle(listing.title, listing)}
                      </CardTitle>
                      {getTypeBadge(listing.dealType || listing.deal_type)}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {listing.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Price */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200/50 hover:shadow-sm transition-all duration-200">
                  <div className="rounded-full bg-green-100 p-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-green-700">
                      {(parseFloat(listing.price_amount || listing.priceAmount || listing.price || 0))?.toLocaleString?.()} {listing.price_currency || listing.priceCurrency || listing.currency}
                    </p>
                    <p className="text-xs text-green-600/70">Giá</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/50 hover:shadow-sm transition-all duration-200">
                  <div className="rounded-full bg-blue-100 p-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 truncate">{listing.depots?.name || listing.locationDepot?.name || listing.location_depot_id || listing.locationDepotId || 'N/A'}</p>
                    <p className="text-xs text-blue-600/70">Vị trí</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-50/50 border border-purple-200/50 hover:shadow-sm transition-all duration-200">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-700">
                      {new Date(listing.created_at || listing.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-purple-600/70">Ngày đăng</p>
                  </div>
                </div>

                {/* Views */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-50/50 border border-orange-200/50 hover:shadow-sm transition-all duration-200">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700">{listing.view_count || listing.views || 0} lượt xem</p>
                    <p className="text-xs text-orange-600/70">Lượt xem</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-3 py-2 rounded-md bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200/50">
                    <span className="font-semibold text-slate-700 text-sm">Kích thước: </span>
                    <span className="text-slate-600 text-sm">{getSizeLabel(listing.listing_facets?.find((f: any) => f.key === 'size')?.value || listing.facets?.find((f: any) => f.key === 'size')?.value || listing.size)}</span>
                  </div>
                  <div className="px-3 py-2 rounded-md bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200/50">
                    <span className="font-semibold text-slate-700 text-sm">Loại: </span>
                    <span className="text-slate-600 text-sm">{getTypeLabel(listing.listing_facets?.find((f: any) => f.key === 'type')?.value || listing.facets?.find((f: any) => f.key === 'type')?.value || listing.type)}</span>
                  </div>
                  <div className="px-3 py-2 rounded-md bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200/50">
                    <span className="font-semibold text-slate-700 text-sm">Tiêu chuẩn: </span>
                    <span className="text-slate-600 text-sm">{getStandardLabel(listing.listing_facets?.find((f: any) => f.key === 'standard')?.value || listing.facets?.find((f: any) => f.key === 'standard')?.value || listing.standard)}</span>
                  </div>
                  <div className="px-3 py-2 rounded-md bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200/50">
                    <span className="font-semibold text-slate-700 text-sm">Tình trạng: </span>
                    <span className="text-slate-600 text-sm">{getConditionLabel(listing.listing_facets?.find((f: any) => f.key === 'condition')?.value || listing.facets?.find((f: any) => f.key === 'condition')?.value || listing.condition || 'N/A')}</span>
                  </div>
                  {/* ============ 🆕 SHOW QUANTITY ============ */}
                  {(listing.total_quantity && listing.total_quantity > 1) && (
                    <div className="px-3 py-2 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300">
                      <span className="font-semibold text-blue-700 text-sm">Số lượng: </span>
                      <span className="text-blue-600 text-sm font-bold">
                        {listing.available_quantity ?? listing.total_quantity} container
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Primary Action - Yêu cầu báo giá */}
                <Button 
                  size="default" 
                  variant="default"
                  className="flex-1 sm:flex-auto bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => router.push(`/rfq/create?listingId=${listing.id}`)}
                >
                  <Send className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Yêu cầu báo giá</span>
                  <span className="sm:hidden">RFQ</span>
                </Button>

                {/* Secondary Actions */}
                <div className="flex gap-2 sm:gap-3 flex-1">
                  {/* Buy Now Button - Only show for SALE listings, not for RENTAL */}
                  {(listing.dealType?.toUpperCase() === 'SALE' || listing.deal_type?.toUpperCase() === 'SALE') && (
                    <Button 
                      size="default" 
                      variant="outline"
                      className="flex-1 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => router.push(`/orders/create?listingId=${listing.id}`)}
                    >
                      <Package className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">Mua ngay</span>
                      <span className="sm:hidden">Mua</span>
                    </Button>
                  )}
                  
                  <Button 
                    size="default" 
                    variant="outline"
                    className="flex-1 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    asChild
                  >
                    <Link href={`/listings/${listing.id}`}>
                      <Eye className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">Xem chi tiết</span>
                      <span className="sm:hidden">Chi tiết</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-foreground">{((page - 1) * itemsPerPage) + 1}</span> - <span className="font-semibold text-foreground">{Math.min(page * itemsPerPage, total)}</span> trong tổng số <span className="font-semibold text-foreground">{total}</span> tin đăng
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="hover:bg-primary/5 hover:border-primary transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages <= 10) return pageNum;
                    if (pageNum <= 3 || pageNum > totalPages - 3 || Math.abs(pageNum - page) <= 1) return pageNum;
                    if (pageNum === 4 && page > 5) return '...';
                    if (pageNum === totalPages - 3 && page < totalPages - 4) return '...';
                    return null;
                  }).filter(Boolean).map((pageNum, idx) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum as number)}
                        className={page === pageNum 
                          ? "bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 min-w-[2.5rem]" 
                          : "hover:bg-primary/5 hover:border-primary transition-all duration-300 min-w-[2.5rem]"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="hover:bg-primary/5 hover:border-primary transition-all duration-300"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <Card className="border-primary/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              Chưa có tin đăng nào
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {user?.permissions?.includes('PM-010') 
                ? 'Bắt đầu bằng cách tạo tin đăng container đầu tiên của bạn'
                : 'Hiện chưa có tin đăng nào. Hãy quay lại sau.'}
            </p>
            {/* Chỉ hiển thị button Đăng tin cho seller/admin */}
            {user?.permissions?.includes('PM-010') && (
              <Button 
                asChild
                className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href="/sell/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng tin mới
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
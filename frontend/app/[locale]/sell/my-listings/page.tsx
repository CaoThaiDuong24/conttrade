"use client";
import { useEffect, useState } from 'react';
import { fetchListings, type ListingFilters } from '@/lib/api/listings';
import { useAuth } from '@/components/providers/auth-context';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getConditionLabel } from '@/lib/utils/condition';
import { getSizeLabel } from '@/lib/utils/containerSize';
import { getStandardLabel } from '@/lib/utils/qualityStandard';
import { getTypeLabel } from '@/lib/utils/containerType';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';
import { formatListingTitle } from '@/lib/utils/listingTitle';
import { Package, Edit, Eye, Trash2, Archive, Plus, DollarSign, MapPin, Calendar, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

export default function MyListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 20; // Tăng từ 5 lên 20 để hiển thị nhiều hơn

  useEffect(() => {
    let ignore = false;
    
    const loadMyListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use authenticated endpoint to get current user's listings
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Vui lòng đăng nhập để xem tin đăng của bạn');
          return;
        }
        
        // Fetch với limit=999999 để lấy tất cả listings không giới hạn
        const response = await fetch('/api/v1/listings/my?limit=999999', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('My listings response:', data);
          console.log('Total listings fetched:', data.data?.listings?.length || 0);
          
          if (!ignore && data.data) {
            setListings(data.data.listings || []);
          }
        } else {
          console.error('Failed to fetch my listings:', response.status);
          if (!ignore) {
            setError('Không thể tải danh sách tin đăng');
            setListings([]);
          }
        }
      } catch (error: any) {
        console.error('Error loading my listings:', error);
        if (!ignore) {
          setError(error.message || 'Không thể tải danh sách tin đăng');
          setListings([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadMyListings();
    return () => { ignore = true };
  }, []);

  const filteredListings = listings.filter(listing => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return listing.status === 'ACTIVE' || listing.status === 'active' || listing.status === 'approved';
    if (selectedTab === 'pending') return listing.status === 'PENDING_REVIEW' || listing.status === 'pending' || listing.status === 'pending_review';
    if (selectedTab === 'sold') return listing.status === 'SOLD' || listing.status === 'sold';
    if (selectedTab === 'paused') return listing.status === 'PAUSED' || listing.status === 'paused';
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // Handle delete listing
  const handleDeleteListing = async (listingId: string) => {
    setActionLoading(listingId);
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

      const response = await fetch(`/api/v1/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove listing from local state
        setListings(prev => prev.filter(l => l.id !== listingId));
        toast({
          title: "Thành công",
          description: "Xóa tin đăng thành công",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: errorData.message || "Không thể xóa tin đăng",
        });
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa tin đăng",
      });
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  // Handle toggle pause/activate listing
  const handleTogglePauseListing = async (listingId: string, currentStatus: string) => {
    setActionLoading(listingId);
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

      const newStatus = (currentStatus === 'PAUSED' || currentStatus === 'paused') ? 'ACTIVE' : 'PAUSED';

      const response = await fetch(`/api/v1/listings/${listingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        // Update listing status in local state
        setListings(prev => prev.map(l => 
          l.id === listingId ? { ...l, status: data.data.listing.status } : l
        ));
        toast({
          title: "Thành công",
          description: newStatus === 'ACTIVE' 
            ? "Kích hoạt tin đăng thành công" 
            : "Tạm dừng tin đăng thành công",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: errorData.message || "Không thể thay đổi trạng thái tin đăng",
        });
      }
    } catch (error) {
      console.error('Error toggling listing status:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi thay đổi trạng thái tin đăng",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit listing
  const handleEditListing = (listingId: string) => {
    router.push(`/sell/edit/${listingId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'active':
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Đang hoạt động</Badge>;
      case 'PENDING_REVIEW':
      case 'pending':
      case 'pending_review':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'PAUSED':
      case 'paused':
        return <Badge variant="outline">Tạm dừng</Badge>;
      case 'SOLD':
      case 'sold':
        return <Badge variant="destructive">Đã bán</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            Tin đăng của tôi
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Quản lý tin đã đăng (SCR-204)
          </p>
        </div>
        <Button 
          asChild
          className="w-full lg:w-auto bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Link href="/sell/new">
            <Plus className="mr-2 h-4 w-4" />
            Đăng tin mới
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full lg:w-auto grid grid-cols-2 lg:flex h-auto gap-1 bg-gradient-to-br from-muted/50 to-muted/30 p-1.5">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:via-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-300"
          >
            <span className="hidden sm:inline">Tất cả</span>
            <span className="sm:hidden">Tất cả</span> ({listings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:via-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all duration-300"
          >
            <span className="hidden lg:inline">Đang hoạt động</span>
            <span className="lg:hidden">Hoạt động</span> ({listings.filter(l => l.status === 'ACTIVE' || l.status === 'active' || l.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:via-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white transition-all duration-300"
          >
            <span className="hidden lg:inline">Chờ duyệt</span>
            <span className="lg:hidden">Chờ</span> ({listings.filter(l => l.status === 'PENDING_REVIEW' || l.status === 'pending' || l.status === 'pending_review').length})
          </TabsTrigger>
          <TabsTrigger 
            value="sold"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:via-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
          >
            <span className="hidden sm:inline">Đã bán</span>
            <span className="sm:hidden">Bán</span> ({listings.filter(l => l.status === 'SOLD' || l.status === 'sold').length})
          </TabsTrigger>
          <TabsTrigger 
            value="paused"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:via-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white transition-all duration-300"
          >
            <span className="hidden lg:inline">Tạm dừng</span>
            <span className="lg:hidden">Dừng</span> ({listings.filter(l => l.status === 'PAUSED' || l.status === 'paused').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <Package className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-muted-foreground mt-6 text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-red-100 p-4 mb-4">
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-red-600 mb-6 text-center max-w-md">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-100 transition-colors duration-300"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6">
                    <Package className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                    Chưa có tin đăng nào
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Bắt đầu bằng cách tạo tin đăng container đầu tiên của bạn
                  </p>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Link href="/sell/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Đăng tin mới
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedListings.map((listing: any) => (
                      <div 
                        key={listing.id} 
                        className="border border-primary/10 rounded-lg p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3 flex-wrap">
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-200">
                                {formatListingTitle(listing.title, listing)}
                              </h3>
                              {getStatusBadge(listing.status)}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          {/* Price */}
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-50/50 border border-green-200/50 hover:shadow-sm transition-all duration-200">
                            <div className="rounded-full bg-green-100 p-2">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-green-700">
                                {(parseFloat(listing.price_amount || listing.priceAmount || listing.price || 0))?.toLocaleString?.()} {listing.price_currency || listing.priceCurrency || listing.currency}
                              </p>
                              <p className="text-xs text-green-600/70">Giá</p>
                            </div>
                          </div>

                          {/* Deal Type */}
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-50/50 border border-indigo-200/50 hover:shadow-sm transition-all duration-200">
                            <div className="rounded-full bg-indigo-100 p-2">
                              <Briefcase className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-indigo-700">
                                {getDealTypeDisplayName(listing.deal_type || listing.dealType || 'SALE')}
                              </p>
                              <p className="text-xs text-indigo-600/70">Loại giao dịch</p>
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
                                {new Date(listing.created_at || listing.createdAt || listing.created_at).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-xs text-purple-600/70">Ngày đăng</p>
                            </div>
                          </div>
                        </div>

                        {/* Specifications */}
                        <div className="flex items-center gap-3 flex-wrap mb-4 pb-4 border-b border-primary/10">
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
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                            className="flex-1 sm:flex-none hover:bg-primary/5 hover:border-primary transition-all duration-300"
                          >
                            <Link href={`/listings/${listing.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditListing(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="flex-1 sm:flex-none hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTogglePauseListing(listing.id, listing.status)}
                            disabled={actionLoading === listing.id}
                            className="flex-1 sm:flex-none hover:bg-amber-50 hover:border-amber-500 hover:text-amber-600 transition-all duration-300"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            {actionLoading === listing.id 
                              ? 'Đang xử lý...' 
                              : (listing.status === 'paused' || listing.status === 'PAUSED' ? 'Kích hoạt' : 'Tạm dừng')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setListingToDelete(listing.id);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={actionLoading === listing.id}
                            className="flex-1 sm:flex-none hover:shadow-md transition-all duration-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-primary/10">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(endIndex, filteredListings.length)}</span> trong tổng số <span className="font-semibold text-foreground">{filteredListings.length}</span> tin đăng
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="hover:bg-primary/5 hover:border-primary transition-all duration-300"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Trước
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page 
                                  ? "bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-300 min-w-[2.5rem]" 
                                  : "hover:bg-primary/5 hover:border-primary transition-all duration-300 min-w-[2.5rem]"
                                }
                              >
                                {page}
                              </Button>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="hover:bg-primary/5 hover:border-primary transition-all duration-300"
                          >
                            Sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tin đăng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading !== null}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (listingToDelete) {
                  handleDeleteListing(listingToDelete);
                }
              }}
              disabled={actionLoading !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getDealTypeDisplayName, getDealTypeBadgeVariant } from '@/lib/utils/dealType';
import { 
  Package, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React from 'react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  dealType: string; // 'sale' | 'rental'
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'sold' | 'expired';
  size?: string;
  containerType?: string;
  condition?: string;
  standard?: string;
  depot?: string;
  depotProvince?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  images?: string[];
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dealTypeFilter, setDealTypeFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Default 50 items per page for admin
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch real data from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        
        // Use admin endpoint to get all listings
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        
        // Get token from cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        const token = getCookie('accessToken') || localStorage.getItem('accessToken');
        console.log('🔑 Using token from:', token ? (getCookie('accessToken') ? 'cookie' : 'localStorage') : 'none');
        
        // Fetch với phân trang - truyền page và limit
        const response = await fetch(`${apiUrl}/api/v1/admin/listings?page=${currentPage}&limit=${itemsPerPage}`, {
          method: 'GET',
          credentials: 'include', // Important: send cookies
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Response received:', data);
          console.log('✅ Admin listings count:', data.data?.listings?.length || 0);
          console.log('📊 Pagination info:', data.data?.pagination);
          
          // Update pagination info from backend
          if (data.data?.pagination) {
            setTotalCount(data.data.pagination.total);
            setTotalPages(data.data.pagination.totalPages);
          }
          
          // Map backend data format to frontend format
          const mappedListings = (data.data?.listings || []).map((listing: any) => {
            // Parse facets correctly - backend trả về array of {key, value}
            const facets = listing.listing_facets || [];
            const size = facets.find((f: any) => f.key === 'size')?.value || '';
            const containerType = facets.find((f: any) => f.key === 'type')?.value || '';
            const condition = facets.find((f: any) => f.key === 'condition')?.value || '';
            const standard = facets.find((f: any) => f.key === 'standard')?.value || '';
            
            return {
              id: listing.id,
              title: listing.title,
              description: listing.description || '',
              price: parseFloat(listing.price_amount || 0),
              currency: listing.price_currency || 'VND',
              // Backend trả về SALE/RENTAL, convert sang lowercase
              dealType: (listing.deal_type || 'SALE').toLowerCase(),
              // Backend trả về PENDING_REVIEW/ACTIVE/REJECTED, convert sang lowercase với underscore
              status: (listing.status || 'PENDING_REVIEW').toLowerCase().replace(/_/g, '_').toLowerCase() as any,
              size: size ? `${size}ft` : '',
              containerType: containerType || '',
              condition: condition || '',
              standard: standard || '',
              depot: listing.depots?.name || 'N/A',
              depotProvince: listing.depots?.province || '',
              owner: listing.users?.display_name || listing.users?.email || 'N/A',
              createdAt: new Date(listing.created_at).toLocaleDateString('vi-VN'),
              updatedAt: new Date(listing.updated_at).toLocaleDateString('vi-VN'),
              // Backend dùng snake_case: rejection_reason
              rejectionReason: listing.rejection_reason || '',
              images: listing.listing_media?.map((m: any) => m.media_url) || []
            };
          });
          
          console.log('Total admin listings:', mappedListings.length);
          console.log('Sample listing:', mappedListings[0]);
          setListings(mappedListings);
        } else {
          console.error('Failed to fetch admin listings:', response.status);
          toast.error('Lỗi tải dữ liệu', {
            description: 'Không thể tải danh sách tin đăng. Vui lòng thử lại.'
          });
          setListings([]);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Lỗi kết nối', {
          description: 'Không thể kết nối đến máy chủ.'
        });
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [currentPage, itemsPerPage]); // Re-fetch khi page hoặc itemsPerPage thay đổi

  const filteredListings = listings.filter(listing => {
    // Tab filter
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'pending' && listing.status === 'pending_review') ||
      (selectedTab === 'active' && listing.status === 'active') ||
      (selectedTab === 'rejected' && listing.status === 'rejected') ||
      (selectedTab === 'sold' && listing.status === 'sold');
      
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    // So sánh dealType không phân biệt hoa thường
    const matchesDealType = dealTypeFilter === 'all' || listing.dealType.toLowerCase() === dealTypeFilter.toLowerCase();
    
    return matchesTab && matchesSearch && matchesStatus && matchesDealType;
  });

  // Server-side pagination - không cần slice vì backend đã trả về đúng page
  const currentListings = filteredListings;
  
  // Calculate display range for pagination info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + currentListings.length;

  // Reset to page 1 when filters change (not when pagination changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedTab, statusFilter, dealTypeFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: {
        label: 'Chờ duyệt',
        className: 'bg-amber-50 text-amber-700 border-amber-300',
        icon: <Clock className="h-3 w-3" />
      },
      approved: {
        label: 'Đã duyệt',
        className: 'bg-blue-50 text-blue-700 border-blue-300',
        icon: <CheckCircle className="h-3 w-3" />
      },
      rejected: {
        label: 'Từ chối',
        className: 'bg-red-50 text-red-700 border-red-300',
        icon: <XCircle className="h-3 w-3" />
      },
      active: {
        label: 'Hoạt động',
        className: 'bg-green-50 text-green-700 border-green-300',
        icon: <CheckCircle className="h-3 w-3" />
      },
      sold: {
        label: 'Đã bán',
        className: 'bg-slate-50 text-slate-700 border-slate-300',
        icon: <DollarSign className="h-3 w-3" />
      },
      expired: {
        label: 'Hết hạn',
        className: 'bg-orange-50 text-orange-700 border-orange-300',
        icon: <AlertTriangle className="h-3 w-3" />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    
    return (
      <Badge variant="outline" className={`${config.className} px-2 py-1 text-[10px] border font-semibold`}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </span>
      </Badge>
    );
  };

  const handleApprove = async (listingId: string) => {
    try {
      setIsLoading(true);
      
      // Get token from cookie first, then localStorage
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const token = getCookie('accessToken') || localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Lỗi xác thực', {
          description: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        });
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const response = await fetch(`${apiUrl}/api/v1/admin/listings/${listingId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsApproveDialogOpen(false);
        // Update local state
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'active' as const, updatedAt: new Date().toLocaleDateString('vi-VN') }
            : listing
        ));
        toast.success('Thành công', {
          description: 'Tin đăng đã được duyệt và kích hoạt!'
        });
        console.log('Listing approved successfully');
      } else {
        toast.error('Lỗi duyệt tin', {
          description: data.message || 'Không thể duyệt tin đăng. Vui lòng thử lại.'
        });
        console.error('Failed to approve listing:', data);
      }
    } catch (error) {
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
      });
      console.error('Error approving listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (listingId: string) => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error('Thông tin chưa đầy đủ', {
        description: 'Vui lòng nhập lý do từ chối (tối thiểu 10 ký tự).'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get token from cookie first, then localStorage
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const token = getCookie('accessToken') || localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Lỗi xác thực', {
          description: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        });
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const response = await fetch(`${apiUrl}/api/v1/admin/listings/${listingId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'rejected' as const, rejectionReason: rejectionReason.trim(), updatedAt: new Date().toLocaleDateString('vi-VN') }
            : listing
        ));
        setRejectionReason('');
        setIsRejectDialogOpen(false);
        toast.success('Thành công', {
          description: 'Tin đăng đã bị từ chối và thông báo đã gửi!'
        });
        console.log('Listing rejected successfully');
      } else {
        toast.error('Lỗi từ chối tin', {
          description: data.message || 'Không thể từ chối tin đăng. Vui lòng thử lại.'
        });
        console.error('Failed to reject listing:', data);
      }
    } catch (error) {
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
      });
      console.error('Error rejecting listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            Quản lý tin đăng
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Duyệt và quản lý các tin đăng container
          </p>
        </div>
      </div>

      {/* Sticky Tabs - Modern Design */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50">
            <TabsList className="w-full grid grid-cols-5 h-14 bg-transparent gap-2 p-2">
              <TabsTrigger 
                value="all" 
                className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:via-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-semibold">Tất cả</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30">
                    {listings.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-amber-500/90 data-[state=active]:to-amber-500/80 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">Chờ duyệt</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30">
                    {listings.filter(l => l.status === 'pending_review').length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-green-500/90 data-[state=active]:to-green-500/80 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold">Hoạt động</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-bold border border-green-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30">
                    {listings.filter(l => l.status === 'active').length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-red-500/90 data-[state=active]:to-red-500/80 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span className="font-semibold">Từ chối</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold border border-red-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30">
                    {listings.filter(l => l.status === 'rejected').length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="sold"
                className="relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:via-slate-500/90 data-[state=active]:to-slate-500/80 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">Đã bán</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:border-white/30">
                    {listings.filter(l => l.status === 'sold').length}
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab} className="mt-0">
            {/* Filters - Modern Design */}
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      placeholder="Tìm kiếm theo tiêu đề, mô tả, người bán..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-11 hover:border-primary/50 transition-colors duration-200">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          Tất cả trạng thái
                        </span>
                      </SelectItem>
                      <SelectItem value="pending_review">
                        <span className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Chờ duyệt
                        </span>
                      </SelectItem>
                      <SelectItem value="active">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          Hoạt động
                        </span>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          Từ chối
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
                    <SelectTrigger className="w-[160px] h-11 hover:border-primary/50 transition-colors duration-200">
                      <SelectValue placeholder="Loại giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Filter className="h-3.5 w-3.5" />
                          Tất cả loại
                        </span>
                      </SelectItem>
                      <SelectItem value="sale">
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                          Bán
                        </span>
                      </SelectItem>
                      <SelectItem value="rental">
                        <span className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          Thuê ngắn hạn
                        </span>
                      </SelectItem>
                      <SelectItem value="lease">
                        <span className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-purple-600" />
                          Thuê dài hạn
                        </span>
                      </SelectItem>
                      <SelectItem value="swap">
                        <span className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-emerald-600" />
                          Trao đổi
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-[120px] h-11 hover:border-primary/50 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 mục</SelectItem>
                      <SelectItem value="50">50 mục</SelectItem>
                      <SelectItem value="100">100 mục</SelectItem>
                      <SelectItem value="200">200 mục</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

      {/* Listings Table - Modern & Compact */}
      <div>
        {isLoading ? (
          <Card className="border-primary/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <Package className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-muted-foreground mt-6 text-sm font-medium">Đang tải dữ liệu...</p>
            </CardContent>
          </Card>
        ) : listings.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6">
                <Package className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                Chưa có tin đăng
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Các tin đăng từ người bán sẽ hiển thị ở đây
              </p>
            </CardContent>
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-50/50 p-6 mb-6">
                <Search className="h-16 w-16 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 hover:bg-gradient-to-r hover:from-slate-100 hover:via-slate-50 hover:to-slate-100">
                    <TableHead className="font-bold text-slate-800 w-16 text-center pl-6">#</TableHead>
                    <TableHead className="font-bold text-slate-800">Thông tin Container</TableHead>
                    <TableHead className="font-bold text-slate-800 w-[200px]">Người bán</TableHead>
                    <TableHead className="font-bold text-slate-800 w-[160px] text-right">Giá</TableHead>
                    <TableHead className="font-bold text-slate-800 w-[140px] text-center">Trạng thái</TableHead>
                    <TableHead className="font-bold text-slate-800 w-[160px] text-center pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentListings.map((listing, index) => (
                    <TableRow 
                      key={listing.id} 
                      className="border-b hover:bg-gradient-to-r hover:from-primary/5 hover:via-transparent hover:to-primary/5 transition-all duration-300 group"
                    >
                      {/* Number */}
                      <TableCell className="text-center py-3 pl-6">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-xs font-bold group-hover:from-primary group-hover:to-primary/90 group-hover:text-white transition-all duration-300">
                          {startIndex + index + 1}
                        </span>
                      </TableCell>

                      {/* Container Info */}
                      <TableCell className="py-3">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-primary transition-colors duration-300">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {listing.description || 'Không có mô tả'}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {listing.size && listing.size !== 'ft' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                                <Package className="h-3 w-3" />
                                {listing.size}
                              </span>
                            )}
                            {listing.containerType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-xs font-medium border border-purple-200">
                                {listing.containerType.toUpperCase()}
                              </span>
                            )}
                            {listing.condition && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
                                {listing.condition === 'used' ? 'Đã qua SD' : 
                                 listing.condition === 'new' ? 'Mới' : 
                                 listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                              </span>
                            )}
                            {listing.depot && listing.depot !== 'N/A' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 text-xs border border-slate-200">
                                <MapPin className="h-3 w-3" />
                                {listing.depot}
                              </span>
                            )}
                          </div>
                          
                          {/* Rejection Reason - Compact */}
                          {listing.status === 'rejected' && listing.rejectionReason && (
                            <div className="flex items-start gap-1.5 p-2 bg-gradient-to-r from-red-50 to-red-100 border-l-2 border-red-400 rounded text-xs">
                              <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-red-700 line-clamp-2">
                                <span className="font-semibold">Lý do:</span> {listing.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Owner */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                            {listing.owner.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{listing.owner}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {listing.createdAt}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Price */}
                      <TableCell className="py-3 text-right">
                        <div className="space-y-1">
                          <div className="font-bold text-base text-slate-900">
                            {new Intl.NumberFormat('vi-VN').format(listing.price)}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{listing.currency}</div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium px-2 py-0.5 border-2 ${
                              listing.dealType.toUpperCase() === 'SALE' 
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300' 
                                : listing.dealType.toUpperCase() === 'RENTAL' 
                                ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300'
                                : listing.dealType.toUpperCase() === 'LEASE'
                                ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-300'
                                : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300'
                            }`}
                          >
                            {getDealTypeDisplayName(listing.dealType)}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 text-center">
                        {getStatusBadge(listing.status)}
                      </TableCell>

                      {/* Actions - Compact */}
                      <TableCell className="py-3 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/listings/${listing.id}`)}
                            className="h-9 px-3 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {listing.status === 'pending_review' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setIsApproveDialogOpen(true);
                                }}
                                className="h-9 px-3 bg-gradient-to-r from-green-600 via-green-600/90 to-green-600/80 hover:from-green-700 hover:via-green-700/90 hover:to-green-700/80 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                disabled={isLoading}
                                title="Duyệt"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setRejectionReason('');
                                  setIsRejectDialogOpen(true);
                                }}
                                className="h-9 px-3 bg-gradient-to-r from-red-600 via-red-600/90 to-red-600/80 hover:from-red-700 hover:via-red-700/90 hover:to-red-700/80 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                disabled={isLoading}
                                title="Từ chối"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Compact */}
            {totalPages > 1 && (
              <CardContent className="border-t bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{endIndex}</span> trong tổng số <span className="font-semibold text-foreground">{totalCount}</span> tin đăng
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-3 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-slate-400 text-sm flex items-center">...</span>
                            )}
                            <Button
                              size="sm"
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => setCurrentPage(page)}
                              className={`h-9 min-w-[2.5rem] text-sm ${
                                currentPage === page 
                                  ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-white shadow-md hover:shadow-lg transition-all duration-300' 
                                  : 'hover:bg-primary/5 hover:border-primary transition-all duration-300'
                              }`}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 px-3 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>      {/* Listing Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 -mx-6 -mt-6 px-6 pt-6">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                  Chi tiết tin đăng
                </div>
                <DialogDescription className="text-sm mt-1">
                  Thông tin đầy đủ về tin đăng container
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-6 pt-4">
              {/* Images */}
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <Label className="mb-3 block font-semibold text-slate-700 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Hình ảnh ({selectedListing.images.length})
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedListing.images.map((image, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg">
                        <img 
                          src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}${image}`}
                          alt={`${selectedListing.title} - ${index + 1}`}
                          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-2 px-3 text-center font-medium">
                          Ảnh {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Label className="text-blue-700 font-semibold text-sm mb-2 block flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Tiêu đề
                  </Label>
                  <div className="text-base font-medium text-slate-900">{selectedListing.title}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Label className="text-green-700 font-semibold text-sm mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Giá
                  </Label>
                  <div className="text-xl font-bold text-green-700">{formatPrice(selectedListing.price, selectedListing.currency)}</div>
                  <div className="text-xs text-green-600 mt-1 font-medium">{getDealTypeDisplayName(selectedListing.dealType)}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border-2 border-slate-200 shadow-sm">
                <Label className="text-slate-700 font-semibold mb-3 block flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Mô tả
                </Label>
                <div className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg">
                  {selectedListing.description || 'Không có mô tả'}
                </div>
              </div>
              
              {/* Container Details */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Thông tin container
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-purple-700 font-semibold text-xs mb-2 block">Kích thước</Label>
                    <div className="text-lg font-bold text-purple-900">{selectedListing.size || 'N/A'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-indigo-700 font-semibold text-xs mb-2 block">Loại</Label>
                    <div className="text-lg font-bold text-indigo-900">{selectedListing.containerType || 'N/A'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border-2 border-cyan-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-cyan-700 font-semibold text-xs mb-2 block">Tình trạng</Label>
                    <div className="text-sm font-bold text-cyan-900">
                      {selectedListing.condition === 'used' ? 'Đã qua sử dụng' : selectedListing.condition || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border-2 border-teal-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-teal-700 font-semibold text-xs mb-2 block">Tiêu chuẩn</Label>
                    <div className="text-lg font-bold text-teal-900">{selectedListing.standard || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {/* Location & Owner */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Vị trí và chủ sở hữu
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-amber-700 font-semibold text-sm mb-2 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Chủ sở hữu
                    </Label>
                    <div className="text-base font-medium text-amber-900">{selectedListing.owner}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-emerald-700 font-semibold text-sm mb-2 block flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Depot
                    </Label>
                    <div className="text-base font-medium text-emerald-900">
                      {selectedListing.depot || 'N/A'}
                    </div>
                    {selectedListing.depotProvince && (
                      <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                        <MapPin className="h-3 w-3" />
                        {selectedListing.depotProvince}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status Info */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Trạng thái và thời gian
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-slate-700 font-semibold text-sm mb-3 block">Trạng thái hiện tại</Label>
                    <div className="mt-1">{getStatusBadge(selectedListing.status)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-blue-700 font-semibold text-sm mb-3 block">Ngày tạo</Label>
                    <div className="text-sm font-medium text-blue-900 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <Calendar className="h-4 w-4" />
                      {selectedListing.createdAt}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <Label className="text-indigo-700 font-semibold text-sm mb-3 block">Cập nhật lần cuối</Label>
                    <div className="text-sm font-medium text-indigo-900 flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      {selectedListing.updatedAt}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedListing.rejectionReason && (
                <div className="border-t-2 border-red-200 pt-6 bg-gradient-to-br from-red-50 to-red-100 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-red-700 font-bold text-base mb-3 block">Lý do từ chối</Label>
                      <div className="text-sm text-red-800 bg-white p-4 rounded-lg border-2 border-red-200 leading-relaxed shadow-sm">
                        {selectedListing.rejectionReason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4 bg-gradient-to-r from-green-50 via-transparent to-green-50 -mx-6 -mt-6 px-6 pt-6">
            <DialogTitle className="text-xl flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 via-green-500/90 to-green-500/80 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-green-700">Xác nhận duyệt tin đăng</div>
                <DialogDescription className="text-sm text-slate-600 mt-1">
                  Bạn có chắc chắn muốn duyệt tin đăng này? Tin đăng sẽ được kích hoạt và hiển thị công khai.
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4 pt-4">
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-2">{selectedListing.title}</div>
                    <div className="text-sm text-slate-600 space-y-1.5">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>Người đăng: <span className="font-medium text-slate-900">{selectedListing.owner}</span></span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <span>Giá: <span className="font-medium text-green-700">{new Intl.NumberFormat('vi-VN').format(selectedListing.price)} {selectedListing.currency}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Sau khi duyệt:</h4>
                    <ul className="text-sm text-green-800 space-y-1.5">
                      <li className="flex items-center gap-2">✓ Tin đăng sẽ được kích hoạt</li>
                      <li className="flex items-center gap-2">✓ Hiển thị công khai trên marketplace</li>
                      <li className="flex items-center gap-2">✓ Người bán sẽ nhận được thông báo</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsApproveDialogOpen(false)}
                  disabled={isLoading}
                  className="min-w-[100px] hover:bg-slate-100 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  className="min-w-[160px] bg-gradient-to-r from-green-600 via-green-600/90 to-green-600/80 hover:from-green-700 hover:via-green-700/90 hover:to-green-700/80 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => selectedListing && handleApprove(selectedListing.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Xác nhận duyệt
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="border-b pb-4 bg-gradient-to-r from-red-50 via-transparent to-red-50 -mx-6 -mt-6 px-6 pt-6">
            <DialogTitle className="text-xl flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 via-red-500/90 to-red-500/80 rounded-full flex items-center justify-center shadow-md">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-red-700">Từ chối tin đăng</div>
                <DialogDescription className="text-sm text-slate-600 mt-1">
                  Vui lòng nhập lý do từ chối tin đăng này. Lý do sẽ được gửi thông báo đến người đăng.
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4 pt-4">
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-500/90 to-amber-500/80 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-2">{selectedListing.title}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        Chủ sở hữu: <span className="font-medium text-slate-900">{selectedListing.owner}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rejectionReason" className="text-slate-700 font-semibold flex items-center gap-2 mb-2">
                  Lý do từ chối <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Ví dụ: Ảnh không rõ ràng, thông tin không đầy đủ, giá không hợp lý..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={5}
                  className="border-slate-300 focus:border-red-500 focus:ring-red-500 resize-none transition-all duration-200"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">
                    Tối thiểu 10 ký tự để đảm bảo thông tin rõ ràng
                  </p>
                  <p className={`text-xs font-medium ${rejectionReason.length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {rejectionReason.length}/10
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                  disabled={isLoading}
                  className="min-w-[100px] hover:bg-slate-100 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  className="min-w-[160px] bg-gradient-to-r from-red-600 via-red-600/90 to-red-600/80 hover:from-red-700 hover:via-red-700/90 hover:to-red-700/80 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => selectedListing && handleReject(selectedListing.id)}
                  disabled={isLoading || rejectionReason.trim().length < 10}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Xác nhận từ chối
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>
      </Card>
      </Tabs>
    </div>
  );
}
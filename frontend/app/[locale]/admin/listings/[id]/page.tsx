"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  User,
  FileText,
  ImageIcon,
  Shield,
  Ruler,
  Box,
  Star
} from 'lucide-react';
import { getDealTypeDisplayName } from '@/lib/utils/dealType';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  dealType: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'sold' | 'expired';
  size?: string;
  containerType?: string;
  condition?: string;
  standard?: string;
  depot?: string;
  depotProvince?: string;
  owner: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  images?: string[];
}

export default function AdminListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchListingDetail = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
        const response = await fetch(`${apiUrl}/api/v1/admin/listings/${listingId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const listingData = data.data.listing;
          
          // Parse facets
          const facets = listingData.listing_facets || [];
          const size = facets.find((f: any) => f.key === 'size')?.value || '';
          const containerType = facets.find((f: any) => f.key === 'type')?.value || '';
          const condition = facets.find((f: any) => f.key === 'condition')?.value || '';
          const standard = facets.find((f: any) => f.key === 'standard')?.value || '';
          
          const mappedListing: Listing = {
            id: listingData.id,
            title: listingData.title,
            description: listingData.description || '',
            price: parseFloat(listingData.price_amount || 0),
            currency: listingData.price_currency || 'VND',
            dealType: (listingData.deal_type || 'SALE').toLowerCase(),
            status: (listingData.status || 'PENDING_REVIEW').toLowerCase().replace(/_/g, '_').toLowerCase() as any,
            size: size ? `${size}ft` : '',
            containerType: containerType || '',
            condition: condition || '',
            standard: standard || '',
            depot: listingData.depots?.name || 'N/A',
            depotProvince: listingData.depots?.province || '',
            owner: listingData.users?.display_name || listingData.users?.email || 'N/A',
            ownerEmail: listingData.users?.email || '',
            createdAt: new Date(listingData.created_at).toLocaleDateString('vi-VN'),
            updatedAt: new Date(listingData.updated_at).toLocaleDateString('vi-VN'),
            rejectionReason: listingData.rejection_reason || '',
            images: listingData.listing_media?.map((m: any) => m.media_url) || []
          };
          
          setListing(mappedListing);
        } else {
          toast.error('Lỗi tải dữ liệu', {
            description: 'Không thể tải thông tin tin đăng.'
          });
          router.push('/admin/listings');
        }
      } catch (error) {
        console.error('Error fetching listing detail:', error);
        toast.error('Lỗi kết nối', {
          description: 'Không thể kết nối đến máy chủ.'
        });
        router.push('/admin/listings');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListingDetail();
    }
  }, [listingId, router]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('accessToken');
      
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
        toast.success('Thành công', {
          description: 'Tin đăng đã được duyệt và kích hoạt!'
        });
        
        // Update local state
        if (listing) {
          setListing({ ...listing, status: 'active' as const, updatedAt: new Date().toLocaleDateString('vi-VN') });
        }
        
        // Redirect to listings page after 1.5 seconds
        setTimeout(() => {
          router.push('/admin/listings');
        }, 1500);
      } else {
        toast.error('Lỗi duyệt tin', {
          description: data.message || 'Không thể duyệt tin đăng. Vui lòng thử lại.'
        });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến máy chủ.'
      });
      console.error('Error approving listing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error('Thông tin chưa đầy đủ', {
        description: 'Vui lòng nhập lý do từ chối (tối thiểu 10 ký tự).'
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('accessToken');
      
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
        setRejectionReason('');
        setIsRejectDialogOpen(false);
        toast.success('Thành công', {
          description: 'Tin đăng đã bị từ chối và thông báo đã gửi!'
        });
        
        // Update local state
        if (listing) {
          setListing({ 
            ...listing, 
            status: 'rejected' as const, 
            rejectionReason: rejectionReason.trim(), 
            updatedAt: new Date().toLocaleDateString('vi-VN') 
          });
        }
        
        // Redirect to listings page after 1.5 seconds
        setTimeout(() => {
          router.push('/admin/listings');
        }, 1500);
      } else {
        toast.error('Lỗi từ chối tin', {
          description: data.message || 'Không thể từ chối tin đăng. Vui lòng thử lại.'
        });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến máy chủ.'
      });
      console.error('Error rejecting listing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: {
        label: 'Chờ duyệt',
        className: 'bg-amber-50 text-amber-700 border-amber-300',
        icon: <Clock className="h-4 w-4" />
      },
      approved: {
        label: 'Đã duyệt',
        className: 'bg-blue-50 text-blue-700 border-blue-300',
        icon: <CheckCircle className="h-4 w-4" />
      },
      rejected: {
        label: 'Từ chối',
        className: 'bg-red-50 text-red-700 border-red-300',
        icon: <XCircle className="h-4 w-4" />
      },
      active: {
        label: 'Hoạt động',
        className: 'bg-green-50 text-green-700 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />
      },
      sold: {
        label: 'Đã bán',
        className: 'bg-slate-50 text-slate-700 border-slate-300',
        icon: <DollarSign className="h-4 w-4" />
      },
      expired: {
        label: 'Hết hạn',
        className: 'bg-orange-50 text-orange-700 border-orange-300',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    
    return (
      <Badge variant="outline" className={`${config.className} px-3 py-1.5 text-sm border-2 font-bold`}>
        <span className="flex items-center gap-2">
          {config.icon}
          {config.label}
        </span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4 mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-lg">Không tìm thấy tin đăng</p>
          <Button onClick={() => router.push('/admin/listings')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-y-auto">
      <div className="w-full px-6 py-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/listings')}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Chi tiết tin đăng</h1>
                  <p className="text-sm text-slate-500">Xem và quản lý thông tin tin đăng container</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(listing.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {listing.images && listing.images.length > 0 && (
              <Card className="shadow-sm border">
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Hình ảnh ({listing.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.images.map((image, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg">
                        <img 
                          src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}${image}`}
                          alt={`${listing.title} - ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-2 px-3 font-semibold">
                          Ảnh {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Info */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-slate-600 text-sm mb-2 block font-semibold">Tiêu đề</Label>
                  <p className="text-lg font-bold text-slate-900">{listing.title}</p>
                </div>
                
                <div>
                  <Label className="text-slate-600 text-sm mb-2 block font-semibold">Mô tả</Label>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {listing.description || 'Không có mô tả'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <Label className="text-green-700 font-bold text-sm mb-2 block flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Giá
                    </Label>
                    <div className="text-2xl font-bold text-green-700">
                      {new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Label className="text-blue-700 font-bold text-sm mb-2 block flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Loại giao dịch
                    </Label>
                    <div className="text-xl font-bold text-blue-700">
                      {getDealTypeDisplayName(listing.dealType)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container Details */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Box className="h-5 w-5 text-cyan-600" />
                  Thông tin container
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <Label className="text-purple-700 font-bold text-xs mb-2 block flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      Kích thước
                    </Label>
                    <div className="text-lg font-bold text-purple-900">{listing.size || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <Label className="text-indigo-700 font-bold text-xs mb-2 block flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Loại
                    </Label>
                    <div className="text-sm font-bold text-indigo-900">{listing.containerType?.toUpperCase() || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <Label className="text-cyan-700 font-bold text-xs mb-2 block flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Tình trạng
                    </Label>
                    <div className="text-sm font-bold text-cyan-900">
                      {listing.condition === 'used' ? 'Đã qua SD' : listing.condition === 'new' ? 'Mới' : listing.condition || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <Label className="text-teal-700 font-bold text-xs mb-2 block flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Tiêu chuẩn
                    </Label>
                    <div className="text-sm font-bold text-teal-900">{listing.standard || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rejection Reason */}
            {listing.status === 'rejected' && listing.rejectionReason && (
              <Card className="shadow-sm border border-l-4 border-l-red-500">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-xl text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Lý do từ chối
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                    <p className="text-slate-800 leading-relaxed">{listing.rejectionReason}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Actions */}
            {listing.status === 'pending_review' && (
              <Card className="shadow-sm border">
                <CardHeader className="border-b bg-amber-50">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-5 w-5 text-amber-600" />
                    Thao tác duyệt
                  </CardTitle>
                  <CardDescription>Phê duyệt hoặc từ chối tin đăng này</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={isProcessing}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Duyệt tin đăng
                    </span>
                  </Button>
                  
                  <Button
                    onClick={() => setIsRejectDialogOpen(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full h-12 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 font-bold"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Từ chối tin đăng
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Owner Info */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-indigo-600" />
                  Người đăng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                    {listing.owner.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">{listing.owner}</p>
                    {listing.ownerEmail && (
                      <p className="text-sm text-slate-500">{listing.ownerEmail}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Vị trí
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <Label className="text-emerald-700 font-bold text-sm mb-2 block">Depot</Label>
                    <p className="text-slate-900 font-semibold">{listing.depot || 'N/A'}</p>
                  </div>
                  
                  {listing.depotProvince && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <Label className="text-teal-700 font-bold text-sm mb-2 block">Tỉnh/Thành phố</Label>
                      <p className="text-slate-900 font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        {listing.depotProvince}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="shadow-sm border">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-slate-600" />
                  Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-blue-700 font-semibold text-sm">Ngày tạo</Label>
                  <span className="text-slate-900 font-bold">{listing.createdAt}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Label className="text-indigo-700 font-semibold text-sm">Cập nhật lần cuối</Label>
                  <span className="text-slate-900 font-bold">{listing.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl flex items-center gap-2 text-green-600">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              Xác nhận duyệt tin đăng
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Bạn có chắc chắn muốn duyệt tin đăng này? Tin đăng sẽ được kích hoạt và hiển thị công khai.
            </DialogDescription>
          </DialogHeader>
          
          {listing && (
            <div className="space-y-4 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-1">{listing.title}</div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>Người đăng: <span className="font-medium">{listing.owner}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        <span>Giá: <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(listing.price)} {listing.currency}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Sau khi duyệt:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ Tin đăng sẽ được kích hoạt</li>
                      <li>✓ Hiển thị công khai trên marketplace</li>
                      <li>✓ Người bán sẽ nhận được thông báo</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsApproveDialogOpen(false)}
                  disabled={isProcessing}
                  className="min-w-[100px]"
                >
                  Hủy
                </Button>
                <Button 
                  className="min-w-[160px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
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
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl flex items-center gap-2 text-red-600">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
              Từ chối tin đăng
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Vui lòng nhập lý do từ chối tin đăng này. Lý do sẽ được gửi thông báo đến người đăng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{listing.title}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Chủ sở hữu: <span className="font-medium">{listing.owner}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="rejectionReason" className="text-slate-700 font-semibold flex items-center gap-2">
                Lý do từ chối <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Ví dụ: Ảnh không rõ ràng, thông tin không đầy đủ, giá không hợp lý..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className="mt-2 border-slate-300 focus:border-red-500 focus:ring-red-500 resize-none"
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
                disabled={isProcessing}
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button 
                className="min-w-[160px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.trim().length < 10}
              >
                {isProcessing ? (
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle2, XCircle, AlertCircle, FileText, Search, Filter } from 'lucide-react';

interface Application {
  id: string;
  application_code: string;
  business_name: string;
  business_type: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  user: {
    email: string;
    full_name: string | null;
    phone: string | null;
  };
}

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Đang thẩm định', color: 'bg-blue-500' },
  INFO_REQUIRED: { label: 'Cần bổ sung', color: 'bg-orange-500' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-500' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-500' }
};

export default function AdminSellerApplicationsPage() {
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request-info'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, searchQuery]);
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller-applications/admin/list?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.data.applications);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchApplicationDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller-applications/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch application detail');
      
      const data = await response.json();
      setSelectedApp(data.data.application);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleAction = async () => {
    if (!selectedApp) return;
    
    if ((actionType === 'reject' || actionType === 'request-info') && !actionReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do',
        variant: 'destructive'
      });
      return;
    }
    
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const endpoint = actionType === 'approve' 
        ? `/seller-applications/${selectedApp.id}/approve`
        : actionType === 'reject'
        ? `/seller-applications/${selectedApp.id}/reject`
        : `/seller-applications/${selectedApp.id}/request-info`;
      
      const body = actionType === 'approve' 
        ? {}
        : actionType === 'reject'
        ? { reason: actionReason }
        : { requiredInfo: actionReason };
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );
      
      if (!response.ok) throw new Error('Action failed');
      
      toast({
        title: 'Thành công',
        description: actionType === 'approve' 
          ? 'Đã duyệt đơn đăng ký'
          : actionType === 'reject'
          ? 'Đã từ chối đơn đăng ký'
          : 'Đã gửi yêu cầu bổ sung thông tin'
      });
      
      setActionDialogOpen(false);
      setSelectedApp(null);
      setActionReason('');
      fetchApplications();
      
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  const openActionDialog = (app: any, type: 'approve' | 'reject' | 'request-info') => {
    fetchApplicationDetail(app.id);
    setActionType(type);
    setActionReason('');
    setActionDialogOpen(true);
  };
  
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length,
    infoRequired: applications.filter(a => a.status === 'INFO_REQUIRED').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý đơn đăng ký Seller</h1>
        <p className="text-gray-600">
          Xem xét và phê duyệt đơn đăng ký trở thành nhà cung cấp
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng đơn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cần bổ sung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.infoRequired}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã đơn, tên, MST..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="UNDER_REVIEW">Đang thẩm định</SelectItem>
                <SelectItem value="INFO_REQUIRED">Cần bổ sung</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Tên doanh nghiệp</TableHead>
                <TableHead>Người đăng ký</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không có đơn nào
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
                  
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.application_code}</TableCell>
                      <TableCell className="font-medium">{app.business_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.user.full_name || app.user.email}</p>
                          <p className="text-xs text-gray-500">{app.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {app.business_type === 'COMPANY' ? 'Doanh nghiệp' : 'Cá nhân'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(app.submitted_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchApplicationDetail(app.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết đơn đăng ký</DialogTitle>
                                <DialogDescription>{app.application_code}</DialogDescription>
                              </DialogHeader>
                              
                              {selectedApp && (
                                <Tabs defaultValue="business" className="mt-4">
                                  <TabsList>
                                    <TabsTrigger value="business">Doanh nghiệp</TabsTrigger>
                                    <TabsTrigger value="depot">Kho bãi</TabsTrigger>
                                    <TabsTrigger value="bank">Ngân hàng</TabsTrigger>
                                    <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
                                    <TabsTrigger value="documents">Tài liệu</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="business" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Loại hình</Label>
                                        <p className="font-medium">{selectedApp.business_type === 'COMPANY' ? 'Doanh nghiệp' : 'Cá nhân'}</p>
                                      </div>
                                      <div>
                                        <Label>Tên</Label>
                                        <p className="font-medium">{selectedApp.business_name}</p>
                                      </div>
                                      <div>
                                        <Label>{selectedApp.business_type === 'COMPANY' ? 'Mã số thuế' : 'CCCD'}</Label>
                                        <p className="font-medium">{selectedApp.tax_code || selectedApp.national_id}</p>
                                      </div>
                                      <div>
                                        <Label>Địa chỉ</Label>
                                        <p className="font-medium">{selectedApp.address}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="depot" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Tên kho</Label>
                                        <p className="font-medium">{selectedApp.depot_name}</p>
                                      </div>
                                      <div>
                                        <Label>Địa chỉ kho</Label>
                                        <p className="font-medium">{selectedApp.depot_address}</p>
                                      </div>
                                      <div>
                                        <Label>Diện tích (m²)</Label>
                                        <p className="font-medium">{selectedApp.depot_area_sqm || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <Label>Sức chứa (TEU)</Label>
                                        <p className="font-medium">{selectedApp.depot_capacity_teu || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Ảnh kho ({selectedApp.depot_images.length})</Label>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        {selectedApp.depot_images.map((url: string, idx: number) => (
                                          <img
                                            key={idx}
                                            src={process.env.NEXT_PUBLIC_API_URL + url}
                                            alt={`Kho ${idx + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="bank" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Ngân hàng</Label>
                                        <p className="font-medium">{selectedApp.bank_name}</p>
                                      </div>
                                      <div>
                                        <Label>Chi nhánh</Label>
                                        <p className="font-medium">{selectedApp.bank_branch || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <Label>Số tài khoản</Label>
                                        <p className="font-medium">{selectedApp.bank_account_number}</p>
                                      </div>
                                      <div>
                                        <Label>Chủ tài khoản</Label>
                                        <p className="font-medium">{selectedApp.bank_account_holder}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="experience" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Số năm kinh nghiệm</Label>
                                        <p className="font-medium">{selectedApp.years_experience || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <Label>Nguồn hàng</Label>
                                        <p className="font-medium">
                                          {selectedApp.supply_source === 'OWN' ? 'Sở hữu' : 
                                           selectedApp.supply_source === 'AGENT' ? 'Đại lý' : 'Trung gian'}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Số lượng container hiện có</Label>
                                        <p className="font-medium">{selectedApp.current_inventory || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Loại container</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedApp.container_types.map((type: string) => (
                                          <Badge key={type} variant="secondary">{type}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Mô tả doanh nghiệp</Label>
                                      <p className="text-sm mt-2">{selectedApp.business_description || 'N/A'}</p>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="documents" className="space-y-2">
                                    {selectedApp.documents.map((doc: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-5 w-5" />
                                          <div>
                                            <p className="font-medium">{doc.filename}</p>
                                            <p className="text-xs text-gray-500">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(process.env.NEXT_PUBLIC_API_URL + doc.url, '_blank')}
                                        >
                                          Xem
                                        </Button>
                                      </div>
                                    ))}
                                  </TabsContent>
                                </Tabs>
                              )}
                              
                              {selectedApp && (selectedApp.status === 'PENDING' || selectedApp.status === 'UNDER_REVIEW') && (
                                <div className="flex gap-2 mt-6 pt-4 border-t">
                                  <Button onClick={() => openActionDialog(app, 'approve')} className="flex-1">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Duyệt
                                  </Button>
                                  <Button onClick={() => openActionDialog(app, 'request-info')} variant="outline" className="flex-1">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Yêu cầu bổ sung
                                  </Button>
                                  <Button onClick={() => openActionDialog(app, 'reject')} variant="destructive" className="flex-1">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Từ chối
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openActionDialog(app, 'approve')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(app, 'request-info')}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openActionDialog(app, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Duyệt đơn đăng ký'}
              {actionType === 'reject' && 'Từ chối đơn đăng ký'}
              {actionType === 'request-info' && 'Yêu cầu bổ sung thông tin'}
            </DialogTitle>
            <DialogDescription>
              {selectedApp?.application_code}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'approve' ? (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Sau khi duyệt, hệ thống sẽ tự động:
              </p>
              <ul className="text-sm space-y-2 ml-4 list-disc">
                <li>Gán role Seller cho user</li>
                <li>Tạo depot mới</li>
                <li>Gửi email thông báo</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                Bạn có chắc chắn muốn duyệt đơn này?
              </p>
            </div>
          ) : (
            <div className="py-4">
              <Label>
                {actionType === 'reject' ? 'Lý do từ chối' : 'Thông tin cần bổ sung'}
                <span className="text-red-500"> *</span>
              </Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={5}
                placeholder={actionType === 'reject' 
                  ? 'Nhập lý do từ chối...'
                  : 'Liệt kê các thông tin cần bổ sung...'}
                className="mt-2"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

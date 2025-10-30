"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';

interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  reason: string;
  description: string | null;
  evidence_json: any;
  requested_resolution: string | null;
  requested_amount: any;
  priority: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution: string | null;
  resolution_notes: string | null;
  orders: {
    id: string;
    order_number: string;
    status: string;
    total: any;
    currency: string;
  };
  users_disputes_raised_byTousers: {
    id: string;
    display_name: string;
    email: string;
  };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data from API
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('❌ No access token found in localStorage');
          alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter.toUpperCase());
        if (priorityFilter !== 'all') params.append('priority', priorityFilter.toUpperCase());
        
        const url = `http://localhost:3006/api/v1/admin/disputes?${params.toString()}`;
        console.log('🔍 Fetching disputes from:', url);
        console.log('🔑 Using token:', token.substring(0, 30) + '...');
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Data received:', data);
          console.log('📊 Total disputes:', data.data?.disputes?.length || 0);
          setDisputes(data.data.disputes || []);
          
          if (!data.data.disputes || data.data.disputes.length === 0) {
            console.warn('⚠️ No disputes found in database');
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          console.error('❌ Failed to fetch disputes:', response.status, errorData);
          alert(`Lỗi: ${errorData.message || 'Không thể tải dữ liệu tranh chấp'}`);
        }
      } catch (error) {
        console.error('❌ Error fetching disputes:', error);
        alert('Lỗi kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy không.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputes();
  }, [statusFilter, priorityFilter]);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dispute.description && dispute.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      dispute.users_disputes_raised_byTousers.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.users_disputes_raised_byTousers.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.orders.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'default' | 'outline'> = {
      OPEN: 'destructive',
      IN_REVIEW: 'secondary',
      RESOLVED: 'default',
      CLOSED: 'outline',
      ESCALATED: 'destructive'
    };
    
    const icons: Record<string, any> = {
      OPEN: <AlertTriangle className="h-3 w-3 mr-1" />,
      IN_REVIEW: <Clock className="h-3 w-3 mr-1" />,
      RESOLVED: <CheckCircle className="h-3 w-3 mr-1" />,
      CLOSED: <XCircle className="h-3 w-3 mr-1" />,
      ESCALATED: <AlertTriangle className="h-3 w-3 mr-1" />
    };
    
    const labels: Record<string, string> = {
      OPEN: 'Đang mở',
      IN_REVIEW: 'Đang xem xét',
      RESOLVED: 'Đã giải quyết',
      CLOSED: 'Đã đóng',
      ESCALATED: 'Đã báo cáo'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center">
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'default' | 'outline'> = {
      LOW: 'outline',
      MEDIUM: 'secondary',
      HIGH: 'default',
      URGENT: 'destructive'
    };
    
    const labels: Record<string, string> = {
      LOW: 'Thấp',
      MEDIUM: 'Trung bình',
      HIGH: 'Cao',
      URGENT: 'Khẩn cấp'
    };
    
    return <Badge variant={variants[priority || 'MEDIUM'] || 'outline'}>{labels[priority || 'MEDIUM'] || priority}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CREATED: 'Đã tạo',
      PENDING_PAYMENT: 'Chờ thanh toán',
      PAYMENT_PENDING_VERIFICATION: 'Chờ xác minh',
      PAID: 'Đã thanh toán',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
      AWAITING_FUNDS: 'Chờ tiền',
      ESCROW_FUNDED: 'Đã ký quỹ',
      PREPARING_DELIVERY: 'Chuẩn bị giao',
      DOCUMENTS_READY: 'Chứng từ sẵn sàng',
      TRANSPORTATION_BOOKED: 'Đã đặt vận chuyển',
      IN_TRANSIT: 'Đang vận chuyển',
      PAYMENT_RELEASED: 'Đã giải ngân',
      DISPUTED: 'Tranh chấp',
      READY_FOR_PICKUP: 'Sẵn sàng lấy hàng',
      DELIVERING: 'Đang giao hàng'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tranh chấp</h1>
          <p className="text-muted-foreground">Xử lý và giải quyết các tranh chấp giữa người dùng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tranh chấp</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mở</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.filter(d => d.status === 'OPEN').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.filter(d => d.status === 'IN_REVIEW').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.filter(d => d.status === 'RESOLVED').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tiêu đề, mô tả, người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="OPEN">Đang mở</SelectItem>
                  <SelectItem value="IN_REVIEW">Đang xử lý</SelectItem>
                  <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                  <SelectItem value="CLOSED">Đã đóng</SelectItem>
                  <SelectItem value="ESCALATED">Đã báo cáo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mức độ ưu tiên</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="LOW">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearchTerm('');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tranh chấp</CardTitle>
          <CardDescription>
            {filteredDisputes.length} tranh chấp được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tranh chấp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Người khiếu nại</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Giá trị yêu cầu</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Clock className="h-5 w-5 animate-spin mr-2" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDisputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy tranh chấp nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dispute.reason}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {dispute.description || 'Không có mô tả'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {dispute.id.slice(0, 15)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dispute.users_disputes_raised_byTousers.display_name}</div>
                        <div className="text-xs text-muted-foreground">{dispute.users_disputes_raised_byTousers.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{dispute.orders.order_number}</div>
                        <div className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {getOrderStatusLabel(dispute.orders.status)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dispute.requested_amount ? (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatPrice(Number(dispute.requested_amount), dispute.orders.currency)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(dispute.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          window.location.href = `/admin/disputes/${dispute.id}`;
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
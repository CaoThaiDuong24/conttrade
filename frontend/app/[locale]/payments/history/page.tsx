"use client";

import { useState, useEffect } from 'react';
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getPaymentHistory } from '@/lib/api/payments';
import { 
  History, 
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  type: 'payment' | 'refund' | 'escrow_deposit' | 'escrow_release';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      console.log('[Payments History] Fetching payments from API...');
      const response = await getPaymentHistory(1, 50);
      console.log('[Payments History] API Response:', response);
      // Map API response to component interface
      const mappedPayments = response.payments.map(payment => ({
        id: payment.id,
        orderId: payment.orderId,
        type: 'payment' as const,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status as 'pending' | 'completed' | 'failed' | 'cancelled',
        paymentMethod: payment.method,
        description: `Thanh toán cho đơn hàng ${payment.orderId}`,
        createdAt: payment.createdAt,
        completedAt: payment.createdAt,
      }));
      setPayments(mappedPayments);
    } catch (error) {
      console.error('[Payments History] Error fetching payment history:', error);
      // Fallback to static data for demo
      setPayments([
        {
          id: 'PAY-001',
          orderId: 'ORD-001',
          type: 'payment',
          amount: 45000000,
          currency: 'VND',
          status: 'completed',
          paymentMethod: 'Bank Transfer',
          description: 'Thanh toán ký quỹ cho đơn hàng ORD-001',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:35:00Z',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Đang xử lý' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Thành công' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Thất bại' },
      cancelled: { variant: 'outline' as const, icon: XCircle, label: 'Đã hủy' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'refund') return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    return <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      payment: 'Thanh toán',
      refund: 'Hoàn tiền',
      escrow_deposit: 'Ký quỹ',
      escrow_release: 'Giải ngân',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const calculateTotalAmount = (type: 'payment' | 'refund') => {
    return payments
      .filter(p => p.type === type && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Lịch sử thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi tất cả giao dịch thanh toán của bạn
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${calculateTotalAmount('payment').toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhận</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${calculateTotalAmount('refund').toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn hàng, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="payment">Thanh toán</SelectItem>
                  <SelectItem value="refund">Hoàn tiền</SelectItem>
                  <SelectItem value="escrow_deposit">Ký quỹ</SelectItem>
                  <SelectItem value="escrow_release">Giải ngân</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${filteredPayments.length} giao dịch`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có giao dịch nào</h3>
              <p className="text-muted-foreground">
                Bạn chưa có giao dịch thanh toán nào
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giao dịch</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày giao dịch</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{payment.id.slice(0, 8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Đơn hàng: {payment.orderId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(payment.type)}
                        <span className="text-sm">{getTypeLabel(payment.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-semibold ${payment.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.type === 'refund' ? '+' : '-'}
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.paymentMethod}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(payment.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/orders/${payment.orderId}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredPayments.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} trong tổng số {filteredPayments.length} giao dịch
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


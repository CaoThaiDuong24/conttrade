"use client";

import { useState, useEffect } from 'react';
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Calendar,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Download,
  RefreshCw,
  Plus,
  TrendingUp,
  AlertTriangle,
  Bell,
  Settings,
  Archive,
  MoreHorizontal,
  Copy
} from 'lucide-react';
import { 
  fetchMyQuotes, 
  deleteQuote, 
  sendQuote, 
  withdrawQuote, 
  extendQuoteValidity,
  Quote,
  QuoteStats
} from '@/lib/api/quotes';
import EditQuoteModal from '@/components/quotes/edit-quote-modal';
import { toast } from 'sonner';

// Using Quote interface from API

export default function QuotesManagementPage() {
  const t = useTranslations();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [pagination, setPagination] = useState<{ total: number; total_pages: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [currentPage, statusFilter, searchTerm, sortBy, sortOrder]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMyQuotes({
        status: statusFilter,
        search: searchTerm,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });

      setQuotes(response.quotes);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Có lỗi khi tải danh sách báo giá');
    } finally {
      setIsLoading(false);
    }
  };

  // Không cần filter client-side vì API đã filter rồi
  const displayQuotes = quotes;

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { icon: Clock, label: 'Nháp', className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300' },
      sent: { icon: Send, label: 'Đã gửi', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300' },
      submitted: { icon: Send, label: 'Đã gửi', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300' },
      accepted: { icon: CheckCircle, label: 'Được chấp nhận', className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' },
      rejected: { icon: XCircle, label: 'Từ chối', className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300' },
      declined: { icon: XCircle, label: 'Từ chối', className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300' },
      expired: { icon: Clock, label: 'Hết hạn', className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300' },
    };

    const statusLower = status?.toLowerCase();
    const { icon: Icon, label, className } = config[statusLower as keyof typeof config] || config.draft;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${className}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Bạn có chắc muốn xóa báo giá này?')) return;

    try {
      await deleteQuote(quoteId);
      toast.success('Xóa báo giá thành công');
      fetchQuotes(); // Refresh list
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Có lỗi khi xóa báo giá');
    }
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      await sendQuote(quoteId);
      toast.success('Gửi báo giá thành công');
      fetchQuotes(); // Refresh list
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Có lỗi khi gửi báo giá');
    }
  };

  const handleWithdrawQuote = async (quoteId: string) => {
    if (!confirm('Bạn có chắc muốn rút lại báo giá này?')) return;

    try {
      await withdrawQuote(quoteId);
      toast.success('Rút lại báo giá thành công');
      fetchQuotes(); // Refresh list
    } catch (error) {
      console.error('Error withdrawing quote:', error);
      toast.error('Có lỗi khi rút lại báo giá');
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowEditModal(true);
  };

  const handleQuoteUpdated = (updatedQuote: Quote) => {
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    toast.success('Cập nhật báo giá thành công');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Quản lý báo giá
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả báo giá bạn đã gửi cho khách hàng
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Tổng báo giá</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats?.total || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Tất cả báo giá
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Nháp</CardTitle>
            <Edit className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats?.draft || 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Chưa gửi
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Đã gửi</CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats?.sent || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Chờ phản hồi
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Được chấp nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats?.accepted || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Thành công
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Bị từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats?.rejected || 0}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Không thành công
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Tổng giá trị</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              ${(stats?.total_value || 0).toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Doanh thu tiềm năng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo RFQ, tên người mua..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="draft">📝 Nháp</SelectItem>
                  <SelectItem value="sent">📤 Đã gửi</SelectItem>
                  <SelectItem value="accepted">✅ Được chấp nhận</SelectItem>
                  <SelectItem value="rejected">❌ Bị từ chối</SelectItem>
                  <SelectItem value="expired">⏰ Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchQuotes} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>

              <Button asChild>
                <Link href="/rfq/received">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo báo giá mới
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách báo giá</CardTitle>
            <CardDescription>
              {isLoading ? 'Đang tải...' : pagination ? `${pagination.total} báo giá được tìm thấy` : `${displayQuotes.length} báo giá được tìm thấy`}
            </CardDescription>
          </div>
          
          {displayQuotes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sắp xếp theo:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Ngày tạo</SelectItem>
                  <SelectItem value="valid_until">Hiệu lực</SelectItem>
                  <SelectItem value="total_amount">Giá trị</SelectItem>
                  <SelectItem value="status">Trạng thái</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy báo giá' : 'Chưa có báo giá nào'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Bạn chưa tạo báo giá nào. Hãy xem RFQ nhận được để tạo báo giá mới.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                {(searchTerm || statusFilter !== 'all') && (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}>
                    Xóa bộ lọc
                  </Button>
                )}
                <Button asChild>
                  <Link href="/rfq/received">
                    <Plus className="h-4 w-4 mr-2" />
                    Xem RFQ nhận được
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('rfq_title')}
                          className="h-auto p-0 font-semibold"
                        >
                          RFQ & Người mua
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('total_amount')}
                          className="h-auto p-0 font-semibold"
                        >
                          Giá trị báo giá
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="h-auto p-0 font-semibold"
                        >
                          Trạng thái
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('valid_until')}
                          className="h-auto p-0 font-semibold"
                        >
                          Hiệu lực đến
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('created_at')}
                          className="h-auto p-0 font-semibold"
                        >
                          Ngày tạo
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[200px]">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayQuotes.map((quote) => (
                      <TableRow key={quote.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{quote.rfq_title}</div>
                            <div className="text-sm text-muted-foreground">
                              👤 {quote.buyer_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {quote.items_count} loại container
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(quote.total_amount, quote.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {quote.currency}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {new Date(quote.valid_until).toLocaleDateString('vi-VN')}
                          </div>
                          {new Date(quote.valid_until) < new Date() && quote.status === 'sent' && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Hết hạn
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(quote.created_at).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/rfq/${quote.rfq_id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            
                            {quote.status === 'draft' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditQuote(quote)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSendQuote(quote.id)}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelete(quote.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            
                            {quote.status === 'sent' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleWithdrawQuote(quote.id)}
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {(quote.status === 'accepted' || quote.status === 'rejected' || 
                              quote.status === 'ACCEPTED' || quote.status === 'REJECTED' ||
                              quote.status === 'declined') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(quote.id);
                                  toast.success('Đã copy ID báo giá');
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} trong tổng số {pagination?.total || 0} báo giá
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {pagination && Array.from({ length: Math.min(pagination.total_pages, 7) }, (_, i) => {
                        const pageNum = i + 1;
                        const totalPages = pagination.total_pages;
                        if (totalPages <= 7) return pageNum;
                        if (pageNum <= 2 || pageNum > totalPages - 2 || Math.abs(pageNum - currentPage) <= 1) return pageNum;
                        if (pageNum === 3 && currentPage > 4) return '...';
                        if (pageNum === totalPages - 2 && currentPage < totalPages - 3) return '...';
                        return null;
                      }).filter(Boolean).map((page, idx) => (
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                          >
                            {page}
                          </Button>
                        )
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination || currentPage >= pagination.total_pages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Success Rate & Performance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Hiệu suất báo giá
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Tỷ lệ chốt đơn:</span>
                    <span className="font-semibold text-green-600">
                      {stats?.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Tỷ lệ từ chối:</span>
                    <span className="font-semibold text-red-500">
                      {stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Giá trị trung bình:</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      ${stats?.total ? Math.round((stats.total_value || 0) / stats.total).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Lời khuyên cho Seller
                </h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Phản hồi RFQ trong vòng 24 giờ để tăng cơ hội</li>
                  <li>• Cung cấp giá cạnh tranh và điều kiện linh hoạt</li>
                  <li>• Thêm ghi chú chi tiết về chất lượng container</li>
                  <li>• Theo dõi thông báo về trạng thái báo giá</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
                Hành động nhanh
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" asChild className="h-auto py-3 px-4 flex flex-col gap-2">
                  <Link href="/rfq/received">
                    <Bell className="h-5 w-5" />
                    <span className="text-xs">RFQ mới</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-3 px-4 flex flex-col gap-2">
                  <Link href="/quotes/templates">
                    <Copy className="h-5 w-5" />
                    <span className="text-xs">Templates</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col gap-2">
                  <Download className="h-5 w-5" />
                  <span className="text-xs">Xuất báo cáo</span>
                </Button>
                <Button variant="outline" asChild className="h-auto py-3 px-4 flex flex-col gap-2">
                  <Link href="/analytics">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Phân tích</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Quote Modal */}
      <EditQuoteModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuote(null);
        }}
        quote={editingQuote}
        onQuoteUpdated={handleQuoteUpdated}
      />
    </div>
  );
}


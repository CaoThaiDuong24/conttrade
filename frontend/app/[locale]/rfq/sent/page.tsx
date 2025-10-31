"use client";

import { useState, useEffect } from 'react';
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Search,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface RFQ {
  id: string;
  listing_id: string;
  buyer_id: string;
  purpose: string;
  quantity: number;
  need_by: string | null;
  services_json: any;
  status: string;
  submitted_at: string;
  expired_at: string;
  created_at: string;
  updated_at: string;
  listings?: {
    id: string;
    title: string;
    price_amount: string;
    price_currency: string;
    containers?: {
      type: string;
      size_ft: number;
    };
  };
  quotes?: {
    id: string;
    status: string;
    total: string;
    currency: string;
    created_at: string;
  }[];
}

export default function RFQSentPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
  const t = useTranslations();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper function to get token from cookies
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchRFQs = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      console.log('Fetching RFQs from:', `${API_URL}/api/v1/rfqs?view=sent`);
      
      const response = await fetch(`${API_URL}/api/v1/rfqs?view=sent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('RFQs response:', result);
        // Backend returns: { success: true, data: [...rfqs] }
        const rfqsData = Array.isArray(result.data) ? result.data : [];
        console.log('RFQs count:', rfqsData.length);
        console.log('First RFQ structure:', rfqsData[0]);
        setRfqs(rfqsData);
      } else {
        const error = await response.json();
        console.error('Failed to fetch RFQs:', error);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const listingTitle = rfq.listings?.title || '';
    const searchLower = searchTerm.toLowerCase();
    return listingTitle.toLowerCase().includes(searchLower) ||
           rfq.purpose.toLowerCase().includes(searchLower);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRFQs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRFQs = filteredRFQs.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    
    // Database RFQStatus enum: DRAFT, SUBMITTED, QUOTED, ACCEPTED, REJECTED, EXPIRED
    const config = {
      DRAFT: { 
        variant: 'secondary' as const, 
        icon: FileText, 
        label: 'Nháp',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
      },
      SUBMITTED: { 
        variant: 'default' as const, 
        icon: Send, 
        label: 'Đã gửi',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      },
      QUOTED: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: 'Đã có báo giá',
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
      },
      ACCEPTED: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: 'Đã chấp nhận',
        className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
      },
      REJECTED: { 
        variant: 'destructive' as const, 
        icon: XCircle, 
        label: 'Đã từ chối',
        className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300'
      },
      EXPIRED: { 
        variant: 'destructive' as const, 
        icon: XCircle, 
        label: 'Hết hạn',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
      },
    };

    const { variant, icon: Icon, label, className } = config[statusUpper as keyof typeof config] || {
      variant: 'secondary' as const,
      icon: AlertCircle,
      label: status,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    };

    return (
      <Badge variant={variant} className={`flex items-center gap-1 w-fit ${className}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPurposeLabel = (purpose: string) => {
    const purposeUpper = purpose.toUpperCase();
    switch (purposeUpper) {
      case 'PURCHASE':
      case 'SALE':
        return 'Mua';
      case 'RENTAL':
      case 'RENT':
        return 'Thuê';
      case 'INQUIRY':
        return 'Hỏi thông tin';
      default:
        return purpose;
    }
  };

  const formatServices = (servicesJson: any) => {
    if (!servicesJson || typeof servicesJson !== 'object') return [];
    const services = [];
    if (servicesJson.inspection) services.push('Kiểm định');
    if (servicesJson.repair_estimate) services.push('Báo giá sửa chữa');
    if (servicesJson.certification) services.push('Chứng nhận');
    if (servicesJson.delivery_estimate) services.push('Vận chuyển');
    return services;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="h-8 w-8 text-primary" />
            RFQ đã gửi
          </h1>
          <p className="text-muted-foreground mt-1">
            Danh sách các yêu cầu báo giá bạn đã gửi đi
          </p>
        </div>
        <Button asChild>
          <Link href="/rfq/create">
            <Plus className="h-4 w-4 mr-2" />
            Tạo RFQ mới
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng RFQ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => r.status.toUpperCase() === 'SUBMITTED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã có báo giá</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => (r.quotes?.length || 0) > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hạn</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => new Date(r.expired_at) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm RFQ theo tiêu đề, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* RFQ List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách RFQ đã gửi</CardTitle>
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${filteredRFQs.length} RFQ được tìm thấy`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRFQs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có RFQ nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Bạn chưa gửi yêu cầu báo giá nào
              </p>
              <Button asChild>
                <Link href="/rfq/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo RFQ đầu tiên
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yêu cầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Báo giá</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRFQs.map((rfq) => {
                  const isExpired = new Date(rfq.expired_at) < new Date();
                  const services = formatServices(rfq.services_json);
                  
                  return (
                    <TableRow key={rfq.id} className={isExpired ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {rfq.listings?.title || 'Container'}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="outline" className="font-normal">
                              {getPurposeLabel(rfq.purpose)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                SL: {rfq.quantity}
                              </span>
                            </div>
                            {rfq.listings?.containers && (
                              <span className="text-muted-foreground">
                                {rfq.listings.containers.type} - {rfq.listings.containers.size_ft}ft
                              </span>
                            )}
                          </div>
                          {services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {services.map((service, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {rfq.need_by && (
                            <div className="text-xs text-muted-foreground">
                              Cần trước: {new Date(rfq.need_by).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(rfq.quotes?.length || 0) > 0 ? (
                            <>
                              <Badge variant="default" className="w-fit">
                                {rfq.quotes?.length} báo giá
                              </Badge>
                              {rfq.quotes && rfq.quotes.length > 0 && rfq.quotes[0].total && (
                                <span className="text-xs text-muted-foreground">
                                  Từ {new Intl.NumberFormat('vi-VN').format(parseFloat(rfq.quotes[0].total))} {rfq.quotes[0].currency}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Chưa có</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(rfq.submitted_at).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={isExpired ? 'text-red-500 font-medium' : ''}>
                            {new Date(rfq.expired_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/rfq/${rfq.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredRFQs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRFQs.length)} trong tổng số {filteredRFQs.length} RFQ
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


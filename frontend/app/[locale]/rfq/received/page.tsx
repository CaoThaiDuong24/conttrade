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
  Inbox, 
  Search,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  Package,
  User,
  Send
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: 'SUBMITTED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
  expiresAt: string;
  totalItems: number;
  myQuoteStatus?: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'PENDING';
  // Real backend fields
  purpose?: 'PURCHASE' | 'RENTAL' | 'INQUIRY';
  needBy?: string;
  currency?: string;
  services?: {
    inspection?: boolean;
    certification?: boolean;
    repair_estimate?: boolean;
    delivery_estimate?: boolean;
  };
}

export default function RFQReceivedPage() {
  const t = useTranslations();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      setIsLoading(true);
      // Get token from cookies OR localStorage for testing
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const token = getCookie('accessToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');

      if (!token) {
        console.error('No access token found in cookies or localStorage');
        setIsLoading(false);
        return;
      }

      // Fallback for API URL if env not set
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

      const response = await fetch(`${apiUrl}/api/v1/rfqs?view=received`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('RFQ API Response Status:', response.status);
      console.log('RFQ API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('RFQ API Response:', data); // Debug log
        console.log('RFQ Count:', data.data?.length || 0); // Debug count

        // Map API response to frontend interface using real data structure (snake_case fields)
        const mappedRfqs = (data.data || []).map((rfq: any) => {
          // Determine quote status based on quotes array
          let myQuoteStatus: string | undefined = undefined;
          if (rfq.quotes && rfq.quotes.length > 0) {
            const latestQuote = rfq.quotes[rfq.quotes.length - 1];
            myQuoteStatus = latestQuote.status?.toUpperCase(); // Normalize to uppercase
          }

          // Translate purpose to Vietnamese
          const purposeText = rfq.purpose === 'PURCHASE' ? 'Mua' : 
                             rfq.purpose === 'RENTAL' ? 'Thuê' : 
                             rfq.purpose === 'INQUIRY' ? 'Hỏi' : 'Không rõ';

          // Create description from available data (using snake_case fields)
          const descriptionParts = [];
          if (rfq.purpose) {
            descriptionParts.push(`Mục đích: ${purposeText}`);
          }
          if (rfq.need_by) {
            descriptionParts.push(`Cần trước: ${new Date(rfq.need_by).toLocaleDateString('vi-VN')}`);
          }
          if (rfq.services_json?.inspection) {
            descriptionParts.push('✓ Kiểm tra');
          }
          if (rfq.services_json?.certification) {
            descriptionParts.push('✓ Chứng nhận');
          }
          if (rfq.services_json?.repair_estimate) {
            descriptionParts.push('✓ Báo giá sửa chữa');
          }
          if (rfq.services_json?.delivery_estimate) {
            descriptionParts.push('✓ Báo giá vận chuyển');
          }
          
          const description = descriptionParts.length > 0 
            ? descriptionParts.join(' • ') 
            : 'Không có mô tả chi tiết';

          return {
            id: rfq.id,
            title: rfq.listings?.title || `RFQ #${rfq.id.slice(-8)}`,
            description: description,
            status: rfq.status, // Use backend status directly: SUBMITTED, QUOTED, ACCEPTED, REJECTED
            buyerName: rfq.users?.display_name || rfq.users?.email || 'Người mua không rõ',
            buyerEmail: rfq.users?.email || '',
            createdAt: rfq.submitted_at,
            expiresAt: rfq.expired_at || rfq.submitted_at,
            totalItems: rfq.quantity || 1,
            myQuoteStatus: myQuoteStatus,
            // Additional data for better display
            purpose: rfq.purpose,
            needBy: rfq.need_by,
            currency: rfq.currency || 'VND',
            services: rfq.services_json || {}
          };
        });

        console.log('Mapped RFQs:', mappedRfqs); // Debug mapped data
        setRfqs(mappedRfqs);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch RFQs:', response.status);
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRFQs = rfqs.filter(rfq =>
    rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRFQs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRFQs = filteredRFQs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    const config = {
      SUBMITTED: { variant: 'secondary' as const, icon: Clock, label: 'Mới', color: 'bg-blue-100 text-blue-800' },
      QUOTED: { variant: 'default' as const, icon: Send, label: 'Đã báo giá', color: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { variant: 'default' as const, icon: CheckCircle, label: 'Được chấp nhận', color: 'bg-green-100 text-green-800' },
      REJECTED: { variant: 'destructive' as const, icon: Clock, label: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
      EXPIRED: { variant: 'outline' as const, icon: Clock, label: 'Hết hạn', color: 'bg-gray-100 text-gray-800' },
    };

    const { variant, icon: Icon, label, color } = config[status as keyof typeof config] || config.SUBMITTED;

    return (
      <Badge variant={variant} className={`flex items-center gap-1 w-fit ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getQuoteStatusBadge = (status?: string) => {
    if (!status) return <span className="text-sm text-muted-foreground italic">Chưa báo giá</span>;
    
    const config = {
      SENT: { variant: 'default' as const, label: 'Đã gửi', color: 'bg-blue-100 text-blue-800' },
      PENDING: { variant: 'default' as const, label: 'Chờ phản hồi', color: 'bg-yellow-100 text-yellow-800' },
      ACCEPTED: { variant: 'default' as const, label: '✓ Được chấp nhận', color: 'bg-green-100 text-green-800' },
      REJECTED: { variant: 'destructive' as const, label: '✗ Bị từ chối', color: 'bg-red-100 text-red-800' },
    };

    const { variant, label, color } = config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, color: '' };

    return (
      <Badge variant={variant} className={color}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Inbox className="h-8 w-8 text-primary" />
            </div>
            RFQ nhận được
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            📬 Các yêu cầu báo giá từ người mua - Quản lý và phản hồi RFQs
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Tổng số RFQ</div>
          <div className="text-3xl font-bold text-primary">{rfqs.length}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng RFQ</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RFQ mới</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => r.status === 'SUBMITTED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chưa báo giá</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã báo giá</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => r.status === 'QUOTED' || r.myQuoteStatus).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Có quote</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Được chấp nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfqs.filter(r => r.status === 'ACCEPTED' || r.myQuoteStatus === 'ACCEPTED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quote win</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, tên người mua..."
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
          <CardTitle>Danh sách RFQ nhận được</CardTitle>
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
              <Inbox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chưa có RFQ nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có yêu cầu báo giá nào được gửi đến bạn
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Yêu cầu & Chi tiết</TableHead>
                    <TableHead className="font-semibold">Người mua</TableHead>
                    <TableHead className="font-semibold">Trạng thái RFQ</TableHead>
                    <TableHead className="font-semibold">Báo giá của tôi</TableHead>
                    <TableHead className="font-semibold">Ngày nhận</TableHead>
                    <TableHead className="w-[200px] font-semibold text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {paginatedRFQs.map((rfq) => (
                  <TableRow key={rfq.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rfq.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {rfq.description.length > 80 ? rfq.description.substring(0, 80) + '...' : rfq.description}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package className="h-3 w-3" />
                            <span className="font-medium">SL: {rfq.totalItems}</span>
                          </div>
                          {rfq.purpose && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              rfq.purpose === 'PURCHASE' ? 'bg-blue-100 text-blue-800' : 
                              rfq.purpose === 'RENTAL' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rfq.purpose === 'PURCHASE' ? '🛒 Mua' : 
                               rfq.purpose === 'RENTAL' ? '📦 Thuê' : 
                               '❓ Hỏi'}
                            </span>
                          )}
                          {rfq.needBy && (
                            <span className="text-orange-600 font-medium">
                              ⏰ {new Date(rfq.needBy).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{rfq.buyerName}</div>
                          <div className="text-xs text-muted-foreground">{rfq.buyerEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell>{getQuoteStatusBadge(rfq.myQuoteStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(rfq.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/rfq/${rfq.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </Link>
                        </Button>
                        {!rfq.myQuoteStatus && rfq.status === 'SUBMITTED' && (
                          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                            <Link href={`/quotes/create?rfqId=${rfq.id}`}>
                              <Plus className="h-4 w-4 mr-2" />
                              Báo giá
                            </Link>
                          </Button>
                        )}
                        {rfq.myQuoteStatus && (
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/quotes/management`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem báo giá
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredRFQs.length)}</span> trong tổng số <span className="font-semibold">{filteredRFQs.length}</span> RFQ
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pageNum = i + 1;
                      if (totalPages <= 7) return pageNum;
                      if (pageNum <= 2 || pageNum > totalPages - 2 || Math.abs(pageNum - currentPage) <= 1) return pageNum;
                      if (pageNum === 3 && currentPage > 4) return '...';
                      if (pageNum === totalPages - 2 && currentPage < totalPages - 3) return '...';
                      return null;
                    }).filter(Boolean).map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2">...</span>
                      ) : (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum as number)}
                          className="min-w-[2.5rem]"
                        >
                          {pageNum}
                        </Button>
                      )
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Box,
  MapPin,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import { getSizeLabel } from '@/lib/utils/containerSize';
import { getTypeLabel } from '@/lib/utils/containerType';
import { getConditionLabel } from '@/lib/utils/condition';
import { getStandardLabel } from '@/lib/utils/qualityStandard';

interface Container {
  id: string;
  containerId: string;
  listingId: string;
  listingTitle: string;
  size: string;
  type: string;
  condition: string;
  standard: string;
  depot: string;
  depotProvince: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AdminContainersListPage() {
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [filteredContainers, setFilteredContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  useEffect(() => {
    fetchContainers();
  }, []);

  useEffect(() => {
    filterContainers();
  }, [searchQuery, statusFilter, sizeFilter, containers]);

  const fetchContainers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = '/api/v1';

      const response = await fetch(`${apiUrl}/admin/containers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const containerData = data.data.containers || [];
        
        const mappedContainers: Container[] = containerData.map((c: any) => ({
          id: c.id,
          containerId: c.container_id,
          listingId: c.listing_id,
          listingTitle: c.listings?.title || 'N/A',
          size: c.size || '',
          type: c.type || '',
          condition: c.condition || '',
          standard: c.standard || '',
          depot: c.listings?.depots?.name || 'N/A',
          depotProvince: c.listings?.depots?.province || '',
          price: parseFloat(c.listings?.price_amount || 0),
          currency: c.listings?.price_currency || 'VND',
          status: c.status || 'available',
          createdAt: new Date(c.created_at).toLocaleDateString('vi-VN')
        }));

        setContainers(mappedContainers);
        setFilteredContainers(mappedContainers);
      } else {
        toast.error('Lỗi tải dữ liệu', {
          description: 'Không thể tải danh sách container.'
        });
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến máy chủ.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContainers = () => {
    let filtered = [...containers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.containerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.depot.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Size filter
    if (sizeFilter && sizeFilter !== 'all') {
      filtered = filtered.filter(c => c.size === sizeFilter);
    }

    setFilteredContainers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      available: { label: 'Có sẵn', className: 'bg-green-50 text-green-700 border-green-300' },
      reserved: { label: 'Đã đặt', className: 'bg-amber-50 text-amber-700 border-amber-300' },
      sold: { label: 'Đã bán', className: 'bg-slate-50 text-slate-700 border-slate-300' },
      rented: { label: 'Đang thuê', className: 'bg-blue-50 text-blue-700 border-blue-300' },
      maintenance: { label: 'Bảo trì', className: 'bg-orange-50 text-orange-700 border-orange-300' }
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs border font-semibold`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4 mx-auto" />
          <p className="text-slate-600 font-medium text-lg">Đang tải danh sách container...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-y-auto">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/listings')}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại quản lý listings
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Box className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Danh sách Container</h1>
                  <p className="text-sm text-slate-500">Quản lý tất cả container trong hệ thống</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{filteredContainers.length}</div>
              <div className="text-sm text-slate-500">Container</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-blue-600" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo ID container, tiêu đề, depot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="reserved">Đã đặt</SelectItem>
                    <SelectItem value="sold">Đã bán</SelectItem>
                    <SelectItem value="rented">Đang thuê</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kích thước" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả kích thước</SelectItem>
                    <SelectItem value="20">20 ft</SelectItem>
                    <SelectItem value="40">40 ft</SelectItem>
                    <SelectItem value="40hc">40 HC</SelectItem>
                    <SelectItem value="45">45 ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Containers Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Danh sách ({filteredContainers.length})
            </CardTitle>
            <CardDescription>
              Hiển thị {filteredContainers.length} / {containers.length} container
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredContainers.length === 0 ? (
              <div className="text-center py-12">
                <Box className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Không tìm thấy container nào</p>
                <p className="text-slate-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">Container ID</TableHead>
                      <TableHead className="font-bold">Listing</TableHead>
                      <TableHead className="font-bold">Thông tin</TableHead>
                      <TableHead className="font-bold">Vị trí</TableHead>
                      <TableHead className="font-bold">Giá</TableHead>
                      <TableHead className="font-bold">Trạng thái</TableHead>
                      <TableHead className="font-bold">Ngày tạo</TableHead>
                      <TableHead className="font-bold text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContainers.map((container) => (
                      <TableRow key={container.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono font-bold text-blue-600">
                          {container.containerId}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-semibold text-slate-900 truncate">
                              {container.listingTitle}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              ID: {container.listingId.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                                {getSizeLabel(container.size)}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-600">
                              {getTypeLabel(container.type)} • {getConditionLabel(container.condition)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-slate-900">{container.depot}</div>
                              {container.depotProvince && (
                                <div className="text-xs text-slate-500">{container.depotProvince}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-green-700 font-bold">
                            <DollarSign className="h-3 w-3" />
                            <span>{new Intl.NumberFormat('vi-VN').format(container.price)}</span>
                          </div>
                          <div className="text-xs text-slate-500">{container.currency}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(container.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{container.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/listings/containers/${container.id}`)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

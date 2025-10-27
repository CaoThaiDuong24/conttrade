'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Search,
  Plus,
  MapPin,
  Calendar,
  Eye,
  TrendingUp,
  PackageCheck,
  PackageX
} from "lucide-react";
import { Link } from "@/i18n/routing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

interface DeliveryItem {
  id: string;
  order_id: string;
  status: string;
  tracking_number?: string;
  delivery_address?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
  orders?: {
    order_number: string;
    buyer?: {
      display_name: string;
    };
    seller?: {
      display_name: string;
    };
  };
}

interface DeliveryStats {
  total: number;
  preparing: number;
  inTransit: number;
  delivered: number;
  issues: number;
}

export default function DeliveryPage() {
  const t = useTranslations("common");
  const { user } = useAuth();
  
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    preparing: 0,
    inTransit: 0,
    delivered: 0,
    issues: 0
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchQuery, activeTab, deliveries]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/deliveries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDeliveries(result.data.deliveries || []);
          calculateStats(result.data.deliveries || []);
        }
      } else {
        console.error('Failed to fetch deliveries:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deliveryList: DeliveryItem[]) => {
    const stats = {
      total: deliveryList.length,
      preparing: deliveryList.filter(d => 
        ['pending', 'preparing_delivery', 'ready_for_pickup', 'scheduled'].includes(d.status.toLowerCase())
      ).length,
      inTransit: deliveryList.filter(d => 
        ['transportation_booked', 'in_transit', 'delivering'].includes(d.status.toLowerCase())
      ).length,
      delivered: deliveryList.filter(d => 
        ['delivered', 'completed'].includes(d.status.toLowerCase())
      ).length,
      issues: deliveryList.filter(d => 
        ['disputed', 'cancelled', 'failed'].includes(d.status.toLowerCase())
      ).length
    };
    setStats(stats);
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.orders?.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      const statusMap: Record<string, string[]> = {
        preparing: ['pending', 'preparing_delivery', 'ready_for_pickup', 'scheduled'],
        transit: ['transportation_booked', 'in_transit', 'delivering'],
        delivered: ['delivered', 'completed'],
        issues: ['disputed', 'cancelled', 'failed']
      };
      filtered = filtered.filter(d => statusMap[activeTab]?.includes(d.status.toLowerCase()));
    }

    setFilteredDeliveries(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: 'Chờ xử lý', variant: 'secondary', icon: Clock },
      preparing_delivery: { label: 'Đang chuẩn bị', variant: 'secondary', icon: Package },
      ready_for_pickup: { label: 'Sẵn sàng lấy hàng', variant: 'default', icon: PackageCheck },
      transportation_booked: { label: 'Đã đặt vận chuyển', variant: 'default', icon: Calendar },
      in_transit: { label: 'Đang vận chuyển', variant: 'secondary', icon: Truck },
      delivering: { label: 'Đang giao hàng', variant: 'secondary', icon: Truck },
      delivered: { label: 'Đã giao hàng', variant: 'default', icon: CheckCircle2 },
      completed: { label: 'Hoàn thành', variant: 'default', icon: CheckCircle2 },
      disputed: { label: 'Tranh chấp', variant: 'destructive', icon: AlertTriangle },
      cancelled: { label: 'Đã hủy', variant: 'destructive', icon: PackageX },
      failed: { label: 'Thất bại', variant: 'destructive', icon: AlertTriangle },
      scheduled: { label: 'Đã lên lịch', variant: 'default', icon: Calendar }
    };

    // Convert status to lowercase for matching
    const normalizedStatus = status.toLowerCase();
    const config = statusConfig[normalizedStatus] || { label: 'Chưa xác định', variant: 'outline', icon: Package };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5 w-fit px-3 py-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-medium">{config.label}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Quản lý vận chuyển
          </h1>
          <p className="text-muted-foreground mt-1">Theo dõi và quản lý tiến trình vận chuyển container</p>
        </div>
        <div className="flex gap-2">
          <Link href="/delivery/request">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Yêu cầu vận chuyển
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Tổng số đơn</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">Tất cả vận chuyển</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Đang chuẩn bị</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{stats.preparing}</p>
                <p className="text-xs text-orange-600 mt-1">Chưa giao hàng</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Đang vận chuyển</p>
                <p className="text-3xl font-bold text-teal-900 mt-2">{stats.inTransit}</p>
                <p className="text-xs text-teal-600 mt-1">Trên đường giao</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Đã giao hàng</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.delivered}</p>
                <p className="text-xs text-green-600 mt-1">Hoàn thành</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span>Danh sách vận chuyển</span>
              </CardTitle>
              <CardDescription className="mt-1 ml-12">
                Theo dõi tất cả các đơn vận chuyển của bạn
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Tìm mã đơn, mã tracking, địa chỉ..." 
                  className="pl-10 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 bg-gray-100 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Tất cả ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Chuẩn bị ({stats.preparing})
              </TabsTrigger>
              <TabsTrigger value="transit" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Vận chuyển ({stats.inTransit})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Đã giao ({stats.delivered})
              </TabsTrigger>
              <TabsTrigger value="issues" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Vấn đề ({stats.issues})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : filteredDeliveries.length > 0 ? (
                <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <TableRow>
                        <TableHead className="font-bold text-gray-700">Mã vận chuyển</TableHead>
                        <TableHead className="font-bold text-gray-700">Đơn hàng</TableHead>
                        <TableHead className="font-bold text-gray-700">Mã Tracking</TableHead>
                        <TableHead className="font-bold text-gray-700">Địa chỉ giao hàng</TableHead>
                        <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                        <TableHead className="font-bold text-gray-700">Cập nhật</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeliveries.map((delivery, index) => (
                        <TableRow 
                          key={delivery.id} 
                          className={`hover:bg-teal-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center">
                                <Package className="h-4 w-4 text-teal-600" />
                              </div>
                              <span className="font-semibold">{delivery.id.slice(0, 8)}...</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{delivery.orders?.order_number || 'Không rõ'}</span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                {delivery.orders?.seller?.display_name || 'Chưa xác định'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {delivery.tracking_number ? (
                              <code className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md font-semibold border border-blue-200">
                                {delivery.tracking_number}
                              </code>
                            ) : (
                              <span className="text-gray-400 text-sm italic">Chưa có</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm line-clamp-2 leading-tight">
                                {delivery.delivery_address || 'Chưa cập nhật'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {formatDate(delivery.updated_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/delivery/track/${delivery.id}`}>
                              <Button size="sm" variant="ghost" className="hover:bg-teal-50 hover:text-teal-700 shadow-sm">
                                <Eye className="h-4 w-4 mr-1.5" />
                                Xem chi tiết
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Truck className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có đơn vận chuyển'}
                    </h3>
                    <p className="text-gray-600 text-center max-w-md mb-6">
                      {searchQuery 
                        ? 'Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại mã đơn hàng'
                        : 'Bạn chưa có đơn vận chuyển nào. Tạo yêu cầu vận chuyển mới để bắt đầu.'
                      }
                    </p>
                    {!searchQuery && (
                      <Link href="/delivery/request">
                        <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md">
                          <Plus className="h-4 w-4 mr-2" />
                          Yêu cầu vận chuyển
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


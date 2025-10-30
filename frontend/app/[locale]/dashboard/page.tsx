'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Activity,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  listings: {
    total: number;
    active: number;
    pending: number;
  };
  rfqs: {
    sent: number;
    received: number;
    pending: number;
  };
  orders: {
    asBuyer: number;
    asSeller: number;
    pendingPayment: number;
    processing: number;
    completed: number;
  };
  deliveries: {
    total: number;
    inTransit: number;
    delivered: number;
  };
  recentActivities: {
    listings: Array<{
      id: string;
      title: string;
      status: string;
      created_at: string;
    }>;
    rfqs: Array<{
      id: string;
      status: string;
      created_at: string;
      listings: { title: string } | null;
    }>;
    orders: Array<{
      id: string;
      order_number: string;
      status: string;
      created_at: string;
      buyer_id: string;
    }>;
  };
}

export default function DashboardPage() {
  const t = useTranslations();
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for permission denied error
  useEffect(() => {
    const error = searchParams.get('error');
    const required = searchParams.get('required');
    const path = searchParams.get('path');

    if (error === 'permission_denied') {
      const permissionNames: Record<string, string> = {
        'PM-010': 'Tạo tin đăng bán',
        'PM-011': 'Sửa tin đăng',
        'PM-070': 'Duyệt tin đăng (Admin)',
        'admin.access': 'Truy cập trang quản trị',
        'admin.users': 'Quản lý người dùng',
        'depot.read': 'Xem thông tin depot',
        'depot.write': 'Quản lý depot',
        'inspection.write': 'Tạo báo cáo kiểm định',
        'billing.read': 'Xem thông tin thanh toán',
      };

      const permissionName = required ? permissionNames[required] || required : 'không xác định';
      const pathName = path || 'trang này';

      toast({
        title: "Không có quyền truy cập",
        description: `Bạn không có quyền "${permissionName}" để truy cập ${pathName}. Vui lòng liên hệ quản trị viên để được cấp quyền.`,
        variant: "destructive",
        duration: 8000,
      });

      // Clean URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('required');
      cleanUrl.searchParams.delete('path');
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      console.log('📊 Dashboard: Starting fetch...', { hasToken: !!token, token: token?.substring(0, 20) });
      
      if (!token) {
        console.log('⚠️ Dashboard: No token available');
        setLoading(false);
        return;
      }

      try {
        console.log('📡 Dashboard: Fetching from API...');
        const response = await fetch('http://localhost:3006/api/v1/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Dashboard: Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Dashboard: Data received:', data);
          setStats(data.data);
        } else {
          const errorText = await response.text();
          console.error('❌ Dashboard: Failed to fetch:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error:', error);
      } finally {
        console.log('📊 Dashboard: Fetch complete, loading = false');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const displayStats = [
    {
      title: 'Tin đăng của tôi',
      value: stats?.listings?.total?.toString() || '0',
      change: (stats?.listings?.active || 0) > 0 ? `${stats?.listings?.active} hoạt động` : 'Chưa có',
      changeType: 'neutral',
      icon: Package,
      description: (stats?.listings?.pending || 0) > 0 ? `${stats?.listings?.pending} chờ duyệt` : 'Tin đang hoạt động'
    },
    {
      title: 'RFQ đã gửi',
      value: stats?.rfqs?.sent?.toString() || '0',
      change: (stats?.rfqs?.received || 0) > 0 ? `${stats?.rfqs?.received} nhận được` : '',
      changeType: (stats?.rfqs?.pending || 0) > 0 ? 'warning' : 'neutral',
      icon: FileText,
      description: (stats?.rfqs?.pending || 0) > 0 ? `${stats?.rfqs?.pending} chờ phản hồi` : 'Yêu cầu báo giá'
    },
    {
      title: 'Đơn hàng',
      value: stats?.orders?.asBuyer?.toString() || '0',
      change: (stats?.orders?.asSeller || 0) > 0 ? `${stats?.orders?.asSeller} bán` : '',
      changeType: 'neutral',
      icon: ShoppingCart,
      description: (stats?.orders?.processing || 0) > 0 ? `${stats?.orders?.processing} đang xử lý` : (stats?.orders?.pendingPayment || 0) > 0 ? `${stats?.orders?.pendingPayment} chờ thanh toán` : 'Đơn hàng của bạn'
    },
    {
      title: 'Vận chuyển',
      value: stats?.deliveries?.total?.toString() || '0',
      change: (stats?.deliveries?.inTransit || 0) > 0 ? `${stats?.deliveries?.inTransit} đang giao` : '',
      changeType: (stats?.deliveries?.inTransit || 0) > 0 ? 'positive' : 'neutral',
      icon: Truck,
      description: (stats?.deliveries?.delivered || 0) > 0 ? `${stats?.deliveries?.delivered} đã giao` : 'Trạng thái vận chuyển'
    }
  ];

  // Format recent activities
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const statusTranslation: Record<string, string> = {
    'ACTIVE': 'Hoạt động',
    'PENDING_REVIEW': 'Chờ duyệt',
    'DRAFT': 'Nháp',
    'SUBMITTED': 'Đã gửi',
    'QUOTED': 'Đã báo giá',
    'ACCEPTED': 'Đã chấp nhận',
    'PENDING_PAYMENT': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'PROCESSING': 'Đang xử lý',
    'PREPARING_DELIVERY': 'Chuẩn bị giao hàng',
    'COMPLETED': 'Hoàn thành',
    'DELIVERED': 'Đã giao hàng'
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (['COMPLETED', 'DELIVERED', 'ACCEPTED', 'ACTIVE'].includes(status)) return 'default';
    if (['PENDING_REVIEW', 'SUBMITTED', 'PROCESSING', 'PREPARING_DELIVERY'].includes(status)) return 'secondary';
    return 'outline';
  };

  const recentActivities = [
    ...(stats?.recentActivities.listings || []).map(listing => ({
      type: 'listing',
      title: listing.title,
      time: formatTimeAgo(listing.created_at),
      status: listing.status,
      icon: Package
    })),
    ...(stats?.recentActivities.rfqs || []).map(rfq => ({
      type: 'rfq',
      title: rfq.listings?.title ? `RFQ cho ${rfq.listings.title}` : 'RFQ mới',
      time: formatTimeAgo(rfq.created_at),
      status: rfq.status,
      icon: FileText
    })),
    ...(stats?.recentActivities.orders || []).map(order => ({
      type: 'order',
      title: `Đơn hàng #${order.order_number}`,
      time: formatTimeAgo(order.created_at),
      status: order.status,
      icon: ShoppingCart
    }))
  ].sort((a, b) => {
    // Sort by time - most recent first
    return 0; // Already sorted by created_at desc from API
  }).slice(0, 5);

  // Quick actions - filter based on permissions
  const allQuickActions = [
    {
      title: 'Đăng tin mới',
      description: 'Tạo tin đăng container',
      icon: Plus,
      href: '/sell/new',
      color: 'bg-blue-500',
      permission: 'PM-010' // CREATE_LISTING - Chỉ cho seller/admin
    },
    {
      title: 'Tạo RFQ',
      description: 'Yêu cầu báo giá',
      icon: FileText,
      href: '/rfq/create',
      color: 'bg-green-500',
      permission: 'rfq.write'
    },
    {
      title: 'Yêu cầu vận chuyển',
      description: 'Đặt dịch vụ giao hàng',
      icon: Truck,
      href: '/delivery/request',
      color: 'bg-orange-500',
      permission: 'delivery.read'
    },
    {
      title: 'Xem đánh giá',
      description: 'Quản lý đánh giá',
      icon: Star,
      href: '/reviews',
      color: 'bg-yellow-500',
      permission: 'reviews.read'
    }
  ];

  // Filter actions based on user permissions
  const quickActions = allQuickActions.filter(action => 
    user?.permissions?.includes(action.permission)
  );

  // Chart data - Activity overview using REAL data from stats
  const activityData = [
    { 
      name: 'Listings', 
      total: stats?.listings?.total || 0,
      active: stats?.listings?.active || 0,
      pending: stats?.listings?.pending || 0
    },
    { 
      name: 'RFQs', 
      sent: stats?.rfqs?.sent || 0,
      received: stats?.rfqs?.received || 0,
      pending: stats?.rfqs?.pending || 0
    },
    { 
      name: 'Orders', 
      buyer: stats?.orders?.asBuyer || 0,
      seller: stats?.orders?.asSeller || 0,
      processing: stats?.orders?.processing || 0
    },
    { 
      name: 'Deliveries', 
      total: stats?.deliveries?.total || 0,
      inTransit: stats?.deliveries?.inTransit || 0,
      delivered: stats?.deliveries?.delivered || 0
    }
  ];

  // Status distribution data - REAL DATA
  const statusData = [
    { name: 'Đã hoàn thành', value: stats?.orders?.completed || 0, color: '#0F766E' },
    { name: 'Đang xử lý', value: stats?.orders?.processing || 0, color: '#F59E0B' },
    { name: 'Chờ thanh toán', value: stats?.orders?.pendingPayment || 0, color: '#EF4444' },
  ].filter(item => item.value > 0); // Only show non-zero values

  // Listings status distribution for second pie chart
  const listingsStatusData = [
    { name: 'Hoạt động', value: stats?.listings?.active || 0, color: '#0F766E' },
    { name: 'Chờ duyệt', value: stats?.listings?.pending || 0, color: '#F59E0B' },
    { name: 'Khác', value: (stats?.listings?.total || 0) - (stats?.listings?.active || 0) - (stats?.listings?.pending || 0), color: '#6B7280' },
  ].filter(item => item.value > 0);

  // Overview comparison data - REAL DATA
  const overviewData = [
    { 
      category: 'Tin đăng',
      count: stats?.listings?.total || 0,
      fill: '#0F766E'
    },
    { 
      category: 'RFQ gửi',
      count: stats?.rfqs?.sent || 0,
      fill: '#3B82F6'
    },
    { 
      category: 'RFQ nhận',
      count: stats?.rfqs?.received || 0,
      fill: '#8B5CF6'
    },
    { 
      category: 'Đơn mua',
      count: stats?.orders?.asBuyer || 0,
      fill: '#F59E0B'
    },
    { 
      category: 'Đơn bán',
      count: stats?.orders?.asSeller || 0,
      fill: '#10B981'
    },
    { 
      category: 'Vận chuyển',
      count: stats?.deliveries?.total || 0,
      fill: '#EC4899'
    }
  ];

  const COLORS = ['#0F766E', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Tổng quan hoạt động và thống kê của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Xem tất cả</span>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              {stat.change && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-primary mr-1" />
                  <span className="text-xs font-medium text-primary">
                    {stat.change}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overview Chart - Tổng quan tất cả hoạt động */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tổng quan hoạt động
            </CardTitle>
            <CardDescription>
              So sánh số lượng tin đăng, RFQ, đơn hàng và vận chuyển
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#0F766E" name="Số lượng" radius={[4, 4, 0, 0]}>
                  {overviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution - Phân bổ trạng thái đơn hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Trạng thái đơn hàng
            </CardTitle>
            <CardDescription>
              Phân bổ các trạng thái đơn hàng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listings Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Chi tiết tin đăng & RFQ
          </CardTitle>
          <CardDescription>
            Phân tích trạng thái tin đăng và RFQ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Listings Status */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-center">Trạng thái tin đăng</h3>
              {listingsStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={listingsStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {listingsStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <p>Chưa có tin đăng</p>
                </div>
              )}
            </div>

            {/* RFQ Comparison */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-center">So sánh RFQ</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Đã gửi', value: stats?.rfqs?.sent || 0, fill: '#3B82F6' },
                  { name: 'Nhận được', value: stats?.rfqs?.received || 0, fill: '#8B5CF6' },
                  { name: 'Chờ phản hồi', value: stats?.rfqs?.pending || 0, fill: '#F59E0B' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Số lượng" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: '#3B82F6' },
                      { fill: '#8B5CF6' },
                      { fill: '#F59E0B' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>
              Các hoạt động và cập nhật mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      ['COMPLETED', 'DELIVERED', 'ACCEPTED'].includes(activity.status) 
                        ? 'bg-primary/10 text-primary' 
                        : ['PENDING_REVIEW', 'SUBMITTED', 'PENDING_PAYMENT'].includes(activity.status)
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(activity.status)}>
                      {statusTranslation[activity.status] || activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Hành động nhanh
            </CardTitle>
            <CardDescription>
              Các tác vụ thường sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.length > 0 ? (
                quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a href={action.href}>
                      <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </a>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có hành động nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



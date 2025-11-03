"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Analytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalListings: number;
    totalOrders: number;
    totalRevenue: number;
    platformFees: number;
  };
  trends: {
    userGrowth: { month: string; count: number }[];
    revenueGrowth: { month: string; amount: number }[];
    orderVolume: { month: string; count: number }[];
  };
  metrics: {
    conversionRate: number;
    averageOrderValue: number;
    rfqSuccessRate: number;
    customerRetention: number;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/admin/analytics?range=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Thống kê & Phân tích
          </h1>
          <p className="text-muted-foreground mt-1">
            Business Intelligence và Performance Metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 px-3 rounded-md border border-input bg-background"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="1year">1 năm qua</option>
          </select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.activeUsers} hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng tin đăng</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalListings.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalOrders.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu (GMV)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${analytics.overview.totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Phí nền tảng</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${analytics.overview.platformFees.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.metrics.conversionRate}%</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList>
              <TabsTrigger value="revenue">
                <DollarSign className="h-4 w-4 mr-2" />
                Doanh thu
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Người dùng
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                <Package className="h-4 w-4 mr-2" />
                Marketplace
              </TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ doanh thu</CardTitle>
                  <CardDescription>Xu hướng doanh thu theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <BarChart3 className="h-12 w-12 text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Biểu đồ doanh thu (Cần tích hợp charting library)</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {analytics.trends.revenueGrowth.slice(0, 6).map((item, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">{item.month}</div>
                        <div className="text-lg font-bold text-green-600">
                          ${item.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Giá trị đơn hàng TB</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${analytics.metrics.averageOrderValue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tỷ lệ giữ chân KH</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.metrics.customerRetention}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tăng trưởng người dùng</CardTitle>
                  <CardDescription>Số lượng người dùng mới theo tháng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Biểu đồ người dùng (Cần tích hợp charting library)</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {analytics.trends.userGrowth.slice(0, 6).map((item, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">{item.month}</div>
                        <div className="text-lg font-bold text-blue-600">
                          +{item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Khối lượng đơn hàng</CardTitle>
                  <CardDescription>Số lượng đơn hàng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Biểu đồ đơn hàng (Cần tích hợp charting library)</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {analytics.trends.orderVolume.slice(0, 6).map((item, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">{item.month}</div>
                        <div className="text-lg font-bold text-orange-600">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chỉ số marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Tỷ lệ chuyển đổi (Listing → Order)</div>
                        <div className="text-sm text-muted-foreground">
                          Số đơn hàng / Số tin đăng
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.metrics.conversionRate}%
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Tỷ lệ thành công RFQ</div>
                        <div className="text-sm text-muted-foreground">
                          RFQ có báo giá được chấp nhận
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.metrics.rfqSuccessRate}%
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Giá trị đơn hàng trung bình</div>
                        <div className="text-sm text-muted-foreground">
                          Average Order Value (AOV)
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        ${analytics.metrics.averageOrderValue.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Tỷ lệ giữ chân khách hàng</div>
                        <div className="text-sm text-muted-foreground">
                          Customer Retention Rate
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.metrics.customerRetention}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Lưu ý về dữ liệu
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Dữ liệu được cập nhật real-time từ database</li>
                    <li>• Biểu đồ cần tích hợp thư viện như Recharts hoặc Chart.js</li>
                    <li>• Có thể xuất báo cáo dạng PDF hoặc Excel</li>
                    <li>• Dữ liệu được cache 5 phút để tối ưu performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có dữ liệu</h3>
              <p className="text-muted-foreground">
                Chưa có dữ liệu thống kê
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


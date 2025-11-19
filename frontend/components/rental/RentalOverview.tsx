import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RentalOverviewProps {
  listing: any;
  stats: any;
  contracts: any[];
  containers: any;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

export function RentalOverview({ listing, stats, contracts, containers }: RentalOverviewProps) {
  // Prepare chart data
  const statusData = [
    { name: 'Đang thuê', value: stats?.active || 0, color: '#10b981' },
    { name: 'Hoàn thành', value: stats?.completed || 0, color: '#3b82f6' },
    { name: 'Đã hủy', value: stats?.terminated || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const containerStatusData = [
    { name: 'Có sẵn', value: containers?.available?.length || 0, color: '#10b981' },
    { name: 'Đang thuê', value: containers?.rented?.length || 0, color: '#3b82f6' },
    { name: 'Bảo trì', value: containers?.maintenance?.length || 0, color: '#f59e0b' },
    { name: 'Đã đặt', value: containers?.reserved?.length || 0, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  // Revenue over time (group by month)
  const revenueByMonth = contracts.reduce((acc: any[], contract: any) => {
    const month = new Date(contract.created_at).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.revenue += contract.total_amount_due || 0;
    } else {
      acc.push({ month, revenue: contract.total_amount_due || 0 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Listing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Listing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Loại container</p>
            <p className="font-semibold">{listing.container_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kích thước</p>
            <p className="font-semibold">{listing.container_size}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Giá thuê</p>
            <p className="font-semibold">
              {listing.rental_price?.toLocaleString('vi-VN')} {listing.rental_currency}/{listing.rental_unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tổng số lượng</p>
            <p className="font-semibold">{listing.total_quantity || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiền cọc đã nhận</p>
                <p className="text-xl font-bold mt-1">
                  {(stats?.totalDeposit || 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiền cọc đã hoàn</p>
                <p className="text-xl font-bold mt-1">
                  {(stats?.depositReturned || 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời gian thuê TB</p>
                <p className="text-xl font-bold mt-1">
                  {Math.round(stats?.averageRentalDuration || 0)} ngày
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Status Distribution */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Phân bố trạng thái hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Container Status Distribution */}
        {containerStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái Container</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={containerStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {containerStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revenue Trend */}
      {revenueByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `${value.toLocaleString('vi-VN')} VND`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có hợp đồng nào
            </p>
          ) : (
            <div className="space-y-3">
              {contracts.slice(0, 5).map((contract: any) => (
                <div 
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{contract.contract_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.buyer?.company_name || contract.buyer?.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {contract.rental_price?.toLocaleString('vi-VN')} {contract.rental_currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contract.start_date).toLocaleDateString('vi-VN')} - 
                        {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant={
                      contract.status === 'ACTIVE' ? 'default' :
                      contract.status === 'COMPLETED' ? 'secondary' :
                      'destructive'
                    }>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

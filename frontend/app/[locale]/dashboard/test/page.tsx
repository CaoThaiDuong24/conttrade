'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Sidebar,
  Menu
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function TestDashboardPage() {
  const stats = [
    {
      title: 'Sidebar Navigation',
      value: '✓ Hoạt động',
      change: '+New',
      changeType: 'positive',
      icon: Sidebar,
      description: 'RBAC Sidebar bên trái'
    },
    {
      title: 'Menu Items',
      value: '15+',
      change: '+Role-based',
      changeType: 'positive',
      icon: Menu,
      description: 'Menu theo vai trò'
    },
    {
      title: 'Responsive Design',
      value: '✓ Mobile',
      change: 'Auto-collapse',
      changeType: 'neutral',
      icon: Package,
      description: 'Tự động thu gọn'
    },
    {
      title: 'User Experience',
      value: '✓ Smooth',
      change: '+Animation',
      changeType: 'positive',
      icon: Star,
      description: 'Trải nghiệm mượt mà'
    }
  ];

  const features = [
    {
      type: 'navigation',
      title: 'Sidebar đã được triển khai',
      time: 'Hiện tại',
      status: 'completed',
      icon: Sidebar
    },
    {
      type: 'rbac',
      title: 'Role-based menu system',
      time: 'Hoạt động',
      status: 'completed',
      icon: Users
    },
    {
      type: 'responsive',
      title: 'Mobile responsive design',
      time: 'Auto-collapse',
      status: 'completed',
      icon: Package
    },
    {
      type: 'animation',
      title: 'Smooth transitions',
      time: 'Với animation',
      status: 'completed',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard với Sidebar RBAC</h1>
          <p className="text-muted-foreground">
            Thanh navigation bên trái đã được triển khai hoàn chỉnh
          </p>
        </div>
        <div className="flex gap-2">
          <SidebarTrigger />
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Toggle Sidebar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Test Navigation
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center pt-1">
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : stat.changeType === 'negative' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  implementation
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sidebar Features */}
        <Card>
          <CardHeader>
            <CardTitle>Tính năng Sidebar</CardTitle>
            <CardDescription>
              Các tính năng đã được triển khai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.time}</p>
                  </div>
                  <Badge variant="default">
                    ✓ Hoàn thành
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Navigation</CardTitle>
            <CardDescription>
              Kiểm tra các link navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a href="/listings">
                  <div className="p-2 rounded-lg bg-blue-500 mr-3">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Listings Page</div>
                    <div className="text-sm text-muted-foreground">
                      Test sidebar on listings
                    </div>
                  </div>
                </a>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a href="/admin">
                  <div className="p-2 rounded-lg bg-red-500 mr-3">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Admin Page</div>
                    <div className="text-sm text-muted-foreground">
                      Test admin sidebar
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a href="/rfq">
                  <div className="p-2 rounded-lg bg-green-500 mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">RFQ Page</div>
                    <div className="text-sm text-muted-foreground">
                      Test RFQ sidebar
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a href="/test-sidebar">
                  <div className="p-2 rounded-lg bg-purple-500 mr-3">
                    <Sidebar className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Sidebar Test</div>
                    <div className="text-sm text-muted-foreground">
                      Test login/logout
                    </div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
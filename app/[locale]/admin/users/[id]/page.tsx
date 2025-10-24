"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Activity,
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  ArrowLeft,
  Save,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  History,
  TrendingUp,
  Clock
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  status: 'active' | 'pending' | 'suspended' | 'banned';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  roles: string[];
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  stats: {
    ordersCount: number;
    listingsCount: number;
    totalRevenue: number;
    reviewsCount: number;
    averageRating: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  const [user, setUser] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserActivities();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: user.displayName,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          status: user.status,
        }),
      });

      if (response.ok) {
        showSuccess('Đã lưu thay đổi thành công');
      } else {
        showError('Không thể lưu thay đổi');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRole = async (role: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('accessToken');
      const hasRole = user.roles.includes(role);
      const endpoint = hasRole ? 'remove-role' : 'assign-role';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUser(prev => prev ? {
          ...prev,
          roles: hasRole 
            ? prev.roles.filter(r => r !== role)
            : [...prev.roles, role]
        } : null);
        showSuccess(`Đã ${hasRole ? 'xóa' : 'thêm'} vai trò ${role}`);
      }
    } catch (error) {
      console.error('Error toggling role:', error);
      showError('Không thể thay đổi vai trò');
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!user || !confirm(`Bạn có chắc muốn đổi trạng thái thành "${newStatus}"?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, status: newStatus as any } : null);
        showSuccess('Đã cập nhật trạng thái tài khoản');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      showError('Không thể thay đổi trạng thái');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, icon: CheckCircle, label: 'Hoạt động' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Chờ xử lý' },
      suspended: { variant: 'outline' as const, icon: XCircle, label: 'Tạm khóa' },
      banned: { variant: 'destructive' as const, icon: Ban, label: 'Cấm' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getKYCBadge = (status: string) => {
    const config = {
      unverified: { variant: 'outline' as const, label: 'Chưa xác thực' },
      pending: { variant: 'secondary' as const, label: 'Đang chờ' },
      verified: { variant: 'default' as const, label: 'Đã xác thực' },
      rejected: { variant: 'destructive' as const, label: 'Bị từ chối' },
    };

    const { variant, label } = config[status as keyof typeof config] || config.unverified;

    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(user.status)}
          {getKYCBadge(user.kycStatus)}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.ordersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tin đăng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.listingsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${user.stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.reviewsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {user.stats.averageRating.toFixed(1)} ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Vai trò & Quyền
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="h-4 w-4 mr-2" />
            Hoạt động
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Chỉnh sửa thông tin người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" value={user.email} disabled className="bg-muted" />
                    {user.emailVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="phone" 
                      value={user.phone || ''} 
                      onChange={(e) => setUser(prev => prev ? {...prev, phone: e.target.value} : null)}
                    />
                    {user.phoneVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input 
                    id="displayName" 
                    value={user.displayName} 
                    onChange={(e) => setUser(prev => prev ? {...prev, displayName: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ tên đầy đủ</Label>
                  <Input 
                    id="fullName" 
                    value={user.fullName} 
                    onChange={(e) => setUser(prev => prev ? {...prev, fullName: e.target.value} : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input 
                  id="address" 
                  value={user.address || ''} 
                  onChange={(e) => setUser(prev => prev ? {...prev, address: e.target.value} : null)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày đăng ký</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(user.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div className="space-y-2">
                    <Label>Đăng nhập gần nhất</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.lastLoginAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vai trò người dùng</CardTitle>
              <CardDescription>Gán hoặc xóa vai trò cho người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['admin', 'buyer', 'seller', 'depot_staff', 'depot_manager', 'inspector', 'finance', 'customer_support'].map(role => (
                <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{role.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {role === 'admin' && 'Toàn quyền hệ thống'}
                      {role === 'buyer' && 'Người mua container'}
                      {role === 'seller' && 'Người bán container'}
                      {role === 'depot_staff' && 'Nhân viên kho bãi'}
                      {role === 'depot_manager' && 'Quản lý kho bãi'}
                      {role === 'inspector' && 'Giám định viên'}
                      {role === 'finance' && 'Kế toán'}
                      {role === 'customer_support' && 'Hỗ trợ khách hàng'}
                    </div>
                  </div>
                  <Switch
                    checked={user.roles.includes(role)}
                    onCheckedChange={() => handleToggleRole(role)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quyền hiệu lực</CardTitle>
              <CardDescription>Danh sách quyền user hiện có</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.permissions.length > 0 ? (
                  user.permissions.map(permission => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có quyền nào</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>Nhật ký hành động của người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">Chưa có hoạt động nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hành động</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.slice(0, 20).map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">{activity.userAgent}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{activity.ipAddress}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(activity.timestamp).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái tài khoản</CardTitle>
              <CardDescription>Quản lý quyền truy cập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant={user.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleChangeStatus('active')}
                  className="flex flex-col gap-2 h-20"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-xs">Kích hoạt</span>
                </Button>
                <Button
                  variant={user.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleChangeStatus('pending')}
                  className="flex flex-col gap-2 h-20"
                >
                  <Clock className="h-5 w-5" />
                  <span className="text-xs">Chờ xử lý</span>
                </Button>
                <Button
                  variant={user.status === 'suspended' ? 'default' : 'outline'}
                  onClick={() => handleChangeStatus('suspended')}
                  className="flex flex-col gap-2 h-20"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-xs">Tạm khóa</span>
                </Button>
                <Button
                  variant={user.status === 'banned' ? 'destructive' : 'outline'}
                  onClick={() => handleChangeStatus('banned')}
                  className="flex flex-col gap-2 h-20"
                >
                  <Ban className="h-5 w-5" />
                  <span className="text-xs">Cấm vĩnh viễn</span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Hành động quản trị</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" disabled>
                    <Lock className="h-4 w-4 mr-2" />
                    Đặt lại mật khẩu
                  </Button>
                  <Button variant="outline" disabled>
                    <Mail className="h-4 w-4 mr-2" />
                    Gửi email thông báo
                  </Button>
                  <Button variant="outline" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    Xem như user (Impersonate)
                  </Button>
                  <Button variant="outline" className="text-destructive" disabled>
                    <Ban className="h-4 w-4 mr-2" />
                    Xóa tài khoản vĩnh viễn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


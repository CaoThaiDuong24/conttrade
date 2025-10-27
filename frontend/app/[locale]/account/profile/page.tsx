import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  FileText, 
  Settings,
  Star,
  TrendingUp,
  Package,
  Truck
} from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations();

  const userStats = [
    { label: 'Tin đăng', value: '12', icon: Package },
    { label: 'Đơn hàng', value: '8', icon: TrendingUp },
    { label: 'Đánh giá', value: '4.8', icon: Star },
    { label: 'Giao hàng', value: '15', icon: Truck },
  ];

  const recentActivity = [
    { action: 'Đăng tin mới', item: 'Container 20ft - Tình trạng tốt', time: '2 giờ trước' },
    { action: 'Nhận đánh giá', item: '5 sao từ Nguyễn Văn A', time: '1 ngày trước' },
    { action: 'Hoàn thành giao dịch', item: 'Container 40ft HC', time: '3 ngày trước' },
    { action: 'Yêu cầu giám định', item: 'Container 20ft', time: '1 tuần trước' },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Nguyễn Văn A</CardTitle>
                <CardDescription>Thành viên từ tháng 1/2024</CardDescription>
                <div className="flex justify-center space-x-2">
                  <Badge variant="secondary">Đã xác thực</Badge>
                  <Badge variant="outline">Cá nhân</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">nguyenvana@email.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+84 123 456 789</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">TP. Hồ Chí Minh</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {userStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="flex justify-center mb-2">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Cá nhân</TabsTrigger>
                <TabsTrigger value="business">Doanh nghiệp</TabsTrigger>
                <TabsTrigger value="verification">Xác thực</TabsTrigger>
                <TabsTrigger value="activity">Hoạt động</TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.personalInfo')}</CardTitle>
                    <CardDescription>
                      Cập nhật thông tin cá nhân của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Họ</Label>
                        <Input id="firstName" defaultValue="Nguyễn" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Tên</Label>
                        <Input id="lastName" defaultValue="Văn A" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="nguyenvana@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" defaultValue="+84 123 456 789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
                    </div>
                    <Button>Lưu thay đổi</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Information */}
              <TabsContent value="business" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.businessInfo')}</CardTitle>
                    <CardDescription>
                      Thông tin doanh nghiệp (nếu có)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Tên công ty</Label>
                      <Input id="companyName" placeholder="Công ty ABC" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxCode">Mã số thuế</Label>
                      <Input id="taxCode" placeholder="0123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Địa chỉ doanh nghiệp</Label>
                      <Input id="businessAddress" placeholder="456 Đường XYZ, Quận 2, TP.HCM" />
                    </div>
                    <Button>Lưu thay đổi</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Verification */}
              <TabsContent value="verification" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.verification')}</CardTitle>
                    <CardDescription>
                      Xác thực danh tính để tăng độ tin cậy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Xác thực danh tính (eKYC)</div>
                            <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
                          </div>
                        </div>
                        <Badge variant="secondary">Đã xác thực</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Xác thực doanh nghiệp (eKYB)</div>
                            <div className="text-sm text-muted-foreground">Chưa thực hiện</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Xác thực</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Tài liệu bổ sung</div>
                            <div className="text-sm text-muted-foreground">Tùy chọn</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Tải lên</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hoạt động gần đây</CardTitle>
                    <CardDescription>
                      Lịch sử hoạt động của bạn trên nền tảng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-sm text-muted-foreground">{activity.item}</div>
                            <div className="text-xs text-muted-foreground">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

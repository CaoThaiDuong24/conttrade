"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { useAuth } from '@/components/providers/auth-context';
import { 
  Settings, 
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

export default function AccountSettingsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    orderUpdates: true,
    rfqUpdates: true,
    paymentAlerts: true,
    weeklyDigest: false,
  });

  // Security Settings
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  // Language & Display
  const [preferences, setPreferences] = useState({
    language: 'vi',
    theme: 'system',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
            
      const response = await fetch('/api/v1/account/settings/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        showSuccess('Đã lưu cài đặt thông báo');
      } else {
        showError('Không thể lưu cài đặt');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
            
      const response = await fetch('/api/v1/account/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showSuccess('Đã đổi mật khẩu thành công');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        showError(error.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Cài đặt tài khoản
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý cài đặt và tùy chọn tài khoản của bạn
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Lock className="h-4 w-4 mr-2" />
            Quyền riêng tư
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="h-4 w-4 mr-2" />
            Tùy chọn
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Chọn cách bạn muốn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Thông báo qua Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua email của bạn
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Thông báo qua SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua tin nhắn SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(value) => handleNotificationChange('smsNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cập nhật đơn hàng</Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về trạng thái đơn hàng
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(value) => handleNotificationChange('orderUpdates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cập nhật RFQ</Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về RFQ và báo giá
                    </p>
                  </div>
                  <Switch
                    checked={notifications.rfqUpdates}
                    onCheckedChange={(value) => handleNotificationChange('rfqUpdates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cảnh báo thanh toán</Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về giao dịch thanh toán
                    </p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(value) => handleNotificationChange('paymentAlerts', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông tin về khuyến mãi và sản phẩm mới
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(value) => handleNotificationChange('marketingEmails', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bản tin hàng tuần</Label>
                    <p className="text-sm text-muted-foreground">
                      Tóm tắt hoạt động hàng tuần
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(value) => handleNotificationChange('weeklyDigest', value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>Quản lý mật khẩu và cài đặt bảo mật</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Lock className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Xác thực hai yếu tố (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  Tăng cường bảo mật cho tài khoản của bạn
                </p>
                <Button variant="outline" disabled>
                  Kích hoạt 2FA (Sắp ra mắt)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Quyền riêng tư</CardTitle>
              <CardDescription>Kiểm soát ai có thể xem thông tin của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị địa chỉ email</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người khác xem email của bạn
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, showEmail: value }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị số điện thoại</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người khác xem số điện thoại của bạn
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, showPhone: value }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cho phép nhận tin nhắn</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người dùng khác gửi tin nhắn cho bạn
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, allowMessages: value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn hiển thị</CardTitle>
              <CardDescription>Tùy chỉnh giao diện và ngôn ngữ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Ngôn ngữ
                  </Label>
                  <select
                    id="language"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Giao diện</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={preferences.theme === 'light' ? 'default' : 'outline'}
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                    >
                      <Sun className="h-5 w-5" />
                      <span className="text-xs">Sáng</span>
                    </Button>
                    <Button
                      variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                    >
                      <Moon className="h-5 w-5" />
                      <span className="text-xs">Tối</span>
                    </Button>
                    <Button
                      variant={preferences.theme === 'system' ? 'default' : 'outline'}
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setPreferences(prev => ({ ...prev, theme: 'system' }))}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Hệ thống</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <select
                    id="timezone"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


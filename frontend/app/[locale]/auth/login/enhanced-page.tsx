'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Package, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function EnhancedLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/vi/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, rememberMe);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick login
  const quickLogin = async (role: string) => {
    const accounts = {
      admin: { email: 'admin@i-contexchange.vn', password: 'admin123' },
      buyer: { email: 'buyer1@example.com', password: 'buyer123' },
      seller: { email: 'seller1@example.com', password: 'seller123' },
      depot: { email: 'depot1@example.com', password: 'depot123' },
      manager: { email: 'operator@i-contexchange.vn', password: 'operator123' },
      inspector: { email: 'inspector1@example.com', password: 'inspector123' },
    };

    const account = accounts[role as keyof typeof accounts];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setRememberMe(true);
      
      try {
        setLoading(true);
        await login(account.email, account.password, true);
        router.push(redirectUrl);
      } catch (err: any) {
        setError(err.message || 'Đăng nhập thất bại');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">i-ContExchange</h1>
          <p className="text-muted-foreground">Đăng nhập vào hệ thống</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <Link
                  href="/auth/forgot"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🚀 Tài khoản demo</CardTitle>
            <CardDescription>
              Click để đăng nhập nhanh với các vai trò khác nhau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Quản trị viên</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('buyer')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-xs font-medium">Buyer</span>
                <span className="text-xs text-muted-foreground">Người mua</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('seller')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium">Seller</span>
                <span className="text-xs text-muted-foreground">Người bán</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('depot')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium">Depot</span>
                <span className="text-xs text-muted-foreground">Nhân viên kho</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('manager')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-xs font-medium">Manager</span>
                <span className="text-xs text-muted-foreground">Quản lý kho</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('inspector')}
                disabled={loading}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium">Inspector</span>
                <span className="text-xs text-muted-foreground">Giám định viên</span>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Tài khoản demo:</strong> Admin/Depot có mật khẩu riêng, User dùng <code>user123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 i-ContExchange Vietnam. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
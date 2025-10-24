"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { useAuth } from '@/components/providers/auth-context';
import { useState } from 'react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { showSuccess, showError, showInfo } = useNotificationContext();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError(t('auth.validation.requiredFields'));
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        showSuccess(t('auth.loginSuccess'), 2000);
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        showError(t('auth.loginError'), 3000);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(t('auth.loginErrorGeneral'), 3000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="flex min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden shadow-2xl bg-white/95">
        
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
          <div className="absolute top-6 left-6 z-20">
            <Button variant="ghost" asChild className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay về trang chủ
              </Link>
            </Button>
          </div>
          
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="text-center text-white px-8">
              <div className="flex justify-center mb-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/40">
                  <Shield className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl font-bold leading-tight text-white drop-shadow-2xl">
                  Chào mừng trở lại!
                </h1>
                <p className="text-lg text-white/90 leading-relaxed font-normal max-w-sm mx-auto drop-shadow-lg">
                  Bạn có thể đăng nhập để truy cập với tài khoản hiện có của mình.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('auth.login')}
              </h2>
              <p className="text-gray-600">
                Nhập thông tin để đăng nhập vào tài khoản
              </p>
            </div>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardContent className="p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      {t('auth.email')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="admin@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      {t('auth.password')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu của bạn"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
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
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        {t('auth.rememberMe')}
                      </Label>
                    </div>
                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      t('auth.login')
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      🚀 Đăng nhập nhanh (Dev Mode)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                      onClick={() => {
                        setFormData({ email: 'superadmin@example.com', password: 'superadmin123' });
                        showInfo('🔥 Super Admin (tất cả quyền)', 1500);
                      }}
                    >
                      🔥 Super Admin
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                      onClick={() => {
                        setFormData({ email: 'admin@example.com', password: 'admin123' });
                        showInfo('⚡ Admin (quản lý)', 1500);
                      }}
                    >
                      ⚡ Admin
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                      onClick={() => {
                        setFormData({ email: 'manager@example.com', password: 'manager123' });
                        showInfo('👨‍💼 Manager (quản lý bộ phận)', 1500);
                      }}
                    >
                      👨‍💼 Manager
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                      onClick={() => {
                        setFormData({ email: 'seller@example.com', password: 'seller123' });
                        showInfo('🏪 Seller (bán hàng)', 1500);
                      }}
                    >
                      🏪 Seller
                    </Button>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    💡 Click vào button để tự động điền thông tin đăng nhập<br/>
                    🔑 Mật khẩu đơn giản: <span className="font-mono font-semibold text-blue-600">role123</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-gray-500 font-medium">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full h-10">
                    <span className="text-sm font-medium">Google</span>
                  </Button>
                  <Button variant="outline" className="w-full h-10">
                    <span className="text-sm font-medium">Facebook</span>
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    {t('auth.dontHaveAccount')}{' '}
                    <Link 
                      href="/auth/register" 
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      {t('auth.signUpHere')}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
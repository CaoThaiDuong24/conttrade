"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Home, Shield, Sparkles } from 'lucide-react';
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
      await login(formData.email, formData.password);
      showSuccess(t('auth.loginSuccess'));
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || error.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-green-900/10">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-600 rounded-full shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('auth.welcome')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('auth.loginToAccount')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4" />
              {t('common.home')}
            </Button>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">
                {t('auth.signIn')}
              </CardTitle>
              <CardDescription>
                {t('auth.enterCredentials')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="h-11"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="h-11 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      {t('auth.rememberMe')}
                    </Label>
                  </div>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      {t('auth.loggingIn')}
                    </div>
                  ) : (
                    t('auth.login')
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Tài khoản Demo - Đăng nhập nhanh
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Admin Account - Full System Access (53 permissions) */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'admin@i-contexchange.vn', password: 'admin123' });
                        showInfo('👑 Admin - Toàn quyền hệ thống (53 permissions)', 1500);
                      }}
                    >
                      👑 Admin
                    </Button>

                    {/* Buyer Account */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'buyer@example.com', password: '123456' });
                        showInfo('🛒 Buyer - Mua hàng', 1500);
                      }}
                    >
                      🛒 Buyer
                    </Button>

                    {/* Seller Account */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'seller@example.com', password: '123456' });
                        showInfo('🏪 Seller - Bán hàng', 1500);
                      }}
                    >
                      🏪 Seller
                    </Button>

                    {/* Depot Manager Account */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'depot@example.com', password: '123456' });
                        showInfo('🏭 Depot Manager - Quản lý kho', 1500);
                      }}
                    >
                      🏭 Depot
                    </Button>

                    {/* Inspector Account */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'inspector@example.com', password: '123456' });
                        showInfo('🔍 Inspector - Kiểm tra chất lượng', 1500);
                      }}
                    >
                      🔍 Inspector
                    </Button>

                    {/* Moderator Account */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'moderator@example.com', password: '123456' });
                        showInfo('⚖️ Moderator - Kiểm duyệt nội dung', 1500);
                      }}
                    >
                      ⚖️ Moderator
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('auth.noAccount')}{' '}
                <Link 
                  href="/auth/register" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Section - Marketing/Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/20 to-green-600/30" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                {t('auth.platformTitle')}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t('auth.platformDescription')}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('auth.feature1Title')}</h3>
                  <p className="text-blue-100">{t('auth.feature1Description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('auth.feature2Title')}</h3>
                  <p className="text-blue-100">{t('auth.feature2Description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('auth.feature3Title')}</h3>
                  <p className="text-blue-100">{t('auth.feature3Description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-48 -translate-x-48" />
      </div>
    </div>
  );
}
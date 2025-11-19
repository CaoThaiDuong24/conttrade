"use client";

import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, ArrowLeft, Home, Shield, Sparkles } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/components/layout/auth-wrapper';

export default function RegisterPage() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', companyName: '', taxCode: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
  const { showSuccess, showError, showInfo } = useNotificationContext();

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (form.password !== form.confirmPassword) {
      showError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (!form.terms) {
      showError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    
    if (!form.email && !form.phone) {
      showError('Vui lòng nhập email hoặc số điện thoại');
      return;
    }
    
    if (form.password.length < 6) {
      showError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const body = {
        type: accountType === 'business' ? 'business' : 'personal',
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        acceptTos: !!form.terms,
      } as const;
      
      const res = await apiClient.register(body);
      
      if (res.status === 200 && res.data) {
        // Store tokens
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        
        showSuccess('Đăng ký thành công! Đang chuyển hướng...', 2000);
        
        setTimeout(() => {
          const path = typeof window !== 'undefined' ? window.location.pathname : '/';
          const match = path.match(/^\/(vi|en)\b/);
          const locale = match ? match[1] : 'vi';
          window.location.href = `/${locale}/dashboard`;
        }, 1000);
      } else {
        const errorMessage = res.message || t('auth.registerError');
        showError(errorMessage, 3000); // Giảm thời gian hiển thị lỗi xuống 3 giây
      }
    } catch (err) {
      console.error('Register error:', err);
      showError(t('auth.registerErrorGeneral'), 3000); // Giảm thời gian hiển thị lỗi xuống 3 giây
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 lg:p-8 relative overflow-hidden">
      {/* 3D Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating 3D Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse transform rotate-12" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000 transform -rotate-12" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-200/10 via-transparent to-transparent rounded-full animate-spin-slow" />
        
        {/* 3D Geometric Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-lime-400/30 to-green-500/30 rounded-lg rotate-45 animate-bounce delay-300 transform-gpu" />
        <div className="absolute bottom-32 left-32 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-rose-500/30 rounded-full animate-bounce delay-700 transform-gpu" />
        <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full animate-pulse delay-500 transform-gpu" />
        
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5 animate-pulse" />
      </div>

      <div className="flex min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-4rem)] rounded-3xl overflow-hidden shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-600/40 transform transition-all duration-700 ease-out">
        {/* Left Panel - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-3xl shadow-2xl">
      {/* Back to Home Button */}
          <div className="absolute top-6 left-6 z-20">
            <Button variant="ghost" asChild className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm">
          <Link href="/vi">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Link>
        </Button>
      </div>

          {/* 3D Gradient Background with Depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
            {/* 3D Layered Shapes with Depth */}
            <div className="absolute top-20 left-20 w-36 h-36 bg-gradient-to-br from-lime-400/40 to-green-500/30 rounded-full blur-3xl animate-pulse transform rotate-12 shadow-2xl" style={{ transform: 'rotateZ(12deg) translateZ(20px)' }} />
            <div className="absolute bottom-20 right-16 w-44 h-44 bg-gradient-to-br from-yellow-300/35 to-orange-400/25 rounded-full blur-3xl animate-pulse delay-1000 transform -rotate-12 shadow-2xl" style={{ transform: 'rotateZ(-12deg) translateZ(30px)' }} />
            <div className="absolute top-1/2 left-1/4 w-28 h-28 bg-gradient-to-br from-blue-300/35 to-cyan-400/25 rounded-full blur-2xl animate-pulse delay-500 transform rotate-6 shadow-xl" style={{ transform: 'rotateZ(6deg) translateZ(15px)' }} />
            <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-green-300/40 to-emerald-400/30 rounded-full blur-xl animate-pulse delay-700 transform -rotate-6 shadow-lg" style={{ transform: 'rotateZ(-6deg) translateZ(10px)' }} />
            
            {/* 3D Geometric Elements with Perspective */}
            <div className="absolute top-16 right-20 w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-lime-400/50 animate-pulse delay-300 shadow-lg" style={{ transform: 'rotateZ(45deg) translateZ(25px)' }} />
            <div className="absolute bottom-20 left-1/3 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[30px] border-b-yellow-300/45 animate-pulse delay-1200 shadow-lg" style={{ transform: 'rotateZ(-30deg) translateZ(20px)' }} />
            
            {/* Floating 3D Particles */}
            <div className="absolute top-1/4 left-1/5 w-12 h-12 bg-gradient-to-br from-white/25 to-white/15 rounded-full animate-pulse delay-400 shadow-xl" style={{ transform: 'translateZ(35px)' }} />
            <div className="absolute bottom-1/3 right-1/5 w-10 h-10 bg-gradient-to-br from-lime-200/35 to-green-300/25 rounded-full animate-pulse delay-900 shadow-lg" style={{ transform: 'translateZ(20px)' }} />
            <div className="absolute top-2/3 left-2/3 w-8 h-8 bg-gradient-to-br from-cyan-300/30 to-blue-400/20 rounded-full animate-pulse delay-600 shadow-md" style={{ transform: 'translateZ(15px)' }} />
            
            {/* 3D Mesh Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-green-500/10 animate-pulse" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="text-center text-white px-8">
              {/* 3D Icon Container */}
              <div className="flex justify-center mb-8">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/40 transform transition-all duration-500" style={{ transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)' }}>
                  <Shield className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              {/* 3D Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl font-bold leading-tight text-white drop-shadow-2xl transform transition-all duration-500" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  Tạo tài khoản mới!
                </h1>
                <p className="text-lg text-white/90 leading-relaxed font-normal max-w-sm mx-auto drop-shadow-lg">
                  Tham gia cùng chúng tôi để bắt đầu hành trình giao dịch của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/98 dark:bg-gray-900/98">
          <div className="w-full max-w-lg space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.register')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
            Tạo tài khoản mới để bắt đầu giao dịch
          </p>
        </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.register')}
              </h2>
            </div>

            {/* Register Form */}
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 space-y-5">
                <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Account Type Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại tài khoản <span className="text-red-500">*</span></Label>
                    <RadioGroup value={accountType} onValueChange={setAccountType} className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                        <Label htmlFor="personal" className="text-sm text-gray-700 dark:text-gray-300">Cá nhân</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business" className="text-sm text-gray-700 dark:text-gray-300">Doanh nghiệp</Label>
                  </div>
                </RadioGroup>
              </div>

                  <div className="space-y-3">
              {/* Personal Information */}
              <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên <span className="text-red-500">*</span></Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                          className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                </div>
              </div>

              {/* Business Information (conditional) */}
              {accountType === 'business' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên công ty <span className="text-red-500">*</span></Label>
                          <div className="relative group">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Công ty ABC"
                              className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                        required
                        value={form.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                          <Label htmlFor="taxCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mã số thuế <span className="text-red-500">*</span></Label>
                    <Input
                      id="taxCode"
                      type="text"
                      placeholder="0123456789"
                            className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                      required
                      value={form.taxCode}
                      onChange={(e) => handleChange('taxCode', e.target.value)}
                    />
                  </div>
                      </div>
              )}

                    {/* Contact Information - Email and Phone on same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.email')} <span className="text-red-500">*</span></Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                            className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.phone')} <span className="text-red-500">*</span></Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+84 123 456 789"
                            className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                        </div>
                </div>
              </div>

                    {/* Password Fields - Password and Confirm Password on same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password')} <span className="text-red-500">*</span></Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                            className="pl-10 pr-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                    required
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                              <EyeOff className="h-3 w-3" />
                    ) : (
                              <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.confirmPassword')} <span className="text-red-500">*</span></Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                            className="pl-10 pr-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                              <EyeOff className="h-3 w-3" />
                    ) : (
                              <Eye className="h-3 w-3" />
                    )}
                  </Button>
                        </div>
                      </div>
                </div>
              </div>

              {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      required 
                      checked={form.terms} 
                      onCheckedChange={(v)=>handleChange('terms', !!v)}
                      className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 cursor-pointer">
                  Tôi đồng ý với{' '}
                      <Link href="/legal/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                      <Link href="/legal/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Chính sách bảo mật
                      </Link> <span className="text-red-500">*</span>
                </Label>
              </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={isLoading || !form.terms || (!form.email && !form.phone) || form.password !== form.confirmPassword}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        {t('auth.creatingAccount')}
                      </div>
                    ) : (
                      t('auth.register')
                    )}
              </Button>
            </form>

                {/* Social Login Section */}
                <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full border-gray-200 dark:border-gray-700" />
              </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full h-10 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                      <svg className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                      <span className="text-sm font-medium">Google</span>
              </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                      <svg className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                      <span className="text-sm font-medium">Facebook</span>
              </Button>
                  </div>
            </div>

                {/* Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Link 
                      href="/auth/login" 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                    >
                {t('auth.signInHere')}
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
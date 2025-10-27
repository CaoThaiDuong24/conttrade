"use client";

import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    setIsEmailSent(true);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild>
            <Link href="/vi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay về trang chủ
            </Link>
          </Button>
        </div>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">i</span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              {t('auth.forgotPassword')}
            </h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email đã được gửi</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{' '}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nếu bạn không nhận được email trong vòng 5 phút, vui lòng kiểm tra thư mục spam.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEmailSent(false)}
                    className="w-full"
                  >
                    Gửi lại email
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/auth/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đăng nhập
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link href="/vi">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Link>
        </Button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">i</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            {t('auth.forgotPassword')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>
              Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Gửi liên kết đặt lại mật khẩu
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button asChild variant="ghost">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

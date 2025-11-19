'use client';

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { AuthProvider } from '@/components/providers/auth-context';
import { CartProvider } from '@/lib/contexts/cart-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppHeader } from '@/components/layout/app-header';
import { AuthWrapper } from '@/components/layout/auth-wrapper';
import { useEffect, useState } from 'react';

const locales = ['vi', 'en'];

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [messages, setMessages] = useState<any>(null);

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Load messages on client side
  useEffect(() => {
    import(`../../messages/${locale}.json`)
      .then((msgs) => setMessages(msgs.default))
      .catch(() => setMessages({}));
  }, [locale]);

  if (!messages) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
            <Toaster />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

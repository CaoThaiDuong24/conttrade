import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { AuthProvider } from '@/components/providers/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppHeader } from '@/components/layout/app-header';
import { AuthWrapper } from '@/components/layout/auth-wrapper';

const locales = ['vi', 'en'];

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <NotificationProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

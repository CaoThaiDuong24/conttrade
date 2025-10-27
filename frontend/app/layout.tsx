import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css"
import "../styles/navigation.css"
import { Providers } from "@/components/providers"
import { PermissionWatcher } from "@/hooks/use-permission-watcher"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "i-ContExchange - Nền tảng Giao dịch Container",
  description: "Nền tảng giao dịch container tích hợp với dịch vụ giám định, sửa chữa và vận chuyển chuyên nghiệp",
  generator: "Next.js",
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages();

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Suspense fallback={null}>
              <NextIntlClientProvider messages={messages}>
                <Providers>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <PermissionWatcher />
                    {children}
                  </ThemeProvider>
                </Providers>
              </NextIntlClientProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

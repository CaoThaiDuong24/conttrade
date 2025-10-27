"use client";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function AppFooter() {
  const t = useTranslations();

  const footerLinks = {
    company: [
      { name: 'Về chúng tôi', href: '/vi/legal' },
      { name: 'Tin tức', href: '/vi/legal' },
      { name: 'Tuyển dụng', href: '/vi/legal' },
      { name: 'Liên hệ', href: '/vi/legal' },
    ],
    services: [
      { name: 'Mua bán Container', href: '/vi/listings' },
      { name: 'Cho thuê Container', href: '/vi/listings' },
      { name: 'Giám định Container', href: '/vi/depot/inspections' },
      { name: 'Sửa chữa Container', href: '/vi/depot/repairs' },
      { name: 'Vận chuyển', href: '/vi/delivery' },
    ],
    support: [
      { name: 'Trung tâm trợ giúp', href: '/vi/help' },
      { name: 'Hướng dẫn sử dụng', href: '/vi/help' },
      { name: 'Câu hỏi thường gặp', href: '/vi/help' },
      { name: 'Hỗ trợ kỹ thuật', href: '/vi/help' },
    ],
    legal: [
      { name: 'Điều khoản sử dụng', href: '/vi/legal/terms' },
      { name: 'Chính sách bảo mật', href: '/vi/legal/privacy' },
      { name: 'Chính sách cookie', href: '/vi/legal' },
      { name: 'Tuyên bố miễn trừ', href: '/vi/legal' },
    ],
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">i</span>
              </div>
              <span className="font-bold text-xl">ContExchange</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Nền tảng giao dịch container tích hợp với dịch vụ giám định, sửa chữa và vận chuyển chuyên nghiệp. 
              Kết nối người mua và người bán container một cách an toàn và hiệu quả.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@contexchange.vn</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ & Pháp lý</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <Separator className="my-4" />
            
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 i-ContExchange. Tất cả quyền được bảo lưu.
          </div>
          
          {/* Newsletter Signup */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Đăng ký nhận tin"
              className="w-64"
            />
            <Button size="sm">Đăng ký</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

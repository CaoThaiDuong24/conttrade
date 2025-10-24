import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Shield, Scale, Users, CreditCard, Truck, AlertTriangle, Calendar, Globe, Lock } from 'lucide-react';

export default function LegalPage() {
  const t = useTranslations();

  const legalDocuments = [
    {
      id: 'terms',
      title: 'Điều khoản sử dụng',
      description: 'Các điều khoản và điều kiện sử dụng nền tảng i-ContExchange',
      icon: FileText,
      href: '/legal/terms',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'privacy',
      title: 'Chính sách bảo mật',
      description: 'Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân',
      icon: Shield,
      href: '/legal/privacy',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'cookies',
      title: 'Chính sách Cookies',
      description: 'Thông tin về việc sử dụng cookies và công nghệ theo dõi',
      icon: Globe,
      href: '/legal/cookies',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'kyc',
      title: 'Chính sách KYC/KYB',
      description: 'Quy trình xác thực danh tính khách hàng và doanh nghiệp',
      icon: Users,
      href: '/legal/kyc',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'payment',
      title: 'Điều khoản thanh toán',
      description: 'Quy định về thanh toán, hoàn tiền và xử lý tranh chấp',
      icon: CreditCard,
      href: '/legal/payment',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'delivery',
      title: 'Điều khoản giao nhận',
      description: 'Quy định về giao nhận container và dịch vụ vận chuyển',
      icon: Truck,
      href: '/legal/delivery',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'dispute',
      title: 'Quy trình giải quyết tranh chấp',
      description: 'Các bước giải quyết tranh chấp và khiếu nại',
      icon: Scale,
      href: '/legal/dispute',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
    {
      id: 'compliance',
      title: 'Tuân thủ pháp luật',
      description: 'Cam kết tuân thủ các quy định pháp luật Việt Nam',
      icon: Lock,
      href: '/legal/compliance',
      lastUpdated: '15/01/2024',
      version: '1.0',
      status: 'active',
    },
  ];

  const quickLinks = [
    {
      title: 'Câu hỏi thường gặp',
      description: 'Tìm câu trả lời cho các câu hỏi phổ biến',
      href: '/help',
      icon: AlertTriangle,
    },
    {
      title: 'Liên hệ hỗ trợ',
      description: 'Liên hệ với đội ngũ hỗ trợ khách hàng',
      href: '/help/contact',
      icon: Users,
    },
    {
      title: 'Báo cáo vi phạm',
      description: 'Báo cáo các hành vi vi phạm điều khoản',
      href: '/help/report',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/help">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Tài liệu pháp lý</h1>
              <p className="text-muted-foreground mt-2">
                Các tài liệu pháp lý và chính sách của i-ContExchange
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Liên kết nhanh</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Card key={link.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <link.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={link.href}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Documents */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tài liệu pháp lý</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <doc.icon className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {doc.status === 'active' ? 'Có hiệu lực' : 'Không có hiệu lực'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cập nhật:</span>
                      <span>{doc.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Phiên bản:</span>
                      <span>{doc.version}</span>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={doc.href}>Xem tài liệu</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Thông báo quan trọng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bằng cách sử dụng nền tảng i-ContExchange, bạn đồng ý tuân thủ tất cả các điều khoản và chính sách được nêu trong các tài liệu pháp lý này.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Lưu ý quan trọng:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Các tài liệu này có thể được cập nhật định kỳ</li>
                  <li>• Thông báo về thay đổi sẽ được gửi qua email</li>
                  <li>• Việc tiếp tục sử dụng dịch vụ được coi là đồng ý với các thay đổi</li>
                  <li>• Nếu không đồng ý, bạn có thể chấm dứt sử dụng dịch vụ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ pháp lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Bộ phận pháp lý</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Email: legal@contexchange.vn</p>
                  <p>Điện thoại: +84 28 1234 5678</p>
                  <p>Địa chỉ: Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Giờ làm việc</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                  <p>Thứ 7: 8:00 - 12:00</p>
                  <p>Chủ nhật: Nghỉ</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về các tài liệu pháp lý, vui lòng liên hệ với chúng tôi.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/help/contact">Liên hệ hỗ trợ</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">Trung tâm trợ giúp</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

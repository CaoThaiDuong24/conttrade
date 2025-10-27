"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  BookOpen, 
  Video, 
  FileText,
  ChevronRight,
  Star,
  Clock,
  User,
  CheckCircle,
  ShoppingCart,
  Store as StoreIcon,
  CreditCard,
  Truck,
  Headphones
} from 'lucide-react';
import { useState } from 'react';

export default function HelpPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Bắt đầu',
      icon: BookOpen,
      questions: [
        {
          question: 'Làm thế nào để đăng ký tài khoản?',
          answer: 'Bạn có thể đăng ký tài khoản bằng cách nhấn nút "Đăng ký" ở góc trên bên phải, điền thông tin cá nhân và xác thực email.',
        },
        {
          question: 'Có những loại tài khoản nào?',
          answer: 'Chúng tôi hỗ trợ 2 loại tài khoản: Cá nhân và Doanh nghiệp. Tài khoản doanh nghiệp cần xác thực thêm thông tin pháp lý.',
        },
        {
          question: 'Làm thế nào để xác thực tài khoản?',
          answer: 'Sau khi đăng ký, bạn cần thực hiện xác thực danh tính (eKYC) bằng cách tải lên ảnh CCCD/CMND và thực hiện xác thực khuôn mặt.',
        },
      ],
    },
    {
      id: 'buying',
      title: 'Mua hàng',
      icon: ShoppingCart,
      questions: [
        {
          question: 'Làm thế nào để tìm container phù hợp?',
          answer: 'Bạn có thể sử dụng công cụ tìm kiếm với các bộ lọc như kích thước, tiêu chuẩn, vị trí, giá cả để tìm container phù hợp.',
        },
        {
          question: 'Làm thế nào để yêu cầu báo giá?',
          answer: 'Nhấn nút "Yêu cầu báo giá" trên trang chi tiết container, điền thông tin yêu cầu và gửi RFQ.',
        },
        {
          question: 'Thanh toán có an toàn không?',
          answer: 'Chúng tôi sử dụng hệ thống thanh toán ký quỹ (Escrow) để đảm bảo an toàn cho cả người mua và người bán.',
        },
      ],
    },
    {
      id: 'selling',
      title: 'Bán hàng',
      icon: StoreIcon,
      questions: [
        {
          question: 'Làm thế nào để đăng tin bán container?',
          answer: 'Nhấn nút "Đăng tin mới", điền thông tin container, tải lên hình ảnh và chọn vị trí depot.',
        },
        {
          question: 'Có phí đăng tin không?',
          answer: 'Đăng tin cơ bản là miễn phí. Bạn có thể trả phí để tin đăng được nổi bật và hiển thị ưu tiên.',
        },
        {
          question: 'Làm thế nào để quản lý tin đăng?',
          answer: 'Vào "Tin đăng của tôi" để xem, chỉnh sửa, ẩn/hiện hoặc xóa tin đăng.',
        },
      ],
    },
    {
      id: 'payment',
      title: 'Thanh toán',
      icon: CreditCard,
      questions: [
        {
          question: 'Các phương thức thanh toán được hỗ trợ?',
          answer: 'Chúng tôi hỗ trợ chuyển khoản ngân hàng, thẻ tín dụng, ví điện tử và thanh toán ký quỹ.',
        },
        {
          question: 'Phí giao dịch là bao nhiêu?',
          answer: 'Phí giao dịch là 2% trên tổng giá trị giao dịch, tối thiểu 50,000 VND.',
        },
        {
          question: 'Khi nào tôi nhận được tiền?',
          answer: 'Tiền sẽ được giải ngân sau khi người mua xác nhận nhận hàng và hoàn tất giao dịch.',
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Giao hàng',
      icon: Truck,
      questions: [
        {
          question: 'Làm thế nào để yêu cầu giao hàng?',
          answer: 'Sau khi hoàn tất thanh toán, bạn có thể yêu cầu giao hàng thông qua hệ thống đặt xe tích hợp.',
        },
        {
          question: 'Có thể theo dõi giao hàng không?',
          answer: 'Có, bạn có thể theo dõi trạng thái giao hàng real-time thông qua GPS và cập nhật từ tài xế.',
        },
        {
          question: 'Chi phí vận chuyển được tính như thế nào?',
          answer: 'Chi phí vận chuyển được tính dựa trên khoảng cách, loại container và yêu cầu đặc biệt.',
        },
      ],
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      icon: Headphones,
      questions: [
        {
          question: 'Làm thế nào để liên hệ hỗ trợ?',
          answer: 'Bạn có thể liên hệ qua hotline, email, chat trực tuyến hoặc tạo ticket hỗ trợ.',
        },
        {
          question: 'Thời gian phản hồi là bao lâu?',
          answer: 'Chúng tôi phản hồi trong vòng 24 giờ làm việc cho các yêu cầu thông thường.',
        },
        {
          question: 'Có hỗ trợ ngoài giờ không?',
          answer: 'Hỗ trợ cơ bản 24/7, hỗ trợ chuyên sâu trong giờ hành chính.',
        },
      ],
    },
  ];

  const guides = [
    {
      title: 'Hướng dẫn đăng ký và xác thực tài khoản',
      description: 'Hướng dẫn chi tiết cách đăng ký tài khoản và thực hiện xác thực danh tính',
      category: 'Bắt đầu',
      readTime: '5 phút',
      difficulty: 'Dễ',
    },
    {
      title: 'Cách tìm và mua container phù hợp',
      description: 'Hướng dẫn sử dụng công cụ tìm kiếm và lọc để tìm container phù hợp',
      category: 'Mua hàng',
      readTime: '8 phút',
      difficulty: 'Trung bình',
    },
    {
      title: 'Quy trình thanh toán ký quỹ (Escrow)',
      description: 'Giải thích chi tiết về hệ thống thanh toán ký quỹ và cách thức hoạt động',
      category: 'Thanh toán',
      readTime: '10 phút',
      difficulty: 'Trung bình',
    },
    {
      title: 'Hướng dẫn đăng tin bán container',
      description: 'Cách tạo tin đăng hiệu quả và thu hút khách hàng',
      category: 'Bán hàng',
      readTime: '12 phút',
      difficulty: 'Trung bình',
    },
  ];

  const tutorials = [
    {
      title: 'Tổng quan về nền tảng i-ContExchange',
      description: 'Video giới thiệu về các tính năng chính của nền tảng',
      duration: '15:30',
      views: '1,234',
      thumbnail: '/placeholder.jpg',
    },
    {
      title: 'Cách sử dụng công cụ tìm kiếm nâng cao',
      description: 'Hướng dẫn sử dụng các bộ lọc và tìm kiếm thông minh',
      duration: '8:45',
      views: '856',
      thumbnail: '/placeholder.jpg',
    },
    {
      title: 'Quy trình giám định container',
      description: 'Tìm hiểu về quy trình giám định chất lượng container',
      duration: '12:20',
      views: '2,156',
      thumbnail: '/placeholder.jpg',
    },
  ];

  const contactMethods = [
    {
      title: 'Hotline',
      description: 'Gọi điện trực tiếp để được hỗ trợ nhanh chóng',
      contact: '+84 123 456 789',
      icon: Phone,
      available: '24/7',
    },
    {
      title: 'Email',
      description: 'Gửi email để được hỗ trợ chi tiết',
      contact: 'support@contexchange.vn',
      icon: Mail,
      available: '24/7',
    },
    {
      title: 'Chat trực tuyến',
      description: 'Chat với nhân viên hỗ trợ trực tuyến',
      contact: 'Bắt đầu chat',
      icon: MessageCircle,
      available: '8:00 - 22:00',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('help.title')}</h1>
          <p className="text-muted-foreground mb-6">
            Tìm kiếm câu trả lời, hướng dẫn và hỗ trợ từ đội ngũ chuyên gia
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm câu trả lời..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">Câu hỏi thường gặp</TabsTrigger>
            <TabsTrigger value="guides">Hướng dẫn</TabsTrigger>
            <TabsTrigger value="tutorials">Video hướng dẫn</TabsTrigger>
            <TabsTrigger value="contact">Liên hệ hỗ trợ</TabsTrigger>
          </TabsList>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faqCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <category.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-medium text-sm">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      Xem tất cả
                      <ChevronRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guides */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid gap-4">
              {guides.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{guide.title}</h3>
                        <p className="text-muted-foreground">{guide.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{guide.category}</span>
                          <span>•</span>
                          <span>{guide.readTime}</span>
                          <span>•</span>
                          <span>{guide.difficulty}</span>
                        </div>
                      </div>
                      <Button variant="outline">
                        Đọc hướng dẫn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tutorials */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{tutorial.duration}</span>
                      <span>{tutorial.views} lượt xem</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">{method.description}</p>
                    <div className="space-y-2">
                      <div className="font-medium">{method.contact}</div>
                      <div className="text-sm text-muted-foreground">
                        Có sẵn: {method.available}
                      </div>
                    </div>
                    <Button className="w-full">
                      {method.title === 'Chat trực tuyến' ? 'Bắt đầu chat' : 'Liên hệ ngay'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
                <CardDescription>
                  Điền form bên dưới để gửi yêu cầu hỗ trợ chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="Nhập email" type="email" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại yêu cầu</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Hỗ trợ kỹ thuật</option>
                    <option>Hỏi về giao dịch</option>
                    <option>Khiếu nại</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả chi tiết</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                  />
                </div>
                <Button className="w-full">
                  Gửi yêu cầu hỗ trợ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

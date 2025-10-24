import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, FileText, Shield, Users, CreditCard, Truck, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations();

  const sections = [
    {
      id: '1',
      title: 'Điều khoản chung',
      content: `
        <p>Chào mừng bạn đến với i-ContExchange ("Nền tảng", "Chúng tôi", "Công ty"). Bằng cách sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.</p>
        
        <h3>1.1. Định nghĩa</h3>
        <ul>
          <li><strong>Nền tảng:</strong> Website và ứng dụng di động i-ContExchange</li>
          <li><strong>Người dùng:</strong> Cá nhân hoặc tổ chức sử dụng nền tảng</li>
          <li><strong>Container:</strong> Thùng chứa hàng hóa theo tiêu chuẩn ISO</li>
          <li><strong>Giao dịch:</strong> Hoạt động mua bán, cho thuê container thông qua nền tảng</li>
        </ul>

        <h3>1.2. Điều kiện sử dụng</h3>
        <p>Để sử dụng nền tảng, bạn phải:</p>
        <ul>
          <li>Đủ 18 tuổi hoặc có đại diện pháp lý</li>
          <li>Cung cấp thông tin chính xác và đầy đủ</li>
          <li>Tuân thủ các quy định pháp luật hiện hành</li>
          <li>Không sử dụng nền tảng cho mục đích bất hợp pháp</li>
        </ul>
      `,
    },
    {
      id: '2',
      title: 'Tài khoản và xác thực',
      content: `
        <h3>2.1. Đăng ký tài khoản</h3>
        <p>Bạn cần tạo tài khoản để sử dụng các tính năng của nền tảng. Thông tin đăng ký phải chính xác và cập nhật.</p>
        
        <h3>2.2. Xác thực danh tính</h3>
        <p>Để đảm bảo an toàn giao dịch, chúng tôi yêu cầu xác thực danh tính (eKYC) cho tất cả người dùng. Thông tin xác thực được bảo mật theo quy định pháp luật.</p>
        
        <h3>2.3. Bảo mật tài khoản</h3>
        <p>Bạn có trách nhiệm:</p>
        <ul>
          <li>Bảo mật thông tin đăng nhập</li>
          <li>Thông báo ngay khi phát hiện tài khoản bị xâm phạm</li>
          <li>Không chia sẻ thông tin đăng nhập với bên thứ ba</li>
        </ul>
      `,
    },
    {
      id: '3',
      title: 'Giao dịch và thanh toán',
      content: `
        <h3>3.1. Quy trình giao dịch</h3>
        <p>Giao dịch trên nền tảng được thực hiện theo quy trình:</p>
        <ol>
          <li>Tìm kiếm và lựa chọn container</li>
          <li>Yêu cầu báo giá (RFQ)</li>
          <li>Nhận và đánh giá báo giá</li>
          <li>Chấp nhận báo giá và tạo đơn hàng</li>
          <li>Thanh toán ký quỹ (Escrow)</li>
          <li>Giao nhận container</li>
          <li>Xác nhận hoàn tất giao dịch</li>
        </ol>

        <h3>3.2. Thanh toán ký quỹ</h3>
        <p>Chúng tôi sử dụng hệ thống thanh toán ký quỹ để đảm bảo an toàn cho cả người mua và người bán. Tiền được giữ trong tài khoản ký quỹ cho đến khi giao dịch hoàn tất.</p>
        
        <h3>3.3. Phí giao dịch</h3>
        <p>Phí giao dịch được tính theo tỷ lệ phần trăm trên giá trị giao dịch:</p>
        <ul>
          <li>Phí cơ bản: 2% trên tổng giá trị</li>
          <li>Phí tối thiểu: 50,000 VND</li>
          <li>Phí tối đa: 2,000,000 VND</li>
        </ul>
      `,
    },
    {
      id: '4',
      title: 'Dịch vụ và chất lượng',
      content: `
        <h3>4.1. Dịch vụ giám định</h3>
        <p>Chúng tôi cung cấp dịch vụ giám định container theo tiêu chuẩn quốc tế IICL-6. Báo cáo giám định được cung cấp cho người mua để đánh giá chất lượng.</p>
        
        <h3>4.2. Dịch vụ sửa chữa</h3>
        <p>Container có thể được sửa chữa tại các depot liên kết. Chi phí sửa chữa được tính riêng và thỏa thuận trước khi thực hiện.</p>
        
        <h3>4.3. Dịch vụ vận chuyển</h3>
        <p>Chúng tôi hỗ trợ dịch vụ vận chuyển container với theo dõi GPS real-time. Chi phí vận chuyển được tính dựa trên khoảng cách và yêu cầu đặc biệt.</p>
      `,
    },
    {
      id: '5',
      title: 'Trách nhiệm và giới hạn',
      content: `
        <h3>5.1. Trách nhiệm của người dùng</h3>
        <p>Người dùng có trách nhiệm:</p>
        <ul>
          <li>Cung cấp thông tin chính xác về container</li>
          <li>Tuân thủ các quy định pháp luật</li>
          <li>Không thực hiện các hoạt động gian lận</li>
          <li>Bảo vệ quyền lợi của các bên liên quan</li>
        </ul>

        <h3>5.2. Trách nhiệm của nền tảng</h3>
        <p>Chúng tôi cam kết:</p>
        <ul>
          <li>Cung cấp nền tảng ổn định và an toàn</li>
          <li>Bảo vệ thông tin cá nhân của người dùng</li>
          <li>Hỗ trợ giải quyết tranh chấp</li>
          <li>Tuân thủ các quy định pháp luật</li>
        </ul>

        <h3>5.3. Giới hạn trách nhiệm</h3>
        <p>Nền tảng không chịu trách nhiệm cho:</p>
        <ul>
          <li>Thiệt hại gián tiếp hoặc hậu quả</li>
          <li>Lỗi kỹ thuật không thể kiểm soát</li>
          <li>Hành vi của người dùng thứ ba</li>
          <li>Thiệt hại do lỗi người dùng</li>
        </ul>
      `,
    },
    {
      id: '6',
      title: 'Bảo mật và quyền riêng tư',
      content: `
        <h3>6.1. Bảo mật thông tin</h3>
        <p>Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của người dùng:</p>
        <ul>
          <li>Mã hóa dữ liệu trong quá trình truyền tải</li>
          <li>Lưu trữ an toàn thông tin nhạy cảm</li>
          <li>Kiểm soát truy cập nghiêm ngặt</li>
          <li>Giám sát bảo mật 24/7</li>
        </ul>

        <h3>6.2. Quyền riêng tư</h3>
        <p>Chúng tôi tuân thủ Nghị định 13/2023 về bảo vệ dữ liệu cá nhân:</p>
        <ul>
          <li>Thu thập dữ liệu với sự đồng ý rõ ràng</li>
          <li>Sử dụng dữ liệu cho mục đích đã thông báo</li>
          <li>Không chia sẻ dữ liệu với bên thứ ba không được phép</li>
          <li>Cho phép người dùng truy cập, sửa đổi, xóa dữ liệu</li>
        </ul>
      `,
    },
    {
      id: '7',
      title: 'Giải quyết tranh chấp',
      content: `
        <h3>7.1. Thương lượng</h3>
        <p>Chúng tôi khuyến khích các bên thương lượng để giải quyết tranh chấp một cách hòa bình.</p>
        
        <h3>7.2. Trung gian hòa giải</h3>
        <p>Nếu không thể thương lượng, chúng tôi sẽ đóng vai trò trung gian hòa giải để hỗ trợ giải quyết.</p>
        
        <h3>7.3. Trọng tài</h3>
        <p>Trong trường hợp cần thiết, tranh chấp sẽ được giải quyết thông qua trọng tài thương mại.</p>
        
        <h3>7.4. Pháp luật áp dụng</h3>
        <p>Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam.</p>
      `,
    },
    {
      id: '8',
      title: 'Thay đổi và chấm dứt',
      content: `
        <h3>8.1. Thay đổi điều khoản</h3>
        <p>Chúng tôi có quyền thay đổi các điều khoản này. Thông báo về thay đổi sẽ được gửi đến người dùng ít nhất 30 ngày trước khi có hiệu lực.</p>
        
        <h3>8.2. Chấm dứt tài khoản</h3>
        <p>Người dùng có thể chấm dứt tài khoản bất kỳ lúc nào. Nền tảng có quyền chấm dứt tài khoản vi phạm điều khoản.</p>
        
        <h3>8.3. Xử lý dữ liệu sau chấm dứt</h3>
        <p>Sau khi chấm dứt tài khoản, dữ liệu cá nhân sẽ được xử lý theo quy định pháp luật về bảo vệ dữ liệu cá nhân.</p>
      `,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold">Điều khoản sử dụng</h1>
              <p className="text-muted-foreground mt-2">
                Các điều khoản và điều kiện sử dụng nền tảng i-ContExchange
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Cập nhật lần cuối: 15/01/2024</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Phiên bản: 1.0</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mục lục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`#section-${section.id}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{section.id}.</span>
                  <span className="text-sm">{section.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} id={`section-${section.id}`}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {section.id}. {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">Điều khoản được bảo vệ bởi pháp luật</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua email: legal@contexchange.vn
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/legal/privacy">Chính sách bảo mật</Link>
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

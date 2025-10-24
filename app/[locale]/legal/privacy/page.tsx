import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, FileText, Shield, Users, CreditCard, Truck, AlertTriangle, Eye, Lock, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations();

  const sections = [
    {
      id: '1',
      title: 'Giới thiệu',
      content: `
        <p>Chính sách bảo mật này mô tả cách i-ContExchange ("Chúng tôi", "Công ty") thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng nền tảng của chúng tôi.</p>
        
        <p>Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các quy định pháp luật hiện hành.</p>

        <h3>1.1. Thông tin liên hệ</h3>
        <ul>
          <li><strong>Tên công ty:</strong> i-ContExchange</li>
          <li><strong>Địa chỉ:</strong> Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM</li>
          <li><strong>Email:</strong> privacy@contexchange.vn</li>
          <li><strong>Điện thoại:</strong> +84 28 1234 5678</li>
        </ul>
      `,
    },
    {
      id: '2',
      title: 'Thông tin chúng tôi thu thập',
      content: `
        <h3>2.1. Thông tin cá nhân</h3>
        <p>Chúng tôi thu thập các thông tin sau:</p>
        <ul>
          <li><strong>Thông tin định danh:</strong> Họ tên, ngày sinh, giới tính, số CMND/CCCD</li>
          <li><strong>Thông tin liên hệ:</strong> Địa chỉ email, số điện thoại, địa chỉ nhà</li>
          <li><strong>Thông tin tài chính:</strong> Số tài khoản ngân hàng, thông tin thẻ thanh toán</li>
          <li><strong>Thông tin doanh nghiệp:</strong> Tên công ty, mã số thuế, địa chỉ trụ sở</li>
        </ul>

        <h3>2.2. Thông tin kỹ thuật</h3>
        <p>Chúng tôi tự động thu thập:</p>
        <ul>
          <li><strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành, trình duyệt</li>
          <li><strong>Thông tin mạng:</strong> Địa chỉ IP, nhà cung cấp dịch vụ internet</li>
          <li><strong>Thông tin sử dụng:</strong> Trang web đã truy cập, thời gian sử dụng</li>
          <li><strong>Cookies và công nghệ tương tự:</strong> Để cải thiện trải nghiệm người dùng</li>
        </ul>

        <h3>2.3. Thông tin giao dịch</h3>
        <p>Chúng tôi lưu trữ:</p>
        <ul>
          <li><strong>Lịch sử giao dịch:</strong> Các giao dịch mua bán, cho thuê container</li>
          <li><strong>Thông tin thanh toán:</strong> Phương thức thanh toán, số tiền giao dịch</li>
          <li><strong>Thông tin giao nhận:</strong> Địa điểm, thời gian giao nhận container</li>
          <li><strong>Thông tin đánh giá:</strong> Đánh giá, phản hồi về dịch vụ</li>
        </ul>
      `,
    },
    {
      id: '3',
      title: 'Mục đích sử dụng thông tin',
      content: `
        <h3>3.1. Cung cấp dịch vụ</h3>
        <p>Chúng tôi sử dụng thông tin để:</p>
        <ul>
          <li>Tạo và quản lý tài khoản người dùng</li>
          <li>Xác thực danh tính (eKYC/eKYB)</li>
          <li>Xử lý giao dịch và thanh toán</li>
          <li>Cung cấp dịch vụ giám định và vận chuyển</li>
          <li>Hỗ trợ khách hàng</li>
        </ul>

        <h3>3.2. Cải thiện dịch vụ</h3>
        <p>Chúng tôi sử dụng thông tin để:</p>
        <ul>
          <li>Phân tích hành vi sử dụng</li>
          <li>Cải thiện giao diện và tính năng</li>
          <li>Phát triển sản phẩm mới</li>
          <li>Tối ưu hóa trải nghiệm người dùng</li>
        </ul>

        <h3>3.3. Bảo mật và tuân thủ</h3>
        <p>Chúng tôi sử dụng thông tin để:</p>
        <ul>
          <li>Phát hiện và ngăn chặn gian lận</li>
          <li>Tuân thủ các quy định pháp luật</li>
          <li>Bảo vệ quyền lợi của người dùng</li>
          <li>Giải quyết tranh chấp</li>
        </ul>
      `,
    },
    {
      id: '4',
      title: 'Chia sẻ thông tin',
      content: `
        <h3>4.1. Chia sẻ với bên thứ ba</h3>
        <p>Chúng tôi có thể chia sẻ thông tin với:</p>
        <ul>
          <li><strong>Đối tác dịch vụ:</strong> Ngân hàng, công ty vận chuyển, depot</li>
          <li><strong>Nhà cung cấp công nghệ:</strong> Dịch vụ cloud, phân tích dữ liệu</li>
          <li><strong>Cơ quan pháp luật:</strong> Khi được yêu cầu theo quy định pháp luật</li>
          <li><strong>Đối tác kinh doanh:</strong> Với sự đồng ý của bạn</li>
        </ul>

        <h3>4.2. Điều kiện chia sẻ</h3>
        <p>Chúng tôi chỉ chia sẻ thông tin khi:</p>
        <ul>
          <li>Có sự đồng ý rõ ràng của bạn</li>
          <li>Cần thiết để cung cấp dịch vụ</li>
          <li>Tuân thủ quy định pháp luật</li>
          <li>Bảo vệ quyền lợi hợp pháp</li>
        </ul>

        <h3>4.3. Bảo vệ thông tin</h3>
        <p>Chúng tôi đảm bảo:</p>
        <ul>
          <li>Ký kết thỏa thuận bảo mật với đối tác</li>
          <li>Giới hạn quyền truy cập thông tin</li>
          <li>Giám sát việc sử dụng thông tin</li>
          <li>Yêu cầu xóa thông tin khi không cần thiết</li>
        </ul>
      `,
    },
    {
      id: '5',
      title: 'Bảo mật thông tin',
      content: `
        <h3>5.1. Biện pháp bảo mật</h3>
        <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
        <ul>
          <li><strong>Mã hóa dữ liệu:</strong> SSL/TLS cho truyền tải, AES-256 cho lưu trữ</li>
          <li><strong>Kiểm soát truy cập:</strong> Xác thực đa yếu tố, phân quyền nghiêm ngặt</li>
          <li><strong>Giám sát bảo mật:</strong> Hệ thống phát hiện xâm nhập 24/7</li>
          <li><strong>Đào tạo nhân viên:</strong> Nâng cao nhận thức về bảo mật</li>
        </ul>

        <h3>5.2. Lưu trữ dữ liệu</h3>
        <p>Thông tin được lưu trữ:</p>
        <ul>
          <li><strong>Máy chủ an toàn:</strong> Tại các trung tâm dữ liệu được chứng nhận</li>
          <li><strong>Sao lưu định kỳ:</strong> Đảm bảo không mất dữ liệu</li>
          <li><strong>Mã hóa tại chỗ:</strong> Bảo vệ dữ liệu ngay cả khi bị xâm nhập</li>
          <li><strong>Kiểm soát vật lý:</strong> Bảo vệ máy chủ khỏi truy cập trái phép</li>
        </ul>

        <h3>5.3. Xử lý sự cố</h3>
        <p>Trong trường hợp rò rỉ dữ liệu:</p>
        <ul>
          <li>Thông báo ngay cho cơ quan chức năng</li>
          <li>Thông báo cho người dùng bị ảnh hưởng</li>
          <li>Thực hiện các biện pháp khắc phục</li>
          <li>Điều tra nguyên nhân và cải thiện bảo mật</li>
        </ul>
      `,
    },
    {
      id: '6',
      title: 'Quyền của người dùng',
      content: `
        <h3>6.1. Quyền truy cập</h3>
        <p>Bạn có quyền:</p>
        <ul>
          <li>Truy cập thông tin cá nhân của mình</li>
          <li>Yêu cầu bản sao dữ liệu</li>
          <li>Kiểm tra cách sử dụng thông tin</li>
          <li>Được thông báo về việc xử lý dữ liệu</li>
        </ul>

        <h3>6.2. Quyền sửa đổi</h3>
        <p>Bạn có thể:</p>
        <ul>
          <li>Sửa đổi thông tin không chính xác</li>
          <li>Cập nhật thông tin đã thay đổi</li>
          <li>Bổ sung thông tin còn thiếu</li>
          <li>Yêu cầu xác minh thông tin</li>
        </ul>

        <h3>6.3. Quyền xóa</h3>
        <p>Bạn có quyền yêu cầu xóa thông tin khi:</p>
        <ul>
          <li>Thông tin không còn cần thiết</li>
          <li>Bạn rút lại sự đồng ý</li>
          <li>Thông tin được xử lý bất hợp pháp</li>
          <li>Tuân thủ nghĩa vụ pháp lý</li>
        </ul>

        <h3>6.4. Quyền hạn chế xử lý</h3>
        <p>Bạn có thể yêu cầu:</p>
        <ul>
          <li>Tạm dừng xử lý thông tin</li>
          <li>Hạn chế mục đích sử dụng</li>
          <li>Ngăn chặn chia sẻ với bên thứ ba</li>
          <li>Kiểm soát việc tự động hóa</li>
        </ul>
      `,
    },
    {
      id: '7',
      title: 'Cookies và công nghệ theo dõi',
      content: `
        <h3>7.1. Loại cookies</h3>
        <p>Chúng tôi sử dụng các loại cookies:</p>
        <ul>
          <li><strong>Cookies cần thiết:</strong> Để nền tảng hoạt động bình thường</li>
          <li><strong>Cookies chức năng:</strong> Lưu trữ tùy chọn người dùng</li>
          <li><strong>Cookies phân tích:</strong> Thu thập thông tin sử dụng</li>
          <li><strong>Cookies quảng cáo:</strong> Hiển thị quảng cáo phù hợp</li>
        </ul>

        <h3>7.2. Quản lý cookies</h3>
        <p>Bạn có thể:</p>
        <ul>
          <li>Chấp nhận hoặc từ chối cookies</li>
          <li>Xóa cookies đã lưu trữ</li>
          <li>Cài đặt trình duyệt để chặn cookies</li>
          <li>Chọn loại cookies muốn cho phép</li>
        </ul>

        <h3>7.3. Công nghệ khác</h3>
        <p>Chúng tôi cũng sử dụng:</p>
        <ul>
          <li><strong>Web beacons:</strong> Theo dõi hiệu quả email</li>
          <li><strong>Pixel tags:</strong> Đo lường hiệu quả quảng cáo</li>
          <li><strong>Local storage:</strong> Lưu trữ dữ liệu tạm thời</li>
          <li><strong>Session storage:</strong> Quản lý phiên đăng nhập</li>
        </ul>
      `,
    },
    {
      id: '8',
      title: 'Lưu trữ và xóa dữ liệu',
      content: `
        <h3>8.1. Thời gian lưu trữ</h3>
        <p>Chúng tôi lưu trữ thông tin trong thời gian:</p>
        <ul>
          <li><strong>Thông tin tài khoản:</strong> Cho đến khi tài khoản bị xóa</li>
          <li><strong>Thông tin giao dịch:</strong> 7 năm theo quy định pháp luật</li>
          <li><strong>Thông tin kỹ thuật:</strong> 2 năm cho mục đích phân tích</li>
          <li><strong>Thông tin marketing:</strong> Cho đến khi bạn hủy đăng ký</li>
        </ul>

        <h3>8.2. Tiêu chí xóa dữ liệu</h3>
        <p>Dữ liệu sẽ được xóa khi:</p>
        <ul>
          <li>Hết thời gian lưu trữ quy định</li>
          <li>Người dùng yêu cầu xóa</li>
          <li>Không còn mục đích sử dụng</li>
          <li>Vi phạm điều khoản sử dụng</li>
        </ul>

        <h3>8.3. Phương pháp xóa</h3>
        <p>Chúng tôi xóa dữ liệu bằng cách:</p>
        <ul>
          <li>Xóa vĩnh viễn khỏi hệ thống</li>
          <li>Ghi đè dữ liệu nhiều lần</li>
          <li>Hủy các bản sao lưu</li>
          <li>Xác nhận việc xóa hoàn tất</li>
        </ul>
      `,
    },
    {
      id: '9',
      title: 'Chuyển giao dữ liệu quốc tế',
      content: `
        <h3>9.1. Điều kiện chuyển giao</h3>
        <p>Chúng tôi chỉ chuyển giao dữ liệu ra nước ngoài khi:</p>
        <ul>
          <li>Có sự đồng ý rõ ràng của bạn</li>
          <li>Quốc gia nhận có mức độ bảo vệ tương đương</li>
          <li>Có các biện pháp bảo vệ phù hợp</li>
          <li>Tuân thủ quy định pháp luật</li>
        </ul>

        <h3>9.2. Biện pháp bảo vệ</h3>
        <p>Khi chuyển giao dữ liệu, chúng tôi:</p>
        <ul>
          <li>Ký kết thỏa thuận bảo vệ dữ liệu</li>
          <li>Mã hóa dữ liệu trong quá trình truyền</li>
          <li>Giới hạn quyền truy cập</li>
          <li>Giám sát việc sử dụng dữ liệu</li>
        </ul>

        <h3>9.3. Quyền của bạn</h3>
        <p>Bạn có quyền:</p>
        <ul>
          <li>Được thông báo về việc chuyển giao</li>
          <li>Yêu cầu thông tin về biện pháp bảo vệ</li>
          <li>Từ chối chuyển giao dữ liệu</li>
          <li>Yêu cầu dừng chuyển giao</li>
        </ul>
      `,
    },
    {
      id: '10',
      title: 'Thay đổi chính sách',
      content: `
        <h3>10.1. Thông báo thay đổi</h3>
        <p>Khi thay đổi chính sách, chúng tôi sẽ:</p>
        <ul>
          <li>Thông báo trước ít nhất 30 ngày</li>
          <li>Gửi email đến tất cả người dùng</li>
          <li>Hiển thị thông báo trên nền tảng</li>
          <li>Giải thích lý do thay đổi</li>
        </ul>

        <h3>10.2. Quyền của người dùng</h3>
        <p>Khi có thay đổi, bạn có thể:</p>
        <ul>
          <li>Tiếp tục sử dụng dịch vụ</li>
          <li>Rút lại sự đồng ý</li>
          <li>Yêu cầu xóa dữ liệu</li>
          <li>Liên hệ để được giải thích</li>
        </ul>

        <h3>10.3. Hiệu lực</h3>
        <p>Chính sách mới có hiệu lực:</p>
        <ul>
          <li>Sau 30 ngày kể từ ngày thông báo</li>
          <li>Khi bạn tiếp tục sử dụng dịch vụ</li>
          <li>Sau khi bạn xác nhận đồng ý</li>
          <li>Theo quy định pháp luật</li>
        </ul>
      `,
    },
    {
      id: '11',
      title: 'Liên hệ và khiếu nại',
      content: `
        <h3>11.1. Thông tin liên hệ</h3>
        <p>Để liên hệ về bảo mật dữ liệu:</p>
        <ul>
          <li><strong>Email:</strong> privacy@contexchange.vn</li>
          <li><strong>Điện thoại:</strong> +84 28 1234 5678</li>
          <li><strong>Địa chỉ:</strong> Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM</li>
          <li><strong>Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 6)</li>
        </ul>

        <h3>11.2. Quy trình khiếu nại</h3>
        <p>Nếu bạn có khiếu nại về bảo mật:</p>
        <ol>
          <li>Gửi email mô tả chi tiết vấn đề</li>
          <li>Chúng tôi sẽ xác nhận nhận được trong 24h</li>
          <li>Điều tra và phản hồi trong 7 ngày</li>
          <li>Thực hiện các biện pháp khắc phục</li>
        </ol>

        <h3>11.3. Cơ quan giám sát</h3>
        <p>Bạn có thể khiếu nại đến:</p>
        <ul>
          <li><strong>Cục An toàn thông tin:</strong> Bộ Thông tin và Truyền thông</li>
          <li><strong>Thanh tra Bộ TT&TT:</strong> Về vi phạm bảo vệ dữ liệu</li>
          <li><strong>Tòa án:</strong> Về quyền riêng tư và bảo mật</li>
          <li><strong>Trung tâm trọng tài:</strong> Về tranh chấp thương mại</li>
        </ul>
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
              <h1 className="text-3xl font-bold">Chính sách bảo mật</h1>
              <p className="text-muted-foreground mt-2">
                Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn
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
                <span className="font-medium">Bảo vệ dữ liệu cá nhân là ưu tiên hàng đầu</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ với chúng tôi qua email: privacy@contexchange.vn
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/legal/terms">Điều khoản sử dụng</Link>
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

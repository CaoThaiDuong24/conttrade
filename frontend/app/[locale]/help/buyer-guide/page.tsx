"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/routing';
import { 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  Truck, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Star,
  MessageSquare,
  Send,
  ShoppingCart,
  CreditCard,
  Eye
} from 'lucide-react';

export default function BuyerGuidePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hướng dẫn mua Container</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Quy trình hoàn chỉnh từ tìm kiếm container đến hoàn tất giao dịch
        </p>
      </div>

      {/* Process Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-6 w-6" />
            Quy trình mua Container (8 bước)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="font-medium">1. Tìm kiếm</h3>
              <p className="text-sm text-muted-foreground">Browse listings</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="font-medium">2. Yêu cầu RFQ</h3>
              <p className="text-sm text-muted-foreground">Gửi báo giá</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-medium">3. Thương lượng</h3>
              <p className="text-sm text-muted-foreground">Đàm phán giá</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="font-medium">4. Tạo Order</h3>
              <p className="text-sm text-muted-foreground">Đặt hàng</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <div className="space-y-6">
        {/* Step 1: Browse Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">1</span>
              </div>
              Tìm kiếm Container
            </CardTitle>
            <CardDescription>
              Duyệt qua danh sách container có sẵn và tìm sản phẩm phù hợp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Cách thực hiện:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Truy cập trang <strong>Listings</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Sử dụng bộ lọc: kích thước, loại, giá, vị trí</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Tìm kiếm theo từ khóa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Xem chi tiết container quan tâm</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Lưu ý quan trọng:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Kiểm tra kỹ hình ảnh và mô tả</li>
                  <li>• Xem rating của seller</li>
                  <li>• So sánh giá với các listing tương tự</li>
                  <li>• Chú ý vị trí depot và chi phí vận chuyển</li>
                </ul>
                <Button asChild className="mt-4">
                  <Link href="/listings">
                    <Eye className="mr-2 h-4 w-4" />
                    Xem Listings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Create RFQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">2</span>
              </div>
              Tạo RFQ (Request for Quote)
            </CardTitle>
            <CardDescription>
              Gửi yêu cầu báo giá chính thức cho seller
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Thông tin cần cung cấp:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Mục đích:</strong> Mua/Thuê/Hỏi thông tin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Số lượng:</strong> Container cần mua</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Thời gian:</strong> Cần trước ngày nào</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Dịch vụ kèm:</strong> Giám định, vận chuyển</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">💡 Mẹo để nhận báo giá tốt:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Cung cấp thông tin chi tiết và rõ ràng</li>
                  <li>• Đề cập ngân sách dự kiến</li>
                  <li>• Thể hiện sự nghiêm túc trong mua</li>
                  <li>• Nêu rõ yêu cầu đặc biệt nếu có</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Review Quotes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              Nhận và xem xét báo giá
            </CardTitle>
            <CardDescription>
              Seller sẽ gửi báo giá, bạn cần xem xét và quyết định
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Trạng thái hiện tại của bạn</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Bạn đã nhận được báo giá và có thể thực hiện các hành động sau:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-yellow-800 mb-2">Tùy chọn có sẵn:</h5>
                  <ul className="space-y-2 text-sm text-yellow-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Chấp nhận báo giá → Tự động tạo Order</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Q&A với người bán để thương lượng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Tạo Order riêng với giá tùy chỉnh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Xem chi tiết container trước khi quyết định</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-yellow-800 mb-2">Cần xem xét:</h5>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• So sánh giá với thị trường</li>
                    <li>• Kiểm tra điều kiện thanh toán</li>
                    <li>• Xác nhận thời gian giao hàng</li>
                    <li>• Đọc kỹ các điều khoản</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Create Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">4</span>
              </div>
              Tạo đơn hàng
            </CardTitle>
            <CardDescription>
              Chuyển từ RFQ sang Order chính thức để thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">2 cách tạo Order:</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-green-600">Cách 1: Chấp nhận báo giá</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Chấp nhận & Tạo Order" → Tự động tạo order với giá đã báo
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-blue-600">Cách 2: Tạo Order riêng</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Tạo Order riêng" → Điều chỉnh giá và điều kiện theo thỏa thuận
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Thông tin cần điền:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Giá đã thỏa thuận:</strong> Giá cuối cùng với seller</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Địa chỉ giao hàng:</strong> Nơi nhận container</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span><strong>Ngày giao hàng:</strong> Thời gian mong muốn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span><strong>Ghi chú:</strong> Yêu cầu đặc biệt</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5-8: Remaining Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-6 w-6" />
              Các bước tiếp theo (5-8)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Thanh toán Escrow</h4>
                    <p className="text-sm text-muted-foreground">Tiền được giữ an toàn cho đến khi nhận hàng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">6</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Giao nhận Container</h4>
                    <p className="text-sm text-muted-foreground">Seller vận chuyển container đến địa chỉ</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">7</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Xác nhận nhận hàng</h4>
                    <p className="text-sm text-muted-foreground">Kiểm tra và xác nhận container đã nhận</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">8</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Đánh giá giao dịch</h4>
                    <p className="text-sm text-muted-foreground">Đánh giá seller để xây dựng uy tín</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-center">Sẵn sàng bắt đầu?</CardTitle>
          <CardDescription className="text-center">
            Khám phá hàng nghìn container chất lượng cao
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/listings">
                <Eye className="mr-2 h-5 w-5" />
                Xem Listings Container
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/rfq/sent">
                <Send className="mr-2 h-5 w-5" />
                Xem RFQ đã gửi
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Cần hỗ trợ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">Tài liệu hướng dẫn</h4>
              <p className="text-sm text-muted-foreground">
                Xem các hướng dẫn chi tiết về cách sử dụng platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">Live Chat</h4>
              <p className="text-sm text-muted-foreground">
                Trò chuyện trực tiếp với đội ngũ hỗ trợ 24/7
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">Account Manager</h4>
              <p className="text-sm text-muted-foreground">
                Được hỗ trợ bởi chuyên gia dành riêng cho tài khoản của bạn
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
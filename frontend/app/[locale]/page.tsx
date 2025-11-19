import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"
import { FeaturedListings } from "@/components/home/featured-listings"
import { 
  Search, 
  Package, 
  Shield, 
  Truck, 
  Building2, 
  Star,
  CheckCircle,
  Users,
  TrendingUp,
  MapPin,
  ArrowRight,
  Zap
} from "lucide-react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'i-ContExchange - Nền tảng Giao dịch Container Hàng đầu Việt Nam',
  description: 'Kết nối người mua và người bán container với dịch vụ giám định IICL, thanh toán Escrow an toàn, vận chuyển chuyên nghiệp. Mua bán container 20ft, 40ft, HC, Reefer uy tín.',
  keywords: 'container, mua bán container, cho thuê container, giám định IICL, vận chuyển container, depot container, container 20ft, container 40ft',
  openGraph: {
    title: 'i-ContExchange - Nền tảng Giao dịch Container',
    description: 'Kết nối người mua và người bán container với dịch vụ giám định, sửa chữa và vận chuyển chuyên nghiệp',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'i-ContExchange - Nền tảng Giao dịch Container',
    description: 'Kết nối người mua và người bán container với dịch vụ giám định, sửa chữa và vận chuyển chuyên nghiệp',
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader isAuthenticated={false} />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-foreground mb-6">
                Nền tảng Giao dịch Container Tích hợp
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Kết nối người mua và người bán container với dịch vụ giám định, sửa chữa và vận chuyển chuyên nghiệp
              </p>
              
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-12">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm container..."
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="px-8">
                  Tìm kiếm
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/listings">
                    <Package className="w-4 h-4 mr-2" />
                    Xem Container
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/rfq">
                    <Search className="w-4 h-4 mr-2" />
                    Yêu cầu Báo giá
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    <Building2 className="w-4 h-4 mr-2" />
                    Đăng ký Ngay
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        <FeaturedListings />

        {/* How It Works Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Quy trình Hoạt động</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                4 bước đơn giản để giao dịch container an toàn và hiệu quả
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Tìm kiếm</h3>
                <p className="text-muted-foreground">
                  Duyệt danh sách container hoặc gửi yêu cầu báo giá (RFQ)
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Giám định</h3>
                <p className="text-muted-foreground">
                  Container được kiểm tra theo tiêu chuẩn IICL tại Depot
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Thanh toán</h3>
                <p className="text-muted-foreground">
                  Thanh toán an toàn qua hệ thống Escrow
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2">Giao hàng</h3>
                <p className="text-muted-foreground">
                  Vận chuyển tận nơi hoặc nhận tại Depot
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Tại sao chọn i-ContExchange?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Nền tảng "Phygital" kết hợp công nghệ số với mạng lưới Depot vật lý
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">Trust Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Giám định chất lượng theo tiêu chuẩn IICL tại Depot, đảm bảo minh bạch và tin cậy
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Package className="w-12 h-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">Giao dịch An toàn</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Thanh toán ký quỹ (Escrow) bảo vệ cả người mua và người bán
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Truck className="w-12 h-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">Dịch vụ Tích hợp</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Vận chuyển, bảo hiểm, sửa chữa - tất cả trong một nền tảng
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Container Types Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Loại Container Có Sẵn</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Đa dạng các loại container đáp ứng mọi nhu cầu vận chuyển
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Package className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>20ft Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Kích thước phổ biến nhất</p>
                  <p className="text-sm text-muted-foreground">Tải trọng: ~28 tấn</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Package className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>40ft Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Dung tích lớn</p>
                  <p className="text-sm text-muted-foreground">Tải trọng: ~27 tấn</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Package className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>40ft High Cube</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Cao hơn 30cm</p>
                  <p className="text-sm text-muted-foreground">Chiều cao: 2.89m</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Package className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Reefer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Container lạnh</p>
                  <p className="text-sm text-muted-foreground">-25°C đến +25°C</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/listings">
                  Xem tất cả Container
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Container có sẵn</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Giao dịch thành công</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Đối tác Depot</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">99%</div>
                <div className="text-muted-foreground">Khách hàng hài lòng</div>
              </div>
            </div>
          </div>
        </section>

        {/* For Business Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Giải pháp cho Doanh nghiệp</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tối ưu hóa chi phí và vận hành với nền tảng của chúng tôi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* For Buyers */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Dành cho Người mua</CardTitle>
                  <CardDescription>Doanh nghiệp cần mua container</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tìm kiếm container chất lượng cao</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>So sánh giá từ nhiều người bán</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Báo cáo giám định chi tiết</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Thanh toán an toàn, bảo vệ quyền lợi</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/register?role=buyer">Đăng ký ngay</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* For Sellers */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <Building2 className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Dành cho Người bán</CardTitle>
                  <CardDescription>Chủ container muốn bán/cho thuê</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tiếp cận hàng nghìn người mua</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Quản lý inventory hiệu quả</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tăng uy tín với giám định</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Hỗ trợ marketing miễn phí</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/register?role=seller">Bắt đầu bán</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* For Depots */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <MapPin className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Dành cho Depot</CardTitle>
                  <CardDescription>Bãi container & dịch vụ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tăng công suất sử dụng bãi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Dịch vụ giám định IICL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Quản lý vận chuyển thông minh</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tăng doanh thu từ dịch vụ</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/register?role=depot">Trở thành đối tác</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Khách hàng Nói gì về Chúng tôi</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hàng nghìn doanh nghiệp tin tưởng sử dụng i-ContExchange
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-background">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "Quy trình mua container rất nhanh chóng và minh bạch. Báo cáo giám định chi tiết giúp chúng tôi yên tâm về chất lượng."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Nguyễn Văn A</p>
                  <p className="text-sm text-muted-foreground">Giám đốc, ABC Logistics</p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "Nền tảng giúp chúng tôi bán container nhanh hơn 50% so với trước. Hệ thống thanh toán Escrow rất an toàn."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Trần Thị B</p>
                  <p className="text-sm text-muted-foreground">CEO, XYZ Container Trading</p>
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "Tuyệt vời! Tất cả các dịch vụ đều có trong một nền tảng - từ tìm kiếm, giám định đến vận chuyển."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Lê Văn C</p>
                  <p className="text-sm text-muted-foreground">Quản lý, DEF Shipping</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Câu hỏi Thường gặp</h2>
              <p className="text-xl text-muted-foreground">
                Giải đáp các thắc mắc phổ biến
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">i-ContExchange là gì?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    i-ContExchange là nền tảng giao dịch container B2B kết hợp công nghệ số với mạng lưới Depot vật lý, 
                    cung cấp dịch vụ toàn diện từ mua bán, cho thuê, giám định, sửa chữa đến vận chuyển container.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quy trình giám định IICL là gì?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    IICL (Institute of International Container Lessors) là tiêu chuẩn quốc tế về kiểm định container. 
                    Các chuyên gia tại Depot sẽ kiểm tra toàn bộ kết cấu, cửa, sàn, và các thiết bị của container 
                    theo 6 tiêu chí chất lượng (IICL Grade).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thanh toán Escrow hoạt động như thế nào?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hệ thống Escrow giữ tiền của người mua cho đến khi container được giao và xác nhận chất lượng. 
                    Điều này bảo vệ cả người mua (đảm bảo nhận hàng đúng) và người bán (đảm bảo nhận tiền).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi phí sử dụng nền tảng là bao nhiêu?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Đăng ký và duyệt container hoàn toàn miễn phí. Chúng tôi chỉ thu phí giao dịch nhỏ (1-2%) 
                    khi đơn hàng thành công. Chi tiết vui lòng xem tại trang Pricing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tôi có thể thuê container không?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Có, nền tảng hỗ trợ cả mua bán và cho thuê container. Bạn có thể tìm các listing cho thuê 
                    hoặc liên hệ trực tiếp với chủ container để thỏa thuận điều khoản thuê.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Container có được bảo hành không?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Mỗi container đã qua giám định IICL sẽ có báo cáo chất lượng chi tiết. 
                    Chính sách bảo hành tùy thuộc vào thỏa thuận giữa người mua và người bán, 
                    được ghi rõ trong hợp đồng giao dịch.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/help">Xem thêm câu hỏi</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">An toàn & Bảo mật</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Cam kết bảo vệ quyền lợi và an toàn cho mọi giao dịch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Giám định IICL Chuẩn quốc tế</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Kiểm tra 6 tiêu chí chất lượng (IICL Grade A-F)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Báo cáo chi tiết với hình ảnh thực tế</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Chuyên gia được chứng nhận IICL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Minh bạch 100% về tình trạng container</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <Package className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Thanh toán Escrow</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tiền được giữ an toàn bởi bên thứ 3</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Chỉ chuyển khi cả 2 bên xác nhận</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Bảo vệ cả người mua và người bán</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Hoàn tiền nếu không đúng cam kết</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <Truck className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Vận chuyển Chuyên nghiệp</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Mạng lưới vận chuyển toàn quốc</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Theo dõi lộ trình real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Bảo hiểm hàng hóa toàn diện</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Giao đúng hẹn, đúng chất lượng</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <Building2 className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Mạng lưới Depot</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>50+ Depot trên toàn quốc</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Dịch vụ sửa chữa, bảo trì chuyên nghiệp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Kho bãi an toàn, rộng rãi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tích hợp với cảng biển lớn</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Bắt đầu giao dịch ngay hôm nay</h2>
            <p className="text-xl mb-8 opacity-90">
              Tham gia nền tảng giao dịch container hàng đầu Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth/register">
                  Đăng ký miễn phí
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link href="/listings">
                  Khám phá Container
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
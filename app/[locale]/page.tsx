import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"
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
  MapPin
} from "lucide-react"

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

        {/* Features Section */}
        <section className="py-20 bg-background">
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
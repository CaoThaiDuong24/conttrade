'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  User, 
  ShoppingCart, 
  Calculator, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Smartphone,
  HelpCircle,
  InfoIcon
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-context';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/currency';

interface CartItem {
  id: string;
  listing_id: string;
  quantity: number;
  deal_type: 'SALE' | 'RENTAL';
  rental_duration_months?: number;
  price_snapshot: string;
  listing: {
    id: string;
    title: string;
    price_sale?: string;
    price_rental_per_month?: string;
    currency: string;
    images?: string[];
    users?: {
      id: string;
      display_name?: string;
    };
    depots?: {
      name: string;
      city?: string;
    };
  };
}

interface Cart {
  id: string;
  cart_items: CartItem[];
}

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("common");
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load cart data
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Pre-fill user info
    setFullName(user.fullName || '');
    setEmail(user.email || '');

    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch cart');

      const data = await response.json();
      setCart(data.data);
    } catch (err: any) {
      console.error('Fetch cart error:', err);
      setError('Không thể tải giỏ hàng');
      toast({
        title: 'Lỗi',
        description: 'Không thể tải giỏ hàng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!cart || !cart.cart_items.length) {
      return { subtotal: 0, platformFee: 0, tax: 0, total: 0 };
    }

    const subtotal = cart.cart_items.reduce((sum, item) => {
      const price = item.deal_type === 'RENTAL'
        ? parseFloat(item.listing.price_rental_per_month || '0') * (item.rental_duration_months || 1)
        : parseFloat(item.listing.price_sale || '0');
      return sum + (price * item.quantity);
    }, 0);

    const platformFee = subtotal * 0.05; // 5%
    const tax = (subtotal + platformFee) * 0.1; // 10% VAT
    const total = subtotal + platformFee + tax;

    return { subtotal, platformFee, tax, total };
  };

  const pricing = calculatePricing();

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName || fullName.trim().length < 3) {
      errors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (VD: 0909123456)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle checkout
  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Vui lòng kiểm tra lại thông tin',
        description: 'Có một số trường chưa hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    if (!cart || cart.cart_items.length === 0) {
      toast({
        title: 'Giỏ hàng trống',
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create orders from cart items (group by seller)
      const ordersByBuyer = cart.cart_items.reduce((acc, item) => {
        const sellerId = item.listing.users?.id || 'unknown';
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      const createdOrderIds: string[] = [];

      // Create order for each seller
      for (const [sellerId, items] of Object.entries(ordersByBuyer)) {
        const firstItem = items[0];
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/from-listing`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId: firstItem.listing_id,
            quantity: items.reduce((sum, i) => sum + i.quantity, 0),
            agreedPrice: parseFloat(firstItem.price_snapshot),
            currency: firstItem.listing.currency,
            notes: notes || undefined,
            deal_type: firstItem.deal_type,
            rental_duration_months: firstItem.rental_duration_months,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Không thể tạo đơn hàng');
        }

        const data = await response.json();
        createdOrderIds.push(data.data.id);
      }

      // Clear cart
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Redirect to first order payment page
      toast({
        title: 'Đơn hàng đã được tạo!',
        description: `Đã tạo ${createdOrderIds.length} đơn hàng thành công`,
      });

      router.push(`/${locale}/orders/${createdOrderIds[0]}/pay`);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      toast({
        title: 'Lỗi',
        description: err.message || 'Có lỗi xảy ra khi tạo đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button onClick={() => router.push(`/${locale}/listings`)}>
              Khám phá sản phẩm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = cart.cart_items[0]?.listing.currency || 'VND';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
        <p className="text-gray-600">Hoàn tất thông tin để tạo đơn hàng</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleCheckout}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin liên hệ
                </CardTitle>
                <CardDescription>
                  Thông tin này sẽ dùng để liên lạc về đơn hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={formErrors.fullName ? 'border-red-500' : ''}
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nguyenvana@example.com"
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Biên lai và thông báo sẽ được gửi đến email này
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0909 123 456"
                    className={formErrors.phone ? 'border-red-500' : ''}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Để liên hệ nếu có vấn đề với đơn hàng
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yêu cầu đặc biệt về đơn hàng..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Câu hỏi thường gặp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="escrow">
                    <AccordionTrigger>
                      Escrow là gì và tại sao cần thiết?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Escrow là dịch vụ bên thứ ba giữ tiền an toàn cho đến khi giao dịch hoàn tất. 
                        Nó bảo vệ cả người mua và người bán.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li><strong>Cho buyer:</strong> Tiền chỉ chuyển cho seller khi nhận hàng OK</li>
                        <li><strong>Cho seller:</strong> Đảm bảo được thanh toán sau khi giao hàng</li>
                        <li><strong>Nếu có tranh chấp:</strong> Hệ thống sẽ giải quyết công bằng</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-methods">
                    <AccordionTrigger>
                      Có những phương thức thanh toán nào?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span><strong>Chuyển khoản ngân hàng:</strong> Miễn phí, quét QR nhanh chóng</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span><strong>Thẻ tín dụng/ghi nợ:</strong> Phí 2.9% + 2,000₫</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-pink-600" />
                          <span><strong>Ví điện tử (VNPay/MoMo):</strong> Phí 1.5%</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="timeline">
                    <AccordionTrigger>
                      Quy trình sau khi thanh toán như thế nào?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                          <div>
                            <p className="font-semibold text-sm">Thanh toán</p>
                            <p className="text-xs text-gray-600">Tiền vào tài khoản Escrow</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                          <div>
                            <p className="font-semibold text-sm">Seller chuẩn bị hàng</p>
                            <p className="text-xs text-gray-600">Thời gian: 1-3 ngày làm việc</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                          <div>
                            <p className="font-semibold text-sm">Vận chuyển/Lấy hàng</p>
                            <p className="text-xs text-gray-600">Theo phương thức đã chọn</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                          <div>
                            <p className="font-semibold text-sm">Xác nhận nhận hàng</p>
                            <p className="text-xs text-gray-600">Kiểm tra và confirm trên hệ thống</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">5</div>
                          <div>
                            <p className="font-semibold text-sm">Giải ngân cho seller</p>
                            <p className="text-xs text-gray-600">Tiền được chuyển từ Escrow</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Sản phẩm ({cart.cart_items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.cart_items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.listing.images?.[0] ? (
                          <img
                            src={item.listing.images[0]}
                            alt={item.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.listing.title}
                        </p>
                        {item.listing.depots && (
                          <p className="text-xs text-gray-500">
                            {item.listing.depots.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.deal_type === 'RENTAL' ? `Thuê ${item.rental_duration_months} tháng` : 'Mua'}
                          </Badge>
                          <span className="text-xs text-gray-500">x{item.quantity}</span>
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-sm">
                            {formatPrice(parseFloat(item.price_snapshot) * item.quantity)} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Chi tiết thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(pricing.subtotal)} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2 border-t pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Phí nền tảng (5%):</span>
                      <InfoIcon className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="font-medium">
                      {formatPrice(pricing.platformFee)} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600">Thuế VAT (10%):</span>
                    <span className="font-medium">
                      {formatPrice(pricing.tax)} {currency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 px-4 py-3 rounded-lg">
                    <span className="font-bold text-base">Tổng thanh toán:</span>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-600">
                        {formatPrice(pricing.total)}
                      </p>
                      <p className="text-xs text-gray-500">{currency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Info */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-amber-700" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-amber-900">
                      💰 Bảo vệ bởi Escrow
                    </p>
                    <p className="text-amber-800">
                      Tiền của bạn sẽ được giữ an toàn trong tài khoản Escrow 
                      và chỉ chuyển cho người bán sau khi:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700 text-xs">
                      <li>Seller chuẩn bị hàng xong</li>
                      <li>Bạn xác nhận đã nhận hàng</li>
                      <li>Hàng đúng mô tả, không có vấn đề</li>
                    </ul>
                    <p className="text-xs text-amber-600 italic">
                      ℹ️ Nếu có tranh chấp, bạn có thể yêu cầu hoàn tiền
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !cart.cart_items.length}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Tiếp tục đến thanh toán
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Thanh toán an toàn & mã hóa 256-bit SSL</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}



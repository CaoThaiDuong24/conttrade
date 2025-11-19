'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Package, 
  ShoppingCart,
  User,
  MapPin,
  FileText,
  CreditCard,
  Shield,
  Box,
  Building2,
  Info,
  AlertCircle,
  Truck,
  DollarSign,
  HelpCircle,
  Lock,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCart } from '@/lib/contexts/cart-context';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-context';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutType = (searchParams.get('type') || 'order') as 'rfq' | 'order';
  
  const { cart, checkout, getTotalItems, getTotalAmount, selectedItemIds } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdIds, setCreatedIds] = useState<string[]>([]);
  
  // Contact form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill user info
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
    
    if (!cart || cart.cart_items.length === 0) {
      router.push('/cart');
    }
    // Redirect if no items are selected
    if (cart && selectedItemIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Không có sản phẩm nào được chọn',
        description: 'Vui lòng chọn sản phẩm trước khi đặt hàng',
      });
      router.push('/cart');
    }
  }, [cart, router, selectedItemIds, toast, user]);
  
  // Form validation
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

  const handleCheckout = async () => {
    // Validate form for orders (not required for RFQ)
    if (checkoutType === 'order' && !validateForm()) {
      toast({
        title: 'Vui lòng kiểm tra lại thông tin',
        description: 'Có một số trường chưa hợp lệ',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const result = await checkout(checkoutType);
      
      setCreatedIds(result.ids);
      setIsSuccess(true);
      
      toast({
        title: 'Thành công!',
        description: `Đã tạo ${result.ids.length} ${checkoutType === 'rfq' ? 'RFQ' : 'đơn hàng'} thành công`,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        if (checkoutType === 'rfq') {
          router.push('/rfqs');
        } else {
          router.push('/orders');
        }
      }, 2000);
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
      setIsProcessing(false);
    }
  };

  if (!cart || cart.cart_items.length === 0) {
    return null;
  }

  // Filter only selected items
  const selectedItems = cart.cart_items.filter(item => selectedItemIds.includes(item.id));

  if (selectedItems.length === 0) {
    return null;
  }

  const totalItems = selectedItems.length;
  
  // Group by currency (only selected items)
  const currencyGroups = selectedItems.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = [];
    }
    acc[item.currency].push(item);
    return acc;
  }, {} as Record<string, typeof selectedItems>);

  // Group by seller (only selected items)
  const sellerGroups = selectedItems.reduce((acc, item) => {
    const sellerId = item.listing.seller_user_id;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.listing.users || item.listing.seller,
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { seller: any; items: typeof selectedItems }>);

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-bounce">
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🎉 Thành công!
            </h2>
            <p className="text-lg text-gray-600 mb-2 text-center">
              Đã tạo {createdIds.length} {checkoutType === 'rfq' ? 'yêu cầu báo giá' : 'đơn hàng'} thành công
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Đang chuyển hướng...
            </p>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Vui lòng đợi...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span 
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => router.push('/')}
          >
            Trang chủ
          </span>
          <span>/</span>
          <span 
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => router.push('/cart')}
          >
            Giỏ hàng
          </span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Xác nhận đơn hàng</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {checkoutType === 'rfq' ? 'Tạo yêu cầu báo giá' : 'Xác nhận đơn hàng'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Kiểm tra và xác nhận thông tin trước khi {checkoutType === 'rfq' ? 'gửi RFQ' : 'đặt hàng'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {totalItems} sản phẩm
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Alert */}
          <Card className={`border-2 ${checkoutType === 'rfq' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                  checkoutType === 'rfq' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600'
                }`}>
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold mb-1 ${checkoutType === 'rfq' ? 'text-blue-900' : 'text-green-900'}`}>
                    {checkoutType === 'rfq' ? '📋 Yêu cầu báo giá (RFQ)' : '🛒 Đặt hàng trực tiếp'}
                  </p>
                  <p className={`text-sm ${checkoutType === 'rfq' ? 'text-blue-700' : 'text-green-700'}`}>
                    {checkoutType === 'rfq' ? (
                      <>
                        Giỏ hàng của bạn sẽ được chuyển thành <strong>yêu cầu báo giá (RFQ)</strong>.
                        Người bán sẽ gửi báo giá cho bạn sau.
                      </>
                    ) : (
                      <>
                        Giỏ hàng của bạn sẽ được chuyển thành <strong>đơn hàng</strong>.
                        Bạn cần thanh toán để hoàn tất đơn hàng.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Form - Only for Order */}
          {checkoutType === 'order' && (
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
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
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
          )}

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
                        <Phone className="h-4 w-4 text-pink-600" />
                        <span><strong>Ví điện tử (VNPay/MoMo):</strong> Phí 1.5%</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="timeline">
                  <AccordionTrigger>
                    Quy trình sau khi {checkoutType === 'rfq' ? 'gửi RFQ' : 'thanh toán'} như thế nào?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                        <div>
                          <p className="font-semibold text-sm">{checkoutType === 'rfq' ? 'RFQ được gửi' : 'Thanh toán'}</p>
                          <p className="text-xs text-gray-600">{checkoutType === 'rfq' ? 'Seller nhận yêu cầu báo giá' : 'Tiền vào tài khoản Escrow'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                        <div>
                          <p className="font-semibold text-sm">{checkoutType === 'rfq' ? 'Nhận báo giá' : 'Seller chuẩn bị hàng'}</p>
                          <p className="text-xs text-gray-600">{checkoutType === 'rfq' ? 'Xem xét và chấp nhận' : 'Thời gian: 1-3 ngày làm việc'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                        <div>
                          <p className="font-semibold text-sm">{checkoutType === 'rfq' ? 'Tạo đơn hàng' : 'Vận chuyển/Lấy hàng'}</p>
                          <p className="text-xs text-gray-600">{checkoutType === 'rfq' ? 'Sau khi chấp nhận báo giá' : 'Theo phương thức đã chọn'}</p>
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

          {/* Items by Seller */}
          {Object.entries(sellerGroups).map(([sellerId, { seller, items }], index) => (
            <Card key={sellerId} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Seller Info */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-orange-900">
                          Người bán {Object.keys(sellerGroups).length > 1 ? `#${index + 1}` : ''}
                        </h3>
                        <p className="text-sm text-orange-700">
                          {seller?.display_name || seller?.email || 'Người bán'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {items.length} sản phẩm
                      </Badge>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const unitPrice = parseFloat(item.price_snapshot);
                      const months = item.deal_type === 'RENTAL' ? item.rental_duration_months : 1;
                      const lineTotal = unitPrice * item.quantity * months;

                      return (
                        <div key={item.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            {/* Product Icon */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                              <Box className="h-6 w-6 text-white" />
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                                {item.listing.title}
                              </h4>
                              <div className="flex flex-wrap gap-2 items-center">
                                <Badge 
                                  variant={item.deal_type === 'SALE' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {item.deal_type === 'SALE' ? '💰 Mua đứt' : `📅 Thuê ${item.rental_duration_months} tháng`}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Package className="h-3 w-3" />
                                  <span>Số lượng: <strong>{item.quantity}</strong></span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatCurrency(unitPrice, item.currency)}/đơn vị {item.deal_type === 'RENTAL' && '/tháng'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-xl text-blue-600">
                                {formatCurrency(lineTotal, item.currency)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity} × {formatCurrency(unitPrice, item.currency)}
                                {item.deal_type === 'RENTAL' && ` × ${months} tháng`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 border shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Summary Title */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">Tổng kết</h3>
                      <p className="text-sm text-gray-600">
                        {totalItems} sản phẩm từ {Object.keys(sellerGroups).length} người bán
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Price Breakdown by Currency */}
                <div className="space-y-4">
                  {Object.entries(currencyGroups).map(([currency, items]) => {
                    const subtotal = items.reduce((sum, item) => {
                      const price = parseFloat(item.price_snapshot);
                      const months = item.deal_type === 'RENTAL' ? 
                        item.rental_duration_months : 1;
                      return sum + (price * item.quantity * months);
                    }, 0);
                    
                    // Calculate tax and fees (same as backend)
                    const tax = subtotal * 0.1;      // 10% VAT
                    const fees = subtotal * 0.02;    // 2% platform fee
                    const total = subtotal + tax + fees;

                    return (
                      <div key={currency} className="space-y-2.5 text-sm">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tạm tính:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(subtotal, currency)}
                          </span>
                        </div>
                        
                        {/* Tax */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Thuế VAT (10%):</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(tax, currency)}
                          </span>
                        </div>
                        
                        {/* Fees - chỉ hiển thị nếu là order */}
                        {checkoutType === 'order' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Phí nền tảng (2%):</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(fees, currency)}
                            </span>
                          </div>
                        )}
                        
                        <Separator className="my-2 bg-gray-300" />
                        
                        {/* Total */}
                        <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3">
                          <span className="font-bold text-blue-900">Tổng cộng:</span>
                          <span className="font-bold text-blue-900 text-xl">
                            {formatCurrency(total, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Multi-Order Notice */}
                {Object.keys(sellerGroups).length > 1 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Tạo {Object.keys(sellerGroups).length} {checkoutType === 'rfq' ? 'RFQ' : 'đơn hàng'}
                        </p>
                        <p className="text-xs text-amber-700">
                          Mỗi người bán sẽ có {checkoutType === 'rfq' ? 'một RFQ' : 'một đơn hàng'} riêng. 
                          {checkoutType === 'order' && ' Bạn cần thanh toán cho từng đơn hàng.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Escrow Protection Info - Only for orders */}
                {checkoutType === 'order' && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Bảo vệ thanh toán Escrow
                        </h4>
                        <ul className="space-y-1.5">
                          <li className="text-xs text-amber-800 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>Tiền của bạn được <strong>giữ an toàn</strong> bởi hệ thống Escrow</span>
                          </li>
                          <li className="text-xs text-amber-800 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>Chỉ chuyển cho seller khi bạn <strong>xác nhận nhận hàng</strong></span>
                          </li>
                          <li className="text-xs text-amber-800 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>Hoàn tiền <strong>100%</strong> nếu có vấn đề với đơn hàng</span>
                          </li>
                        </ul>
                        <div className="mt-3 pt-2 border-t border-amber-200">
                          <p className="text-xs text-amber-700 font-semibold">
                            🔒 Giao dịch được mã hóa SSL 256-bit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardContent className="pt-0">
              <Button 
                className={`w-full h-12 shadow-md hover:shadow-lg transition-all font-semibold text-base ${
                  checkoutType === 'rfq'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {checkoutType === 'rfq' ? (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Gửi yêu cầu báo giá
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Xác nhận đặt hàng
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                {checkoutType === 'rfq' 
                  ? 'Bằng cách gửi RFQ, bạn đồng ý với điều khoản sử dụng'
                  : 'Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

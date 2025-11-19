"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitCompare,
  CheckCircle,
  DollarSign,
  Calendar,
  Truck,
  Star,
  User,
  Package,
  ArrowLeft,
  Info,
  MapPin
} from 'lucide-react';

interface Quote {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  
  totalAmount: number;
  currency: string;
  
  deliveryTerms: string;
  paymentTerms: string;
  validUntil: string;
  
  items: {
    containerType: string;
    size: string;
    quantity: number;
    unitPrice: number;
    availableDate: string;
    depotLocation: string;
  }[];
  
  estimatedDelivery: string;
  notes?: string;
  
  createdAt: string;
}

export default function CompareQuotesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rfqId = searchParams.get('rfqId');
  const quoteIds = searchParams.get('quoteIds')?.split(',') || [];

  useEffect(() => {
    if (rfqId && quoteIds.length > 0) {
      fetchQuotes();
    }
  }, [rfqId, quoteIds]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/quotes/compare?ids=${quoteIds.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuotes(data.data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const getDeliveryTermsLabel = (terms: string) => {
    const labels = {
      ex_works: 'EX Works (Tại kho)',
      fob: 'FOB',
      cif: 'CIF',
      door_to_door: 'Door to Door',
    };
    return labels[terms as keyof typeof labels] || terms;
  };

  const getPaymentTermsLabel = (terms: string) => {
    const labels = {
      '100_advance': '100% trước',
      '50_50': '50-50',
      '30_70': '30-70',
      'cod': 'COD',
    };
    return labels[terms as keyof typeof labels] || terms;
  };

  const getBestPriceBadge = (quote: Quote, allQuotes: Quote[]) => {
    const minPrice = Math.min(...allQuotes.map(q => q.totalAmount));
    if (quote.totalAmount === minPrice) {
      return (
        <Badge className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Giá tốt nhất
        </Badge>
      );
    }
    return null;
  };

  const getBestRatingBadge = (quote: Quote, allQuotes: Quote[]) => {
    const maxRating = Math.max(...allQuotes.map(q => q.sellerRating));
    if (quote.sellerRating === maxRating && quote.sellerRating >= 4.5) {
      return (
        <Badge className="bg-blue-600">
          <Star className="h-3 w-3 mr-1" />
          Đánh giá cao nhất
        </Badge>
      );
    }
    return null;
  };

  if (!rfqId || quoteIds.length === 0) {
    return (
      <div className="text-center py-12">
        <GitCompare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Thiếu thông tin so sánh</h3>
        <p className="text-muted-foreground mb-4">
          Vui lòng chọn ít nhất 2 báo giá để so sánh
        </p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitCompare className="h-8 w-8 text-primary" />
            So sánh báo giá
          </h1>
          <p className="text-muted-foreground mt-1">
            So sánh {quotes.length} báo giá để chọn lựa tốt nhất
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <GitCompare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có báo giá nào</h3>
              <p className="text-muted-foreground">
                Chưa tìm thấy báo giá để so sánh
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote, index) => (
              <Card key={quote.id} className={index === 0 ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Báo giá #{index + 1}</CardTitle>
                    {getBestPriceBadge(quote, quotes)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {quote.sellerName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Tổng giá trị</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(quote.totalAmount, quote.currency)}
                    </div>
                  </div>

                  {/* Seller Rating */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{quote.sellerRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({quote.sellerReviews})
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Container:</span>
                      <span className="font-medium">
                        {quote.items.reduce((sum, item) => sum + item.quantity, 0)} chiếc
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điều kiện giao:</span>
                      <span className="font-medium">{getDeliveryTermsLabel(quote.deliveryTerms)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thanh toán:</span>
                      <span className="font-medium">{getPaymentTermsLabel(quote.paymentTerms)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giao hàng:</span>
                      <span className="font-medium">
                        {new Date(quote.estimatedDelivery).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hiệu lực đến:</span>
                      <span className="font-medium">
                        {new Date(quote.validUntil).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Chi tiết:</div>
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                        <div className="flex justify-between">
                          <span>{item.containerType} {item.size}</span>
                          <span className="font-medium">
                            {formatCurrency(item.unitPrice, quote.currency)}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {item.depotLocation}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button asChild className="w-full">
                      <Link href={`/rfq/${rfqId}?selectQuote=${quote.id}`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Chọn báo giá này
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/rfq/${rfqId}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bảng so sánh chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Tiêu chí</th>
                      {quotes.map((quote, index) => (
                        <th key={quote.id} className="text-center p-3 font-medium">
                          Báo giá #{index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Người bán</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center font-medium">{q.sellerName}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/50">
                      <td className="p-3 font-semibold">Tổng giá</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center text-lg font-bold text-primary">
                          {formatCurrency(q.totalAmount, q.currency)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Đánh giá</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {q.sellerRating.toFixed(1)} ({q.sellerReviews})
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Điều kiện giao hàng</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center">
                          {getDeliveryTermsLabel(q.deliveryTerms)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Điều kiện thanh toán</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center">
                          {getPaymentTermsLabel(q.paymentTerms)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Giao hàng dự kiến</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center">
                          {new Date(q.estimatedDelivery).toLocaleDateString('vi-VN')}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Hiệu lực đến</td>
                      {quotes.map(q => (
                        <td key={q.id} className="p-3 text-center">
                          {new Date(q.validUntil).toLocaleDateString('vi-VN')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Gợi ý chọn báo giá
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Xem xét cả giá và đánh giá của người bán</li>
                    <li>• Kiểm tra điều kiện giao hàng và thanh toán</li>
                    <li>• Ưu tiên người bán có đánh giá cao và nhiều giao dịch</li>
                    <li>• Lưu ý thời gian giao hàng và vị trí depot</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


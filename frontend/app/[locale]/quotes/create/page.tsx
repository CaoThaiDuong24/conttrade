"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  FileText, 
  DollarSign,
  Package,
  ArrowLeft,
  Send,
  Calendar,
  Truck,
  Clock,
  Info
} from 'lucide-react';

interface RFQData {
  id: string;
  listing_id: string;
  buyer_id: string;
  purpose: 'PURCHASE' | 'RENTAL' | 'INQUIRY';
  quantity: number;
  need_by?: string;
  services_json?: any;
  status: string;
  listings?: {
    id: string;
    title: string;
    description?: string;
    price_amount?: number;
    price_currency?: string;
    containers?: {
      id: string;
      type: string;
      size_ft: number;
      iso_code?: string;
      condition?: string;
    };
    listing_facets?: Array<{
      key: string;
      value: string;
    }>;
    users?: {
      id: string;
      display_name: string;
      email: string;
    };
  };
  users?: {
    id: string;
    display_name: string;
    email: string;
  };
}

interface QuoteItem {
  item_type: 'CONTAINER' | 'INSPECTION' | 'REPAIR' | 'DELIVERY' | 'OTHER';
  ref_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  total_price?: number;
  // Additional fields for UI display
  containerType?: string;
  size?: string;
  availableDate?: string;
  depotLocation?: string;
}

export default function CreateQuotePage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [rfqData, setRfqData] = useState<RFQData | null>(null);
  
  const rfqId = searchParams.get('rfqId');

  const [formData, setFormData] = useState({
    validUntil: '',
    deliveryTerms: '',
    paymentTerms: '',
    notes: '',
    currency: 'VND',
  });

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    if (rfqId) {
      fetchRFQData(rfqId);
    }
  }, [rfqId]);

  // Helper function to get token from localStorage or cookies
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    
    // Try multiple possible storage keys
    const possibleKeys = ['token', 'accessToken'];
    
    // Try localStorage first
    for (const key of possibleKeys) {
      const localToken = localStorage.getItem(key);
      if (localToken) {
        return localToken;
      }
    }
    
    // Fallback to cookies
    const cookies = document.cookie.split(';');
    for (const key of possibleKeys) {
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${key}=`));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        return token;
      }
    }
    
    return null;
  };

  const fetchRFQData = async (id: string) => {
    try {
      const token = getToken();
      const apiUrl = '/api/v1';
      const response = await fetch(`${apiUrl}/rfqs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rfq = data.data;
        setRfqData(rfq);
        
        console.log('RFQ data loaded:', rfq);
        console.log('RFQ purpose:', rfq.purpose);
        console.log('RFQ quantity:', rfq.quantity);
        console.log('RFQ listings:', rfq.listings);
        console.log('RFQ containers:', rfq.listings?.containers);
        console.log('RFQ listing_facets:', rfq.listings?.listing_facets);
        
        // Initialize quote items based on RFQ and listing info
        const listing = rfq.listings;
        const facets = listing?.listing_facets || [];
        
        // ONLY use data from listing_facets - NO fallback values
        const getFacetValue = (key: string) => {
          const facet = facets.find((f: { key: string; value: string }) => f.key === key);
          return facet?.value || '';
        };
        
        const containerType = getFacetValue('type');
        const containerSize = getFacetValue('size');  // Use 'size' key consistently
        
        console.log('=== CONTAINER INFO FROM FACETS ===');
        console.log('All facets:', facets);
        console.log('Container type:', containerType);
        console.log('Container size:', containerSize);
        console.log('================================');
        
        // Create quote item ONLY if we have real data
        const items = [];
        if (containerType && containerSize) {
          items.push({
            item_type: 'CONTAINER' as const,
            ref_id: rfq.id,
            description: `Container - ${containerType} ${containerSize}ft`,
            qty: rfq.quantity || 1,
            unit_price: listing?.price_amount || 0,
            total_price: (rfq.quantity || 1) * (listing?.price_amount || 0),
            // UI fields
            containerType: containerType,
            size: `${containerSize}ft`,
            availableDate: '',
            depotLocation: '',
          });
        }
        
        console.log('Quote items initialized:', items);
        setQuoteItems(items);
        
        // Set currency from listing
        if (listing?.price_currency) {
          setFormData(prev => ({
            ...prev,
            currency: listing.price_currency
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      showError('Không thể tải thông tin RFQ');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuoteItemChange = (index: number, field: string, value: string | number) => {
    setQuoteItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate total price when unit_price or qty changes
      if (field === 'unit_price' || field === 'qty') {
        const unitPrice = field === 'unit_price' ? Number(value) : updated[index].unit_price;
        const qty = field === 'qty' ? Number(value) : updated[index].qty;
        updated[index].total_price = unitPrice * qty;
      }
      
      // Update description when container details change
      if (field === 'containerType' || field === 'size') {
        const containerType = field === 'containerType' ? value : updated[index].containerType;
        const size = field === 'size' ? value : updated[index].size;
        updated[index].description = `Container - ${containerType} ${size}`;
      }
      
      return updated;
    });
  };

  const calculateGrandTotal = () => {
    return quoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.validUntil) {
      showError('Vui lòng chọn ngày hết hạn báo giá');
      return;
    }

    if (!formData.deliveryTerms) {
      showError('Vui lòng chọn điều kiện giao hàng');
      return;
    }

    if (!formData.paymentTerms) {
      showError('Vui lòng chọn điều kiện thanh toán');
      return;
    }

    const invalidItems = quoteItems.filter(item => 
      item.unit_price <= 0
    );
    
    if (invalidItems.length > 0) {
      showError('Vui lòng nhập đơn giá hợp lệ cho tất cả container');
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      const apiUrl = '/api/v1';
      
      // Prepare items in correct backend format
      const formattedItems = quoteItems.map(item => ({
        item_type: item.item_type,
        ref_id: item.ref_id,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
      }));

      // Calculate valid_days from validUntil
      const validDays = formData.validUntil 
        ? Math.ceil((new Date(formData.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 7;

      const requestBody = {
        rfqId: rfqId,
        items: formattedItems,
        total: calculateGrandTotal(),
        currency: formData.currency,
        valid_days: validDays > 0 ? validDays : 7,
        notes: formData.notes || undefined,
        deliveryTerms: formData.deliveryTerms || undefined,
        paymentTerms: formData.paymentTerms || undefined,
      };

      console.log('Creating quote with data:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${apiUrl}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Quote created successfully:', result);
        showSuccess('Gửi báo giá thành công!', 2000);
        
        setTimeout(() => {
          router.push('/quotes/management');
        }, 1000);
      } else {
        const error = await response.json();
        console.error('Failed to create quote:', error);
        showError(error.message || 'Gửi báo giá thất bại');
      }
    } catch (error) {
      console.error('Create quote error:', error);
      showError('Có lỗi xảy ra khi gửi báo giá');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rfqId) {
    return (
      <div className="text-center py-12">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Thiếu thông tin RFQ</h3>
        <p className="text-muted-foreground mb-4">Vui lòng chọn RFQ để tạo báo giá</p>
        <Button asChild>
          <Link href="/rfq/received">Xem RFQ nhận được</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900">
      {/* Header - Full Width */}
      <div className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tạo báo giá mới</h1>
              <p className="text-sm text-muted-foreground">
                Gửi báo giá cho yêu cầu từ người mua
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.back()} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Column - RFQ Information (Sticky) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-4">
            {rfqData && (
              <>
                {/* RFQ Info Card */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 dark:border-blue-800 shadow-md">
                  <CardHeader className="pb-3 bg-blue-600 dark:bg-blue-700 text-white rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      <CardTitle className="text-lg">Thông tin RFQ</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {/* Listing Title */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        📦 CONTAINER LISTING
                      </div>
                      <div className="font-bold text-base">{rfqData.listings?.title || 'N/A'}</div>
                    </div>

                    {/* Buyer Info */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">👤 NGƯỜI MUA</div>
                      <div className="font-semibold">{rfqData.users?.display_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{rfqData.users?.email || 'N/A'}</div>
                    </div>

                    {/* Purpose & Quantity */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
                        <div className="text-xs text-muted-foreground mb-1">Mục đích</div>
                        <Badge variant="outline" className="text-xs">
                          {rfqData.purpose === 'PURCHASE' ? '💰 Mua' : 
                           rfqData.purpose === 'RENTAL' ? '📋 Thuê' : 
                           rfqData.purpose === 'INQUIRY' ? '❓ Hỏi' : rfqData.purpose}
                        </Badge>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
                        <div className="text-xs text-muted-foreground mb-1">Số lượng</div>
                        <Badge variant="secondary" className="text-sm font-bold">
                          {rfqData.quantity} ×
                        </Badge>
                      </div>
                    </div>

                    {/* Need By Date */}
                    {rfqData.need_by && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                          ⏰ CẦN TRƯỚC
                        </div>
                        <div className="font-semibold">
                          {new Date(rfqData.need_by).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    {/* Containers */}
                    {rfqData.listings?.listing_facets && rfqData.listings.listing_facets.length > 0 && (() => {
                      const facets = rfqData.listings.listing_facets;
                      const getVal = (key: string) => facets.find((f: any) => f.key === key)?.value;
                      const type = getVal('type');
                      const size = getVal('size_ft');
                      const condition = getVal('condition');
                      
                      if (type || size) {
                        return (
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                            <div className="text-xs font-medium text-muted-foreground mb-2">🚢 CONTAINER</div>
                            <div className="flex flex-wrap gap-1.5">
                              {type && size && (
                                <Badge variant="secondary" className="text-xs">
                                  {type} {size}ft
                                </Badge>
                              )}
                              {condition && (
                                <Badge variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Fallback to containers table if no facets */}
                    {rfqData.listings?.containers && !rfqData.listings?.listing_facets?.length && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                        <div className="text-xs font-medium text-muted-foreground mb-2">🚢 CONTAINER</div>
                        <Badge variant="secondary" className="text-xs">
                          {rfqData.listings.containers.type} {rfqData.listings.containers.size_ft}ft
                        </Badge>
                        {rfqData.listings.containers.condition && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {rfqData.listings.containers.condition}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Listed Price */}
                    {rfqData.listings?.price_amount && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                          💵 GIÁ NIÊM YẾT
                        </div>
                        <div className="font-bold text-lg text-green-700 dark:text-green-400">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: rfqData.listings.price_currency || 'VND' 
                          }).format(rfqData.listings.price_amount)}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {rfqData.listings?.description && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">📝 MÔ TẢ</div>
                        <p className="text-sm leading-relaxed">
                          {rfqData.listings.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Quote Form */}
        <div className="lg:col-span-8 xl:col-span-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quote Items Section */}
            <Card className="shadow-lg border-2">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Chi tiết báo giá</CardTitle>
                      <CardDescription className="mt-0.5">
                        Nhập giá và thông tin chi tiết cho từng loại container
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {quoteItems.length} mục
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {quoteItems.map((item, index) => (
                  <div key={item.ref_id || index} className="p-5 border-2 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">
                            {item.containerType} - {item.size}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Container #{index + 1}
                          </p>
                        </div>
                      </div>
                      <Badge className="text-base px-3 py-1 bg-blue-500">
                        {item.qty} units
                      </Badge>
                    </div>

                    {/* Container Info - Compact Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Loại container</Label>
                        <Input
                          type="text"
                          placeholder="Standard, High Cube..."
                          value={item.containerType || ''}
                          onChange={(e) => handleQuoteItemChange(index, 'containerType', e.target.value)}
                          className="h-10 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Kích thước</Label>
                        <Input
                          type="text"
                          placeholder="20ft, 40ft..."
                          value={item.size || ''}
                          onChange={(e) => handleQuoteItemChange(index, 'size', e.target.value)}
                          className="h-10 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Số lượng</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.qty || ''}
                          onChange={(e) => handleQuoteItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                          className="h-10 font-medium text-center"
                        />
                      </div>
                    </div>

                    {/* Pricing Section - Prominent */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                          <DollarSign className="h-4 w-4" />
                          Đơn giá <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="Nhập đơn giá..."
                            value={item.unit_price || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            required
                            className="h-12 text-lg font-bold pr-20 border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                            {formData.currency}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Giá cho 1 container</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-muted-foreground">Thành tiền</Label>
                        <div className="h-12 px-4 flex items-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 border-2 border-green-300 dark:border-green-700 rounded-md">
                          <span className="text-xl font-black text-green-700 dark:text-green-400">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: formData.currency 
                            }).format(item.total_price || 0)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">= Đơn giá × {item.qty}</p>
                      </div>
                    </div>

                    {/* Optional Fields - Clear Labels & Better UI */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">THÔNG TIN BỔ SUNG (Tùy chọn)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`availableDate-${index}`} className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>Ngày có hàng</span>
                          </Label>
                          <Input
                            id={`availableDate-${index}`}
                            type="date"
                            value={item.availableDate || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'availableDate', e.target.value)}
                            className="h-10 text-sm border-2"
                            title="Chọn ngày container có thể giao"
                          />
                          <p className="text-xs text-muted-foreground">Ngày sớm nhất có thể giao hàng</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`depotLocation-${index}`} className="text-sm font-semibold flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span>Vị trí depot/kho</span>
                          </Label>
                          <Input
                            id={`depotLocation-${index}`}
                            type="text"
                            placeholder="VD: Depot Hải Phòng, Kho Cát Lái, HCMC..."
                            value={item.depotLocation || ''}
                            onChange={(e) => handleQuoteItemChange(index, 'depotLocation', e.target.value)}
                            className="h-10 text-sm border-2"
                            title="Nhập vị trí depot hoặc kho chứa container"
                          />
                          <p className="text-xs text-muted-foreground">Địa điểm lấy/giao container</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="shadow-lg border-2">
              <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Điều khoản & Điều kiện</CardTitle>
                    <CardDescription className="mt-0.5">
                      Thiết lập các điều khoản và thời hạn hiệu lực của báo giá
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="validUntil" className="text-sm font-semibold">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Hiệu lực đến <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => handleInputChange('validUntil', e.target.value)}
                        required
                        className="h-11 max-w-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryTerms" className="text-sm font-semibold ">
                          <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Điều kiện giao hàng <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.deliveryTerms} onValueChange={(value) => handleInputChange('deliveryTerms', value)}>
                          <SelectTrigger className="h-11 max-w-xs">
                            <SelectValue placeholder="Chọn điều kiện giao hàng..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EX_WORKS">🏭 EX Works - Lấy tại kho người bán</SelectItem>
                            <SelectItem value="FOB">🚢 FOB - Giao lên tàu (người bán chịu phí)</SelectItem>
                            <SelectItem value="CIF">📦 CIF - Bao gồm vận chuyển & bảo hiểm</SelectItem>
                            <SelectItem value="DOOR_TO_DOOR">🚚 Door to Door - Giao tận nơi</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* <p className="text-xs text-muted-foreground">
                          💡 Quy định trách nhiệm vận chuyển và chi phí
                        </p> */}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms" className="text-sm font-semibold">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Điều kiện thanh toán <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                          <SelectTrigger className="h-11 max-w-xs">
                            <SelectValue placeholder="Chọn điều kiện thanh toán..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NET_30">📅 Net 30 - Thanh toán trong 30 ngày</SelectItem>
                            <SelectItem value="NET_15">⏱️ Net 15 - Thanh toán trong 15 ngày</SelectItem>
                            <SelectItem value="100_ADVANCE">💵 100% trả trước - Thanh toán toàn bộ trước</SelectItem>
                            <SelectItem value="50_50">⚖️ 50-50 - Trả 50% trước, 50% sau giao hàng</SelectItem>
                            <SelectItem value="30_70">📊 30-70 - Trả 30% trước, 70% sau giao hàng</SelectItem>
                            <SelectItem value="COD">💰 COD - Thanh toán khi nhận hàng</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* <p className="text-xs text-muted-foreground">
                          💡 Cách thức và thời hạn thanh toán
                        </p> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Ghi chú thêm (tùy chọn)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="VD: Giá đã bao gồm phí kho bãi 7 ngày, container đạt tiêu chuẩn IICL..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Thêm các điều kiện đặc biệt hoặc thông tin quan trọng
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary - Prominent */}
            <Card className="shadow-xl border-4 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Tổng kết báo giá</CardTitle>
                      <p className="text-sm text-white/80 mt-0.5">Tóm tắt tổng quan chi tiết</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {quoteItems.reduce((sum, item) => sum + item.qty, 0)}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Tổng containers</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{quoteItems.length}</div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Số mục</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                        {formData.validUntil 
                          ? Math.max(0, Math.ceil((new Date(formData.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          : 0}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Ngày hiệu lực</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 text-center hover:shadow-lg transition-shadow">
                      <div className="text-2xl font-black text-green-600 dark:text-green-400">{formData.currency}</div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Loại tiền</div>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Grand Total - Huge Display */}
                  <div className="p-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="text-lg font-bold opacity-90">💰 TỔNG GIÁ TRỊ BÁO GIÁ</div>
                        <div className="text-sm opacity-75 mt-1">
                          Bao gồm {quoteItems.length} loại × {quoteItems.reduce((sum, item) => sum + item.qty, 0)} container
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-white drop-shadow-2xl">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: formData.currency 
                          }).format(calculateGrandTotal())}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-lg border-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <Info className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">
                      {calculateGrandTotal() === 0 
                        ? '⚠️ Vui lòng nhập đơn giá để tiếp tục'
                        : '✅ Kiểm tra kỹ thông tin trước khi gửi'
                      }
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      size="lg"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="min-w-[140px] h-12"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Hủy bỏ
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || calculateGrandTotal() === 0}
                      size="lg"
                      className="min-w-[200px] h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-bold shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          Đang gửi...
                        </div>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Gửi báo giá ngay
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Package, 
  User, 
  Calendar,
  ArrowLeft,
  Send,
  FileText,
  Upload,
  Shield,
  Clock
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';

interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  status: string;
  totalAmount?: number;
  listing: {
    id: string;
    title: string;
    container: {
      sizeFt: number;
      type: string;
      condition: string;
    };
  };
  seller: {
    displayName: string;
    orgUsers: Array<{
      org: {
        name: string;
      };
    }>;
  };
  createdAt: string;
}

interface DisputeForm {
  orderId: string;
  reason: string;
  description: string;
  evidence: string[];
  resolutionRequest: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function NewDisputePage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<DisputeForm>({
    orderId: '',
    reason: '',
    description: '',
    evidence: [],
    resolutionRequest: '',
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
      setFormData(prev => ({ ...prev, orderId }));
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with real order API when available
      const response = await fetch(`/api/v1/orders/${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dispute - Order API response:', data);
        
        if (data.success && data.data) {
          setOrder(data.data.order || data.data);
        } else {
          showError('Không tìm thấy đơn hàng');
        }
      } else {
        // For now, use mock data if API not ready
        console.warn('Order API not ready, using mock data');
        setOrder({
          id: orderId!,
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          status: 'delivered',
          listing: {
            id: 'listing-1',
            title: 'Container 40HC Dry - Tình trạng tốt',
            container: {
              sizeFt: 40,
              type: 'Dry Container',
              condition: 'Good'
            }
          },
          seller: {
            displayName: 'Công ty ABC',
            orgUsers: [{
              org: {
                name: 'Công ty ABC Logistics'
              }
            }]
          },
          totalAmount: 85000000,
          createdAt: '2024-01-15'
        });
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      // Use mock data as fallback
      setOrder({
        id: orderId!,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: 'delivered',
        listing: {
          id: 'listing-1',
          title: 'Container 40HC Dry',
          container: {
            sizeFt: 40,
            type: 'Dry Container',
            condition: 'Good'
          }
        },
        seller: {
          displayName: 'Công ty ABC',
          orgUsers: [{
            org: {
              name: 'Công ty ABC Logistics'
            }
          }]
        },
        totalAmount: 85000000,
        createdAt: '2024-01-15'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof typeof prev] as any;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...fileNames]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      showError('Vui lòng chọn lý do khiếu nại');
      return;
    }

    if (!formData.description.trim()) {
      showError('Vui lòng mô tả chi tiết vấn đề');
      return;
    }

    if (!formData.resolutionRequest.trim()) {
      showError('Vui lòng đề xuất giải pháp');
      return;
    }

    if (!formData.contactInfo.name || !formData.contactInfo.phone) {
      showError('Vui lòng điền đầy đủ thông tin liên hệ');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement API call
      // await apiClient.createDispute(formData);
      showSuccess('Khiếu nại đã được gửi thành công. Chúng tôi sẽ xử lý trong vòng 24h.');
      router.push('/disputes');
    } catch (error) {
      console.error('Error submitting dispute:', error);
      showError('Không thể gửi khiếu nại');
    } finally {
      setSubmitting(false);
    }
  };

  const disputeReasons = [
    { value: 'product_not_as_described', label: 'Sản phẩm không đúng mô tả' },
    { value: 'product_damaged', label: 'Sản phẩm bị hỏng' },
    { value: 'delivery_delayed', label: 'Giao hàng trễ' },
    { value: 'delivery_not_received', label: 'Không nhận được hàng' },
    { value: 'payment_issue', label: 'Vấn đề thanh toán' },
    { value: 'communication_issue', label: 'Vấn đề giao tiếp' },
    { value: 'inspection_issue', label: 'Vấn đề giám định' },
    { value: 'other', label: 'Lý do khác' }
  ];

  const resolutionOptions = [
    { value: 'refund', label: 'Hoàn tiền' },
    { value: 'replacement', label: 'Thay thế sản phẩm' },
    { value: 'repair', label: 'Sửa chữa' },
    { value: 'partial_refund', label: 'Hoàn tiền một phần' },
    { value: 'other', label: 'Giải pháp khác' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Khiếu nại / Tranh chấp</h1>
          <p className="text-muted-foreground">Báo cáo vấn đề với giao dịch</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông tin giao dịch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{order.listing.title}</h3>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {order.listing.container.sizeFt}ft {order.listing.container.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Tình trạng: {order.listing.container.condition}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Người bán: {order.seller.orgUsers[0]?.org.name || order.seller.displayName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Chi tiết khiếu nại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Lý do khiếu nại *</Label>
                  <Select 
                    value={formData.reason} 
                    onValueChange={(value) => handleInputChange('reason', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lý do khiếu nại" />
                    </SelectTrigger>
                    <SelectContent>
                      {disputeReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả chi tiết vấn đề *</Label>
                  <Textarea
                    id="description"
                    placeholder="Hãy mô tả chi tiết vấn đề bạn gặp phải..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolutionRequest">Đề xuất giải pháp *</Label>
                  <Textarea
                    id="resolutionRequest"
                    placeholder="Bạn muốn giải quyết vấn đề này như thế nào?"
                    value={formData.resolutionRequest}
                    onChange={(e) => handleInputChange('resolutionRequest', e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evidence Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bằng chứng
                </CardTitle>
                <CardDescription>
                  Tải lên hình ảnh, tài liệu liên quan đến vấn đề
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Kéo thả file hoặc click để chọn
                    </p>
                    <p className="text-xs text-gray-500">
                      Hỗ trợ: JPG, PNG, PDF (tối đa 10MB mỗi file)
                    </p>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="mt-4"
                  />
                </div>

                {formData.evidence.length > 0 && (
                  <div className="space-y-2">
                    <Label>File đã chọn:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.evidence.map((file, index) => (
                        <Badge key={index} variant="outline">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>
                  Thông tin để chúng tôi liên hệ về việc xử lý khiếu nại
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Tên người liên hệ *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactInfo.name}
                      onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Số điện thoại *</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} size="lg">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dispute Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quy trình xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">1</div>
                    <div>
                      <p className="text-sm font-medium">Tiếp nhận khiếu nại</p>
                      <p className="text-xs text-muted-foreground">Trong vòng 24h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">2</div>
                    <div>
                      <p className="text-sm font-medium">Xem xét và điều tra</p>
                      <p className="text-xs text-muted-foreground">3-5 ngày làm việc</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">3</div>
                    <div>
                      <p className="text-sm font-medium">Đề xuất giải pháp</p>
                      <p className="text-xs text-muted-foreground">Liên hệ các bên liên quan</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">4</div>
                    <div>
                      <p className="text-sm font-medium">Giải quyết</p>
                      <p className="text-xs text-muted-foreground">Thực hiện giải pháp</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Lưu ý quan trọng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-orange-700">
                <p>• Hãy cung cấp thông tin chính xác và đầy đủ</p>
                <p>• Bằng chứng rõ ràng sẽ giúp xử lý nhanh hơn</p>
                <p>• Chúng tôi cam kết xử lý công bằng và minh bạch</p>
                <p>• Có thể liên hệ trực tiếp qua hotline: 1900-xxxx</p>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Hỗ trợ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Cần hỗ trợ thêm về quy trình khiếu nại?
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Liên hệ hỗ trợ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

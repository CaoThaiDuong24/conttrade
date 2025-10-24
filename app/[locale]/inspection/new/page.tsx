"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Clock,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  User
} from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { apiClient } from '@/lib/api';

interface Listing {
  id: string;
  title: string;
  container: {
    sizeFt: number;
    type: string;
    condition: string;
    serialNo: string;
  };
  locationDepot: {
    id: string;
    name: string;
    address: string;
  };
  seller: {
    displayName: string;
    orgUsers: Array<{
      org: {
        name: string;
      };
    }>;
  };
}

interface InspectionRequest {
  listingId: string;
  standard: string;
  scheduledAt: string;
  specialRequirements: string;
  services: {
    visual: boolean;
    structural: boolean;
    functional: boolean;
    documentation: boolean;
  };
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function NewInspectionPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotificationContext();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<InspectionRequest>({
    listingId: '',
    standard: 'CSC',
    scheduledAt: '',
    specialRequirements: '',
    services: {
      visual: true,
      structural: false,
      functional: false,
      documentation: false
    },
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const listingId = searchParams.get('listingId');

  useEffect(() => {
    if (listingId) {
      fetchListingDetail();
      setFormData(prev => ({ ...prev, listingId }));
    }
  }, [listingId]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3006/api/v1/listings/${listingId}`);
      const data = await response.json();
      
      console.log('Inspection - Listing API response:', data);
      
      if (data.success && data.data && data.data.listing) {
        const apiListing = data.data.listing;
        
        setListing({
          id: apiListing.id,
          title: apiListing.title,
          container: {
            sizeFt: apiListing.facets?.find((f: any) => f.key === 'size')?.value || 'N/A',
            type: apiListing.facets?.find((f: any) => f.key === 'type')?.value || 'N/A',
            condition: apiListing.facets?.find((f: any) => f.key === 'condition')?.value || 'N/A',
            serialNo: apiListing.container?.serialNumber || 'N/A'
          },
          locationDepot: {
            id: apiListing.locationDepotId || '',
            name: apiListing.locationDepot?.name || 'N/A',
            address: apiListing.locationDepot?.address || ''
          },
          seller: {
            displayName: apiListing.seller?.displayName || 'N/A',
            orgUsers: apiListing.seller?.orgUsers || []
          }
        });
      } else {
        showError('Không tìm thấy tin đăng');
      }
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      showError(error.message || 'Không thể tải thông tin tin đăng');
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

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduledAt) {
      showError('Vui lòng chọn thời gian giám định');
      return;
    }

    if (!formData.contactInfo.name || !formData.contactInfo.phone) {
      showError('Vui lòng điền đầy đủ thông tin liên hệ');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement API call
      // await apiClient.createInspectionRequest(formData);
      showSuccess('Yêu cầu giám định đã được gửi thành công');
      router.push('/depot/inspections');
    } catch (error) {
      console.error('Error submitting inspection request:', error);
      showError('Không thể gửi yêu cầu giám định');
    } finally {
      setSubmitting(false);
    }
  };

  const inspectionStandards = [
    { value: 'CSC', label: 'CSC (Container Safety Convention)' },
    { value: 'IMO', label: 'IMO (International Maritime Organization)' },
    { value: 'ISO', label: 'ISO (International Organization for Standardization)' },
    { value: 'CUSTOM', label: 'Tiêu chuẩn tùy chỉnh' }
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

  if (!listing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy container</h1>
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
          <h1 className="text-3xl font-bold">Yêu cầu giám định</h1>
          <p className="text-muted-foreground">Tạo yêu cầu giám định container</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Container Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông tin Container
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{listing.title}</h3>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {listing.container.sizeFt}ft {listing.container.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Tình trạng: {listing.container.condition}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Số serial: {listing.container.serialNo}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Vị trí: {listing.locationDepot.name}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Người bán:</span>
                  <span>{listing.seller.orgUsers[0]?.org.name || listing.seller.displayName}</span>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Chi tiết giám định
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="standard">Tiêu chuẩn giám định</Label>
                    <Select 
                      value={formData.standard} 
                      onValueChange={(value) => handleInputChange('standard', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tiêu chuẩn" />
                      </SelectTrigger>
                      <SelectContent>
                        {inspectionStandards.map((standard) => (
                          <SelectItem key={standard.value} value={standard.value}>
                            {standard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Thời gian giám định</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Yêu cầu đặc biệt</Label>
                  <Textarea
                    id="specialRequirements"
                    placeholder="Mô tả các yêu cầu đặc biệt cho việc giám định..."
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inspection Services */}
            <Card>
              <CardHeader>
                <CardTitle>Dịch vụ giám định</CardTitle>
                <CardDescription>
                  Chọn các dịch vụ giám định bạn cần
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="visual"
                      checked={formData.services.visual}
                      onCheckedChange={(checked) => handleServiceChange('visual', checked as boolean)}
                    />
                    <Label htmlFor="visual">Giám định thị giác</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="structural"
                      checked={formData.services.structural}
                      onCheckedChange={(checked) => handleServiceChange('structural', checked as boolean)}
                    />
                    <Label htmlFor="structural">Kiểm tra cấu trúc</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="functional"
                      checked={formData.services.functional}
                      onCheckedChange={(checked) => handleServiceChange('functional', checked as boolean)}
                    />
                    <Label htmlFor="functional">Kiểm tra chức năng</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="documentation"
                      checked={formData.services.documentation}
                      onCheckedChange={(checked) => handleServiceChange('documentation', checked as boolean)}
                    />
                    <Label htmlFor="documentation">Kiểm tra tài liệu</Label>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-blue-900">Lưu ý về dịch vụ</h4>
                      <p className="text-sm text-blue-800">
                        Giám định thị giác là bắt buộc cho tất cả yêu cầu. 
                        Các dịch vụ khác sẽ có phí bổ sung.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>
                  Thông tin để liên hệ về việc giám định
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
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu giám định'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inspection Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quy trình giám định
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">1</div>
                    <div>
                      <p className="text-sm font-medium">Gửi yêu cầu</p>
                      <p className="text-xs text-muted-foreground">Tạo yêu cầu giám định</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">2</div>
                    <div>
                      <p className="text-sm font-medium">Xác nhận lịch</p>
                      <p className="text-xs text-muted-foreground">Xác nhận thời gian và địa điểm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">3</div>
                    <div>
                      <p className="text-sm font-medium">Thực hiện giám định</p>
                      <p className="text-xs text-muted-foreground">Chuyên gia đến giám định</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center font-medium">4</div>
                    <div>
                      <p className="text-sm font-medium">Báo cáo kết quả</p>
                      <p className="text-xs text-muted-foreground">Nhận báo cáo giám định</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin phí</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Giám định thị giác:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kiểm tra cấu trúc:</span>
                  <span className="font-medium">500,000 VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kiểm tra chức năng:</span>
                  <span className="font-medium">300,000 VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kiểm tra tài liệu:</span>
                  <span className="font-medium">200,000 VND</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Tổng dự kiến:</span>
                  <span className="text-green-600">1,000,000 VND</span>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Cần hỗ trợ về việc giám định?
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

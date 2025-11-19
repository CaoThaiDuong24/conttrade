"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  Package,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';

interface InspectionReport {
  id: string;
  inspectionNumber: string;
  containerId: string;
  containerNumber: string;
  containerType: string;
  size: string;
  
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  scheduledDate: string;
  completedDate?: string;
  
  depot: {
    name: string;
    location: string;
  };
  
  inspector: {
    name: string;
    email: string;
    certifications: string[];
  };
  
  requester: {
    name: string;
    email: string;
    role: string;
  };
  
  findings: {
    overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
    structuralIntegrity: number; // 0-100
    weatherTightness: number;
    doorOperation: number;
    floorCondition: number;
    
    damages: {
      type: string;
      severity: 'minor' | 'moderate' | 'major';
      location: string;
      description: string;
      image?: string;
    }[];
    
    recommendations: string[];
    estimatedRepairCost?: number;
  };
  
  photos: {
    category: string;
    url: string;
    caption?: string;
  }[];
  
  certification: {
    isCertified: boolean;
    certificateNumber?: string;
    validUntil?: string;
    standard: string;
  };
  
  cost: number;
  currency: string;
  
  createdAt: string;
}

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<InspectionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const inspectionId = params.id as string;

  useEffect(() => {
    if (inspectionId) {
      fetchInspection();
    }
  }, [inspectionId]);

  const fetchInspection = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/inspections/${inspectionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInspection(data.data.inspection);
      }
    } catch (error) {
      console.error('Error fetching inspection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      scheduled: { variant: 'secondary' as const, icon: Clock, label: 'Đã đặt lịch' },
      in_progress: { variant: 'default' as const, icon: Search, label: 'Đang kiểm tra' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Hoàn thành' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: 'Đã hủy' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.scheduled;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const config = {
      excellent: { variant: 'default' as const, label: 'Xuất sắc', color: 'text-green-600' },
      good: { variant: 'default' as const, label: 'Tốt', color: 'text-blue-600' },
      fair: { variant: 'secondary' as const, label: 'Trung bình', color: 'text-yellow-600' },
      poor: { variant: 'destructive' as const, label: 'Kém', color: 'text-red-600' },
    };

    const { variant, label } = config[condition as keyof typeof config] || config.fair;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      minor: { variant: 'outline' as const, label: 'Nhỏ' },
      moderate: { variant: 'secondary' as const, label: 'Vừa' },
      major: { variant: 'destructive' as const, label: 'Nghiêm trọng' },
    };

    const { variant, label } = config[severity as keyof typeof config] || config.minor;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Không tìm thấy báo cáo giám định</h3>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-8 w-8 text-primary" />
              Báo cáo giám định #{inspection.inspectionNumber}
            </h1>
            <p className="text-muted-foreground">
              Container: {inspection.containerNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(inspection.status)}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Tải PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Container Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin container</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Số container</Label>
                <div className="font-medium">{inspection.containerNumber}</div>
              </div>
              <div>
                <Label>Loại container</Label>
                <div>{inspection.containerType}</div>
              </div>
              <div>
                <Label>Kích thước</Label>
                <div>{inspection.size}</div>
              </div>
              <div>
                <Label>Depot</Label>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {inspection.depot.name}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Kết quả giám định</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Condition */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Tình trạng tổng quan</h4>
                  {getConditionBadge(inspection.findings.overallCondition)}
                </div>
                
                {/* Scores */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kết cấu (Structural Integrity)</span>
                      <span className={`font-semibold ${getScoreColor(inspection.findings.structuralIntegrity)}`}>
                        {inspection.findings.structuralIntegrity}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inspection.findings.structuralIntegrity >= 80 ? 'bg-green-600' :
                          inspection.findings.structuralIntegrity >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${inspection.findings.structuralIntegrity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chống thấm nước (Weather Tightness)</span>
                      <span className={`font-semibold ${getScoreColor(inspection.findings.weatherTightness)}`}>
                        {inspection.findings.weatherTightness}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inspection.findings.weatherTightness >= 80 ? 'bg-green-600' :
                          inspection.findings.weatherTightness >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${inspection.findings.weatherTightness}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hoạt động cửa (Door Operation)</span>
                      <span className={`font-semibold ${getScoreColor(inspection.findings.doorOperation)}`}>
                        {inspection.findings.doorOperation}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inspection.findings.doorOperation >= 80 ? 'bg-green-600' :
                          inspection.findings.doorOperation >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${inspection.findings.doorOperation}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sàn container (Floor Condition)</span>
                      <span className={`font-semibold ${getScoreColor(inspection.findings.floorCondition)}`}>
                        {inspection.findings.floorCondition}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inspection.findings.floorCondition >= 80 ? 'bg-green-600' :
                          inspection.findings.floorCondition >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${inspection.findings.floorCondition}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Damages */}
              {inspection.findings.damages.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Hư hỏng phát hiện ({inspection.findings.damages.length})</h4>
                  <div className="space-y-3">
                    {inspection.findings.damages.map((damage, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{damage.type}</span>
                            {getSeverityBadge(damage.severity)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {damage.location}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{damage.description}</p>
                        {damage.image && (
                          <div className="mt-2">
                            <img
                              src={damage.image}
                              alt={damage.type}
                              className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedImage(damage.image!)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Recommendations */}
              {inspection.findings.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Khuyến nghị</h4>
                  <ul className="space-y-2">
                    {inspection.findings.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {inspection.findings.estimatedRepairCost && (
                <>
                  <Separator />
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                          Chi phí sửa chữa ước tính
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Dựa trên các hư hỏng phát hiện
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: inspection.currency
                        }).format(inspection.findings.estimatedRepairCost)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh giám định</CardTitle>
              <CardDescription>{inspection.photos.length} ảnh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {inspection.photos.map((photo, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedImage(photo.url)}
                    >
                      <img
                        src={photo.url || '/placeholder.jpg'}
                        alt={photo.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs font-medium">{photo.category}</div>
                    {photo.caption && (
                      <div className="text-xs text-muted-foreground">{photo.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certification */}
          {inspection.certification.isCertified && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Chứng nhận
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Số chứng nhận</Label>
                    <div className="font-medium">{inspection.certification.certificateNumber}</div>
                  </div>
                  <div>
                    <Label>Tiêu chuẩn</Label>
                    <div>{inspection.certification.standard}</div>
                  </div>
                  <div className="col-span-2">
                    <Label>Hiệu lực đến</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {inspection.certification.validUntil && 
                        new Date(inspection.certification.validUntil).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inspector Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Giám định viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{inspection.inspector.name}</div>
                <div className="text-sm text-muted-foreground">{inspection.inspector.email}</div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs">Chứng chỉ</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {inspection.inspector.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Người yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="font-medium">{inspection.requester.name}</div>
                <div className="text-sm text-muted-foreground">{inspection.requester.email}</div>
              </div>
              <Badge variant="outline">{inspection.requester.role}</Badge>
            </CardContent>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch trình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Ngày đặt lịch</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(inspection.scheduledDate).toLocaleString('vi-VN')}
                </div>
              </div>
              {inspection.completedDate && (
                <div>
                  <Label className="text-xs">Ngày hoàn thành</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {new Date(inspection.completedDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi phí giám định</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: inspection.currency
                }).format(inspection.cost)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Inspection"
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="outline"
            className="absolute top-4 right-4"
            onClick={() => setSelectedImage(null)}
          >
            Đóng
          </Button>
        </div>
      )}
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-xs font-medium text-muted-foreground mb-1 ${className}`}>{children}</div>;
}


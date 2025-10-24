"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  FileText,
  Download,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'user' | 'marketplace';
  icon: any;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'financial_summary',
    name: 'Báo cáo tài chính tổng hợp',
    description: 'Doanh thu, chi phí, lợi nhuận theo thời gian',
    category: 'financial',
    icon: DollarSign,
  },
  {
    id: 'transaction_report',
    name: 'Báo cáo giao dịch',
    description: 'Chi tiết tất cả giao dịch thanh toán',
    category: 'financial',
    icon: TrendingUp,
  },
  {
    id: 'user_activity',
    name: 'Báo cáo hoạt động người dùng',
    description: 'Đăng ký, đăng nhập, hành động người dùng',
    category: 'user',
    icon: Users,
  },
  {
    id: 'user_kyc',
    name: 'Báo cáo KYC/KYB',
    description: 'Trạng thái xác thực người dùng',
    category: 'user',
    icon: CheckCircle,
  },
  {
    id: 'order_summary',
    name: 'Báo cáo đơn hàng',
    description: 'Tổng hợp đơn hàng theo trạng thái, sản phẩm',
    category: 'operational',
    icon: ShoppingCart,
  },
  {
    id: 'listing_performance',
    name: 'Báo cáo hiệu quả tin đăng',
    description: 'Lượt xem, conversion rate của listings',
    category: 'marketplace',
    icon: Package,
  },
  {
    id: 'rfq_analytics',
    name: 'Báo cáo RFQ & Quote',
    description: 'Phân tích RFQ, tỷ lệ thành công',
    category: 'marketplace',
    icon: FileText,
  },
  {
    id: 'depot_utilization',
    name: 'Báo cáo tận dụng Depot',
    description: 'Công suất sử dụng kho bãi',
    category: 'operational',
    icon: Package,
  },
];

export default function AdminReportsPage() {
  const { showSuccess, showError, showInfo } = useNotificationContext();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (templateId: string) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      showError('Vui lòng chọn khoảng thời gian');
      return;
    }

    setIsGenerating(true);
    setSelectedTemplate(templateId);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${templateId}_${Date.now()}.pdf`;
        a.click();
        
        showSuccess('Báo cáo đã được tạo và tải xuống');
      } else {
        showError('Không thể tạo báo cáo');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showError('Có lỗi xảy ra khi tạo báo cáo');
    } finally {
      setIsGenerating(false);
      setSelectedTemplate(null);
    }
  };

  const groupedTemplates = REPORT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const getCategoryLabel = (category: string) => {
    const labels = {
      financial: 'Tài chính',
      operational: 'Vận hành',
      user: 'Người dùng',
      marketplace: 'Marketplace',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Báo cáo hệ thống
        </h1>
        <p className="text-muted-foreground mt-1">
          Tạo và tải báo cáo theo các mẫu có sẵn
        </p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chọn khoảng thời gian</CardTitle>
          <CardDescription>Dữ liệu báo cáo sẽ dựa trên khoảng thời gian này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Từ ngày <span className="text-red-500">*</span>
              </Label>
              <input
                id="startDate"
                type="date"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Đến ngày <span className="text-red-500">*</span>
              </Label>
              <input
                id="endDate"
                type="date"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="financial">Tài chính</TabsTrigger>
          <TabsTrigger value="operational">Vận hành</TabsTrigger>
          <TabsTrigger value="user">Người dùng</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3">{getCategoryLabel(category)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card key={template.id} className="hover:border-primary transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <CardDescription className="text-sm">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
                            className="w-full"
                            variant={selectedTemplate === template.id ? 'default' : 'outline'}
                          >
                            {selectedTemplate === template.id && isGenerating ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Tạo báo cáo
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {['financial', 'operational', 'user', 'marketplace'].map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTemplates[category]?.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleGenerateReport(template.id)}
                        disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
                        className="w-full"
                        variant={selectedTemplate === template.id ? 'default' : 'outline'}
                      >
                        {selectedTemplate === template.id && isGenerating ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Tạo báo cáo
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}


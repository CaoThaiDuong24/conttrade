"use client";

import { useState, useEffect } from 'react';
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText,
  Search,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Package,
  MapPin,
  Filter
} from 'lucide-react';

interface InspectionReport {
  id: string;
  inspectionNumber: string;
  containerNumber: string;
  containerType: string;
  size: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  damagesCount: number;
  depotName: string;
  inspectorName: string;
  scheduledDate: string;
  completedDate?: string;
  isCertified: boolean;
}

export default function InspectionReportsPage() {
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/inspections/reports`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.depotName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      scheduled: { variant: 'secondary' as const, icon: Clock, label: 'Đã lên lịch' },
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
      excellent: { variant: 'default' as const, label: 'Xuất sắc', color: 'bg-green-600' },
      good: { variant: 'default' as const, label: 'Tốt', color: 'bg-blue-600' },
      fair: { variant: 'secondary' as const, label: 'TB', color: 'bg-yellow-600' },
      poor: { variant: 'destructive' as const, label: 'Kém', color: 'bg-red-600' },
    };

    const { variant, label } = config[condition as keyof typeof config] || config.fair;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Báo cáo giám định
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả báo cáo giám định container
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang tiến hành</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter(r => r.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chứng nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.isCertified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo số container, mã báo cáo, depot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="in_progress">Đang kiểm tra</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo</CardTitle>
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${filteredReports.length} báo cáo`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có báo cáo nào</h3>
              <p className="text-muted-foreground">
                Chưa có báo cáo giám định nào
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Báo cáo</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Giám định viên</TableHead>
                  <TableHead>Depot</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{report.inspectionNumber}</div>
                        {report.isCertified && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã chứng nhận
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.containerNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {report.containerType} • {report.size}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getConditionBadge(report.overallCondition)}
                      {report.damagesCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {report.damagesCount} hư hỏng
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{report.inspectorName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {report.depotName}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {report.completedDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(report.completedDate).toLocaleDateString('vi-VN')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(report.scheduledDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/inspection/${report.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Link>
                        </Button>
                        {report.status === 'completed' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  Shield, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  AlertTriangle,
  Download,
  ZoomIn,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

interface KYCSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  type: 'individual' | 'business';
  status: 'pending' | 'approved' | 'rejected' | 'need_more_info';
  documents: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  // Individual KYC
  idType?: 'cccd' | 'passport' | 'driver_license';
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  // Business KYC
  businessName?: string;
  taxCode?: string;
  businessLicense?: string;
  representativeName?: string;
}

export default function AdminKYCPage() {
  const { showSuccess, showError } = useNotificationContext();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKYCSubmissions();
  }, []);

  const fetchKYCSubmissions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/kyc/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    if (!confirm('Bạn có chắc muốn phê duyệt KYC này?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/kyc/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId ? { ...s, status: 'approved' as const } : s
        ));
        showSuccess('Đã phê duyệt KYC thành công');
        setIsDetailDialogOpen(false);
      } else {
        showError('Không thể phê duyệt KYC');
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      showError('Có lỗi xảy ra');
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      showError('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/kyc/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId ? { ...s, status: 'rejected' as const, rejectionReason } : s
        ));
        showSuccess('Đã từ chối KYC');
        setRejectionReason('');
        setIsRejectDialogOpen(false);
        setIsDetailDialogOpen(false);
      } else {
        showError('Không thể từ chối KYC');
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      showError('Có lỗi xảy ra');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sub.idNumber && sub.idNumber.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesType = typeFilter === 'all' || sub.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Chờ duyệt' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Đã duyệt' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Từ chối' },
      need_more_info: { variant: 'outline' as const, icon: AlertTriangle, label: 'Cần bổ sung' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'individual' ? (
      <Badge variant="outline">
        <User className="h-3 w-3 mr-1" />
        Cá nhân
      </Badge>
    ) : (
      <Badge variant="outline">
        <Building className="h-3 w-3 mr-1" />
        Doanh nghiệp
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Xét duyệt KYC/KYB
        </h1>
        <p className="text-muted-foreground mt-1">
          Xác thực danh tính người dùng và doanh nghiệp
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => s.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần bổ sung</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'need_more_info').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số CCCD..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="individual">Cá nhân</option>
                <option value="business">Doanh nghiệp</option>
              </select>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="need_more_info">Cần bổ sung</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu xác thực</CardTitle>
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${filteredSubmissions.length} yêu cầu`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có yêu cầu nào</h3>
              <p className="text-muted-foreground">
                Chưa có yêu cầu xác thực nào cần xử lý
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Thông tin</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.userName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submission.userEmail}
                        </div>
                        {submission.userPhone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {submission.userPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(submission.type)}</TableCell>
                    <TableCell>
                      {submission.type === 'individual' ? (
                        <div className="text-sm">
                          <div><strong>CCCD/Passport:</strong> {submission.idNumber || 'N/A'}</div>
                          <div className="text-muted-foreground">{submission.fullName}</div>
                          <div className="text-xs text-muted-foreground">{submission.dateOfBirth}</div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div><strong>MST:</strong> {submission.taxCode || 'N/A'}</div>
                          <div className="text-muted-foreground">{submission.businessName}</div>
                          <div className="text-xs text-muted-foreground">
                            Đại diện: {submission.representativeName}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {submission.documents.length} file
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Chi tiết xác thực KYC
            </DialogTitle>
            <DialogDescription>
              Xem xét thông tin và tài liệu để phê duyệt hoặc từ chối
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin người dùng</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Họ tên</Label>
                    <div className="text-sm font-medium">
                      {selectedSubmission.type === 'individual' 
                        ? selectedSubmission.fullName 
                        : selectedSubmission.representativeName}
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="text-sm">{selectedSubmission.userEmail}</div>
                  </div>
                  {selectedSubmission.type === 'individual' ? (
                    <>
                      <div>
                        <Label>Số CCCD/Passport</Label>
                        <div className="text-sm font-medium">{selectedSubmission.idNumber}</div>
                      </div>
                      <div>
                        <Label>Ngày sinh</Label>
                        <div className="text-sm">{selectedSubmission.dateOfBirth}</div>
                      </div>
                      <div className="col-span-2">
                        <Label>Địa chỉ</Label>
                        <div className="text-sm">{selectedSubmission.address}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Tên doanh nghiệp</Label>
                        <div className="text-sm font-medium">{selectedSubmission.businessName}</div>
                      </div>
                      <div>
                        <Label>Mã số thuế</Label>
                        <div className="text-sm">{selectedSubmission.taxCode}</div>
                      </div>
                      <div className="col-span-2">
                        <Label>Số ĐKKD</Label>
                        <div className="text-sm">{selectedSubmission.businessLicense}</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tài liệu đính kèm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedSubmission.documents.map((doc, index) => (
                      <div key={index} className="space-y-2">
                        <div className="text-sm font-medium">{doc.type}</div>
                        <div
                          className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(doc.url)}
                        >
                          <img
                            src={doc.url || '/placeholder.jpg'}
                            alt={doc.type}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tải lên: {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Checklist */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                    Checklist xác thực
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Ảnh chụp rõ ràng, không mờ
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Thông tin trên giấy tờ khớp với khai báo
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Giấy tờ còn hiệu lực (chưa hết hạn)
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Địa chỉ hợp lệ và có thể xác minh
                  </div>
                  {selectedSubmission.type === 'business' && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Giấy phép kinh doanh hợp lệ
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSubmission(selectedSubmission);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối xác thực KYC</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối để người dùng biết và bổ sung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Lý do từ chối <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejectionReason"
                placeholder="VD: Ảnh CCCD không rõ ràng, cần chụp lại..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedSubmission && handleReject(selectedSubmission.id)}
                disabled={!rejectionReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Xem tài liệu</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <img
              src={selectedImage || ''}
              alt="Document"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <a href={selectedImage || ''} download target="_blank">
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle2, XCircle, AlertCircle, FileText, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  application_code: string;
  business_name: string;
  business_type: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  required_info: string | null;
  created_at: string;
  application_logs: ApplicationLog[];
}

interface ApplicationLog {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  performed_by: string;
  performed_by_role: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-500', icon: FileText },
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-500', icon: Clock },
  UNDER_REVIEW: { label: 'Đang thẩm định', color: 'bg-blue-500', icon: Clock },
  INFO_REQUIRED: { label: 'Cần bổ sung', color: 'bg-orange-500', icon: AlertCircle },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-500', icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối', color: 'bg-red-500', icon: XCircle }
};

export default function SellerApplicationStatusPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    } else {
      fetchMyApplications();
    }
  }, [applicationId]);
  
  const fetchApplication = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller-applications/${applicationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch application');
      
      const data = await response.json();
      setApplication(data.data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller-applications/my`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      if (data.data.applications.length > 0) {
        setApplication(data.data.applications[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (error || !application) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn đăng ký</h3>
              <p className="text-gray-600 mb-4">
                {error || 'Bạn chưa có đơn đăng ký nào'}
              </p>
              <Link href="/vi/become-seller">
                <Button>Đăng ký ngay</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const statusConfig = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trạng thái đơn đăng ký</h1>
        <p className="text-gray-600">
          Theo dõi tiến độ xử lý đơn đăng ký của bạn
        </p>
      </div>
      
      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {application.business_name}
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                Mã đơn: <span className="font-mono font-semibold">{application.application_code}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ngày nộp đơn</p>
              <p className="font-semibold">
                {new Date(application.submitted_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
            {application.reviewed_at && (
              <div>
                <p className="text-gray-500">Ngày xử lý</p>
                <p className="font-semibold">
                  {new Date(application.reviewed_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Required */}
      {application.status === 'INFO_REQUIRED' && application.required_info && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Cần bổ sung thông tin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm whitespace-pre-line">{application.required_info}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⏰ Hạn bổ sung: 7 ngày</strong> từ ngày nhận yêu cầu
              </p>
            </div>
            <Link href={`/vi/become-seller?edit=${application.id}`}>
              <Button>Cập nhật thông tin</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {/* Rejection Reason */}
      {application.status === 'REJECTED' && application.rejection_reason && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="h-5 w-5" />
              Lý do từ chối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm whitespace-pre-line">{application.rejection_reason}</p>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Bạn có thể nộp lại đơn đăng ký sau 7 ngày với thông tin đã được cập nhật.
            </p>
            <Link href="/vi/become-seller">
              <Button variant="outline">Nộp đơn mới</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {/* Success Message */}
      {application.status === 'APPROVED' && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Chúc mừng! Đơn đã được duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-4">
              Tài khoản của bạn đã được nâng cấp lên <strong>Nhà Cung Cấp</strong>. 
              Bạn có thể bắt đầu đăng tin và nhận RFQ ngay bây giờ!
            </p>
            <div className="flex gap-2">
              <Link href="/vi/dashboard/seller">
                <Button>Vào Dashboard Seller</Button>
              </Link>
              <Link href="/vi/sell/create-listing">
                <Button variant="outline">Đăng tin đầu tiên</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử xử lý</CardTitle>
          <CardDescription>
            Theo dõi quá trình xử lý đơn của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {application.application_logs.map((log, index) => {
              const isLast = index === application.application_logs.length - 1;
              
              return (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    {!isLast && <div className="w-0.5 h-full bg-gray-300 mt-1"></div>}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">
                        {log.action === 'CREATED' && 'Đơn được tạo'}
                        {log.action === 'SUBMITTED' && 'Đơn được nộp'}
                        {log.action === 'UPDATED' && 'Đơn được cập nhật'}
                        {log.action === 'REVIEWED' && 'Đơn được xem xét'}
                        {log.action === 'APPROVED' && 'Đơn được duyệt'}
                        {log.action === 'REJECTED' && 'Đơn bị từ chối'}
                        {log.action === 'INFO_REQUESTED' && 'Yêu cầu bổ sung thông tin'}
                        {log.action === 'INFO_SUBMITTED' && 'Đã bổ sung thông tin'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                        {log.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Bởi: {log.performed_by_role === 'admin' ? 'Admin' : 'Bạn'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Support */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cần hỗ trợ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Email</p>
                <a href="mailto:support@i-contexchange.vn" className="text-sm text-blue-600 hover:underline">
                  support@i-contexchange.vn
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Hotline</p>
                <a href="tel:1900xxxx" className="text-sm text-blue-600 hover:underline">
                  1900-xxxx
                </a>
                <p className="text-xs text-gray-500">8:00-18:00, T2-T6</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Vui lòng cung cấp mã đơn <span className="font-mono font-semibold">{application.application_code}</span> khi liên hệ hỗ trợ.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

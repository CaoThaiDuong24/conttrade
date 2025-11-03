"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  AlertTriangle,
  User,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Eye,
  Download,
  Clock
} from 'lucide-react';

interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  reason: string;
  description: string | null;
  evidence_json: any;
  requested_resolution: string | null;
  requested_amount: any;
  priority: string | null;
  resolution: string | null;
  resolution_notes: string | null;
  resolution_amount: any;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  orders: {
    id: string;
    order_number: string;
    status: string;
    total: any;
    currency: string;
    created_at: string;
    buyer_id: string;
    seller_id: string;
    users_orders_buyer_idTousers: {
      id: string;
      display_name: string;
      email: string;
    };
    users_orders_seller_idTousers: {
      id: string;
      display_name: string;
      email: string;
    };
    deliveries: Array<{
      id: string;
      delivery_proof_json: any;
      receipt_data_json: any;
      delivered_at: string | null;
    }>;
  };
  users_disputes_raised_byTousers: {
    id: string;
    display_name: string;
    email: string;
  };
  users_disputes_resolved_byTousers: {
    id: string;
    display_name: string;
    email: string;
  } | null;
  dispute_messages?: Array<{
    id: string;
    message: string;
    sender_id: string;
    is_internal: boolean;
    created_at: string;
    users?: {
      id: string;
      display_name: string;
      email: string;
    };
  }>;
}

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  
  // Resolution form state
  const [resolutionType, setResolutionType] = useState<string>('');
  const [resolutionAmount, setResolutionAmount] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Message state
  const [newMessage, setNewMessage] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  const disputeId = params.id as string;

  useEffect(() => {
    if (disputeId) {
      fetchDispute();
    }
  }, [disputeId]);

  const fetchDispute = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/v1/admin/disputes/${disputeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDispute(data.data);
      }
    } catch (error) {
      console.error('Error fetching dispute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionType) {
      showError('Vui lòng chọn loại giải quyết');
      return;
    }

    if (resolutionType === 'PARTIAL_REFUND' && (!resolutionAmount || parseFloat(resolutionAmount) <= 0)) {
      showError('Vui lòng nhập số tiền hoàn lại');
      return;
    }

    try {
      setIsResolving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/admin/disputes/${disputeId}/resolve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resolution_type: resolutionType,
            resolution_amount: resolutionAmount ? parseFloat(resolutionAmount) : null,
            resolution_notes: resolutionNotes,
            admin_notes: adminNotes,
          }),
        }
      );

      if (response.ok) {
        showSuccess('Đã giải quyết tranh chấp thành công!');
        fetchDispute();
        setResolutionType('');
        setResolutionAmount('');
        setResolutionNotes('');
        setAdminNotes('');
      } else {
        const error = await response.json();
        showError(error.message || 'Không thể giải quyết tranh chấp');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      showError('Có lỗi xảy ra khi giải quyết tranh chấp');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      showError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/v1/admin/disputes/${disputeId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage,
            is_internal: isInternalNote
          }),
        }
      );

      if (response.ok) {
        showSuccess(isInternalNote ? 'Ghi chú nội bộ đã lưu' : 'Đã gửi tin nhắn');
        setNewMessage('');
        setIsInternalNote(false);
        fetchDispute(); // Refresh to show new message
      } else {
        const error = await response.json();
        showError(error.message || 'Không thể gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      OPEN: { 
        className: 'bg-red-50 text-red-700 border-red-300',
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Đang mở' 
      },
      IN_REVIEW: { 
        className: 'bg-blue-50 text-blue-700 border-blue-300',
        icon: <Clock className="h-4 w-4" />,
        label: 'Đang xem xét' 
      },
      RESOLVED: { 
        className: 'bg-green-50 text-green-700 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Đã giải quyết' 
      },
      CLOSED: { 
        className: 'bg-slate-50 text-slate-700 border-slate-300',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Đã đóng' 
      },
      ESCALATED: { 
        className: 'bg-orange-50 text-orange-700 border-orange-300',
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Đã báo cáo' 
      },
    };

    const { className, icon, label } = config[status as keyof typeof config] || config.OPEN;
    return (
      <Badge variant="outline" className={`${className} px-3 py-1.5 text-sm border-2 font-bold`}>
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    const config = {
      LOW: { 
        className: 'bg-slate-50 text-slate-700 border-slate-300',
        label: '🔵 Thấp' 
      },
      MEDIUM: { 
        className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
        label: '🟡 Trung bình' 
      },
      HIGH: { 
        className: 'bg-orange-50 text-orange-700 border-orange-300',
        label: '🟠 Cao' 
      },
      URGENT: { 
        className: 'bg-red-50 text-red-700 border-red-300',
        label: '🔴 Khẩn cấp' 
      },
    };

    const { className, label } = config[(priority || 'MEDIUM') as keyof typeof config] || config.MEDIUM;
    return (
      <Badge variant="outline" className={`${className} px-3 py-1.5 text-sm border-2 font-bold`}>
        {label}
      </Badge>
    );
  };

  const formatPrice = (amount: any, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CREATED: 'Đã tạo',
      PENDING_PAYMENT: 'Chờ thanh toán',
      PAYMENT_PENDING_VERIFICATION: 'Chờ xác minh',
      PAID: 'Đã thanh toán',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
      AWAITING_FUNDS: 'Chờ tiền',
      ESCROW_FUNDED: 'Đã ký quỹ',
      PREPARING_DELIVERY: 'Chuẩn bị giao',
      DOCUMENTS_READY: 'Chứng từ sẵn sàng',
      TRANSPORTATION_BOOKED: 'Đã đặt vận chuyển',
      IN_TRANSIT: 'Đang vận chuyển',
      PAYMENT_RELEASED: 'Đã giải ngân',
      DISPUTED: 'Tranh chấp',
      READY_FOR_PICKUP: 'Sẵn sàng lấy hàng',
      DELIVERING: 'Đang giao hàng'
    };
    return labels[status] || status;
  };

  const getResolutionLabel = (resolution: string | null) => {
    if (!resolution) return 'Chưa giải quyết';
    const labels: Record<string, string> = {
      FULL_REFUND: 'Hoàn tiền 100%',
      PARTIAL_REFUND: 'Hoàn tiền một phần',
      REPLACEMENT: 'Giao hàng thay thế',
      REJECT_DISPUTE: 'Từ chối tranh chấp'
    };
    return labels[resolution] || resolution;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Không tìm thấy tranh chấp</h3>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen overflow-y-auto">
      <div className="w-full px-6 py-6 pb-12">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Chi tiết tranh chấp</h1>
                  <p className="text-sm text-slate-500">
                    Đơn hàng: <span className="font-semibold">#{dispute.orders.order_number}</span> • ID: {dispute.id.slice(0, 12)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(dispute.status)}
              {getPriorityBadge(dispute.priority)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Section */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-blue-600" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã đơn hàng</Label>
                  <div className="text-sm font-mono font-bold">#{dispute.orders.order_number}</div>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Badge variant="outline">{getOrderStatusLabel(dispute.orders.status)}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tổng giá trị</Label>
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(dispute.orders.total, dispute.orders.currency)}
                  </div>
                </div>
                <div>
                  <Label>Ngày tạo đơn</Label>
                  <div className="text-sm">{formatDate(dispute.orders.created_at)}</div>
                </div>
              </div>

              {dispute.orders.deliveries?.[0] && (
                <>
                  <Separator />
                  <div>
                    <Label>Thời gian giao hàng</Label>
                    <div className="text-sm">
                      {dispute.orders.deliveries[0].delivered_at 
                        ? formatDate(dispute.orders.deliveries[0].delivered_at)
                        : 'Chưa giao'}
                    </div>
                  </div>
                  {dispute.orders.deliveries[0].receipt_data_json?.received_at && (
                    <div>
                      <Label>Thời gian buyer nhận hàng</Label>
                      <div className="text-sm">
                        {formatDate(dispute.orders.deliveries[0].receipt_data_json.received_at)}
                      </div>
                    </div>
                  )}
                </>
              )}

              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Người mua</Label>
                  <div className="text-sm font-medium">{dispute.orders.users_orders_buyer_idTousers.display_name}</div>
                  <div className="text-xs text-muted-foreground">{dispute.orders.users_orders_buyer_idTousers.email}</div>
                </div>
                <div>
                  <Label>Người bán</Label>
                  <div className="text-sm font-medium">{dispute.orders.users_orders_seller_idTousers.display_name}</div>
                  <div className="text-xs text-muted-foreground">{dispute.orders.users_orders_seller_idTousers.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Info */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Thông tin tranh chấp
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Người khởi tạo</Label>
                <div className="text-sm font-medium">
                  {dispute.users_disputes_raised_byTousers.display_name}
                  {dispute.raised_by === dispute.orders.buyer_id && ' (Buyer)'}
                  {dispute.raised_by === dispute.orders.seller_id && ' (Seller)'}
                </div>
                <div className="text-xs text-muted-foreground">{dispute.users_disputes_raised_byTousers.email}</div>
              </div>

              <div>
                <Label>Lý do tranh chấp</Label>
                <div className="text-sm font-medium">{dispute.reason}</div>
              </div>

              <div>
                <Label>Mô tả chi tiết vấn đề</Label>
                <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {dispute.description || 'Không có mô tả chi tiết'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số tiền yêu cầu hoàn lại</Label>
                  <div className="text-lg font-bold text-red-600">
                    {dispute.requested_amount ? formatPrice(dispute.requested_amount, dispute.orders.currency) : 'Chưa xác định'}
                  </div>
                </div>
                <div>
                  <Label>Ngày tạo tranh chấp</Label>
                  <div className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(dispute.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <Label>Loại giải quyết yêu cầu</Label>
                <Badge variant="secondary">
                  {getResolutionLabel(dispute.requested_resolution)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Both Parties' Statements */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Phát biểu từ các bên
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Buyer's Statement */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Buyer - {dispute.orders.users_orders_buyer_idTousers.display_name}</span>
                </div>
                <div className="text-sm whitespace-pre-wrap bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                  {dispute.description || dispute.reason}
                  {dispute.evidence_json?.notes && (
                    <>
                      <br /><br />
                      <strong>Ghi chú khi nhận hàng:</strong><br />
                      {dispute.evidence_json.notes}
                    </>
                  )}
                </div>
                {dispute.evidence_json?.condition && (
                  <div className="mt-2">
                    <Badge variant="destructive">
                      Tình trạng: {dispute.evidence_json.condition === 'MAJOR_DAMAGE' ? 'Hư hỏng nghiêm trọng' : dispute.evidence_json.condition}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Seller's Statement (from delivery notes if available) */}
              {dispute.orders.deliveries?.[0]?.delivery_proof_json?.notes && (
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Seller - {dispute.orders.users_orders_seller_idTousers.display_name}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-green-50 dark:bg-green-950/20 p-3 rounded">
                    <strong>Ghi chú khi giao hàng:</strong><br />
                    {dispute.orders.deliveries[0].delivery_proof_json.notes}
                  </div>
                </div>
              )}

              {/* Admin Notes if any */}
              {dispute.admin_notes && (
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Admin Notes (Internal)</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                    {dispute.admin_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Comparison Evidence */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="h-5 w-5 text-red-600" />
                So sánh ảnh bằng chứng
              </CardTitle>
              <CardDescription className="mt-2 text-slate-600">
                So sánh ảnh trước khi giao (Seller) và khi nhận (Buyer)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seller's delivery photos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-sm text-green-900 dark:text-green-100">
                        Ảnh từ Seller (trước khi giao)
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        {dispute.orders.deliveries?.[0]?.delivered_at 
                          ? formatDate(dispute.orders.deliveries[0].delivered_at)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {dispute.orders.deliveries?.[0]?.delivery_proof_json?.photos?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {dispute.orders.deliveries[0].delivery_proof_json.photos.map((photo: string, index: number) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg border-2 border-green-300 hover:border-green-500 transition-all shadow-sm hover:shadow-lg">
                          <img
                            src={photo}
                            alt={`Seller delivery ${index + 1}`}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(photo, '_blank')}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-2 px-3 font-semibold">
                            Ảnh {index + 1} - Seller
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded">
                      Không có ảnh từ seller
                    </div>
                  )}

                  {dispute.orders.deliveries?.[0]?.delivery_proof_json?.notes && (
                    <div className="text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      <strong>Ghi chú:</strong> {dispute.orders.deliveries[0].delivery_proof_json.notes}
                    </div>
                  )}
                </div>

                {/* Buyer's receipt photos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                        Ảnh từ Buyer (khi nhận hàng)
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        {dispute.orders.deliveries?.[0]?.receipt_data_json?.received_at 
                          ? formatDate(dispute.orders.deliveries[0].receipt_data_json.received_at)
                          : formatDate(dispute.created_at)}
                      </div>
                    </div>
                  </div>

                  {dispute.evidence_json?.photos?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {dispute.evidence_json.photos.map((photo: string, index: number) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg">
                          <img
                            src={photo}
                            alt={`Buyer evidence ${index + 1}`}
                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(photo, '_blank')}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-2 px-3 font-semibold">
                            Ảnh {index + 1} - Buyer
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded">
                      Không có ảnh bằng chứng
                    </div>
                  )}

                  {dispute.evidence_json?.notes && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      <strong>Ghi chú:</strong> {dispute.evidence_json.notes}
                    </div>
                  )}

                  {dispute.evidence_json?.condition && (
                    <div>
                      <Badge variant="destructive" className="w-full justify-center">
                        {dispute.evidence_json.condition === 'MAJOR_DAMAGE' ? '🔴 Hư hỏng nghiêm trọng' : dispute.evidence_json.condition}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />
              
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-orange-900 dark:text-orange-100">Lưu ý:</strong>{' '}
                    <span className="text-orange-800 dark:text-orange-200">
                      So sánh kỹ ảnh từ cả hai bên để đánh giá chính xác. Click vào ảnh để xem full size.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication / Messages */}
          <Card id="message-section" className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-cyan-600" />
                Trao đổi & Ghi chú
              </CardTitle>
              <CardDescription className="mt-2 text-slate-600">
                Gửi tin nhắn cho buyer/seller hoặc tạo ghi chú nội bộ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Messages List */}
              {dispute.dispute_messages && dispute.dispute_messages.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dispute.dispute_messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.is_internal
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {msg.users?.display_name || 'Admin'}
                          </span>
                          {msg.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              Nội bộ
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có tin nhắn nào
                </p>
              )}

              <Separator />

              {/* New Message Form */}
              {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
                <div className="space-y-3">
                  <Label htmlFor="newMessage">Tin nhắn mới</Label>
                  <Textarea
                    id="newMessage"
                    placeholder="Nhập tin nhắn hoặc yêu cầu thêm thông tin..."
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isInternalNote"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isInternalNote" className="text-sm cursor-pointer">
                        Ghi chú nội bộ (chỉ admin thấy)
                      </Label>
                    </div>

                    <Button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || !newMessage.trim()}
                      size="sm"
                    >
                      {isSendingMessage ? (
                        <>Đang gửi...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Gửi
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution Form */}
          {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
            <Card className="shadow-sm border" id="resolution-section">
              <CardHeader className="border-b bg-green-50">
                <CardTitle className="text-xl text-green-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Giải quyết tranh chấp
                </CardTitle>
                <CardDescription className="mt-2 text-green-700">Chọn phương án giải quyết phù hợp</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Resolution Type Explanation */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Chọn quyết định phù hợp:
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-6 list-disc">
                    <li><strong>Hoàn tiền 100%:</strong> Buyer nhận lại toàn bộ tiền, đơn hàng bị hủy</li>
                    <li><strong>Hoàn tiền một phần:</strong> Buyer nhận lại một phần tiền, seller vẫn giữ một phần</li>
                    <li><strong>Giao hàng thay thế:</strong> Seller gửi container khác, buyer giữ hàng hiện tại hoặc trả lại</li>
                    <li><strong>Từ chối tranh chấp:</strong> Không có hoàn tiền, payment được release cho seller</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolutionType">
                    Loại giải quyết <span className="text-red-500">*</span>
                  </Label>
                  <Select value={resolutionType} onValueChange={setResolutionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương án giải quyết" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_REFUND">
                        💰 Hoàn tiền 100% cho Buyer
                      </SelectItem>
                      <SelectItem value="PARTIAL_REFUND">
                        💵 Hoàn tiền một phần cho Buyer
                      </SelectItem>
                      <SelectItem value="REPLACEMENT">
                        📦 Seller gửi container thay thế
                      </SelectItem>
                      <SelectItem value="REJECT_DISPUTE">
                        ❌ Từ chối tranh chấp - Release payment cho Seller
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {resolutionType && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <strong>Kết quả:</strong>{' '}
                      {resolutionType === 'FULL_REFUND' && (
                        <span className="text-green-600">Buyer nhận lại {formatPrice(dispute.orders.total, dispute.orders.currency)}</span>
                      )}
                      {resolutionType === 'PARTIAL_REFUND' && (
                        <span className="text-blue-600">Buyer nhận lại số tiền bạn nhập bên dưới</span>
                      )}
                      {resolutionType === 'REPLACEMENT' && (
                        <span className="text-orange-600">Đơn hàng chuyển về trạng thái "Ready for Pickup"</span>
                      )}
                      {resolutionType === 'REJECT_DISPUTE' && (
                        <span className="text-red-600">Seller nhận {formatPrice(dispute.orders.total, dispute.orders.currency)}</span>
                      )}
                    </div>
                  </div>
                )}

                {resolutionType === 'PARTIAL_REFUND' && (
                  <div className="space-y-2">
                    <Label htmlFor="refundAmount">
                      Số tiền hoàn lại <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="refundAmount"
                        type="number"
                        placeholder="Nhập số tiền..."
                        value={resolutionAmount}
                        onChange={(e) => setResolutionAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="resolutionNotes">Ghi chú cho người dùng</Label>
                  <Textarea
                    id="resolutionNotes"
                    placeholder="Giải thích quyết định của bạn..."
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Ghi chú nội bộ (không hiển thị cho user)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Ghi chú cho admin..."
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <Separator />

                <Button
                  onClick={handleResolve}
                  disabled={!resolutionType || isResolving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isResolving ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xác nhận giải quyết
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {dispute.resolution && dispute.status === 'RESOLVED' && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Đã giải quyết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Quyết định</Label>
                  <div className="text-sm font-medium">{getResolutionLabel(dispute.resolution)}</div>
                </div>
                {dispute.resolution_amount && (
                  <div>
                    <Label>Số tiền hoàn lại</Label>
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(dispute.resolution_amount, dispute.orders.currency)}
                    </div>
                  </div>
                )}
                {dispute.resolution_notes && (
                  <div>
                    <Label>Ghi chú giải quyết</Label>
                    <div className="text-sm whitespace-pre-wrap p-3 bg-muted rounded">
                      {dispute.resolution_notes}
                    </div>
                  </div>
                )}
                {dispute.admin_notes && (
                  <div>
                    <Label>Ghi chú nội bộ</Label>
                    <div className="text-sm whitespace-pre-wrap p-3 bg-muted rounded">
                      {dispute.admin_notes}
                    </div>
                  </div>
                )}
                {dispute.resolved_at && dispute.users_disputes_resolved_byTousers && (
                  <div className="text-sm text-muted-foreground">
                    Giải quyết bởi: {dispute.users_disputes_resolved_byTousers.display_name} • {' '}
                    {formatDate(dispute.resolved_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Buyer Info */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-blue-50">
              <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                <User className="h-4 w-4" />
                Người mua
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div>
                <div className="font-medium">{dispute.orders.users_orders_buyer_idTousers.display_name}</div>
                <div className="text-sm text-muted-foreground">{dispute.orders.users_orders_buyer_idTousers.email}</div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/admin/users/${dispute.orders.users_orders_buyer_idTousers.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem hồ sơ
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-green-50">
              <CardTitle className="text-base flex items-center gap-2 text-green-900">
                <User className="h-4 w-4" />
                Người bán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <div>
                <div className="font-medium">{dispute.orders.users_orders_seller_idTousers.display_name}</div>
                <div className="text-sm text-muted-foreground">{dispute.orders.users_orders_seller_idTousers.email}</div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/admin/users/${dispute.orders.users_orders_seller_idTousers.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem hồ sơ
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="text-base text-slate-900">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label>Mã đơn hàng</Label>
                <div className="text-sm font-medium">#{dispute.orders.order_number}</div>
              </div>
              <div>
                <Label>Trạng thái đơn hàng</Label>
                <Badge variant="outline" className="text-xs">
                  {getOrderStatusLabel(dispute.orders.status)}
                </Badge>
              </div>
              <div>
                <Label>Tổng giá trị</Label>
                <div className="text-sm font-bold">
                  {formatPrice(dispute.orders.total, dispute.orders.currency)}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/orders/${dispute.orders.id}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Xem đơn hàng
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-purple-50">
              <CardTitle className="text-base text-purple-900">Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const element = document.getElementById('message-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Yêu cầu thêm thông tin
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const element = document.getElementById('message-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Gửi tin nhắn hòa giải
                  </Button>
                  <Separator />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const element = document.getElementById('resolution-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Đưa ra quyết định
                  </Button>
                </>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/orders/${dispute.orders.id}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Xem chi tiết đơn hàng
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Xuất báo cáo PDF
              </Button>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Download className="h-4 w-4 mr-2" />
                Tải xuống toàn bộ hồ sơ
              </Button>
            </CardContent>
          </Card>

          {/* Dispute Timeline */}
          <Card className="shadow-sm border">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Tranh chấp được tạo</div>
                    <div className="text-xs text-muted-foreground">{formatDate(dispute.created_at)}</div>
                  </div>
                </div>
                
                {dispute.status === 'IN_REVIEW' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Đang xem xét</div>
                      <div className="text-xs text-muted-foreground">Hiện tại</div>
                    </div>
                  </div>
                )}

                {dispute.resolved_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Đã giải quyết</div>
                      <div className="text-xs text-muted-foreground">{formatDate(dispute.resolved_at)}</div>
                      {dispute.users_disputes_resolved_byTousers && (
                        <div className="text-xs text-muted-foreground">
                          Bởi: {dispute.users_disputes_resolved_byTousers.display_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}


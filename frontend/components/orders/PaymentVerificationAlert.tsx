"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface PaymentVerificationAlertProps {
  order: {
    id: string;
    total: number;
    currency: string;
    order_number?: string;
  };
  onVerify: (verified: boolean, notes?: string) => Promise<void>;
}

export function PaymentVerificationAlert({ order, onVerify }: PaymentVerificationAlertProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onVerify(true, notes || 'Đã nhận đủ tiền');
      setShowConfirmModal(false);
      setNotes('');
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setLoading(true);
    try {
      await onVerify(false, notes);
      setShowRejectModal(false);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              Buyer đã thanh toán - Cần xác nhận
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Buyer đã xác nhận thanh toán <span className="font-bold">{formatPrice(order.total)} {order.currency}</span> cho đơn hàng{' '}
              <span className="font-mono font-semibold">#{order.order_number || order.id.slice(-8).toUpperCase()}</span>.
            </p>
            <p className="text-sm text-amber-700 mb-5">
              Vui lòng kiểm tra tài khoản ngân hàng của bạn và xác nhận đã nhận được tiền.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setShowConfirmModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Xác nhận đã nhận tiền
              </Button>
              
              <Button 
                onClick={() => setShowRejectModal(true)}
                variant="destructive"
                className="shadow-md"
              >
                <X className="mr-2 h-4 w-4" />
                Chưa nhận được tiền
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Xác nhận đã nhận tiền
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Bạn xác nhận đã nhận được <span className="font-bold text-green-600">{formatPrice(order.total)} {order.currency}</span> từ buyer?
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirm-notes" className="text-sm font-medium text-gray-700">
                  Ghi chú (tùy chọn)
                </Label>
                <Textarea
                  id="confirm-notes"
                  placeholder="VD: Đã nhận đủ tiền vào TK ***1234 lúc 15:30 ngày 21/10/2025"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái "Đã thanh toán" và bạn có thể bắt đầu chuẩn bị hàng.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <AlertDialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Từ chối thanh toán
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Bạn chưa nhận được <span className="font-bold text-red-600">{formatPrice(order.total)} {order.currency}</span> từ buyer?
              </p>
              <div className="space-y-2">
                <Label htmlFor="reject-notes" className="text-sm font-medium text-gray-700">
                  Lý do từ chối <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-notes"
                  placeholder="VD: Chưa thấy tiền về TK ***1234, vui lòng kiểm tra lại số TK hoặc gửi lại chứng từ chuyển khoản"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-gray-500">
                  Vui lòng mô tả rõ lý do để buyer có thể kiểm tra và thanh toán lại.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ Sau khi từ chối, đơn hàng sẽ quay về trạng thái "Chờ thanh toán" và buyer sẽ nhận được thông báo với lý do từ chối.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={loading || !notes.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Đang xử lý...' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

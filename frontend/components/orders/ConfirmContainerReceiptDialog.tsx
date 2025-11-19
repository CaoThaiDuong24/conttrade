"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, User, AlertTriangle } from 'lucide-react';
import { useNotificationContext } from '@/components/providers/notification-provider';

interface ConfirmContainerReceiptDialogProps {
  isOpen: boolean;
  deliveryId: string;
  containerId: string;
  containerCode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ConfirmContainerReceiptDialog({
  isOpen,
  deliveryId,
  containerId,
  containerCode,
  onSuccess,
  onClose
}: ConfirmContainerReceiptDialogProps) {
  const [loading, setLoading] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [condition, setCondition] = useState<'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE'>('GOOD');
  const [notes, setNotes] = useState('');

  const { showSuccess, showError } = useNotificationContext();

  const handleSubmit = async () => {
    // Validation
    if (!receivedBy.trim()) {
      showError('Vui lòng nhập tên người nhận');
      return;
    }

    if (condition !== 'GOOD' && !notes.trim()) {
      showError('Vui lòng ghi chú tình trạng container');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `/api/v1/deliveries/${deliveryId}/containers/${containerId}/confirm-receipt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receivedBy,
            condition,
            notes: notes || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm receipt');
      }

      const result = await response.json();
      showSuccess(result.message || 'Đã xác nhận nhận container thành công');
      onSuccess();
    } catch (error: any) {
      console.error('Error confirming container receipt:', error);
      showError(error.message || 'Failed to confirm receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Xác nhận nhận container
          </DialogTitle>
          <DialogDescription>
            Container: <span className="font-mono font-semibold">{containerCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Received By */}
          <div className="space-y-2">
            <Label htmlFor="received-by" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Người nhận hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="received-by"
              placeholder="Họ và tên người nhận"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
            />
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Tình trạng container <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={condition} onValueChange={(value: any) => setCondition(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="GOOD" id="good" />
                <Label htmlFor="good" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Tốt - Không có vấn đề</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="MINOR_DAMAGE" id="minor" />
                <Label htmlFor="minor" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Hư hỏng nhẹ</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="MAJOR_DAMAGE" id="major" />
                <Label htmlFor="major" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Hư hỏng nặng</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Ghi chú {condition !== 'GOOD' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                condition === 'GOOD'
                  ? 'Ghi chú thêm (không bắt buộc)'
                  : 'Mô tả chi tiết tình trạng container...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            {condition !== 'GOOD' && (
              <p className="text-xs text-red-500">
                * Bắt buộc phải mô tả chi tiết khi container có vấn đề
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang xử lý...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Xác nhận
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

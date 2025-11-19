import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface TerminateContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: any;
  onSuccess: () => void;
}

export function TerminateContractModal({ open, onClose, contract, onSuccess }: TerminateContractModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do kết thúc hợp đồng",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/rental-contracts/${contract.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'TERMINATE',
          notes: reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to terminate contract');
      }

      toast({
        title: "Kết thúc hợp đồng thành công",
        description: "Container đã được chuyển về trạng thái sẵn sàng",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error terminating contract:', error);
      toast({
        title: "Lỗi kết thúc hợp đồng",
        description: error.message || "Không thể kết thúc hợp đồng",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Kết thúc hợp đồng
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn kết thúc hợp đồng {contract?.contract_number} trước thời hạn?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contract Info */}
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Người thuê:</span>
              <span className="font-medium">
                {contract?.buyer?.company_name || contract?.buyer?.full_name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày kết thúc dự kiến:</span>
              <span className="font-medium">
                {new Date(contract?.end_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Còn lại:</span>
              <span className="font-medium text-red-600">
                {Math.max(0, Math.ceil(
                  (new Date(contract?.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                ))} ngày
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do kết thúc *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do kết thúc hợp đồng trước thời hạn..."
              rows={4}
              required
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Lưu ý:</strong> Sau khi kết thúc hợp đồng:
            </p>
            <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 ml-4 space-y-1">
              <li>• Container sẽ được chuyển về trạng thái "Có sẵn"</li>
              <li>• Cần kiểm tra và hoàn trả tiền cọc (nếu có)</li>
              <li>• Số lượng container khả dụng sẽ được cập nhật</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant="destructive"
            >
              {loading ? 'Đang xử lý...' : 'Kết thúc hợp đồng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

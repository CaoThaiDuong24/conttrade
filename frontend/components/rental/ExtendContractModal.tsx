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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

interface ExtendContractModalProps {
  open: boolean;
  onClose: () => void;
  contract: any;
  onSuccess: () => void;
}

export function ExtendContractModal({ open, onClose, contract, onSuccess }: ExtendContractModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEndDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ngày kết thúc mới",
        variant: "destructive"
      });
      return;
    }

    // Validate new end date is after current end date
    if (new Date(newEndDate) <= new Date(contract.end_date)) {
      toast({
        title: "Ngày không hợp lệ",
        description: "Ngày kết thúc mới phải sau ngày kết thúc hiện tại",
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
          action: 'EXTEND',
          newEndDate: new Date(newEndDate).toISOString(),
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to extend contract');
      }

      toast({
        title: "Gia hạn thành công",
        description: `Hợp đồng đã được gia hạn đến ${new Date(newEndDate).toLocaleDateString('vi-VN')}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error extending contract:', error);
      toast({
        title: "Lỗi gia hạn hợp đồng",
        description: error.message || "Không thể gia hạn hợp đồng",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate current end date + 30 days as default
  const suggestedEndDate = new Date(contract?.end_date || Date.now());
  suggestedEndDate.setDate(suggestedEndDate.getDate() + 30);
  const suggestedDateString = suggestedEndDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gia hạn hợp đồng
          </DialogTitle>
          <DialogDescription>
            Gia hạn thời gian thuê cho hợp đồng {contract?.contract_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Info */}
          <div className="p-4 bg-accent/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày bắt đầu:</span>
              <span className="font-medium">
                {new Date(contract?.start_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày kết thúc hiện tại:</span>
              <span className="font-medium">
                {new Date(contract?.end_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giá thuê:</span>
              <span className="font-medium">
                {contract?.rental_price?.toLocaleString('vi-VN')} {contract?.rental_currency}/{contract?.rental_unit}
              </span>
            </div>
          </div>

          {/* New End Date */}
          <div className="space-y-2">
            <Label htmlFor="newEndDate">Ngày kết thúc mới *</Label>
            <Input
              id="newEndDate"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={new Date(contract?.end_date).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-muted-foreground">
              Đề xuất: {suggestedDateString} (thêm 30 ngày)
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về việc gia hạn..."
            />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Gia hạn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

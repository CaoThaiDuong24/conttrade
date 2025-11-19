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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface CompleteMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  maintenanceLog: any;
  onSuccess: () => void;
}

export function CompleteMaintenanceModal({ 
  open, 
  onClose, 
  maintenanceLog, 
  onSuccess 
}: CompleteMaintenanceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    actualCost: maintenanceLog?.estimated_cost?.toString() || '',
    actualCompletionDate: new Date().toISOString().split('T')[0],
    technicianNotes: '',
    qualityChecked: false,
    qualityNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : null,
        actualCompletionDate: new Date(formData.actualCompletionDate).toISOString(),
        technicianNotes: formData.technicianNotes || null,
        qualityChecked: formData.qualityChecked,
        qualityNotes: formData.qualityNotes || null,
      };

      const response = await fetch(
        `/api/v1/maintenance-logs/${maintenanceLog.id}/complete`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete maintenance');
      }

      toast({
        title: "Hoàn thành bảo trì",
        description: "Container đã sẵn sàng cho thuê",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error completing maintenance:', error);
      toast({
        title: "Lỗi hoàn thành bảo trì",
        description: error.message || "Không thể hoàn thành bảo trì",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Hoàn thành bảo trì
          </DialogTitle>
          <DialogDescription>
            Xác nhận hoàn thành công việc bảo trì
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Maintenance Info */}
          <div className="p-4 bg-accent/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loại bảo trì:</span>
              <span className="font-medium">{maintenanceLog?.maintenance_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lý do:</span>
              <span className="font-medium">{maintenanceLog?.reason}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chi phí dự kiến:</span>
              <span className="font-medium">
                {maintenanceLog?.estimated_cost?.toLocaleString('vi-VN')} {maintenanceLog?.cost_currency}
              </span>
            </div>
          </div>

          {/* Actual Cost */}
          <div className="space-y-2">
            <Label htmlFor="actualCost">Chi phí thực tế (VND) *</Label>
            <Input
              id="actualCost"
              type="number"
              value={formData.actualCost}
              onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Actual Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="actualCompletionDate">Ngày hoàn thành *</Label>
            <Input
              id="actualCompletionDate"
              type="date"
              value={formData.actualCompletionDate}
              onChange={(e) => setFormData({ ...formData, actualCompletionDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Technician Notes */}
          <div className="space-y-2">
            <Label htmlFor="technicianNotes">Ghi chú kỹ thuật viên</Label>
            <Textarea
              id="technicianNotes"
              value={formData.technicianNotes}
              onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
              placeholder="Mô tả công việc đã thực hiện, vấn đề gặp phải..."
              rows={4}
            />
          </div>

          {/* Quality Check */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="qualityChecked"
                checked={formData.qualityChecked}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, qualityChecked: checked as boolean })
                }
              />
              <Label
                htmlFor="qualityChecked"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Đã kiểm tra chất lượng
              </Label>
            </div>

            {formData.qualityChecked && (
              <div className="space-y-2">
                <Label htmlFor="qualityNotes">Ghi chú kiểm tra chất lượng</Label>
                <Textarea
                  id="qualityNotes"
                  value={formData.qualityNotes}
                  onChange={(e) => setFormData({ ...formData, qualityNotes: e.target.value })}
                  placeholder="Kết quả kiểm tra chất lượng sau bảo trì..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ Sau khi hoàn thành:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 ml-4 space-y-1">
              <li>• Container sẽ được chuyển về trạng thái "Có sẵn"</li>
              <li>• Số lượng container khả dụng sẽ được cập nhật</li>
              <li>• Container có thể được cho thuê ngay</li>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Hoàn thành'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

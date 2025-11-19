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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wrench } from 'lucide-react';

interface CreateMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  container: any;
  onSuccess: () => void;
}

export function CreateMaintenanceModal({ 
  open, 
  onClose, 
  listingId, 
  container, 
  onSuccess 
}: CreateMaintenanceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maintenanceType: 'ROUTINE',
    priority: 'MEDIUM',
    reason: '',
    description: '',
    estimatedCost: '',
    estimatedDurationDays: '',
    technicianName: '',
    technicianContact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập lý do bảo trì",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        estimatedDurationDays: formData.estimatedDurationDays ? parseInt(formData.estimatedDurationDays) : null,
      };

      const response = await fetch(
        `/api/v1/rental/listings/${listingId}/containers/${container.id}/maintenance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create maintenance');
      }

      toast({
        title: "Tạo lệnh bảo trì thành công",
        description: `Container đã được chuyển sang trạng thái bảo trì`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating maintenance:', error);
      toast({
        title: "Lỗi tạo lệnh bảo trì",
        description: error.message || "Không thể tạo lệnh bảo trì",
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
            <Wrench className="w-5 h-5" />
            Tạo lệnh bảo trì
          </DialogTitle>
          <DialogDescription>
            Tạo lệnh bảo trì cho container {container?.container_iso_code || container?.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Container Info */}
          <div className="p-4 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">
              {container?.container_iso_code || `Container #${container?.id.slice(0, 8)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {container?.shipping_line} • {container?.manufactured_year}
            </p>
          </div>

          {/* Maintenance Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Loại bảo trì *</Label>
              <Select
                value={formData.maintenanceType}
                onValueChange={(value) => setFormData({ ...formData, maintenanceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Bảo trì định kỳ</SelectItem>
                  <SelectItem value="REPAIR">Sửa chữa</SelectItem>
                  <SelectItem value="INSPECTION">Kiểm tra</SelectItem>
                  <SelectItem value="CLEANING">Vệ sinh</SelectItem>
                  <SelectItem value="DAMAGE_REPAIR">Sửa chữa hư hỏng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Độ ưu tiên *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do bảo trì *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="VD: Kiểm tra định kỳ 6 tháng"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết công việc cần thực hiện..."
              rows={3}
            />
          </div>

          {/* Estimated Cost & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Chi phí dự kiến (VND)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDurationDays">Thời gian dự kiến (ngày)</Label>
              <Input
                id="estimatedDurationDays"
                type="number"
                value={formData.estimatedDurationDays}
                onChange={(e) => setFormData({ ...formData, estimatedDurationDays: e.target.value })}
                placeholder="0"
                min="1"
              />
            </div>
          </div>

          {/* Technician Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technicianName">Tên kỹ thuật viên</Label>
              <Input
                id="technicianName"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicianContact">Liên hệ</Label>
              <Input
                id="technicianContact"
                value={formData.technicianContact}
                onChange={(e) => setFormData({ ...formData, technicianContact: e.target.value })}
                placeholder="0123456789"
              />
            </div>
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
              {loading ? 'Đang xử lý...' : 'Tạo lệnh bảo trì'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

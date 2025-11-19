import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Package, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { CompleteMaintenanceModal } from './CompleteMaintenanceModal';

interface MaintenanceContainersTabProps {
  listingId: string;
  containers: any[];
  onRefresh: () => void;
}

export function MaintenanceContainersTab({ listingId, containers, onRefresh }: MaintenanceContainersTabProps) {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleCompleteMaintenance = (log: any) => {
    setSelectedLog(log);
    setShowCompleteModal(true);
  };

  const getMaintenanceStatusBadge = (status: string) => {
    const variants: any = {
      'SCHEDULED': { variant: 'secondary', label: 'Đã lên lịch' },
      'IN_PROGRESS': { variant: 'default', label: 'Đang thực hiện' },
      'ON_HOLD': { variant: 'outline', label: 'Tạm dừng' },
      'COMPLETED': { variant: 'default', label: 'Hoàn thành', class: 'bg-green-600' },
      'CANCELLED': { variant: 'destructive', label: 'Đã hủy' },
    };
    const config = variants[status] || variants['SCHEDULED'];
    
    return (
      <Badge variant={config.variant} className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: any = {
      'ROUTINE': 'Bảo trì định kỳ',
      'REPAIR': 'Sửa chữa',
      'INSPECTION': 'Kiểm tra',
      'CLEANING': 'Vệ sinh',
      'DAMAGE_REPAIR': 'Sửa chữa hư hỏng',
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: any = {
      'LOW': { variant: 'secondary', label: 'Thấp' },
      'MEDIUM': { variant: 'outline', label: 'Trung bình' },
      'HIGH': { variant: 'default', label: 'Cao', class: 'bg-orange-600' },
      'URGENT': { variant: 'destructive', label: 'Khẩn cấp' },
    };
    const config = variants[priority] || variants['MEDIUM'];
    
    return <Badge variant={config.variant} className={config.class}>{config.label}</Badge>;
  };

  if (containers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Wrench className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Không có container nào đang bảo trì</p>
            <p className="text-sm text-muted-foreground mt-2">
              Các container trong bảo trì sẽ hiển thị ở đây
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {containers.map((container: any) => {
          const maintenanceLog = container.maintenance_logs?.[0];
          if (!maintenanceLog) return null;

          const daysInMaintenance = Math.ceil(
            (new Date().getTime() - new Date(maintenanceLog.start_date).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={container.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {container.container_iso_code || `Container #${container.id.slice(0, 8)}`}
                        {getMaintenanceStatusBadge(maintenanceLog.status)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {container.shipping_line} • {container.manufactured_year}
                      </p>
                    </div>
                    {getPriorityBadge(maintenanceLog.priority)}
                  </div>

                  {/* Maintenance Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Loại bảo trì</p>
                        <p className="text-sm text-muted-foreground">
                          {getMaintenanceTypeLabel(maintenanceLog.maintenance_type)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Thời gian</p>
                        <p className="text-sm text-muted-foreground">
                          Bắt đầu: {new Date(maintenanceLog.start_date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {daysInMaintenance} ngày
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Chi phí</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {maintenanceLog.estimated_cost?.toLocaleString('vi-VN')} {maintenanceLog.cost_currency}
                        </p>
                        <p className="text-xs text-muted-foreground">Dự kiến</p>
                      </div>
                    </div>

                    {maintenanceLog.technician_name && (
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Kỹ thuật viên</p>
                          <p className="text-sm text-muted-foreground">
                            {maintenanceLog.technician_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reason & Description */}
                  {maintenanceLog.reason && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium mb-1">Lý do:</p>
                      <p className="text-sm text-muted-foreground">{maintenanceLog.reason}</p>
                      {maintenanceLog.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {maintenanceLog.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {maintenanceLog.status === 'IN_PROGRESS' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleCompleteMaintenance(maintenanceLog)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hoàn thành bảo trì
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedLog && (
        <CompleteMaintenanceModal
          open={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          maintenanceLog={selectedLog}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

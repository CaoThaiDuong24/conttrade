import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Wrench } from 'lucide-react';
import { useState } from 'react';
import { CreateMaintenanceModal } from './CreateMaintenanceModal';

interface AvailableContainersTabProps {
  listingId: string;
  containers: any[];
  onRefresh: () => void;
}

export function AvailableContainersTab({ listingId, containers, onRefresh }: AvailableContainersTabProps) {
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const handleCreateMaintenance = (container: any) => {
    setSelectedContainer(container);
    setShowMaintenanceModal(true);
  };

  if (containers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Không có container nào có sẵn</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tất cả container đang được thuê hoặc bảo trì
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {containers.map((container: any) => (
          <Card key={container.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">
                      {container.container_iso_code || `Container #${container.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {container.shipping_line}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Có sẵn
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Năm sản xuất:</span>
                    <span className="font-medium">{container.manufactured_year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tình trạng:</span>
                    <span className="font-medium">{container.condition || 'N/A'}</span>
                  </div>
                  {container.current_depot && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depot:</span>
                      <span className="font-medium">{container.current_depot.name}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCreateMaintenance(container)}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Tạo lệnh bảo trì
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedContainer && (
        <CreateMaintenanceModal
          open={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          listingId={listingId}
          container={selectedContainer}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Calendar, 
  DollarSign, 
  MapPin,
  FileText,
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Package
} from 'lucide-react';
import { ContractDetailsModal } from './ContractDetailsModal';
import { ExtendContractModal } from './ExtendContractModal';
import { TerminateContractModal } from './TerminateContractModal';

interface RentedContainersTabProps {
  listingId: string;
  containers: any[];
  onRefresh: () => void;
}

export function RentedContainersTab({ listingId, containers, onRefresh }: RentedContainersTabProps) {
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const getPaymentStatusBadge = (status: string) => {
    const variants: any = {
      'PAID': { variant: 'default', icon: CheckCircle, label: 'Đã thanh toán' },
      'PENDING': { variant: 'secondary', icon: Clock, label: 'Chờ thanh toán' },
      'PARTIALLY_PAID': { variant: 'outline', icon: AlertCircle, label: 'Thanh toán 1 phần' },
      'OVERDUE': { variant: 'destructive', icon: XCircle, label: 'Quá hạn' },
    };
    const config = variants[status] || variants['PENDING'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getContractStatusBadge = (status: string) => {
    const variants: any = {
      'ACTIVE': { variant: 'default', label: 'Đang thuê' },
      'COMPLETED': { variant: 'secondary', label: 'Hoàn thành' },
      'TERMINATED': { variant: 'destructive', label: 'Đã hủy' },
      'OVERDUE': { variant: 'destructive', label: 'Quá hạn' },
    };
    const config = variants[status] || variants['ACTIVE'];
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewDetails = (container: any) => {
    setSelectedContract(container.rental_contracts?.[0]);
    setShowDetailsModal(true);
  };

  const handleExtendContract = (container: any) => {
    setSelectedContract(container.rental_contracts?.[0]);
    setShowExtendModal(true);
  };

  const handleTerminateContract = (container: any) => {
    setSelectedContract(container.rental_contracts?.[0]);
    setShowTerminateModal(true);
  };

  if (containers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Chưa có container nào đang được thuê</p>
            <p className="text-sm text-muted-foreground mt-2">
              Các container đang thuê sẽ hiển thị ở đây
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
          const contract = container.rental_contracts?.[0];
          if (!contract) return null;

          const daysRemaining = Math.ceil(
            (new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={container.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {container.container_iso_code || `Container #${container.id.slice(0, 8)}`}
                      {getContractStatusBadge(contract.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {container.shipping_line} • {container.manufactured_year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Hợp đồng: {contract.contract_number}</p>
                    {getPaymentStatusBadge(contract.payment_status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Renter Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Người thuê</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.buyer?.company_name || contract.buyer?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contract.buyer?.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Thời gian thuê</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contract.start_date).toLocaleDateString('vi-VN')} - 
                        {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                      </p>
                      <p className={`text-xs font-medium ${daysRemaining < 7 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Đã hết hạn'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Giá thuê</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {contract.rental_price?.toLocaleString('vi-VN')} {contract.rental_currency}/{contract.rental_unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tổng: {contract.total_amount_due?.toLocaleString('vi-VN')} {contract.rental_currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Địa điểm</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận: {contract.pickup_depot?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Trả: {contract.return_depot?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Thanh toán</p>
                    <p className="text-xs text-muted-foreground">
                      Đã thanh toán: {contract.total_paid?.toLocaleString('vi-VN')} / 
                      {contract.total_amount_due?.toLocaleString('vi-VN')} {contract.rental_currency}
                    </p>
                  </div>
                  {contract.deposit_amount > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Tiền cọc</p>
                      <p className="text-xs text-muted-foreground">
                        {contract.deposit_amount?.toLocaleString('vi-VN')} {contract.deposit_currency}
                        {contract.deposit_paid && ' (Đã nhận)'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(container)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  
                  {contract.status === 'ACTIVE' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendContract(container)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Gia hạn
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateContract(container)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Kết thúc
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {selectedContract && (
        <>
          <ContractDetailsModal
            open={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            contract={selectedContract}
            onRefresh={onRefresh}
          />
          
          <ExtendContractModal
            open={showExtendModal}
            onClose={() => setShowExtendModal(false)}
            contract={selectedContract}
            onSuccess={onRefresh}
          />
          
          <TerminateContractModal
            open={showTerminateModal}
            onClose={() => setShowTerminateModal(false)}
            contract={selectedContract}
            onSuccess={onRefresh}
          />
        </>
      )}
    </>
  );
}

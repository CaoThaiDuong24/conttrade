import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  DollarSign, 
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Package
} from 'lucide-react';

interface ContractDetailsModalProps {
  open: boolean;
  onClose: () => void;
  contract: any;
  onRefresh: () => void;
}

export function ContractDetailsModal({ open, onClose, contract, onRefresh }: ContractDetailsModalProps) {
  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chi tiết hợp đồng: {contract.contract_number}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hợp đồng cho thuê container
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="payment">Thanh toán</TabsTrigger>
            <TabsTrigger value="inspection">Kiểm tra</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {contract.status}
              </Badge>
              <Badge variant={contract.payment_status === 'PAID' ? 'default' : 'outline'}>
                {contract.payment_status}
              </Badge>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Người cho thuê</p>
                      <p className="font-semibold">
                        {contract.seller?.company_name || contract.seller?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.seller?.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.seller?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Người thuê</p>
                      <p className="font-semibold">
                        {contract.buyer?.company_name || contract.buyer?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.buyer?.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.buyer?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rental Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Thời gian thuê</p>
                      <p className="text-sm text-muted-foreground">
                        Bắt đầu: {new Date(contract.start_date).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kết thúc: {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Giá thuê</p>
                      <p className="text-lg font-bold text-blue-600">
                        {contract.rental_price?.toLocaleString('vi-VN')} {contract.rental_currency}/{contract.rental_unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Địa điểm nhận</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.pickup_depot?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Địa điểm trả</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.return_depot?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto Renewal */}
            {contract.auto_renewal && (
              <Card className="bg-blue-50 dark:bg-blue-950">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">🔄 Tự động gia hạn</p>
                  <p className="text-sm text-muted-foreground">
                    Đã gia hạn {contract.renewal_count || 0} lần
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Tổng phải trả</p>
                  <p className="text-2xl font-bold">
                    {contract.total_amount_due?.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{contract.rental_currency}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contract.total_paid?.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{contract.rental_currency}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Còn lại</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {((contract.total_amount_due || 0) - (contract.total_paid || 0)).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{contract.rental_currency}</p>
                </CardContent>
              </Card>
            </div>

            {/* Deposit */}
            {contract.deposit_amount > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Tiền cọc</p>
                      <p className="text-lg font-bold">
                        {contract.deposit_amount?.toLocaleString('vi-VN')} {contract.deposit_currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={contract.deposit_paid ? 'default' : 'secondary'}>
                        {contract.deposit_paid ? 'Đã nhận' : 'Chưa nhận'}
                      </Badge>
                      {contract.deposit_returned && (
                        <Badge variant="outline" className="ml-2">
                          Đã hoàn trả
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Late Fees */}
            {contract.late_fees > 0 && (
              <Card className="bg-red-50 dark:bg-red-950">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Phí trễ hạn</p>
                      <p className="text-sm text-muted-foreground">
                        Trễ {contract.days_overdue || 0} ngày
                      </p>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                      {contract.late_fees?.toLocaleString('vi-VN')} {contract.rental_currency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inspection" className="space-y-4 mt-4">
            {/* Pickup Condition */}
            {contract.pickup_condition && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Tình trạng khi nhận</p>
                  <p className="text-sm text-muted-foreground">{contract.pickup_condition}</p>
                  {contract.pickup_photos && contract.pickup_photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {contract.pickup_photos.map((photo: string, idx: number) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Pickup ${idx + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Return Condition */}
            {contract.return_condition && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Tình trạng khi trả</p>
                  <p className="text-sm text-muted-foreground">{contract.return_condition}</p>
                  {contract.return_photos && contract.return_photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {contract.return_photos.map((photo: string, idx: number) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Return ${idx + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Damage Report */}
            {contract.damage_report && (
              <Card className="bg-amber-50 dark:bg-amber-950">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Báo cáo hư hỏng</p>
                  <p className="text-sm text-muted-foreground">{contract.damage_report}</p>
                  {contract.damage_cost > 0 && (
                    <p className="text-sm font-semibold mt-2">
                      Chi phí sửa chữa: {contract.damage_cost?.toLocaleString('vi-VN')} {contract.rental_currency}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tạo hợp đồng</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contract.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {contract.last_renewed_at && (
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gia hạn gần nhất</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contract.last_renewed_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cập nhật cuối</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contract.updated_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

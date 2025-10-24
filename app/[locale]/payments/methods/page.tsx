"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotificationContext } from '@/components/providers/notification-provider';
import { 
  CreditCard, 
  Plus,
  Trash2,
  CheckCircle,
  Building,
  Smartphone,
  Wallet,
  Shield
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'e_wallet';
  isDefault: boolean;
  details: {
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    walletType?: string;
    phoneNumber?: string;
  };
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const t = useTranslations();
  const { showSuccess, showError } = useNotificationContext();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<string>('credit_card');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/methods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMethods(data.data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/methods/${methodId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMethods(prev => prev.map(m => ({
          ...m,
          isDefault: m.id === methodId
        })));
        showSuccess('Đã đặt làm phương thức mặc định');
      }
    } catch (error) {
      console.error('Error setting default method:', error);
      showError('Không thể đặt làm mặc định');
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMethods(prev => prev.filter(m => m.id !== methodId));
        showSuccess('Đã xóa phương thức thanh toán');
      }
    } catch (error) {
      console.error('Error deleting method:', error);
      showError('Không thể xóa phương thức');
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank_account':
        return <Building className="h-5 w-5" />;
      case 'e_wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodLabel = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Thẻ tín dụng/ghi nợ';
      case 'bank_account':
        return 'Tài khoản ngân hàng';
      case 'e_wallet':
        return 'Ví điện tử';
      default:
        return type;
    }
  };

  const maskCardNumber = (number: string) => {
    return '**** **** **** ' + number.slice(-4);
  };

  const maskAccountNumber = (number: string) => {
    return '****' + number.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Phương thức thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các phương thức thanh toán của bạn
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phương thức
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
              <DialogDescription>
                Chọn loại phương thức thanh toán muốn thêm
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={newMethodType === 'credit_card' ? 'default' : 'outline'}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setNewMethodType('credit_card')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs">Thẻ</span>
                </Button>
                <Button
                  variant={newMethodType === 'bank_account' ? 'default' : 'outline'}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setNewMethodType('bank_account')}
                >
                  <Building className="h-6 w-6" />
                  <span className="text-xs">Ngân hàng</span>
                </Button>
                <Button
                  variant={newMethodType === 'e_wallet' ? 'default' : 'outline'}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setNewMethodType('e_wallet')}
                >
                  <Wallet className="h-6 w-6" />
                  <span className="text-xs">Ví điện tử</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Tính năng thêm phương thức thanh toán sẽ được cập nhật sớm
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phương thức</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{methods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác thực</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{methods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo mật</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : methods.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Chưa có phương thức thanh toán
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Thêm phương thức thanh toán để thanh toán dễ dàng hơn
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm phương thức
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          methods.map((method) => (
            <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {getMethodIcon(method.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{getMethodLabel(method.type)}</h3>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">Mặc định</Badge>
                        )}
                      </div>
                      
                      {method.type === 'credit_card' && method.details.cardNumber && (
                        <div className="text-sm text-muted-foreground">
                          {maskCardNumber(method.details.cardNumber)}
                          {method.details.cardHolder && ` • ${method.details.cardHolder}`}
                          {method.details.expiryDate && ` • Hết hạn ${method.details.expiryDate}`}
                        </div>
                      )}
                      
                      {method.type === 'bank_account' && method.details.accountNumber && (
                        <div className="text-sm text-muted-foreground">
                          {method.details.bankName} • {maskAccountNumber(method.details.accountNumber)}
                          {method.details.accountHolder && ` • ${method.details.accountHolder}`}
                        </div>
                      )}
                      
                      {method.type === 'e_wallet' && method.details.phoneNumber && (
                        <div className="text-sm text-muted-foreground">
                          {method.details.walletType} • {method.details.phoneNumber}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        Thêm vào: {new Date(method.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Đặt mặc định
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      disabled={method.isDefault}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Security Info */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Bảo mật thông tin thanh toán
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Thông tin được mã hóa theo chuẩn PCI DSS</li>
                <li>• Không lưu trữ CVV/CVC code</li>
                <li>• Xác thực 3D Secure cho mọi giao dịch</li>
                <li>• Hệ thống escrow bảo vệ cả người mua và người bán</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface QRPaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  currency: string;
  method: 'vnpay' | 'momo' | 'bank';
}

export function QRPaymentModal({
  open,
  onClose,
  orderId,
  amount,
  currency,
  method,
}: QRPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      generateQRCode();
      startCountdown();
    } else {
      // Cleanup
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [open]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/v1/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          method,
          amount,
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrData(data.data);
        setPaymentStatus('checking');
        startPaymentStatusCheck();
      } else {
        throw new Error(data.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = () => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      
      try {
        const response = await fetch(`/api/v1/payments/order/${orderId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const latestPayment = data.data[0];
          if (latestPayment.status === 'PENDING' || latestPayment.status === 'completed') {
            setPaymentStatus('success');
            clearInterval(interval);
            
            toast({
              title: 'Thanh toán thành công!',
              description: 'Đơn hàng của bạn đã được thanh toán.',
            });

            setTimeout(() => {
              onClose();
              window.location.href = `/orders/${orderId}`;
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check every 3 seconds

    setCheckInterval(interval);

    // Clear interval after 15 minutes
    setTimeout(() => clearInterval(interval), 15 * 60 * 1000);
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  const getMethodName = () => {
    switch (method) {
      case 'vnpay': return 'VNPay';
      case 'momo': return 'MoMo';
      case 'bank': return 'Chuyển khoản ngân hàng';
      default: return 'Thanh toán';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Thanh toán bằng {getMethodName()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tạo mã QR...</p>
            </div>
          )}

          {paymentStatus === 'checking' && qrData && (
            <>
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                {method === 'bank' && qrData.qrCodeUrl && (
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="VietQR Code" 
                    className="w-64 h-64 object-contain"
                  />
                )}
                {method === 'momo' && qrData.qrCodeUrl && (
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="MoMo QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                )}
                {method === 'vnpay' && qrData.paymentUrl && (
                  <div className="text-center">
                    <p className="mb-4 text-gray-600">Click nút bên dưới để thanh toán</p>
                  </div>
                )}
                <p className="text-center text-sm text-gray-600 mt-4">
                  {qrData.message}
                </p>
              </div>

              {/* Bank Info for bank transfer */}
              {method === 'bank' && qrData.bankInfo && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">{qrData.bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{qrData.bankInfo.accountNo}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(qrData.bankInfo.accountNo, 'Số tài khoản')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                    <span className="font-medium">{qrData.bankInfo.accountName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Số tiền:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(qrData.bankInfo.amount)} VND
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                    <span className="text-sm text-gray-600">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">{qrData.bankInfo.content}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(qrData.bankInfo.content, 'Nội dung')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-center text-red-600">
                    ⚠️ Vui lòng nhập đúng nội dung chuyển khoản để xác nhận tự động
                  </p>
                </div>
              )}

              {/* MoMo Deep Link */}
              {method === 'momo' && qrData.deeplink && (
                <>
                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500 text-sm">
                      Hoặc
                    </span>
                  </div>
                  <Button
                    onClick={() => window.location.href = qrData.deeplink}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở ứng dụng MoMo
                  </Button>
                </>
              )}

              {/* VNPay Payment URL */}
              {method === 'vnpay' && qrData.paymentUrl && (
                <Button
                  onClick={() => window.location.href = qrData.paymentUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Chuyển đến VNPay
                </Button>
              )}

              {/* Countdown & Status */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Thời gian còn lại:</span>
                  <Badge variant={countdown < 60 ? 'destructive' : 'secondary'}>
                    {formatTime(countdown)}
                  </Badge>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang chờ thanh toán...</span>
                </div>
              </div>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-gray-600 text-center">
                Đơn hàng đã được thanh toán. Đang chuyển hướng...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-red-600 mb-2">
                Mã QR đã hết hạn
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Vui lòng tạo mã QR mới để tiếp tục thanh toán
              </p>
              <Button onClick={generateQRCode} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tạo mã QR mới
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

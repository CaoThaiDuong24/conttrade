'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CreditCardPaymentProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  currency: string;
}

function CardPaymentForm({ 
  orderId, 
  amount, 
  currency, 
  onClose 
}: Omit<CreditCardPaymentProps, 'open'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const router = useRouter();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingName, setBillingName] = useState('');

  const calculateFee = (amount: number) => {
    return Math.round(amount * 0.029 + 2000); // 2.9% + 2,000₫
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!billingName) {
      setError('Vui lòng nhập tên chủ thẻ');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');

      // Step 1: Create payment intent
      const response = await fetch('/api/v1/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          method: 'credit_card',
          amount: calculateTotal(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      const { clientSecret } = data.data;

      // Step 2: Confirm card payment
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingName,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        toast({ 
          title: 'Thanh toán thành công!',
          description: 'Đơn hàng của bạn đã được thanh toán.'
        });
        
        setTimeout(() => {
          onClose();
          router.push(`/orders/${orderId}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Có lỗi xảy ra khi thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <label className="block text-sm font-medium mb-2">
          Thông tin thẻ <span className="text-red-500">*</span>
        </label>
        <div className="p-4 border rounded-lg bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Hỗ trợ Visa, Mastercard, American Express
        </p>
      </div>

      {/* Billing Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Tên chủ thẻ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="NGUYEN VAN A"
          required
        />
      </div>

      {/* Amount Breakdown */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Số tiền đơn hàng:</span>
          <span className="font-medium">{formatCurrency(amount)} VND</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí xử lý thẻ (2.9% + 2,000₫):</span>
          <span className="font-medium text-orange-600">
            +{formatCurrency(calculateFee(amount))} VND
          </span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-bold">Tổng thanh toán:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(calculateTotal(amount))} VND
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Thanh toán {formatCurrency(calculateTotal(amount))} VND
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Bảo mật bởi Stripe - PCI DSS Level 1</span>
      </div>
    </form>
  );
}

export function CreditCardPaymentModal(props: CreditCardPaymentProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Thanh toán bằng thẻ tín dụng/ghi nợ
          </DialogTitle>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <CardPaymentForm
            orderId={props.orderId}
            amount={props.amount}
            currency={props.currency}
            onClose={props.onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

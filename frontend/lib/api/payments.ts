import { apiClient } from "./client";

export interface PaymentStatus {
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  method: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
  createdAt: string;
}

// API-F04: Payment status for an order (via payments routes from backend)
export async function getPaymentStatus(orderId: string) {
  const data = await apiClient.request<PaymentStatus>({
    method: "GET",
    path: `/api/v1/payments/order/${orderId}/status`,
  });
  return data;
}

// Fund escrow for an order (via payments routes from backend)
export async function fundEscrow(orderId: string, fundRequest: { method: string; amount: number; currency?: string; paymentData?: any }) {
  const data = await apiClient.request<{ success: boolean; transactionId?: string }>({
    method: "POST",
    path: `/api/v1/payments/escrow/${orderId}/fund`,
    body: fundRequest,
  });
  return data;
}

// Get payment history 
export async function getPaymentHistory(page: number = 1, limit: number = 20) {
  const data = await apiClient.request<{ payments: PaymentHistory[]; total: number }>({
    method: "GET",
    path: `/api/v1/payments/history`,
    query: { page, limit },
  });
  return data;
}
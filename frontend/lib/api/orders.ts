import { apiClient } from "./client";

export interface Order {
  id: string;
  order_number?: string;
  quoteId: string;
  buyerId: string;
  sellerId: string;
  listingId?: string;
  orgId?: string;
  status: 'CREATED' | 'PENDING_PAYMENT' | 'PAYMENT_PENDING_VERIFICATION' | 'PAID' | 'AWAITING_FUNDS' | 'ESCROW_FUNDED' | 'PREPARING_DELIVERY' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  subtotal: string;
  tax: string;
  fees: string;
  total: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  // Include relations from backend
  buyer?: {
    id: string;
    display_name?: string;
    email: string;
  };
  seller?: {
    id: string;
    display_name?: string;
    email: string;
  };
  listings?: {
    id: string;
    title: string;
    description?: string;
    priceAmount?: string;
    priceCurrency?: string;
    dealType?: string;
    status?: string;
    locationDepotId?: string;
    sellerUserId?: string;
    createdAt?: string;
    updatedAt?: string;
    locationDepot?: {
      id: string;
      name: string;
    };
    seller?: {
      id: string;
      displayName: string;
      email: string;
    };
  };
  users_orders_buyerIdTousers?: {
    id: string;
    displayName: string;
    email: string;
    phone?: string;
    status?: string;
  };
  users_orders_sellerIdTousers?: {
    id: string;
    displayName: string;
    email: string;
    phone?: string;
    status?: string;
  };
  order_items?: any[];
  payments?: {
    id: string;
    method: string;
    status: string;
    createdAt: string;
  }[];
  deliveries?: {
    id: string;
    status: string;
    createdAt: string;
  }[];
}

export interface OrderFilters {
  status?: string;
  role?: 'buyer' | 'seller';
  page?: number;
  limit?: number;
}

export async function fetchOrders(filters?: OrderFilters) {
  console.log('[fetchOrders] Starting API call with filters:', filters);
  
  const response = await apiClient.request<{ success: boolean; data: Order[]; message?: string }>({
    method: "GET",
    path: "/api/v1/orders",
    query: {
      status: filters?.status,
      role: filters?.role,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    },
  });
  
  console.log('[fetchOrders] Raw backend response:', response);
  console.log('[fetchOrders] Response type:', typeof response);
  console.log('[fetchOrders] Response success:', response?.success);
  console.log('[fetchOrders] Response.data:', response?.data);
  console.log('[fetchOrders] Response.data type:', typeof response?.data);
  console.log('[fetchOrders] Response.data length:', response?.data?.length);
  
  // Backend returns { success: true, data: Order[] }
  // We need to transform to { items: Order[], total: number }
  const result = {
    items: response?.data || [], // Use 'data' not 'items'!
    total: response?.data?.length || 0
  };
  
  console.log('[fetchOrders] Final result:', result);
  console.log('[fetchOrders] Result.items length:', result.items.length);
  console.log('[fetchOrders] Result.items[0]:', result.items[0]);
  
  return result;
}

export async function fetchOrderById(id: string) {
  const data = await apiClient.request<Order>({
    method: "GET",
    path: `/api/v1/orders/${id}`,
  });
  return data;
}

export async function createOrderFromQuote(quoteId: string) {
  const data = await apiClient.request<{ order_id: string }>({
    method: "POST",
    path: "/api/v1/orders",
    body: { quote_id: quoteId },
  });
  return data;
}

export async function payEscrow(orderId: string, method: 'bank' | 'card' | 'ewallet') {
  const data = await apiClient.request<{ success: boolean }>({
    method: "POST",
    path: `/api/v1/orders/${orderId}/pay`,
    body: { method },
  });
  return data;
}

export async function confirmReceipt(orderId: string) {
  const data = await apiClient.request<{ success: boolean }>({
    method: "POST",
    path: `/api/v1/orders/${orderId}/confirm-receipt`,
  });
  return data;
}

export async function cancelOrder(orderId: string, reason?: string) {
  const data = await apiClient.request<{ success: boolean }>({
    method: "POST",
    path: `/api/v1/orders/${orderId}/cancel`,
    body: { reason },
  });
  return data;
}

export async function fetchOrderDocuments(orderId: string) {
  const data = await apiClient.request<{ documents: any[] }>({
    method: "GET",
    path: `/api/v1/orders/${orderId}/documents`,
  });
  return data;
}

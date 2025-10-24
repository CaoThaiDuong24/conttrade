import { apiClient } from "./client";

export interface RFQ {
  id: string;
  listing_id: string;
  buyer_id: string;
  purpose: 'sale' | 'rental';
  quantity: number;
  need_by: string;
  status: 'submitted' | 'quoted' | 'accepted' | 'declined' | 'expired';
  services: {
    inspection?: boolean;
    repair?: boolean;
    storage_days?: number;
    delivery_estimate?: boolean;
    insurance?: boolean;
  };
  created_at: string;
  updated_at: string;
  quotes_count: number;
  best_price?: number;
  currency: string;
}

export interface Quote {
  id: string;
  rfq_id: string;
  seller_id: string;
  items: Array<{
    item_type: 'container' | 'service';
    ref_id?: string;
    description: string;
    qty: number;
    unit_price: number;
  }>;
  fees: Array<{
    code: string;
    amount: number;
  }>;
  total: number;
  currency: string;
  valid_until: string;
  status: 'issued' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

export interface RFQFilters {
  status?: string;
  purpose?: 'sale' | 'rental';
  page?: number;
  limit?: number;
}

// API-D02: Fetch RFQs with filters
export async function fetchRFQs(filters?: RFQFilters) {
  const data = await apiClient.request<{ items: RFQ[]; total: number }>({
    method: "GET",
    path: "/api/v1/rfqs",
    query: {
      status: filters?.status,
      purpose: filters?.purpose,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    },
  });
  return data;
}

// Fetch single RFQ by ID
export async function fetchRFQById(id: string) {
  const data = await apiClient.request<RFQ>({
    method: "GET",
    path: `/api/v1/rfqs/${id}`,
  });
  return data;
}

// API-D01: Create new RFQ
export async function createRFQ(rfqData: {
  listing_id: string;
  purpose: 'sale' | 'rental';
  quantity: number;
  need_by: string;
  services?: {
    inspection?: boolean;
    repair?: boolean;
    storage_days?: number;
    delivery_estimate?: boolean;
    insurance?: boolean;
  };
}) {
  const data = await apiClient.request<{ rfq: RFQ }>({
    method: "POST",
    path: "/api/v1/rfqs",
    body: rfqData,
  });
  return data;
}

// API-D04: Fetch quotes for RFQ
export async function fetchRFQQuotes(rfqId: string) {
  const data = await apiClient.request<{ quotes: Quote[] }>({
    method: "GET",
    path: `/api/v1/rfqs/${rfqId}/quotes`,
  });
  return data;
}

// API-D03: Create quote for RFQ
export async function createQuote(rfqId: string, quoteData: {
  items: Array<{
    item_type: 'container' | 'service';
    ref_id?: string;
    description: string;
    qty: number;
    unit_price: number;
  }>;
  fees?: Array<{
    code: string;
    amount: number;
  }>;
  total: number;
  currency: string;
  valid_until: string;
}) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "POST",
    path: `/api/v1/rfqs/${rfqId}/quotes`,
    body: quoteData,
  });
  return data;
}

// API-D05: Accept quote (creates order)
export async function acceptQuote(quoteId: string) {
  const data = await apiClient.request<{ order_id: string }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/accept`,
  });
  return data;
}

// API-D06: Decline quote
export async function declineQuote(quoteId: string, reason?: string) {
  const data = await apiClient.request<{ success: boolean }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/decline`,
    body: { reason },
  });
  return data;
}
import { apiClient } from './client';

export interface Quote {
  id: string;
  rfq_id: string;
  rfq_title: string;
  buyer_name: string;
  seller_id: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected' | 'declined' | 'expired' | 
          'DRAFT' | 'SENT' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DECLINED' | 'EXPIRED';
  valid_until: string;
  created_at: string;
  updated_at: string;
  items_count: number;
  items: QuoteItem[];
  fees?: QuoteFee[];
  notes?: string;
  delivery_terms?: string;
  payment_terms?: string;
}

export interface QuoteItem {
  id: string;
  item_type: 'container' | 'service';
  ref_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export interface QuoteFee {
  id: string;
  code: string;
  description: string;
  amount: number;
}

export interface QuoteStats {
  total: number;
  sent: number;
  accepted: number;
  rejected: number;
  draft: number;
  expired: number;
  total_value: number;
}

// Get all quotes for seller (my quotes)
export async function fetchMyQuotes(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters?.offset) {
    params.append('offset', filters.offset.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/api/v1/quotes/my-quotes?${queryString}` : '/api/v1/quotes/my-quotes';

  const data = await apiClient.request<{
    quotes: Quote[];
    stats: QuoteStats;
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }>({
    method: "GET",
    path: url,
  });
  return data;
}

// Get quote details by ID
export async function fetchQuoteById(quoteId: string) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "GET",
    path: `/api/v1/quotes/${quoteId}`,
  });
  return data;
}

// Update quote (only for draft status)
export async function updateQuote(quoteId: string, updateData: {
  items?: QuoteItem[];
  fees?: QuoteFee[];
  total_amount?: number;
  currency?: string;
  valid_until?: string;
  delivery_terms?: string;
  payment_terms?: string;
  notes?: string;
}) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "PUT",
    path: `/api/v1/quotes/${quoteId}`,
    body: updateData,
  });
  return data;
}

// Delete quote (only for draft status)
export async function deleteQuote(quoteId: string) {
  const data = await apiClient.request<{ success: boolean }>({
    method: "DELETE",
    path: `/api/v1/quotes/${quoteId}`,
  });
  return data;
}

// Send quote to buyer (change status from draft to sent)
export async function sendQuote(quoteId: string) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/send`,
  });
  return data;
}

// Withdraw quote (change status from sent to draft)
export async function withdrawQuote(quoteId: string) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/withdraw`,
  });
  return data;
}

// Extend quote validity
export async function extendQuoteValidity(quoteId: string, newValidUntil: string) {
  const data = await apiClient.request<{ quote: Quote }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/extend`,
    body: { valid_until: newValidUntil },
  });
  return data;
}

// Get quote templates
export async function fetchQuoteTemplates() {
  const data = await apiClient.request<{ templates: any[] }>({
    method: "GET",
    path: `/api/v1/quotes/templates`,
  });
  return data;
}

// Save quote as template
export async function saveQuoteAsTemplate(quoteId: string, templateName: string) {
  const data = await apiClient.request<{ template: any }>({
    method: "POST",
    path: `/api/v1/quotes/${quoteId}/save-template`,
    body: { name: templateName },
  });
  return data;
}
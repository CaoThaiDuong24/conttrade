import { apiClient, generateIdempotencyKey } from "./client";

// Helper function to normalize listing data
function normalizeListing(listing: any): any {
  return {
    ...listing,
    price: listing.price || listing.price_amount || listing.priceAmount || 0,
    currency: listing.currency || listing.price_currency || listing.priceCurrency || 'VND',
    priceAmount: listing.priceAmount || listing.price_amount || listing.price || 0,
    priceCurrency: listing.priceCurrency || listing.price_currency || listing.currency || 'VND'
  };
}

export interface ListingSummary {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  type: string;
  size: string;
  deal_type: string; // Accept any deal type code
  standard: 'WWT' | 'CW' | 'IICL';
  condition: 'new' | 'used';
  depot_id: string;
  status: 'active' | 'pending' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
  views: number;
  rating?: number;
  reviews_count?: number;
  featured: boolean;
}

export interface ListingFilters {
  q?: string;
  deal_type?: string; // Accept any deal type code
  size?: string;
  standard?: string;
  condition?: string;
  depot_id?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  my?: boolean;  // Filter by current user's listings
}

// Add missing interfaces
export interface FetchListingsParams {
  q?: string;
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  dealType?: string;
  sortBy?: string;
  sortOrder?: string;
  my?: boolean;  // Filter by current user's listings
}

export interface ListingsResponse {
  listings: ListingSummary[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function fetchListings(params: FetchListingsParams = {}): Promise<ApiResponse<ListingsResponse>> {
  console.log('[API] fetchListings called with params:', params);
  
  const queryParams: Record<string, any> = {};
  
  if (params.q) queryParams.q = params.q;
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.category) queryParams.category = params.category;
  if (params.location) queryParams.location = params.location;
  if (params.dealType) queryParams.dealType = params.dealType;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params.my) queryParams.my = params.my;
  
  console.log('[API] Query params:', queryParams);
  
  const response = await apiClient.request<ApiResponse<ListingsResponse>>({
    path: '/api/v1/listings',
    query: queryParams,
  });
  
  // Normalize listing data
  if (response.data?.listings) {
    response.data.listings = response.data.listings.map(normalizeListing);
  }
  
  console.log('[API] Response received:', response);
  return response;
}

export async function fetchListingById(id: string) {
  const response = await apiClient.request<any>({
    method: "GET",
    path: `/api/v1/listings/${id}`,
  });
  
  // Normalize listing data
  if (response.data?.listing) {
    response.data.listing = normalizeListing(response.data.listing);
  } else if (response.listing) {
    response.listing = normalizeListing(response.listing);
  } else if (response && !response.success) {
    // Handle direct listing response
    return normalizeListing(response);
  }
  
  return response;
}

export async function createListing(listingData: {
  dealType: string; // Accept any deal type code from master data
  title: string;
  description: string;
  locationDepotId: string;
  priceAmount: number;
  priceCurrency: string;
  rentalUnit?: string;
  facets?: {
    size: string;
    type: string;
    standard: string;
    condition: string;
  };
  media?: string[];
}) {
  const data = await apiClient.request<{ 
    success: boolean;
    data: { listing: { id: string } }
  }>({
    method: "POST",
    path: "/api/v1/listings",
    body: listingData,
    idempotencyKey: generateIdempotencyKey(),
  });
  return data;
}

export async function updateListing(id: string, listingData: Partial<ListingSummary>) {
  const data = await apiClient.request<ListingSummary>({
    method: "PUT",
    path: `/api/v1/listings/${id}`,
    body: listingData,
  });
  return data;
}

export async function deleteListing(id: string) {
  const data = await apiClient.request<{ success: boolean }>({
    method: "DELETE",
    path: `/api/v1/listings/${id}`,
  });
  return data;
}



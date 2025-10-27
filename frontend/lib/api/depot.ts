import { apiClient } from "./client";

export interface DepotStock {
  container_id: string;
  owner_org_id: string;
  size_ft: number;
  type: string;
  quality_standard: 'WWT' | 'CW' | 'IICL';
  condition: 'new' | 'used';
  manufactured_year: number;
}

export interface DepotMovement {
  id: string;
  container_id: string;
  depot_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER';
  direction: 'IN' | 'OUT';
  ref_doc_type: string;
  ref_doc_id: string;
  reason?: string;
  occurred_at: string;
}

export interface DepotStockReport {
  from: string;
  to: string;
  grouping: 'owner' | 'size' | 'standard' | 'none';
  rows: Array<{
    key: string;
    opening: number;
    in_qty: number;
    out_qty: number;
    closing: number;
    aging: {
      bucket_0_7: number;
      bucket_8_14: number;
      bucket_15_30: number;
      bucket_31_60: number;
      bucket_60_plus: number;
    };
  }>;
  generated_at: string;
}

export interface StockFilters {
  owner_org_id?: string;
  size_ft?: number;
  type?: string;
  quality_standard?: string;
  condition?: string;
  manufactured_year_from?: number;
  manufactured_year_to?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface MovementFilters {
  from: string;
  to: string;
  movement_type?: 'IN' | 'OUT' | 'TRANSFER';
  container_id?: string;
  owner_org_id?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Depot {
  id: number;
  name: string;
  code: string;
  address: string;
  province: string;
  capacityTeu: number;
  totalSlots?: number;
  usedSlots?: number;
  availableSlots?: number;
}

export async function fetchDepots() {
  const data = await apiClient.request<{ success: boolean; data: { depots: Depot[] } }>({
    method: "GET",
    path: "/api/v1/depots",
  });
  return data;
}

export async function fetchDepotStock(depotId: string, filters?: StockFilters) {
  const data = await apiClient.request<{ items: DepotStock[]; total: number; page: number }>({
    method: "GET",
    path: `/depots/${depotId}/stock`,
    query: {
      owner_org_id: filters?.owner_org_id,
      size_ft: filters?.size_ft,
      type: filters?.type,
      quality_standard: filters?.quality_standard,
      condition: filters?.condition,
      manufactured_year_from: filters?.manufactured_year_from,
      manufactured_year_to: filters?.manufactured_year_to,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
      sort: filters?.sort,
    },
  });
  return data;
}

export async function fetchDepotMovements(depotId: string, filters: MovementFilters) {
  const data = await apiClient.request<{ items: DepotMovement[]; total: number }>({
    method: "GET",
    path: `/depots/${depotId}/stock-movements`,
    query: {
      from: filters.from,
      to: filters.to,
      movement_type: filters.movement_type,
      container_id: filters.container_id,
      owner_org_id: filters.owner_org_id,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      sort: filters.sort ?? 'occurred_at:desc',
    },
  });
  return data;
}

export async function createStockAdjustment(depotId: string, adjustmentData: {
  container_id: string;
  direction: 'IN' | 'OUT';
  reason?: string;
  occurred_at: string;
}) {
  const data = await apiClient.request<{ id: string }>({
    method: "POST",
    path: `/depots/${depotId}/stock-adjustments`,
    body: adjustmentData,
  });
  return data;
}

export async function fetchStockReport(depotId: string, filters: {
  from: string;
  to: string;
  group_by?: string;
  export?: string;
}) {
  const data = await apiClient.request<DepotStockReport>({
    method: "GET",
    path: `/depots/${depotId}/stock-report`,
    query: filters,
  });
  return data;
}

export async function createDepotTransfer(transferData: {
  container_id: string;
  from_depot_id: string;
  to_depot_id: string;
  reason?: string;
  occurred_at: string;
}) {
  const data = await apiClient.request<{ movements: Array<{ out_id: string } | { in_id: string }> }>({
    method: "POST",
    path: "/api/v1/depots/transfers",
    body: transferData,
  });
  return data;
}

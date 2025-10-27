/**
 * MASTER DATA REACT HOOKS
 * React hooks để fetch và cache master data
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import MasterDataAPI from '@/lib/api/master-data';

/**
 * Query options cho master data - cache lâu vì ít thay đổi
 */
const MASTER_DATA_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 60, // 1 hour
  gcTime: 1000 * 60 * 60 * 24, // 24 hours
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

// ==========================================
// GEO & CURRENCY HOOKS
// ==========================================

export function useCountries(params?: { active?: 'true' | 'false'; region?: string }) {
  return useQuery({
    queryKey: ['master-data', 'countries', params],
    queryFn: () => MasterDataAPI.getCountries(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useProvinces(params?: { country?: string; active?: 'true' | 'false'; region?: string }) {
  return useQuery({
    queryKey: ['master-data', 'provinces', params],
    queryFn: () => MasterDataAPI.getProvinces(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useCurrencies(params?: { active?: 'true' | 'false' }) {
  return useQuery({
    queryKey: ['master-data', 'currencies', params],
    queryFn: () => MasterDataAPI.getCurrencies(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useTimezones() {
  return useQuery({
    queryKey: ['master-data', 'timezones'],
    queryFn: () => MasterDataAPI.getTimezones(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// CONTAINER HOOKS
// ==========================================

export function useContainerSizes() {
  return useQuery({
    queryKey: ['master-data', 'container-sizes'],
    queryFn: () => MasterDataAPI.getContainerSizes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useContainerTypes() {
  return useQuery({
    queryKey: ['master-data', 'container-types'],
    queryFn: () => MasterDataAPI.getContainerTypes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useQualityStandards() {
  return useQuery({
    queryKey: ['master-data', 'quality-standards'],
    queryFn: () => MasterDataAPI.getQualityStandards(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useISOCodes() {
  return useQuery({
    queryKey: ['master-data', 'iso-codes'],
    queryFn: () => MasterDataAPI.getISOCodes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// BUSINESS HOOKS
// ==========================================

export function useDealTypes() {
  return useQuery({
    queryKey: ['master-data', 'deal-types'],
    queryFn: () => MasterDataAPI.getDealTypes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useListingStatuses() {
  return useQuery({
    queryKey: ['master-data', 'listing-statuses'],
    queryFn: () => MasterDataAPI.getListingStatuses(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useOrderStatuses() {
  return useQuery({
    queryKey: ['master-data', 'order-statuses'],
    queryFn: () => MasterDataAPI.getOrderStatuses(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function usePaymentStatuses() {
  return useQuery({
    queryKey: ['master-data', 'payment-statuses'],
    queryFn: () => MasterDataAPI.getPaymentStatuses(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useDeliveryStatuses() {
  return useQuery({
    queryKey: ['master-data', 'delivery-statuses'],
    queryFn: () => MasterDataAPI.getDeliveryStatuses(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useDisputeStatuses() {
  return useQuery({
    queryKey: ['master-data', 'dispute-statuses'],
    queryFn: () => MasterDataAPI.getDisputeStatuses(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['master-data', 'document-types'],
    queryFn: () => MasterDataAPI.getDocumentTypes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useServiceCodes() {
  return useQuery({
    queryKey: ['master-data', 'service-codes'],
    queryFn: () => MasterDataAPI.getServiceCodes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// PRICING & UNITS HOOKS
// ==========================================

export function useRentalUnits() {
  return useQuery({
    queryKey: ['master-data', 'rental-units'],
    queryFn: () => MasterDataAPI.getRentalUnits(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useUnits(params?: { type?: string }) {
  return useQuery({
    queryKey: ['master-data', 'units', params],
    queryFn: () => MasterDataAPI.getUnits(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useFeeCodes() {
  return useQuery({
    queryKey: ['master-data', 'fee-codes'],
    queryFn: () => MasterDataAPI.getFeeCodes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useTaxCodes() {
  return useQuery({
    queryKey: ['master-data', 'tax-codes'],
    queryFn: () => MasterDataAPI.getTaxCodes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// LOGISTICS HOOKS
// ==========================================

export function useIncoterms() {
  return useQuery({
    queryKey: ['master-data', 'incoterms'],
    queryFn: () => MasterDataAPI.getIncoterms(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useDeliveryEventTypes() {
  return useQuery({
    queryKey: ['master-data', 'delivery-event-types'],
    queryFn: () => MasterDataAPI.getDeliveryEventTypes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useCities(params?: { province?: string; country?: string }) {
  return useQuery({
    queryKey: ['master-data', 'cities', params],
    queryFn: () => MasterDataAPI.getCities(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useUNLOCODEs(params?: { country?: string }) {
  return useQuery({
    queryKey: ['master-data', 'unlocodes', params],
    queryFn: () => MasterDataAPI.getUNLOCODEs(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// REASONS HOOKS
// ==========================================

export function useDisputeReasons() {
  return useQuery({
    queryKey: ['master-data', 'dispute-reasons'],
    queryFn: () => MasterDataAPI.getDisputeReasons(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useCancelReasons() {
  return useQuery({
    queryKey: ['master-data', 'cancel-reasons'],
    queryFn: () => MasterDataAPI.getCancelReasons(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function usePaymentFailureReasons() {
  return useQuery({
    queryKey: ['master-data', 'payment-failure-reasons'],
    queryFn: () => MasterDataAPI.getPaymentFailureReasons(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// INSPECTION & REPAIR HOOKS
// ==========================================

export function useInspectionItemCodes(params?: { category?: string }) {
  return useQuery({
    queryKey: ['master-data', 'inspection-item-codes', params],
    queryFn: () => MasterDataAPI.getInspectionItemCodes(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useRepairItemCodes(params?: { category?: string }) {
  return useQuery({
    queryKey: ['master-data', 'repair-item-codes', params],
    queryFn: () => MasterDataAPI.getRepairItemCodes(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// NOTIFICATION HOOKS
// ==========================================

export function useNotificationChannels() {
  return useQuery({
    queryKey: ['master-data', 'notification-channels'],
    queryFn: () => MasterDataAPI.getNotificationChannels(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useNotificationEventTypes() {
  return useQuery({
    queryKey: ['master-data', 'notification-event-types'],
    queryFn: () => MasterDataAPI.getNotificationEventTypes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useTemplateCodes(params?: { channel?: string }) {
  return useQuery({
    queryKey: ['master-data', 'template-codes', params],
    queryFn: () => MasterDataAPI.getTemplateCodes(params),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// INSURANCE HOOKS
// ==========================================

export function useInsuranceCoverages() {
  return useQuery({
    queryKey: ['master-data', 'insurance-coverages'],
    queryFn: () => MasterDataAPI.getInsuranceCoverages(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

export function useRatingScales() {
  return useQuery({
    queryKey: ['master-data', 'rating-scales'],
    queryFn: () => MasterDataAPI.getRatingScales(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

export function useViolationCodes() {
  return useQuery({
    queryKey: ['master-data', 'violation-codes'],
    queryFn: () => MasterDataAPI.getViolationCodes(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// BULK HOOK - Load tất cả master data
// ==========================================

export function useAllMasterData() {
  return useQuery({
    queryKey: ['master-data', 'all'],
    queryFn: () => MasterDataAPI.getAll(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });
}

// ==========================================
// COMPOSITE HOOKS - Lấy nhiều master data cho form
// ==========================================

/**
 * Hook cho Create Listing Form
 */
export function useListingFormData() {
  const dealTypes = useDealTypes();
  const containerSizes = useContainerSizes();
  const containerTypes = useContainerTypes();
  const qualityStandards = useQualityStandards();
  const currencies = useCurrencies();
  const provinces = useProvinces({ country: 'VN' });
  const rentalUnits = useRentalUnits();

  return {
    dealTypes,
    containerSizes,
    containerTypes,
    qualityStandards,
    currencies,
    provinces,
    rentalUnits,
    isLoading:
      dealTypes.isLoading ||
      containerSizes.isLoading ||
      containerTypes.isLoading ||
      qualityStandards.isLoading ||
      currencies.isLoading ||
      provinces.isLoading ||
      rentalUnits.isLoading,
    isError:
      dealTypes.isError ||
      containerSizes.isError ||
      containerTypes.isError ||
      qualityStandards.isError ||
      currencies.isError ||
      provinces.isError ||
      rentalUnits.isError,
  };
}

/**
 * Hook cho Order Form
 */
export function useOrderFormData() {
  const currencies = useCurrencies();
  const paymentStatuses = usePaymentStatuses();
  const deliveryStatuses = useDeliveryStatuses();
  const incoterms = useIncoterms();

  return {
    currencies,
    paymentStatuses,
    deliveryStatuses,
    incoterms,
    isLoading:
      currencies.isLoading ||
      paymentStatuses.isLoading ||
      deliveryStatuses.isLoading ||
      incoterms.isLoading,
    isError:
      currencies.isError ||
      paymentStatuses.isError ||
      deliveryStatuses.isError ||
      incoterms.isError,
  };
}

/**
 * Hook cho Inspection Form
 */
export function useInspectionFormData() {
  const inspectionItems = useInspectionItemCodes();
  const qualityStandards = useQualityStandards();

  return {
    inspectionItems,
    qualityStandards,
    isLoading: inspectionItems.isLoading || qualityStandards.isLoading,
    isError: inspectionItems.isError || qualityStandards.isError,
  };
}

/**
 * Hook cho Repair Form
 */
export function useRepairFormData() {
  const repairItems = useRepairItemCodes();
  const units = useUnits();

  return {
    repairItems,
    units,
    isLoading: repairItems.isLoading || units.isLoading,
    isError: repairItems.isError || units.isError,
  };
}

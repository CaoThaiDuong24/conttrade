/**
 * MASTER DATA API CLIENT
 * Client-side utilities để fetch master data
 */

// Use relative path for API calls (proxied through Nginx)
const API_BASE_URL = '/api/v1';

console.log('🔧 MasterDataAPI - API_BASE_URL:', API_BASE_URL);
console.log('🔧 MasterDataAPI - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export interface MasterDataResponse<T> {
  success: boolean;
  data: T;
}

export class MasterDataAPI {
  
  /**
   * Generic fetch method
   */
  private static async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Construct URL properly - use relative path or absolute URL based on environment
    let urlString = `${API_BASE_URL}/master-data/${endpoint}`;
    
    // If we have query params, build URL with searchParams
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      urlString = `${urlString}?${queryParams.toString()}`;
    }
    
    console.log('🌐 Fetching:', urlString);

    const response = await fetch(urlString);
    const result: MasterDataResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch master data');
    }
    
    return result.data;
  }

  // ==========================================
  // GEO & CURRENCY
  // ==========================================
  
  static async getCountries(params?: { active?: 'true' | 'false'; region?: string }) {
    return this.fetch<any[]>('countries', params);
  }

  static async getProvinces(params?: { country?: string; active?: 'true' | 'false'; region?: string }) {
    return this.fetch<any[]>('provinces', params);
  }

  static async getCurrencies(params?: { active?: 'true' | 'false' }) {
    return this.fetch<any[]>('currencies', params);
  }

  static async getTimezones() {
    return this.fetch<any[]>('timezones');
  }

  // ==========================================
  // CONTAINER
  // ==========================================
  
  static async getContainerSizes() {
    return this.fetch<any[]>('container-sizes');
  }

  static async getContainerTypes() {
    return this.fetch<any[]>('container-types');
  }

  static async getQualityStandards() {
    return this.fetch<any[]>('quality-standards');
  }

  static async getISOCodes() {
    return this.fetch<any[]>('iso-codes');
  }

  // ==========================================
  // BUSINESS
  // ==========================================
  
  static async getDealTypes() {
    return this.fetch<any[]>('deal-types');
  }

  static async getListingStatuses() {
    return this.fetch<any[]>('listing-statuses');
  }

  static async getOrderStatuses() {
    return this.fetch<any[]>('order-statuses');
  }

  static async getPaymentStatuses() {
    return this.fetch<any[]>('payment-statuses');
  }

  static async getDeliveryStatuses() {
    return this.fetch<any[]>('delivery-statuses');
  }

  static async getDisputeStatuses() {
    return this.fetch<any[]>('dispute-statuses');
  }

  static async getDocumentTypes() {
    return this.fetch<any[]>('document-types');
  }

  static async getServiceCodes() {
    return this.fetch<any[]>('service-codes');
  }

  // ==========================================
  // PRICING & UNITS
  // ==========================================
  
  static async getRentalUnits() {
    return this.fetch<any[]>('rental-units');
  }

  static async getUnits(params?: { type?: string }) {
    return this.fetch<any[]>('units', params);
  }

  static async getFeeCodes() {
    return this.fetch<any[]>('fee-codes');
  }

  static async getTaxCodes() {
    return this.fetch<any[]>('tax-codes');
  }

  // ==========================================
  // LOGISTICS
  // ==========================================
  
  static async getIncoterms() {
    return this.fetch<any[]>('incoterms');
  }

  static async getDeliveryEventTypes() {
    return this.fetch<any[]>('delivery-event-types');
  }

  static async getCities(params?: { province?: string; country?: string }) {
    return this.fetch<any[]>('cities', params);
  }

  static async getUNLOCODEs(params?: { country?: string }) {
    return this.fetch<any[]>('unlocodes', params);
  }

  // ==========================================
  // REASONS
  // ==========================================
  
  static async getDisputeReasons() {
    return this.fetch<any[]>('dispute-reasons');
  }

  static async getCancelReasons() {
    return this.fetch<any[]>('cancel-reasons');
  }

  static async getPaymentFailureReasons() {
    return this.fetch<any[]>('payment-failure-reasons');
  }

  // ==========================================
  // INSPECTION & REPAIR
  // ==========================================
  
  static async getInspectionItemCodes(params?: { category?: string }) {
    return this.fetch<any[]>('inspection-item-codes', params);
  }

  static async getRepairItemCodes(params?: { category?: string }) {
    return this.fetch<any[]>('repair-item-codes', params);
  }

  // ==========================================
  // NOTIFICATION
  // ==========================================
  
  static async getNotificationChannels() {
    return this.fetch<any[]>('notification-channels');
  }

  static async getNotificationEventTypes() {
    return this.fetch<any[]>('notification-event-types');
  }

  static async getTemplateCodes(params?: { channel?: string }) {
    return this.fetch<any[]>('template-codes', params);
  }

  // ==========================================
  // INSURANCE
  // ==========================================
  
  static async getInsuranceCoverages() {
    return this.fetch<any[]>('insurance-coverages');
  }

  // ==========================================
  // ADMIN
  // ==========================================
  
  static async getRatingScales() {
    return this.fetch<any[]>('rating-scales');
  }

  static async getViolationCodes() {
    return this.fetch<any[]>('violation-codes');
  }

  // ==========================================
  // BULK
  // ==========================================
  
  static async getAll() {
    return this.fetch<{
      countries: any[];
      provinces: any[];
      currencies: any[];
      containerSizes: any[];
      containerTypes: any[];
      qualityStandards: any[];
      dealTypes: any[];
      listingStatuses: any[];
      orderStatuses: any[];
      paymentStatuses: any[];
      deliveryStatuses: any[];
      rentalUnits: any[];
      cities: any[];
    }>('all');
  }
}

export default MasterDataAPI;

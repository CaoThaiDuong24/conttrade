// @ts-nocheck
/**
 * MASTER DATA HELPER UTILITIES
 * Các hàm tiện ích để làm việc với master data
 */

import prisma from './prisma.js';

export class MasterDataService {
  
  /**
   * Validate nếu giá trị tồn tại trong master data table
   */
  static async validate(tableName: string, field: string, value: any): Promise<boolean> {
    try {
      const result = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) as count FROM ${tableName} WHERE ${field} = $1`,
        value
      );
      return result[0]?.count > 0;
    } catch (error) {
      console.error(`Validate error for ${tableName}.${field}:`, error);
      return false;
    }
  }

  /**
   * Validate deal type
   */
  static async validateDealType(code: string): Promise<boolean> {
    return this.validate('md_deal_types', 'code', code);
  }

  /**
   * Validate listing status
   */
  static async validateListingStatus(code: string): Promise<boolean> {
    return this.validate('md_listing_statuses', 'code', code);
  }

  /**
   * Validate order status
   */
  static async validateOrderStatus(code: string): Promise<boolean> {
    return this.validate('md_order_statuses', 'code', code);
  }

  /**
   * Validate payment status
   */
  static async validatePaymentStatus(code: string): Promise<boolean> {
    return this.validate('md_payment_statuses', 'code', code);
  }

  /**
   * Validate delivery status
   */
  static async validateDeliveryStatus(code: string): Promise<boolean> {
    return this.validate('md_delivery_statuses', 'code', code);
  }

  /**
   * Validate container size
   */
  static async validateContainerSize(sizeFt: number): Promise<boolean> {
    return this.validate('md_container_sizes', 'size_ft', sizeFt);
  }

  /**
   * Validate container type
   */
  static async validateContainerType(code: string): Promise<boolean> {
    return this.validate('md_container_types', 'code', code);
  }

  /**
   * Validate currency
   */
  static async validateCurrency(code: string): Promise<boolean> {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM md_currencies WHERE code = $1`,
      code
    );
    return result[0]?.count > 0;
  }

  /**
   * Validate country
   */
  static async validateCountry(code: string): Promise<boolean> {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM md_countries WHERE code = $1`,
      code
    );
    return result[0]?.count > 0;
  }

  /**
   * Validate province
   */
  static async validateProvince(code: string, countryId: string = 'country-vn'): Promise<boolean> {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM md_provinces WHERE code = $1 AND country_id = $2`,
      code,
      countryId
    );
    return result[0]?.count > 0;
  }

  /**
   * Lấy danh sách countries
   */
  static async getCountries(activeOnly: boolean = true): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_countries ORDER BY name ASC`;
  }

  /**
   * Lấy danh sách provinces theo country
   */
  static async getProvinces(countryId: string = 'country-vn', activeOnly: boolean = true): Promise<any[]> {
    return prisma.$queryRawUnsafe(
      `SELECT * FROM md_provinces WHERE country_id = $1 ORDER BY name ASC`,
      countryId
    );
  }

  /**
   * Lấy danh sách currencies
   */
  static async getCurrencies(activeOnly: boolean = true): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_currencies ORDER BY code ASC`;
  }

  /**
   * Lấy container sizes
   */
  static async getContainerSizes(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_container_sizes ORDER BY size_ft ASC`;
  }

  /**
   * Lấy container types
   */
  static async getContainerTypes(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_container_types ORDER BY code ASC`;
  }

  /**
   * Lấy quality standards
   */
  static async getQualityStandards(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_quality_standards ORDER BY code ASC`;
  }

  /**
   * Lấy deal types
   */
  static async getDealTypes(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_deal_types ORDER BY code ASC`;
  }

  /**
   * Lấy listing statuses
   */
  static async getListingStatuses(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_listing_statuses ORDER BY sort_order ASC`;
  }

  /**
   * Lấy order statuses
   */
  static async getOrderStatuses(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_order_statuses ORDER BY sort_order ASC`;
  }

  /**
   * Lấy payment statuses
   */
  static async getPaymentStatuses(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_payment_statuses ORDER BY sort_order ASC`;
  }

  /**
   * Lấy delivery statuses
   */
  static async getDeliveryStatuses(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_delivery_statuses ORDER BY sort_order ASC`;
  }

  /**
   * Lấy rental units
   */
  static async getRentalUnits(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_rental_units ORDER BY code ASC`;
  }

  /**
   * Lấy dispute reasons
   */
  static async getDisputeReasons(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_dispute_reasons ORDER BY code ASC`;
  }

  /**
   * Lấy cancel reasons
   */
  static async getCancelReasons(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_cancel_reasons ORDER BY code ASC`;
  }

  /**
   * Lấy inspection item codes
   */
  static async getInspectionItemCodes(category?: string): Promise<any[]> {
    if (category) {
      return prisma.$queryRawUnsafe(
        `SELECT * FROM md_inspection_item_codes WHERE category = $1 ORDER BY code ASC`,
        category
      );
    }
    return prisma.$queryRaw`SELECT * FROM md_inspection_item_codes ORDER BY code ASC`;
  }

  /**
   * Lấy repair item codes
   */
  static async getRepairItemCodes(category?: string): Promise<any[]> {
    if (category) {
      return prisma.$queryRawUnsafe(
        `SELECT * FROM md_repair_item_codes WHERE category = $1 ORDER BY code ASC`,
        category
      );
    }
    return prisma.$queryRaw`SELECT * FROM md_repair_item_codes ORDER BY code ASC`;
  }

  /**
   * Lấy notification event types
   */
  static async getNotificationEventTypes(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_notification_event_types ORDER BY code ASC`;
  }

  /**
   * Lấy insurance coverages
   */
  static async getInsuranceCoverages(): Promise<any[]> {
    return prisma.$queryRaw`SELECT * FROM md_insurance_coverages ORDER BY code ASC`;
  }

  /**
   * Lấy tất cả master data cần thiết cho form tạo listing
   */
  static async getListingFormData(): Promise<any> {
    const [
      dealTypes,
      containerSizes,
      containerTypes,
      qualityStandards,
      currencies,
      provinces,
      rentalUnits
    ] = await Promise.all([
      this.getDealTypes(),
      this.getContainerSizes(),
      this.getContainerTypes(),
      this.getQualityStandards(),
      this.getCurrencies(),
      this.getProvinces('country-vn'),
      this.getRentalUnits()
    ]);

    return {
      dealTypes,
      containerSizes,
      containerTypes,
      qualityStandards,
      currencies,
      provinces,
      rentalUnits
    };
  }

  /**
   * Lấy tất cả master data cần thiết cho order
   */
  static async getOrderFormData(): Promise<any> {
    const [
      currencies,
      paymentStatuses,
      deliveryStatuses,
      incoterms
    ] = await Promise.all([
      this.getCurrencies(),
      this.getPaymentStatuses(),
      this.getDeliveryStatuses(),
      prisma.$queryRaw`SELECT * FROM md_incoterms ORDER BY code ASC`
    ]);

    return {
      currencies,
      paymentStatuses,
      deliveryStatuses,
      incoterms
    };
  }

  /**
   * Lấy tất cả master data cần thiết cho inspection
   */
  static async getInspectionFormData(): Promise<any> {
    const [
      inspectionItems,
      qualityStandards
    ] = await Promise.all([
      this.getInspectionItemCodes(),
      this.getQualityStandards()
    ]);

    return {
      inspectionItems,
      qualityStandards
    };
  }

  /**
   * Lấy tất cả master data cần thiết cho repair
   */
  static async getRepairFormData(): Promise<any> {
    const [
      repairItems,
      units
    ] = await Promise.all([
      this.getRepairItemCodes(),
      prisma.$queryRaw`SELECT * FROM md_units ORDER BY code ASC`
    ]);

    return {
      repairItems,
      units
    };
  }
}

export default MasterDataService;


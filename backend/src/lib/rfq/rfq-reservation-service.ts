// @ts-nocheck
import { PrismaClient } from '@prisma/client';

/**
 * RFQ Reservation Service
 * Handles container reservation for RFQ negotiation period
 */
export class RFQReservationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Release containers reserved by an RFQ
   * Used when RFQ is rejected, cancelled, or expired
   * 
   * @param rfqId - The RFQ ID that reserved the containers
   * @param transactionClient - Optional transaction client
   * @returns Number of containers released
   */
  async releaseRFQReservation(rfqId: string, transactionClient?: any): Promise<number> {
    const client = transactionClient || this.prisma;
    
    try {
      console.log(`🔓 [RFQ Service] Releasing containers for RFQ ${rfqId}`);
      
      // Get containers before releasing to know the listing_id and count
      const containersToRelease = await client.listing_containers.findMany({
        where: {
          reserved_by_rfq_id: rfqId,
          status: 'RESERVED'
        },
        select: {
          id: true,
          container_iso_code: true,
          listing_id: true
        }
      });

      if (containersToRelease.length === 0) {
        console.log(`ℹ️  [RFQ Service] No containers to release for RFQ ${rfqId}`);
        return 0;
      }

      const listingId = containersToRelease[0].listing_id;
      const containerCount = containersToRelease.length;
      
      // Release containers
      const result = await client.listing_containers.updateMany({
        where: {
          reserved_by_rfq_id: rfqId,
          status: 'RESERVED'
        },
        data: {
          status: 'AVAILABLE',
          reserved_by_rfq_id: null,
          reserved_until: null,
          updated_at: new Date()
        }
      });

      console.log(`✅ [RFQ Service] Released ${result.count} containers from RFQ ${rfqId}`);
      
      // ✅ INCREMENT available_quantity and DECREMENT reserved_quantity when releasing containers
      if (result.count > 0) {
        console.log(`⬆️  [RFQ Service] Incrementing available_quantity and decrementing reserved_quantity by ${result.count} for listing ${listingId}`);
        await client.listings.update({
          where: { id: listingId },
          data: {
            available_quantity: {
              increment: result.count
            },
            reserved_quantity: {
              decrement: result.count
            },
            updated_at: new Date()
          }
        });
        console.log(`✅ [RFQ Service] Updated quantities successfully`);
      }
      
      return result.count;
    } catch (error: any) {
      console.error(`❌ [RFQ Service] Failed to release containers for RFQ ${rfqId}:`, error);
      throw error;
    }
  }

  /**
   * Convert RESERVED containers to SOLD or RENTED when quote is accepted
   * 
   * @param rfqId - The RFQ ID
   * @param orderId - The order ID that purchased the containers
   * @param dealType - The deal type ('SALE' or 'RENTAL')
   * @param rentalDurationMonths - Rental duration in months (for RENTAL orders)
   * @param transactionClient - Optional transaction client
   * @returns Number of containers converted
   */
  async convertReservationToSold(
    rfqId: string, 
    orderId: string,
    dealType?: string,
    rentalDurationMonths?: number,
    transactionClient?: any
  ): Promise<number> {
    const client = transactionClient || this.prisma;
    
    try {
      const isRental = dealType === 'RENTAL';
      const targetStatus = isRental ? 'RESERVED' : 'SOLD';  // RENTAL keeps RESERVED until delivery
      
      console.log(`🔄 [RFQ Service] Converting RESERVED → ${targetStatus} for RFQ ${rfqId}, Order ${orderId}, Deal Type: ${dealType || 'SALE'}`);
      
      // ============ ✅ FIX: Get listing_id and count BEFORE update ============
      const containersToConvert = await client.listing_containers.findMany({
        where: {
          reserved_by_rfq_id: rfqId,
          status: 'RESERVED'
        },
        select: {
          id: true,
          container_iso_code: true,
          listing_id: true
        }
      });
      
      if (containersToConvert.length === 0) {
        console.warn(`⚠️  [RFQ Service] No RESERVED containers found for RFQ ${rfqId}`);
        return 0;
      }
      
      const listingId = containersToConvert[0].listing_id;
      const containerCount = containersToConvert.length;
      const containerIds = containersToConvert.map(c => c.container_iso_code);
      
      console.log(`📦 [RFQ Service] Found ${containerCount} containers to convert`);
      console.log(`   Listing ID: ${listingId}`);
      console.log(`   Container IDs: ${containerIds.join(', ')}`);
      
      // Update container status based on deal type
      const updateData: any = {
        status: targetStatus,
        reserved_by_rfq_id: null,
        reserved_until: null,
        updated_at: new Date()
      };
      
      if (isRental) {
        // For RENTAL: set rented_to_order_id, rented_at, and rental_return_date
        updateData.rented_to_order_id = orderId;
        updateData.rented_at = new Date();
        
        // Calculate return date if rental duration is provided
        if (rentalDurationMonths && rentalDurationMonths > 0) {
          const returnDate = new Date();
          returnDate.setMonth(returnDate.getMonth() + rentalDurationMonths);
          updateData.rental_return_date = returnDate;
          console.log(`   📅 Rental return date: ${returnDate.toISOString()} (${rentalDurationMonths} months from now)`);
        }
        console.log(`   Setting rented_to_order_id and rental dates for RENTAL order`);
      } else {
        // For SALE: set sold_to_order_id and sold_at
        updateData.sold_to_order_id = orderId;
        updateData.sold_at = new Date();
        console.log(`   Setting sold_to_order_id and sold_at for SALE order`);
      }
      
      const result = await client.listing_containers.updateMany({
        where: {
          reserved_by_rfq_id: rfqId,
          status: 'RESERVED'
        },
        data: updateData
      });

      // ✅ UPDATE LISTING QUANTITIES CORRECTLY
      // For SALE: containers move from RESERVED → SOLD:
      // - reserved_quantity decreases (containers no longer reserved)
      // - total_quantity decreases (containers sold, not available for listing anymore)
      // For RENTAL: containers stay RESERVED until delivery
      // - reserved_quantity stays same (still reserved)
      // - total_quantity stays same (still in listing, just rented out)
      if (!isRental) {
        await client.listings.update({
          where: { id: listingId },
          data: {
            reserved_quantity: { decrement: containerCount },
            total_quantity: { decrement: containerCount },
            updated_at: new Date()
          }
        });
        
        console.log(`📊 [RFQ Service] Updated listing quantities for SALE:`);
        console.log(`   - Decreased reserved_quantity by ${containerCount}`);
        console.log(`   - Decreased total_quantity by ${containerCount}`);
      } else {
        console.log(`📊 [RFQ Service] Rental order: quantities unchanged (containers remain RESERVED)`);
      }
      
      console.log(`✅ [RFQ Service] Converted ${result.count} containers to ${targetStatus}`);
      
      return result.count;
    } catch (error: any) {
      console.error(`❌ [RFQ Service] Failed to convert containers:`, error);
      throw error;
    }
  }

  /**
   * Auto-release expired RFQ reservations
   * Should be run periodically (e.g., every hour)
   * 
   * @returns Number of containers released
   */
  async releaseExpiredReservations(): Promise<number> {
    try {
      console.log('🔄 [RFQ Service] Checking for expired reservations...');
      
      // Get expired containers grouped by listing
      const expiredContainers = await this.prisma.listing_containers.findMany({
        where: {
          status: 'RESERVED',
          reserved_by_rfq_id: { not: null },
          reserved_until: { lt: new Date() }
        },
        select: {
          id: true,
          listing_id: true,
          container_iso_code: true,
          reserved_by_rfq_id: true
        }
      });

      if (expiredContainers.length === 0) {
        console.log('ℹ️  [RFQ Service] No expired reservations found');
        return 0;
      }

      // Group by listing_id to increment available_quantity correctly
      const listingGroups = expiredContainers.reduce((acc, container) => {
        if (!acc[container.listing_id]) {
          acc[container.listing_id] = [];
        }
        acc[container.listing_id].push(container);
        return acc;
      }, {} as Record<string, typeof expiredContainers>);

      // Release containers
      const result = await this.prisma.listing_containers.updateMany({
        where: {
          status: 'RESERVED',
          reserved_by_rfq_id: { not: null },
          reserved_until: { lt: new Date() }
        },
        data: {
          status: 'AVAILABLE',
          reserved_by_rfq_id: null,
          reserved_until: null,
          updated_at: new Date()
        }
      });

      // ✅ INCREMENT available_quantity and DECREMENT reserved_quantity for each listing
      for (const [listingId, containers] of Object.entries(listingGroups)) {
        console.log(`⬆️  [RFQ Service] Incrementing available_quantity and decrementing reserved_quantity by ${containers.length} for listing ${listingId}`);
        await this.prisma.listings.update({
          where: { id: listingId },
          data: {
            available_quantity: {
              increment: containers.length
            },
            reserved_quantity: {
              decrement: containers.length
            },
            updated_at: new Date()
          }
        });
      }

      console.log(`✅ [RFQ Service] Released ${result.count} expired reservations across ${Object.keys(listingGroups).length} listings`);
      return result.count;
    } catch (error: any) {
      console.error('❌ [RFQ Service] Failed to release expired reservations:', error);
      throw error;
    }
  }

  /**
   * Get RFQ reservation status
   * 
   * @param rfqId - The RFQ ID
   * @returns Reservation details
   */
  async getReservationStatus(rfqId: string) {
    try {
      const containers = await this.prisma.listing_containers.findMany({
        where: {
          reserved_by_rfq_id: rfqId
        },
        select: {
          id: true,
          container_iso_code: true,
          status: true,
          reserved_until: true,
          listing_id: true
        }
      });

      const isExpired = containers.some(c => 
        c.reserved_until && c.reserved_until < new Date()
      );

      return {
        rfqId,
        reservedContainers: containers.length,
        containers: containers.map(c => ({
          id: c.id,
          code: c.container_iso_code,
          status: c.status,
          reservedUntil: c.reserved_until
        })),
        isExpired,
        allReserved: containers.every(c => c.status === 'RESERVED')
      };
    } catch (error: any) {
      console.error(`❌ [RFQ Service] Failed to get reservation status:`, error);
      throw error;
    }
  }

  /**
   * Check if containers are still available for RFQ
   * Used before creating RFQ to prevent conflicts
   * 
   * @param listingId - The listing ID
   * @param containerCodes - Array of container ISO codes
   * @returns Availability check result
   */
  async checkContainerAvailability(
    listingId: string, 
    containerCodes: string[]
  ): Promise<{
    available: boolean;
    availableContainers: string[];
    unavailableContainers: Array<{ code: string; status: string }>;
  }> {
    try {
      const containers = await this.prisma.listing_containers.findMany({
        where: {
          listing_id: listingId,
          container_iso_code: { in: containerCodes }
        },
        select: {
          container_iso_code: true,
          status: true
        }
      });

      const availableContainers = containers
        .filter(c => c.status === 'AVAILABLE')
        .map(c => c.container_iso_code);

      const unavailableContainers = containers
        .filter(c => c.status !== 'AVAILABLE')
        .map(c => ({
          code: c.container_iso_code,
          status: c.status
        }));

      return {
        available: unavailableContainers.length === 0,
        availableContainers,
        unavailableContainers
      };
    } catch (error: any) {
      console.error('❌ [RFQ Service] Failed to check availability:', error);
      throw error;
    }
  }
}

// Export singleton instance helper
let rfqReservationServiceInstance: RFQReservationService | null = null;

export function getRFQReservationService(prisma: PrismaClient): RFQReservationService {
  if (!rfqReservationServiceInstance) {
    rfqReservationServiceInstance = new RFQReservationService(prisma);
  }
  return rfqReservationServiceInstance;
}

import { PrismaClient } from '@prisma/client';

/**
 * InventoryService - Centralized service for managing listing inventory
 * Handles reserve, release, and confirmation of container inventory
 */
export class InventoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Reserve inventory when order is created
   * Decrements available_quantity and marks containers as SOLD or RESERVED
   * 
   * @param orderId - The order ID reserving the inventory
   * @param listingId - The listing ID to reserve from
   * @param quantity - Number of containers to reserve
   * @param containerIds - Optional specific container ISO codes to reserve
   * @param dealType - Optional deal type ('SALE' or 'RENTAL') to determine status
   * @param rentalDurationMonths - Optional rental duration in months (for RENTAL orders)
   * @returns Promise<boolean>
   */
  async reserveInventory(
    orderId: string, 
    listingId: string, 
    quantity: number, 
    containerIds?: string[],
    dealType?: string,
    rentalDurationMonths?: number
  ): Promise<boolean> {
    try {
      console.log('🔄 [InventoryService] reserveInventory CALLED');
      console.log('   OrderId:', orderId);
      console.log('   ListingId:', listingId);
      console.log('   Quantity:', quantity);
      console.log('   ContainerIds:', containerIds?.length || 0, 'containers');
      console.log('   Deal Type:', dealType || 'SALE');
      console.log('   Rental Duration:', rentalDurationMonths || 'N/A', 'months');
      
      // Use this.prisma directly - it's already the transaction if passed from outside
      // 1. Check if enough inventory available
      const listing = await this.prisma.listings.findUnique({
        where: { id: listingId },
        select: { 
          id: true, 
          title: true,
          available_quantity: true,
          total_quantity: true 
        }
      });

      if (!listing) {
        console.error('❌ [InventoryService] Listing not found:', listingId);
        throw new Error(`Listing ${listingId} not found`);
      }

      const currentAvailable = listing.available_quantity || 0;
      console.log('📊 [InventoryService] Current available_quantity:', currentAvailable);
      if (currentAvailable < quantity) {
        console.error('❌ [InventoryService] Not enough inventory!');
        console.error('   Available:', currentAvailable);
        console.error('   Requested:', quantity);
        throw new Error(
          `Not enough inventory. Available: ${currentAvailable}, Requested: ${quantity}`
        );
      }

      // 2. Update quantities based on deal_type
      const isRental = dealType === 'RENTAL';
      
      if (isRental) {
        // ✅ RENTAL: Containers remain AVAILABLE until actually rented (after payment/delivery)
        // Don't decrement available_quantity yet, will be updated when containers marked as RENTED
        console.log('📝 [InventoryService] RENTAL order: Containers will be marked RESERVED (not affecting available_quantity yet)');
      } else {
        // SALE: Decrement available, increment reserved immediately
        console.log('⬇️  [InventoryService] SALE order: Decrementing available_quantity by', quantity);
        console.log('⬆️  [InventoryService] Incrementing reserved_quantity by', quantity);
        const updateResult = await this.prisma.listings.update({
          where: { id: listingId },
          data: {
            available_quantity: {
              decrement: quantity
            },
            reserved_quantity: {
              increment: quantity
            },
            updated_at: new Date()
          }
        });

        console.log('✅ [InventoryService] Reserved', quantity, 'units from listing', listingId);
        console.log('   Before:', currentAvailable, '→ After:', updateResult.available_quantity);
        console.log('   Listing:', listing.title);
      }

      // 3. Update specific container status if container IDs provided
      if (containerIds && containerIds.length > 0) {
        // ✅ Determine status based on deal_type
        const containerStatus = isRental ? 'RESERVED' : 'SOLD'; // RESERVED for rental, SOLD for sale
        
        console.log(`🔄 [InventoryService] Deal Type: ${dealType || 'SALE'}, Setting status: ${containerStatus}`);
        
        const updateData: any = {
          status: containerStatus,
          updated_at: new Date()
        };
        
        // Set appropriate order ID and timestamp based on deal type
        if (isRental) {
          // For rental: set rented_to_order_id, rented_at, and rental_return_date
          updateData.rented_to_order_id = orderId;
          updateData.rented_at = new Date();
          
          // Calculate return date if rental duration is provided
          if (rentalDurationMonths && rentalDurationMonths > 0) {
            const returnDate = new Date();
            returnDate.setMonth(returnDate.getMonth() + rentalDurationMonths);
            updateData.rental_return_date = returnDate;
            console.log(`   📅 Rental return date: ${returnDate.toISOString()} (${rentalDurationMonths} months from now)`);
          }
        } else {
          // For sale: set sold_to_order_id and sold_at
          updateData.sold_to_order_id = orderId;
          updateData.sold_at = new Date();
        }
        
        const updateResult = await this.prisma.listing_containers.updateMany({
          where: {
            listing_id: listingId,
            container_iso_code: { in: containerIds },
            status: 'AVAILABLE' // Only update containers that are actually available
          },
          data: updateData
        });

        console.log(`✅ [InventoryService] Marked ${updateResult.count} containers as ${containerStatus} for order ${orderId}`);
        console.log(`   Container IDs: ${containerIds.join(', ')}`);

        if (updateResult.count !== containerIds.length) {
          console.warn(`⚠️  [InventoryService] Expected to update ${containerIds.length} containers, but only updated ${updateResult.count}`);
        }
        
        // Update quantities based on deal_type
        if (!isRental) {
          // SALE: Move from reserved to sold, decrease total
          await this.prisma.listings.update({
            where: { id: listingId },
            data: {
              reserved_quantity: { decrement: updateResult.count },
              total_quantity: { decrement: updateResult.count },
              updated_at: new Date()
            }
          });
          
          console.log(`📊 [InventoryService] Updated listing quantities for sold containers:`);
          console.log(`   - Decreased reserved_quantity by ${updateResult.count}`);
          console.log(`   - Decreased total_quantity by ${updateResult.count}`);
        } else {
          // RENTAL: Increment reserved_quantity (containers reserved for rental)
          await this.prisma.listings.update({
            where: { id: listingId },
            data: {
              reserved_quantity: { increment: updateResult.count },
              updated_at: new Date()
            }
          });
          
          console.log(`📊 [InventoryService] Rental order: incremented reserved_quantity by ${updateResult.count}`);
        }
      }

      return true;
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to reserve inventory:`, error);
      throw error;
    }
  }

  /**
   * Release inventory when order is cancelled or payment is rejected
   * Increments available_quantity and resets container status
   * 
   * @param orderId - The order ID releasing the inventory
   * @param listingId - The listing ID to release to
   * @param quantity - Number of containers to release
   * @returns Promise<boolean>
   */
  async releaseInventory(
    orderId: string, 
    listingId: string, 
    quantity: number
  ): Promise<boolean> {
    try {
      // Use this.prisma directly - it's already the transaction if passed from outside
      // 1. Check listing exists
      const listing = await this.prisma.listings.findUnique({
        where: { id: listingId },
        select: { 
          id: true, 
          title: true,
          available_quantity: true,
          total_quantity: true 
        }
      });

      if (!listing) {
        throw new Error(`Listing ${listingId} not found`);
      }

      const currentAvailable = listing.available_quantity || 0;

      // 2. Increment available quantity AND decrement reserved quantity
      await this.prisma.listings.update({
        where: { id: listingId },
        data: {
          available_quantity: {
            increment: quantity
          },
          reserved_quantity: {
            decrement: quantity
          },
          updated_at: new Date()
        }
      });

      console.log(`✅ [InventoryService] Released ${quantity} units to listing ${listingId}`);
      console.log(`   Available: ${currentAvailable} → ${currentAvailable + quantity}`);
      console.log(`   Reserved: decreased by ${quantity}`);

      // 3. Reset container status for this order (both sold and rented)
      const resetSoldResult = await this.prisma.listing_containers.updateMany({
        where: {
          sold_to_order_id: orderId
        },
        data: {
          status: 'AVAILABLE',
          sold_to_order_id: null,
          sold_at: null,
          updated_at: new Date()
        }
      });

      const resetRentedResult = await this.prisma.listing_containers.updateMany({
        where: {
          rented_to_order_id: orderId
        },
        data: {
          status: 'AVAILABLE',
          rented_to_order_id: null,
          rented_at: null,
          rental_return_date: null,
          updated_at: new Date()
        }
      });

      const totalReset = resetSoldResult.count + resetRentedResult.count;
      console.log(`✅ [InventoryService] Reset ${totalReset} containers to AVAILABLE status (${resetSoldResult.count} sold, ${resetRentedResult.count} rented)`);

      return true;
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to release inventory:`, error);
      throw error;
    }
  }

  /**
   * Confirm rental - Convert RESERVED containers to RENTED and update quantities
   * Called when rental order is paid/delivered
   * 
   * @param orderId - The order ID to confirm
   * @returns Promise<number> - Number of containers confirmed as rented
   */
  async confirmRental(orderId: string): Promise<number> {
    try {
      // Find the order and listing
      const order = await this.prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          listing_containers_rented: {
            select: {
              listing_id: true,
              status: true
            }
          }
        }
      });

      if (!order || !order.listing_containers_rented.length) {
        console.log(`⚠️  [InventoryService] No containers to confirm for order ${orderId}`);
        return 0;
      }

      const listingId = order.listing_containers_rented[0].listing_id;

      // Update containers from RESERVED to RENTED
      const confirmResult = await this.prisma.listing_containers.updateMany({
        where: {
          rented_to_order_id: orderId,
          status: 'RESERVED'
        },
        data: {
          status: 'RENTED',
          updated_at: new Date()
        }
      });

      if (confirmResult.count > 0) {
        // Update listing quantities: RESERVED → RENTED
        await this.prisma.listings.update({
          where: { id: listingId },
          data: {
            available_quantity: { decrement: confirmResult.count },
            reserved_quantity: { decrement: confirmResult.count },
            rented_quantity: { increment: confirmResult.count },
            updated_at: new Date()
          }
        });

        console.log(`✅ [InventoryService] Confirmed rental for ${confirmResult.count} containers in order ${orderId}`);
        console.log(`   Updated quantities: available↓, reserved↓, rented↑ by ${confirmResult.count}`);
      }

      return confirmResult.count;
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to confirm rental:`, error);
      throw error;
    }
  }

  /**
   * Confirm sale - Final confirmation when order is completed
   * Marks containers as permanently sold (no change to quantity, already decremented)
   * 
   * @param orderId - The order ID to confirm
   * @returns Promise<number> - Number of containers confirmed
   */
  async confirmSale(orderId: string): Promise<number> {
    try {
      // Use this.prisma directly - it's already the transaction if passed from outside
      // Update container status to ensure they're marked as SOLD with timestamp
      const confirmResult = await this.prisma.listing_containers.updateMany({
        where: {
          sold_to_order_id: orderId,
          status: { in: ['SOLD', 'RESERVED'] }
        },
        data: {
          status: 'SOLD',
          sold_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ [InventoryService] Confirmed sale for ${confirmResult.count} containers in order ${orderId}`);

      return confirmResult.count;
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to confirm sale:`, error);
      throw error;
    }
  }

  /**
   * Get inventory status for a listing
   * Useful for debugging and auditing
   * 
   * @param listingId - The listing ID to check
   * @returns Inventory status details
   */
  async getInventoryStatus(listingId: string) {
    try {
      const listing = await this.prisma.listings.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          title: true,
          total_quantity: true,
          available_quantity: true,
          reserved_quantity: true,
          listing_containers: {
            select: {
              container_iso_code: true,
              status: true,
              sold_to_order_id: true,
              sold_at: true,
              rented_to_order_id: true
            }
          }
        }
      });

      if (!listing) {
        throw new Error(`Listing ${listingId} not found`);
      }

      const containersByStatus = listing.listing_containers.reduce((acc, container) => {
        acc[container.status] = (acc[container.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        listingId: listing.id,
        title: listing.title,
        totalQuantity: listing.total_quantity,
        availableQuantity: listing.available_quantity,
        reservedQuantity: listing.reserved_quantity,
        containersByStatus,
        totalContainers: listing.listing_containers.length
      };
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to get inventory status:`, error);
      throw error;
    }
  }

  /**
   * Verify inventory consistency
   * Checks if available_quantity matches actual container status
   * 
   * @param listingId - The listing ID to verify
   * @returns Verification result with discrepancies if any
   */
  async verifyInventoryConsistency(listingId: string) {
    try {
      const status = await this.getInventoryStatus(listingId);
      
      const actualAvailable = status.containersByStatus['AVAILABLE'] || 0;
      const recordedAvailable = status.availableQuantity || 0;
      
      const discrepancy = recordedAvailable - actualAvailable;
      
      const result = {
        listingId: status.listingId,
        title: status.title,
        totalQuantity: status.totalQuantity,
        recordedAvailable,
        actualAvailable,
        discrepancy,
        isConsistent: discrepancy === 0,
        containersByStatus: status.containersByStatus
      };

      if (!result.isConsistent) {
        console.warn(`⚠️  [InventoryService] Inventory inconsistency detected for listing ${listingId}:`);
        console.warn(`   Recorded Available: ${recordedAvailable}`);
        console.warn(`   Actual Available: ${actualAvailable}`);
        console.warn(`   Discrepancy: ${discrepancy}`);
      } else {
        console.log(`✅ [InventoryService] Inventory is consistent for listing ${listingId}`);
      }

      return result;
    } catch (error: any) {
      console.error(`❌ [InventoryService] Failed to verify inventory consistency:`, error);
      throw error;
    }
  }
}

// Export singleton instance helper
let inventoryServiceInstance: InventoryService | null = null;

export function getInventoryService(prisma: PrismaClient): InventoryService {
  if (!inventoryServiceInstance) {
    inventoryServiceInstance = new InventoryService(prisma);
  }
  return inventoryServiceInstance;
}

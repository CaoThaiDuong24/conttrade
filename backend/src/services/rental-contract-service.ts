/**
 * Rental Contract Service
 * Handles automatic rental contract creation and management
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export class RentalContractService {
  /**
   * Automatically create rental contract when order is paid
   * Called from order payment verification hook
   */
  static async createContractFromOrder(orderId: string): Promise<{ 
    success: boolean; 
    contractId?: string; 
    contractIds?: string[];
    containerCount?: number;
    message: string 
  }> {
    try {
      // Get order with all necessary relations
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          listings: {
            select: {
              id: true,
              deal_type: true,
              price_amount: true,
              price_currency: true,
              rental_unit: true,
              min_rental_duration: true,
              deposit_required: true,
              deposit_amount: true,
              deposit_currency: true,
              late_return_fee_amount: true,
              late_return_fee_unit: true,
              location_depot_id: true,
            },
          },
          order_items: {
            select: {
              id: true,
              order_id: true,
              item_type: true,
              ref_id: true,
              description: true,
              deal_type: true,                      // ✅ Include deal_type
              rental_duration_months: true,         // ✅ Include rental_duration_months
              qty: true,
              unit_price: true,
              total_price: true,
              created_at: true,
            },
          },
          listing_containers_sold: {
            select: {
              id: true,
              container_iso_code: true,
              listing_id: true,
            },
          },
          listing_containers_rented: {
            select: {
              id: true,
              container_iso_code: true,
              listing_id: true,
            },
          },
        },
      });

      if (!order) {
        return { success: false, message: 'Order not found' };
      }

      // Check if this is a rental order
      if (order.listings?.deal_type !== 'RENTAL') {
        console.log(`Order ${orderId} is not a rental order (deal_type: ${order.listings?.deal_type}). Skipping contract creation.`);
        return { success: true, message: 'Not a rental order, contract not needed' };
      }

      // Check if contract already exists
      const existingContract = await prisma.rental_contracts.findFirst({
        where: {
          order_id: orderId,
          deleted_at: null,
        },
      });

      if (existingContract) {
        console.log(`Rental contract already exists for order ${orderId}: ${existingContract.id}`);
        return { success: true, contractId: existingContract.id, message: 'Contract already exists' };
      }

      const listing = order.listings;
      if (!listing) {
        return { success: false, message: 'Listing not found for order' };
      }

      // ✅ FIX: Get rental duration from order (highest priority)
      const orderItem = order.order_items[0];
      const rentalDurationMonths = 
        order.rental_duration_months ||                    // 1. From order
        orderItem?.rental_duration_months ||               // 2. From order_items
        listing.min_rental_duration ||                     // 3. Fallback: min duration
        1;                                                 // 4. Default: 1 month

      // ✅ Validate for rental orders
      if (order.deal_type === 'RENTAL' && !order.rental_duration_months) {
        console.warn(`⚠️  Order ${orderId} is RENTAL but missing rental_duration_months. Using fallback: ${rentalDurationMonths} month(s)`);
      }

      console.log(`📅 Rental duration: ${rentalDurationMonths} month(s) (source: ${
        order.rental_duration_months ? 'order' : 
        orderItem?.rental_duration_months ? 'order_items' : 
        'listing.min_rental_duration'
      })`);

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + rentalDurationMonths);

      // Get containers (use rented containers first, then sold containers as fallback)
      const rentedContainers = order.listing_containers_rented || [];
      const soldContainers = order.listing_containers_sold || [];
      const containers = rentedContainers.length > 0 ? rentedContainers : soldContainers;
      
      if (!containers || containers.length === 0) {
        console.log(`No containers found for order ${orderId}. Cannot create rental contracts.`);
        return { success: false, message: 'No containers assigned to order' };
      }

      console.log(`📦 Creating rental contracts for ${containers.length} container(s)`);

      // Calculate amounts PER CONTAINER
      const rentalPricePerContainer = Number(listing.price_amount);
      const totalAmountDuePerContainer = rentalPricePerContainer * rentalDurationMonths;
      const depositAmountPerContainer = listing.deposit_required ? Number(listing.deposit_amount || 0) : 0;
      const depositPaid = depositAmountPerContainer > 0; // Assume deposit paid with first payment

      // ✅ Validate total_amount_due matches order.total
      const expectedTotal = (totalAmountDuePerContainer + depositAmountPerContainer) * containers.length;
      const actualTotal = Number(order.total);
      
      if (Math.abs(expectedTotal - actualTotal) > 1000) { // Allow 1000 VND tolerance for rounding/fees
        console.warn(`⚠️  Amount mismatch for order ${orderId}:
          Expected (price × duration × quantity): ${expectedTotal.toLocaleString()} ${listing.price_currency}
          Actual (order.total): ${actualTotal.toLocaleString()} ${listing.price_currency}
          Difference: ${(actualTotal - expectedTotal).toLocaleString()} ${listing.price_currency}
          This might be due to taxes/fees.
        `);
      }

      // ✅ FIX: CREATE ONE RENTAL CONTRACT FOR EACH CONTAINER
      const createdContracts: string[] = [];
      const paidPerContainer = Number(order.total) / containers.length; // Divide payment equally

      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const contractId = randomUUID();
        const contractTimestamp = Date.now() + i; // Ensure unique contract numbers
        
        const contract = await prisma.rental_contracts.create({
          data: {
            id: contractId,
            contract_number: `RC-${contractTimestamp}-${contractId.slice(0, 8).toUpperCase()}`,
            listing_id: listing.id,
            seller_id: order.seller_id,
            buyer_id: order.buyer_id,
            order_id: orderId,
            container_id: container.id,
            quantity: 1, // 1 contract per container
            
            // Contract terms - USING CORRECT SCHEMA FIELDS
            start_date: startDate,
            end_date: endDate,
            rental_price: rentalPricePerContainer,
            rental_currency: listing.price_currency || 'VND',
            rental_unit: listing.rental_unit || 'MONTHLY',
            
            // Deposit
            deposit_amount: depositAmountPerContainer,
            deposit_currency: listing.deposit_currency || 'VND',
            deposit_paid: depositPaid,
            deposit_paid_at: depositPaid ? startDate : null,
            deposit_returned: false,
            
            // Late fees
            late_fee_rate: listing.late_return_fee_amount || 0,
            late_fee_unit: listing.late_return_fee_unit || 'DAY',
            
            // Pickup/Return locations
            pickup_depot_id: listing.location_depot_id,
            return_depot_id: listing.location_depot_id,
            
            // Financial tracking
            total_amount_due: totalAmountDuePerContainer,
            total_paid: paidPerContainer,
            payment_status: paidPerContainer >= totalAmountDuePerContainer ? 'PAID' : 'PARTIALLY_PAID',
            
            // Status
            status: 'ACTIVE',
            
            // Metadata
            special_notes: `Auto-created from order ${order.order_number || orderId}. Container: ${container.container_iso_code}. Rental duration: ${rentalDurationMonths} month(s). (${i + 1}/${containers.length})`,
            
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        createdContracts.push(contract.id);
        console.log(`✅ Rental contract ${i + 1}/${containers.length} created: ${contract.id} for container ${container.container_iso_code}`);

        // Update container status to rented
        await prisma.listing_containers.update({
          where: { id: container.id },
          data: {
            status: 'RENTED',
            rented_to_order_id: orderId,
            rented_at: startDate,
            rental_return_date: endDate,
            updated_at: new Date(),
          },
        });
        console.log(`✅ Container ${container.container_iso_code} marked as RENTED`);

        // Create initial rental payment record (for tracking future payments)
        await this.generatePaymentSchedule(contract.id);
      }

      // Update listing quantities (once for all containers)
      const totalContainers = containers.length;
      await prisma.listings.update({
        where: { id: listing.id },
        data: {
          rented_quantity: {
            increment: totalContainers,
          },
          available_quantity: {
            decrement: totalContainers,
          },
          last_rented_at: startDate,
          total_rental_count: {
            increment: totalContainers,
          },
          updated_at: new Date(),
        },
      });

      console.log(`✅ Listing ${listing.id} quantities updated (rented: +${totalContainers}, available: -${totalContainers})`);

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'rental_contract_created',
          title: 'Hợp đồng thuê đã được tạo',
          message: `${totalContainers} hợp đồng thuê container đã được tạo thành công. Thời hạn: ${rentalDurationMonths} tháng.`,
          actionUrl: `/buy/orders/${orderId}`,
          orderData: {
            orderId: orderId,
            contractCount: totalContainers,
            contractIds: createdContracts,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            rentalPrice: rentalPricePerContainer,
            currency: listing.price_currency,
            action: 'view_contracts',
          },
        });
      } catch (notifError) {
        console.error('Failed to send contract creation notification:', notifError);
      }

      return {
        success: true,
        contractId: createdContracts[0], // Return first contract ID for backward compatibility
        contractIds: createdContracts,
        containerCount: totalContainers,
        message: `Successfully created ${totalContainers} rental contract(s)`,
      };
    } catch (error: any) {
      console.error('Error creating rental contract from order:', error);
      return {
        success: false,
        message: `Failed to create rental contract: ${error.message}`,
      };
    }
  }

  /**
   * Generate payment schedule for a rental contract
   * Creates rental_payments records for each payment period
   */
  static async generatePaymentSchedule(contractId: string): Promise<void> {
    try {
      const contract = await prisma.rental_contracts.findUnique({
        where: { id: contractId },
      });

      if (!contract) {
        console.error(`Contract ${contractId} not found`);
        return;
      }

      // Check if payment schedule already exists
      const existingPayments = await prisma.rental_payments.count({
        where: { rental_contract_id: contractId },
      });

      if (existingPayments > 0) {
        console.log(`Payment schedule already exists for contract ${contractId}`);
        return;
      }

      // Calculate duration in months based on start and end dates
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      const durationMonths = Math.max(1, monthsDiff);

      const rentalPrice = Number(contract.rental_price);

      // Create payment record for each month
      const paymentRecords = [];
      for (let month = 0; month < durationMonths; month++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + month);

        const paymentId = randomUUID();
        paymentRecords.push({
          id: paymentId,
          rental_contract_id: contractId,
          amount: rentalPrice,
          currency: contract.rental_currency || 'VND',
          payment_type: 'RENTAL_FEE' as const,
          due_date: dueDate,
          status: month === 0 ? ('COMPLETED' as const) : ('PENDING' as const), // First month paid
          paid_at: month === 0 ? new Date() : null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Add deposit payment if required
      const depositAmount = contract.deposit_amount ? Number(contract.deposit_amount) : 0;
      if (depositAmount > 0) {
        const depositId = randomUUID();
        paymentRecords.push({
          id: depositId,
          rental_contract_id: contractId,
          amount: depositAmount,
          currency: contract.deposit_currency || 'VND',
          payment_type: 'DEPOSIT' as const,
          due_date: startDate,
          status: contract.deposit_paid ? ('COMPLETED' as const) : ('PENDING' as const),
          paid_at: contract.deposit_paid_at || null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      await prisma.rental_payments.createMany({
        data: paymentRecords,
      });

      console.log(`✅ Payment schedule created: ${paymentRecords.length} payments for contract ${contractId}`);
    } catch (error: any) {
      console.error('Error generating payment schedule:', error);
      throw error;
    }
  }

  /**
   * Check for overdue contracts and update status
   */
  static async updateOverdueContracts(): Promise<void> {
    try {
      const now = new Date();

      // Find active contracts that are past end date
      const overdueContracts = await prisma.rental_contracts.findMany({
        where: {
          status: 'ACTIVE',
          end_date: {
            lt: now,
          },
          deleted_at: null,
        },
      });

      for (const contract of overdueContracts) {
        await prisma.rental_contracts.update({
          where: { id: contract.id },
          data: {
            status: 'OVERDUE',
            updated_at: new Date(),
          },
        });

        // Send notification to buyer
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: contract.buyer_id,
            type: 'rental_contract_overdue',
            title: 'Hợp đồng thuê đã quá hạn',
            message: `Hợp đồng ${contract.contract_number} đã quá hạn trả container. Vui lòng liên hệ để gia hạn hoặc trả container.`,
            actionUrl: `/buy/rental-contracts/${contract.id}`,
            orderData: {
              contractId: contract.id,
              contractNumber: contract.contract_number,
              endDate: contract.end_date.toISOString(),
              action: 'view_contract',
            },
          });
        } catch (notifError) {
          console.error('Failed to send overdue notification:', notifError);
        }
      }

      console.log(`✅ Updated ${overdueContracts.length} overdue contracts`);
    } catch (error: any) {
      console.error('Error updating overdue contracts:', error);
    }
  }

  /**
   * Send payment reminders before due date
   */
  static async sendPaymentReminders(daysBeforeDue: number = 3): Promise<void> {
    try {
      const now = new Date();
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + daysBeforeDue);

      // Find upcoming payments
      const upcomingPayments = await prisma.rental_payments.findMany({
        where: {
          status: 'PENDING',
          due_date: {
            gte: now,
            lte: reminderDate,
          },
        },
        include: {
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              buyer_id: true,
              rental_price: true,
              rental_currency: true,
            },
          },
        },
      });

      for (const payment of upcomingPayments) {
        const contract = payment.rental_contract;
        if (!contract || !payment.due_date) continue;

        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: contract.buyer_id,
            type: 'rental_payment_reminder',
            title: 'Nhắc nhở thanh toán tiền thuê',
            message: `Kỳ thanh toán tiền thuê container (${new Intl.NumberFormat('vi-VN').format(Number(payment.amount))} ${contract.rental_currency}) sẽ đến hạn vào ${payment.due_date.toLocaleDateString('vi-VN')}.`,
            actionUrl: `/buy/rental-payments/${payment.id}/pay`,
            orderData: {
              contractId: contract.id,
              contractNumber: contract.contract_number,
              paymentId: payment.id,
              amount: payment.amount,
              dueDate: payment.due_date.toISOString(),
              action: 'pay_now',
            },
          });
        } catch (notifError) {
          console.error('Failed to send payment reminder:', notifError);
        }
      }

      console.log(`✅ Sent ${upcomingPayments.length} payment reminders`);
    } catch (error: any) {
      console.error('Error sending payment reminders:', error);
    }
  }

  /**
   * 🆕 AUTO LATE FEE CALCULATION
   * Calculate and apply late fees for overdue payments
   * Called by cron job daily
   */
  static async calculateLateFees(): Promise<void> {
    try {
      console.log('🔄 Starting late fee calculation...');
      
      const now = new Date();
      
      // Find overdue payments (due_date < today, status = PENDING)
      const overduePayments = await prisma.rental_payments.findMany({
        where: {
          due_date: { lt: now },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
        include: {
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              buyer_id: true,
              late_fee_rate: true,
              late_fee_unit: true,
              rental_price: true,
              rental_currency: true,
            },
          },
        },
      });

      console.log(`📦 Found ${overduePayments.length} overdue payments`);

      let updatedCount = 0;

      for (const payment of overduePayments) {
        if (!payment.due_date) continue;

        const contract = payment.rental_contract;
        if (!contract) continue;

        // Calculate days overdue
        const daysOverdue = Math.floor((now.getTime() - payment.due_date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue <= 0) continue;

        let lateFee = 0;
        const lateFeeRate = Number(contract.late_fee_rate || 0);

        if (contract.late_fee_unit === 'DAY') {
          // Fixed amount per day: late_fee_rate × days
          lateFee = lateFeeRate * daysOverdue;
        } else if (contract.late_fee_unit === 'PERCENT') {
          // Percentage of rental price per day: (rental_price × late_fee_rate% / 100) × days
          lateFee = (Number(contract.rental_price) * lateFeeRate / 100) * daysOverdue;
        }

        // Update payment with late fee
        await prisma.rental_payments.update({
          where: { id: payment.id },
          data: {
            late_fee_amount: lateFee,
            late_fee_currency: contract.rental_currency,
            updated_at: new Date(),
          },
        });

        // Update contract total_amount_due if late fee is new
        const previousLateFee = Number(payment.late_fee_amount || 0);
        const lateFeeIncrease = lateFee - previousLateFee;

        if (lateFeeIncrease > 0) {
          await prisma.rental_contracts.update({
            where: { id: contract.id },
            data: {
              total_amount_due: {
                increment: lateFeeIncrease,
              },
              updated_at: new Date(),
            },
          });
        }

        updatedCount++;
        console.log(`   💰 Late fee calculated: Payment ${payment.id.slice(0, 8)}, Fee: ${lateFee.toLocaleString()} ${contract.rental_currency} (${daysOverdue} days)`);
      }

      console.log(`✅ Late fee calculation complete: ${updatedCount} payments updated`);
    } catch (error: any) {
      console.error('❌ Error calculating late fees:', error);
    }
  }

  /**
   * 🆕 AUTO-RENEWAL LOGIC
   * Process auto-renewals for contracts expiring soon
   * Called by cron job daily
   */
  static async processAutoRenewals(): Promise<void> {
    try {
      console.log('🔄 Starting auto-renewal process...');
      
      const now = new Date();
      const sevenDaysLater = new Date(now);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      // Find contracts expiring in 7 days with auto_renewal_enabled
      const expiringContracts = await prisma.rental_contracts.findMany({
        where: {
          end_date: {
            gte: now,
            lte: sevenDaysLater,
          },
          auto_renewal_enabled: true,
          status: 'ACTIVE',
          deleted_at: null,
        },
        include: {
          buyer: {
            select: { id: true, full_name: true, email: true },
          },
          seller: {
            select: { id: true, full_name: true, email: true },
          },
          listing: {
            select: {
              id: true,
              title: true,
              price_amount: true,
              price_currency: true,
              min_rental_duration: true,
            },
          },
        },
      });

      console.log(`📦 Found ${expiringContracts.length} contracts eligible for auto-renewal`);

      let renewedCount = 0;
      let skippedCount = 0;

      for (const contract of expiringContracts) {
        try {
          // Check for overdue payments
          const overduePayments = await prisma.rental_payments.count({
            where: {
              rental_contract_id: contract.id,
              due_date: { lt: now },
              status: { in: ['PENDING', 'PARTIALLY_PAID'] },
            },
          });

          if (overduePayments > 0) {
            console.log(`   ⚠️  Skipping renewal for ${contract.contract_number}: Has ${overduePayments} overdue payments`);
            
            // Notify buyer about blocked renewal
            try {
              const { NotificationService } = await import('../lib/notifications/notification-service');
              await NotificationService.createNotification({
                userId: contract.buyer_id,
                type: 'rental_contract_overdue',
                title: '⚠️ Không thể gia hạn tự động',
                message: `Hợp đồng ${contract.contract_number} không thể gia hạn tự động do có ${overduePayments} kỳ thanh toán quá hạn. Vui lòng thanh toán để tiếp tục.`,
                actionUrl: `/buy/rental-contracts/${contract.id}`,
                priority: 'high',
                orderData: {
                  contractId: contract.id,
                  reason: 'overdue_payments',
                  overdueCount: overduePayments,
                },
              });
            } catch (notifError) {
              console.error('Failed to send renewal blocked notification:', notifError);
            }
            
            skippedCount++;
            continue;
          }

          // Calculate renewal duration
          const renewalMonths = contract.auto_renewal_duration_months || 
                                contract.listing?.min_rental_duration || 
                                1;

          // Create renewal contract
          const renewalContractId = randomUUID();
          const newStartDate = new Date(contract.end_date);
          const newEndDate = new Date(newStartDate);
          newEndDate.setMonth(newEndDate.getMonth() + renewalMonths);

          const renewalContract = await prisma.rental_contracts.create({
            data: {
              id: renewalContractId,
              contract_number: `RC-RENEW-${Date.now()}-${renewalContractId.slice(0, 8).toUpperCase()}`,
              listing_id: contract.listing_id,
              seller_id: contract.seller_id,
              buyer_id: contract.buyer_id,
              container_id: contract.container_id,
              
              // Renewal metadata
              previous_contract_id: contract.id,
              
              // Contract terms (same as previous)
              start_date: newStartDate,
              end_date: newEndDate,
              rental_price: contract.rental_price,
              rental_currency: contract.rental_currency,
              rental_unit: contract.rental_unit,
              
              // Deposit already collected
              deposit_amount: 0,
              deposit_paid: true,
              deposit_paid_at: contract.deposit_paid_at,
              deposit_returned: false,
              
              // Same terms
              late_fee_rate: contract.late_fee_rate,
              late_fee_unit: contract.late_fee_unit,
              pickup_depot_id: contract.pickup_depot_id,
              return_depot_id: contract.return_depot_id,
              
              // Financial
              total_amount_due: Number(contract.rental_price) * renewalMonths,
              total_paid: 0,
              payment_status: 'PENDING',
              
              // Auto-renewal settings (carry forward)
              auto_renewal_enabled: contract.auto_renewal_enabled,
              auto_renewal_duration_months: contract.auto_renewal_duration_months,
              
              // Status
              status: 'ACTIVE',
              
              special_notes: `Auto-renewed from contract ${contract.contract_number}. Duration: ${renewalMonths} month(s).`,
              
              created_at: new Date(),
              updated_at: new Date(),
            },
          });

          // Generate payment schedule for renewal
          await this.generatePaymentSchedule(renewalContract.id);

          // Update previous contract
          await prisma.rental_contracts.update({
            where: { id: contract.id },
            data: {
              status: 'RENEWED',
              renewal_contract_id: renewalContractId,
              updated_at: new Date(),
            },
          });

          // Send notifications
          try {
            const { NotificationService } = await import('../lib/notifications/notification-service');
            
            // Notify buyer
            await NotificationService.createNotification({
              userId: contract.buyer_id,
              type: 'rental_contract_created',
              title: '🔄 Hợp đồng đã được gia hạn tự động',
              message: `Hợp đồng ${contract.contract_number} đã được gia hạn tự động thành ${renewalContract.contract_number}. Thời hạn mới: ${renewalMonths} tháng.`,
              actionUrl: `/buy/rental-contracts/${renewalContract.id}`,
              priority: 'high',
              orderData: {
                oldContractId: contract.id,
                newContractId: renewalContract.id,
                newContractNumber: renewalContract.contract_number,
                renewalMonths,
                newEndDate: newEndDate.toISOString(),
              },
            });

            // Notify seller
            await NotificationService.createNotification({
              userId: contract.seller_id,
              type: 'rental_contract_created',
              title: '🔄 Hợp đồng thuê đã được gia hạn',
              message: `Hợp đồng ${contract.contract_number} đã được gia hạn tự động ${renewalMonths} tháng bởi ${contract.buyer?.full_name}.`,
              actionUrl: `/sell/rental-management/contracts`,
              priority: 'medium',
              orderData: {
                contractId: renewalContract.id,
                buyerName: contract.buyer?.full_name,
                renewalMonths,
              },
            });
          } catch (notifError) {
            console.error('Failed to send renewal notifications:', notifError);
          }

          renewedCount++;
          console.log(`   ✅ Auto-renewed: ${contract.contract_number} → ${renewalContract.contract_number}`);

        } catch (error) {
          console.error(`   ❌ Error renewing contract ${contract.contract_number}:`, error);
          skippedCount++;
        }
      }

      console.log(`✅ Auto-renewal process complete:`);
      console.log(`   - Total eligible: ${expiringContracts.length}`);
      console.log(`   - Successfully renewed: ${renewedCount}`);
      console.log(`   - Skipped: ${skippedCount}`);

    } catch (error: any) {
      console.error('❌ Error in auto-renewal process:', error);
    }
  }

  /**
   * 🆕 PAYMENT RETRY LOGIC
   * Retry failed rental payments
   * Called by cron job or manually
   */
  static async retryFailedPayments(): Promise<void> {
    try {
      console.log('🔄 Starting payment retry process...');
      
      const now = new Date();
      
      // Find failed payments eligible for retry
      const failedPayments = await prisma.rental_payments.findMany({
        where: {
          status: 'FAILED',
          // retry_count: { lt: 3 }, // Max 3 retries (if field exists)
          updated_at: {
            // Only retry if last attempt was > 1 day ago
            lt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
        include: {
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              buyer_id: true,
            },
          },
        },
        take: 50, // Limit to 50 retries per run
      });

      console.log(`📦 Found ${failedPayments.length} failed payments to retry`);

      let retriedCount = 0;

      for (const payment of failedPayments) {
        try {
          // Update status to PENDING for manual retry
          await prisma.rental_payments.update({
            where: { id: payment.id },
            data: {
              status: 'PENDING',
              updated_at: new Date(),
            },
          });

          // Send notification to buyer
          try {
            const { NotificationService } = await import('../lib/notifications/notification-service');
            await NotificationService.createNotification({
              userId: payment.rental_contract.buyer_id,
              type: 'rental_payment_reminder',
              title: '⚠️ Thanh toán thất bại - Vui lòng thử lại',
              message: `Thanh toán tiền thuê (${new Intl.NumberFormat('vi-VN').format(Number(payment.amount))} ${payment.currency}) đã thất bại. Vui lòng thử lại.`,
              actionUrl: `/buy/rental-payments/${payment.id}/pay`,
              priority: 'high',
              orderData: {
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                action: 'retry_payment',
              },
            });
          } catch (notifError) {
            console.error('Failed to send retry notification:', notifError);
          }

          retriedCount++;
          console.log(`   🔄 Reset payment for retry: ${payment.id.slice(0, 8)}`);

        } catch (error) {
          console.error(`   ❌ Error retrying payment ${payment.id}:`, error);
        }
      }

      console.log(`✅ Payment retry process complete: ${retriedCount} payments reset for retry`);

    } catch (error: any) {
      console.error('❌ Error in payment retry process:', error);
    }
  }
}

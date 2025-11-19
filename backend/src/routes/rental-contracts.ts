/**
 * Rental Contracts Management Routes
 * Handles rental agreements, contracts, and payments
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function rentalContractsRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/rental-contracts - Get all contracts (with filters)
  // ============================================================
  fastify.get('/rental-contracts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        listingId,
        sellerId,
        buyerId,
        status,
        paymentStatus,
        page = 1,
        limit = 20,
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        deleted_at: null,
      };

      if (listingId) where.listing_id = listingId;
      if (sellerId) where.seller_id = sellerId;
      if (buyerId) where.buyer_id = buyerId;
      if (status) where.status = status;
      if (paymentStatus) where.payment_status = paymentStatus;

      // Get total count
      const total = await prisma.rental_contracts.count({ where });

      // Get contracts with relations
      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price_amount: true,
              price_currency: true,
              rental_unit: true,
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
            },
          },
          seller: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          buyer: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          pickup_depot: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
              province: true,
            },
          },
          return_depot: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
              province: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      });

      return reply.send({
        success: true,
        data: {
          contracts,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching rental contracts:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental contracts',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/rental-contracts/:id - Get contract details
  // ============================================================
  fastify.get('/rental-contracts/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const contract = await prisma.rental_contracts.findUnique({
        where: { id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
              price_amount: true,
              price_currency: true,
              rental_unit: true,
              listing_media: {
                select: {
                  id: true,
                  media_url: true,
                  media_type: true,
                },
                take: 5,
              },
            },
          },
          container: true,
          seller: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          buyer: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          pickup_depot: true,
          return_depot: true,
          payments: {
            orderBy: {
              created_at: 'desc',
            },
          },
          maintenance_logs: {
            where: {
              deleted_at: null,
            },
            orderBy: {
              created_at: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!contract || contract.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Rental contract not found',
        });
      }

      return reply.send({
        success: true,
        data: contract,
      });
    } catch (error: any) {
      console.error('Error fetching rental contract:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental contract',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/listings/:listingId/rental-contracts - Get contracts for a listing
  // ============================================================
  fastify.get('/listings/:listingId/rental-contracts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { listingId } = request.params as { listingId: string };
      const { status, groupBy } = request.query as any;

      const where: any = {
        listing_id: listingId,
        deleted_at: null,
      };

      if (status) {
        where.status = status;
      }

      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
            },
          },
          buyer: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          pickup_depot: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Get summary statistics
      const summary = {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'ACTIVE').length,
        completed: contracts.filter(c => c.status === 'COMPLETED').length,
        overdue: contracts.filter(c => c.status === 'OVERDUE').length,
        terminated: contracts.filter(c => c.status === 'TERMINATED').length,
        totalRevenue: contracts
          .filter(c => c.payment_status === 'PAID')
          .reduce((sum, c) => sum + Number(c.total_paid || 0), 0),
        pendingRevenue: contracts
          .filter(c => c.payment_status !== 'PAID')
          .reduce((sum, c) => sum + Number(c.total_amount_due || 0) - Number(c.total_paid || 0), 0),
      };

      // Group by status if requested
      let groupedData = null;
      if (groupBy === 'status') {
        groupedData = {
          ACTIVE: contracts.filter(c => c.status === 'ACTIVE'),
          COMPLETED: contracts.filter(c => c.status === 'COMPLETED'),
          OVERDUE: contracts.filter(c => c.status === 'OVERDUE'),
          TERMINATED: contracts.filter(c => c.status === 'TERMINATED'),
          CANCELLED: contracts.filter(c => c.status === 'CANCELLED'),
        };
      }

      return reply.send({
        success: true,
        data: {
          contracts: groupBy === 'status' ? groupedData : contracts,
          summary,
        },
      });
    } catch (error: any) {
      console.error('Error fetching listing rental contracts:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental contracts',
        error: error.message,
      });
    }
  });

  // ============================================================
  // PATCH /api/v1/rental-contracts/:id - Update contract
  // ============================================================
  fastify.patch('/rental-contracts/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        action,
        newEndDate,
        paymentAmount,
        notes,
        status,
        returnCondition,
        returnPhotos,
        damageReport,
        damageCost,
      } = request.body as any;

      // Get existing contract
      const existingContract = await prisma.rental_contracts.findUnique({
        where: { id },
        include: {
          container: true,
          listing: true,
        },
      });

      if (!existingContract || existingContract.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Rental contract not found',
        });
      }

      let updateData: any = {
        updated_at: new Date(),
      };

      // Handle different actions
      if (action === 'EXTEND') {
        // Extend rental period
        if (!newEndDate) {
          return reply.status(400).send({
            success: false,
            message: 'newEndDate is required for EXTEND action',
          });
        }

        updateData.end_date = new Date(newEndDate);
        updateData.renewal_count = existingContract.renewal_count + 1;
        updateData.last_renewed_at = new Date();
        updateData.special_notes = `${existingContract.special_notes || ''}\n[${new Date().toISOString()}] Extended to ${newEndDate}`;

      } else if (action === 'TERMINATE') {
        // Early termination
        updateData.status = 'TERMINATED';
        updateData.completed_at = new Date();
        updateData.special_notes = `${existingContract.special_notes || ''}\n[${new Date().toISOString()}] Terminated early. Reason: ${notes || 'N/A'}`;

        // Update container status to AVAILABLE
        if (existingContract.container_id) {
          await prisma.listing_containers.update({
            where: { id: existingContract.container_id },
            data: {
              status: 'AVAILABLE',
              rented_to_order_id: null,
              rented_at: null,
              rental_return_date: null,
            },
          });
        }

        // Update listing quantity
        await prisma.listings.update({
          where: { id: existingContract.listing_id },
          data: {
            rented_quantity: {
              decrement: 1,
            },
            available_quantity: {
              increment: 1,
            },
          },
        });

      } else if (action === 'COMPLETE') {
        // Mark as completed
        updateData.status = 'COMPLETED';
        updateData.completed_at = new Date();
        updateData.return_condition = returnCondition;
        updateData.return_photos = returnPhotos || [];
        updateData.return_inspection_date = new Date();
        updateData.damage_report = damageReport;
        updateData.damage_cost = damageCost;

        // Update container status
        if (existingContract.container_id) {
          await prisma.listing_containers.update({
            where: { id: existingContract.container_id },
            data: {
              status: 'AVAILABLE',
              rented_to_order_id: null,
              rented_at: null,
              rental_return_date: null,
            },
          });
        }

        // Update listing quantity
        await prisma.listings.update({
          where: { id: existingContract.listing_id },
          data: {
            rented_quantity: {
              decrement: 1,
            },
            available_quantity: {
              increment: 1,
            },
          },
        });

      } else if (action === 'UPDATE_PAYMENT') {
        // Update payment information
        if (paymentAmount) {
          updateData.total_paid = {
            increment: Number(paymentAmount),
          };

          // Update payment status
          const newTotalPaid = Number(existingContract.total_paid) + Number(paymentAmount);
          const totalDue = Number(existingContract.total_amount_due || 0);

          if (newTotalPaid >= totalDue) {
            updateData.payment_status = 'PAID';
          } else if (newTotalPaid > 0) {
            updateData.payment_status = 'PARTIALLY_PAID';
          }
        }

      } else if (status) {
        // General status update
        updateData.status = status;
      }

      // Apply notes if provided
      if (notes && action !== 'EXTEND' && action !== 'TERMINATE') {
        updateData.special_notes = `${existingContract.special_notes || ''}\n[${new Date().toISOString()}] ${notes}`;
      }

      // Update contract
      const updatedContract = await prisma.rental_contracts.update({
        where: { id },
        data: updateData,
        include: {
          listing: true,
          container: true,
          buyer: {
            select: {
              id: true,
              display_name: true,
              email: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: `Contract ${action?.toLowerCase() || 'updated'} successfully`,
        data: updatedContract,
      });
    } catch (error: any) {
      console.error('Error updating rental contract:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update rental contract',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/sellers/:sellerId/rental-stats - Get seller rental statistics
  // ============================================================
  fastify.get('/sellers/:sellerId/rental-stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sellerId } = request.params as { sellerId: string };
      const { period = 'month' } = request.query as any; // month, quarter, year, all

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Get contracts in period
      const contracts = await prisma.rental_contracts.findMany({
        where: {
          seller_id: sellerId,
          deleted_at: null,
          created_at: {
            gte: startDate,
          },
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              total_quantity: true,
              available_quantity: true,
              rented_quantity: true,
            },
          },
        },
      });

      // Get all-time contracts for comparison
      const allTimeContracts = await prisma.rental_contracts.findMany({
        where: {
          seller_id: sellerId,
          deleted_at: null,
        },
      });

      // Calculate statistics
      const stats = {
        currentPeriod: {
          totalContracts: contracts.length,
          activeContracts: contracts.filter(c => c.status === 'ACTIVE').length,
          completedContracts: contracts.filter(c => c.status === 'COMPLETED').length,
          overdueContracts: contracts.filter(c => c.status === 'OVERDUE').length,
          revenue: contracts
            .filter(c => c.payment_status === 'PAID')
            .reduce((sum, c) => sum + Number(c.total_paid), 0),
          pendingRevenue: contracts
            .filter(c => c.payment_status !== 'PAID')
            .reduce((sum, c) => sum + Number(c.total_amount_due || 0) - Number(c.total_paid), 0),
          depositHeld: contracts
            .filter(c => c.deposit_paid && !c.deposit_returned)
            .reduce((sum, c) => sum + Number(c.deposit_amount || 0), 0),
          lateFees: contracts.reduce((sum, c) => sum + Number(c.late_fees), 0),
        },
        allTime: {
          totalContracts: allTimeContracts.length,
          totalRevenue: allTimeContracts
            .filter(c => c.payment_status === 'PAID')
            .reduce((sum, c) => sum + Number(c.total_paid), 0),
          averageContractDuration: 0, // Calculate average days
          totalRentalDays: 0,
        },
      };

      // Calculate average duration
      const completedContracts = allTimeContracts.filter(c => c.status === 'COMPLETED');
      if (completedContracts.length > 0) {
        const totalDays = completedContracts.reduce((sum, c) => {
          const start = new Date(c.start_date);
          const end = new Date(c.completed_at || c.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        stats.allTime.averageContractDuration = Math.round(totalDays / completedContracts.length);
        stats.allTime.totalRentalDays = totalDays;
      }

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching rental stats:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental statistics',
        error: error.message,
      });
    }
  });
}

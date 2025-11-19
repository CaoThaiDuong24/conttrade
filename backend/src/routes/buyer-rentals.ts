/**
 * Buyer Rentals Routes
 * Handles buyer-side rental management (my rentals, payments, extensions)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function buyerRentalsRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/buyers/my-rentals - Get all active rentals for buyer
  // ============================================================
  fastify.get('/buyers/my-rentals', {
    preHandler: [(fastify as any).authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { status, page = 1, limit = 20 } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        buyer_id: user.userId,
        deleted_at: null,
      };

      if (status) {
        where.status = status;
      }

      // Get contracts
      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
              listing_media: {
                select: {
                  media_url: true,
                  media_type: true,
                },
                take: 1,
              },
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
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
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      });

      // Calculate summary statistics
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const active = contracts.filter(c => c.status === 'ACTIVE');
      const expiring = active.filter(c => new Date(c.end_date) <= sevenDaysFromNow && new Date(c.end_date) > now);
      const overdue = contracts.filter(c => c.payment_status === 'OVERDUE' || c.status === 'OVERDUE');

      // Calculate total containers by summing quantities
      const totalActiveContainers = active.reduce((sum: number, c: any) => sum + (c.quantity || 1), 0);

      const totalMonthlyСost = active.reduce((sum: number, c: any) => {
        // Calculate monthly cost based on rental_unit
        let monthlyCost = Number(c.rental_price);
        if (c.rental_unit === 'DAY') {
          monthlyCost = monthlyCost * 30;
        } else if (c.rental_unit === 'WEEK') {
          monthlyCost = monthlyCost * 4;
        } else if (c.rental_unit === 'QUARTER') {
          monthlyCost = monthlyCost / 3;
        } else if (c.rental_unit === 'YEAR') {
          monthlyCost = monthlyCost / 12;
        }
        // Multiply by quantity
        return sum + (monthlyCost * (c.quantity || 1));
      }, 0);

      const summary = {
        totalActive: totalActiveContainers, // Changed from active.length to sum of quantities
        totalContracts: active.length, // Added: number of contracts
        totalMonthlyPayment: Math.round(totalMonthlyСost),
        expiringSoon: expiring.length,
        overduePayments: overdue.length,
      };

      // Get total count for pagination
      const total = await prisma.rental_contracts.count({ where });

      return reply.send({
        success: true,
        data: {
          active: active.map((c: any) => {
            const daysRemaining = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: c.id,
              container_id: c.container_id,
              listing_id: c.listing_id,
              quantity: c.quantity || 1, // Added: number of containers in this contract
              container_number: c.container?.container_iso_code,
              container_type: c.listing?.title,
              container_size: c.container_size,
              start_date: c.start_date,
              end_date: c.end_date,
              monthly_rate: c.rental_price,
              payment_status: c.payment_status,
              status: c.status,
              deposit_amount: c.deposit_amount,
              deposit_paid: c.deposit_paid,
              auto_renewal_enabled: c.auto_renewal_enabled || false,
              seller_name: c.seller?.display_name,
              depot_location: c.pickup_depot?.name,
              daysRemaining,
              isExpiring: daysRemaining <= 7 && daysRemaining > 0,
              isOverdue: c.payment_status === 'OVERDUE' || c.status === 'OVERDUE',
            };
          }),
          expiring: expiring.map((c: any) => {
            const daysRemaining = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: c.id,
              container_id: c.container_id,
              listing_id: c.listing_id,
              container_number: c.container?.container_iso_code,
              container_type: c.listing?.title,
              container_size: c.container_size,
              start_date: c.start_date,
              end_date: c.end_date,
              monthly_rate: c.rental_price,
              payment_status: c.payment_status,
              status: c.status,
              deposit_amount: c.deposit_amount,
              deposit_paid: c.deposit_paid,
              auto_renewal_enabled: c.auto_renewal_enabled || false,
              seller_name: c.seller?.display_name,
              depot_location: c.pickup_depot?.name,
              daysRemaining,
            };
          }),
          overdue: overdue.map((c: any) => ({
            id: c.id,
            container_id: c.container_id,
            listing_id: c.listing_id,
            container_number: c.container?.container_iso_code,
            container_type: c.listing?.title,
            container_size: c.container_size,
            start_date: c.start_date,
            end_date: c.end_date,
            monthly_rate: c.rental_price,
            payment_status: c.payment_status,
            status: c.status,
            deposit_amount: c.deposit_amount,
            deposit_paid: c.deposit_paid,
            auto_renewal_enabled: c.auto_renewal_enabled || false,
            seller_name: c.seller?.display_name,
            depot_location: c.pickup_depot?.name,
          })),
          summary,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching buyer rentals:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rentals',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/buyers/my-rentals/:contractId - Get specific rental contract (buyer view)
  // ============================================================
  fastify.get('/buyers/my-rentals/:contractId', {
    preHandler: [(fastify as any).authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { contractId } = request.params as { contractId: string };

      const contract = await prisma.rental_contracts.findUnique({
        where: {
          id: contractId,
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
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
          pickup_depot: true,
          return_depot: true,
          payments: {
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      if (!contract || contract.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Rental contract not found',
        });
      }

      // Verify buyer owns this contract
      if (contract.buyer_id !== user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
        });
      }

      // Calculate days remaining
      const now = new Date();
      const endDate = new Date(contract.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return reply.send({
        success: true,
        data: {
          ...contract,
          daysRemaining,
          isExpiring: daysRemaining <= 7 && daysRemaining > 0,
          isExpired: daysRemaining <= 0,
        },
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
  // POST /api/v1/buyers/my-rentals/:contractId/request-extension - Request contract extension
  // ============================================================
  fastify.post('/buyers/my-rentals/:contractId/request-extension', {
    preHandler: [(fastify as any).authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { contractId } = request.params as { contractId: string };
      const {
        newEndDate,
        requestedPrice,
        notes,
        autoRenewal = false,
      } = request.body as any;

      // Get contract
      const contract = await prisma.rental_contracts.findUnique({
        where: { id: contractId },
        include: {
          listing: true,
          seller: {
            select: {
              id: true,
              display_name: true,
              email: true,
            },
          },
        },
      });

      if (!contract || contract.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Contract not found',
        });
      }

      // Verify buyer owns this contract
      if (contract.buyer_id !== user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
        });
      }

      // Validate newEndDate is after current end_date
      if (new Date(newEndDate) <= new Date(contract.end_date)) {
        return reply.status(400).send({
          success: false,
          message: 'New end date must be after current end date',
        });
      }

      // Calculate extension days
      const currentEndDate = new Date(contract.end_date);
      const requestedEndDate = new Date(newEndDate);
      const extensionDays = Math.ceil((requestedEndDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24));

      // For now, we'll update the contract directly (in production, create extension_requests table)
      // Update contract with extension
      const updatedContract = await prisma.rental_contracts.update({
        where: { id: contractId },
        data: {
          end_date: requestedEndDate,
          renewal_count: contract.renewal_count + 1,
          last_renewed_at: new Date(),
          auto_renewal: autoRenewal,
          special_notes: `${contract.special_notes || ''}\n[${new Date().toISOString()}] Extension requested by buyer. Extended by ${extensionDays} days. ${notes ? `Notes: ${notes}` : ''}`,
        },
      });

      // TODO: Send notification to seller about extension request

      return reply.send({
        success: true,
        message: 'Extension request sent successfully',
        data: {
          contractId: updatedContract.id,
          newEndDate: updatedContract.end_date,
          extensionDays,
          status: 'APPROVED', // In production, would be 'PENDING'
        },
      });
    } catch (error: any) {
      console.error('Error requesting extension:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to request extension',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/buyers/rental-history - Get rental history
  // ============================================================
  fastify.get('/buyers/rental-history', {
    preHandler: [(fastify as any).authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Unauthorized',
        });
      }

      const {
        startDate,
        endDate,
        status,
        page = 1,
        limit = 20,
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        buyer_id: user.userId,
        deleted_at: null,
        status: { in: ['COMPLETED', 'TERMINATED'] },
      };

      if (startDate) {
        where.created_at = { gte: new Date(startDate) };
      }

      if (endDate) {
        if (where.created_at) {
          where.created_at.lte = new Date(endDate);
        } else {
          where.created_at = { lte: new Date(endDate) };
        }
      }

      if (status) {
        where.status = status;
      }

      // Get contracts
      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              listing_media: {
                select: { media_url: true },
                take: 1,
              },
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
            },
          },
          seller: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
        orderBy: {
          completed_at: 'desc',
        },
        skip,
        take,
      });

      // Calculate analytics
      const allContracts = await prisma.rental_contracts.findMany({
        where: {
          buyer_id: user.userId,
          deleted_at: null,
          status: { in: ['COMPLETED', 'TERMINATED'] },
        },
      });

      const totalRentals = allContracts.length;
      const totalSpent = allContracts.reduce((sum: number, c: any) => sum + Number(c.total_paid || 0), 0);
      
      let totalDays = 0;
      allContracts.forEach((c: any) => {
        const start = new Date(c.start_date);
        const end = new Date(c.completed_at || c.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += days;
      });

      const avgDuration = totalRentals > 0 ? Math.round(totalDays / totalRentals) : 0;
      const avgMonthlyCost = totalRentals > 0 ? Math.round((totalSpent / totalDays) * 30) : 0;

      const analytics = {
        totalRentals,
        totalSpent,
        avgDuration,
        avgMonthlyCost,
      };

      // Get total count
      const total = await prisma.rental_contracts.count({ where });

      return reply.send({
        success: true,
        data: {
          rentals: contracts.map((c: any) => {
            const start = new Date(c.start_date);
            const end = new Date(c.completed_at || c.end_date);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            return {
              ...c,
              duration,
              totalCost: Number(c.total_paid || 0),
            };
          }),
          analytics,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching rental history:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental history',
        error: error.message,
      });
    }
  });

  // ============================================================
  // POST /api/v1/buyers/my-rentals/:contractId/rate - Rate rental experience
  // ============================================================
  fastify.post('/buyers/my-rentals/:contractId/rate', {
    preHandler: [(fastify as any).authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { contractId } = request.params as { contractId: string };
      const { rating, review } = request.body as any;

      if (!rating || rating < 1 || rating > 5) {
        return reply.status(400).send({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }

      // Get contract
      const contract = await prisma.rental_contracts.findUnique({
        where: { id: contractId },
      });

      if (!contract || contract.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Contract not found',
        });
      }

      // Verify buyer owns this contract
      if (contract.buyer_id !== user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
        });
      }

      // Verify contract is completed
      if (contract.status !== 'COMPLETED') {
        return reply.status(400).send({
          success: false,
          message: 'Can only rate completed rentals',
        });
      }

      // Update contract with rating (in production, create separate reviews table)
      await prisma.rental_contracts.update({
        where: { id: contractId },
        data: {
          // Note: buyer_rating, buyer_review, buyer_reviewed_at fields need to be added to schema
          // For now, we can store in special_notes or skip this update
          special_notes: `Rating: ${rating}/5${review ? `. Review: ${review}` : ''}`,
        },
      });

      return reply.send({
        success: true,
        message: 'Thank you for your feedback!',
      });
    } catch (error: any) {
      console.error('Error rating rental:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to submit rating',
        error: error.message,
      });
    }
  });
}

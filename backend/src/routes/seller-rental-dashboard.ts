/**
 * Seller Rental Dashboard Routes
 * Provides seller tools: occupancy tracking, revenue reports, contract management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sellerRentalDashboardRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/sellers/me/rental-dashboard - Seller rental dashboard
  // ============================================================
  fastify.get('/sellers/me/rental-dashboard', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
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

      // Get all rental listings for seller
      const rentalListings = await prisma.listings.findMany({
        where: {
          seller_user_id: userId,
          deal_type: 'RENTAL',
          deleted_at: null,
        },
        select: {
          id: true,
          title: true,
          total_quantity: true,
          available_quantity: true,
          rented_quantity: true,
          price_amount: true,
          price_currency: true,
        },
      });

      // Get contracts in period
      const contracts = await prisma.rental_contracts.findMany({
        where: {
          seller_id: userId,
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
            },
          },
        },
      });

      // Get all-time contracts for comparison
      const allTimeContracts = await prisma.rental_contracts.findMany({
        where: {
          seller_id: userId,
          deleted_at: null,
        },
      });

      // Calculate occupancy rate
      const totalContainers = rentalListings.reduce((sum, l) => sum + (l.total_quantity || 0), 0);
      const rentedContainers = rentalListings.reduce((sum, l) => sum + (l.rented_quantity || 0), 0);
      const availableContainers = rentalListings.reduce((sum, l) => sum + (l.available_quantity || 0), 0);
      const occupancyRate = totalContainers > 0 ? (rentedContainers / totalContainers) * 100 : 0;

      // Calculate revenue
      const currentPeriodRevenue = contracts
        .filter(c => c.payment_status === 'PAID' || c.payment_status === 'PARTIALLY_PAID')
        .reduce((sum, c) => sum + Number(c.total_paid), 0);

      const pendingRevenue = contracts
        .filter(c => c.payment_status !== 'PAID')
        .reduce((sum, c) => sum + Number(c.total_amount_due || 0) - Number(c.total_paid), 0);

      const allTimeRevenue = allTimeContracts
        .filter(c => c.payment_status === 'PAID' || c.payment_status === 'PARTIALLY_PAID')
        .reduce((sum, c) => sum + Number(c.total_paid), 0);

      // Active contracts
      const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
      const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
      const overdueContracts = contracts.filter(c => c.status === 'OVERDUE');

      // Calculate average contract duration
      const completedAllTime = allTimeContracts.filter(c => c.status === 'COMPLETED');
      let avgDuration = 0;
      if (completedAllTime.length > 0) {
        const totalDays = completedAllTime.reduce((sum, c) => {
          const start = new Date(c.start_date);
          const end = new Date(c.completed_at || c.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        avgDuration = Math.round(totalDays / completedAllTime.length);
      }

      // Revenue by listing
      const revenueByListing = rentalListings.map(listing => {
        const listingContracts = contracts.filter(c => c.listing_id === listing.id);
        return {
          listingId: listing.id,
          listingTitle: listing.title,
          totalRevenue: listingContracts.reduce((sum, c) => sum + Number(c.total_paid), 0),
          contractCount: listingContracts.length,
          activeContracts: listingContracts.filter(c => c.status === 'ACTIVE').length,
        };
      }).sort((a, b) => b.totalRevenue - a.totalRevenue);

      const dashboard = {
        occupancy: {
          totalContainers,
          rentedContainers,
          availableContainers,
          occupancyRate: occupancyRate.toFixed(2),
        },
        revenue: {
          currentPeriod: currentPeriodRevenue,
          pending: pendingRevenue,
          allTime: allTimeRevenue,
        },
        contracts: {
          currentPeriod: {
            total: contracts.length,
            active: activeContracts.length,
            completed: completedContracts.length,
            overdue: overdueContracts.length,
          },
          allTime: {
            total: allTimeContracts.length,
            avgDuration: avgDuration,
          },
        },
        listings: rentalListings,
        revenueByListing,
        topPerformers: revenueByListing.slice(0, 5),
      };

      return reply.send({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      console.error('Error fetching rental dashboard:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental dashboard',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/sellers/me/revenue-reports - Detailed revenue reports
  // ============================================================
  fastify.get('/sellers/me/revenue-reports', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const {
        startDate,
        endDate,
        listingId,
        contractId,
        groupBy = 'month', // month, quarter, year, listing, container
      } = request.query as any;

      // Build where clause
      const where: any = {
        seller_id: userId,
        deleted_at: null,
      };

      if (startDate && endDate) {
        where.created_at = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (listingId) {
        where.listing_id = listingId;
      }

      if (contractId) {
        where.id = contractId;
      }

      // Get contracts
      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
            },
          },
          payments: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              id: true,
              amount: true,
              payment_type: true,
              paid_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Calculate totals
      const totalRevenue = contracts.reduce((sum, c) => sum + Number(c.total_paid), 0);
      const totalDue = contracts.reduce((sum, c) => sum + Number(c.total_amount_due || 0), 0);
      const pendingRevenue = totalDue - totalRevenue;
      const depositHeld = contracts
        .filter(c => c.deposit_paid && !c.deposit_returned)
        .reduce((sum, c) => sum + Number(c.deposit_amount || 0), 0);
      const lateFees = contracts.reduce((sum, c) => sum + Number(c.late_fees), 0);

      // Group data based on groupBy parameter
      let groupedData: any = {};

      if (groupBy === 'listing') {
        // Group by listing
        const listings = contracts.reduce((acc: any, c) => {
          const key = c.listing_id;
          if (!acc[key]) {
            acc[key] = {
              listingId: c.listing_id,
              listingTitle: c.listing?.title || 'Unknown',
              contracts: [],
              totalRevenue: 0,
              totalPending: 0,
            };
          }
          acc[key].contracts.push(c);
          acc[key].totalRevenue += Number(c.total_paid);
          acc[key].totalPending += Number(c.total_amount_due || 0) - Number(c.total_paid);
          return acc;
        }, {});
        groupedData = Object.values(listings);

      } else if (groupBy === 'container') {
        // Group by container
        const containers = contracts.reduce((acc: any, c) => {
          const key = c.container_id || 'unassigned';
          if (!acc[key]) {
            acc[key] = {
              containerId: c.container_id,
              containerCode: c.container?.container_iso_code || 'Unassigned',
              contracts: [],
              totalRevenue: 0,
            };
          }
          acc[key].contracts.push(c);
          acc[key].totalRevenue += Number(c.total_paid);
          return acc;
        }, {});
        groupedData = Object.values(containers);

      } else {
        // Group by time period (month, quarter, year)
        const timeGroups = contracts.reduce((acc: any, c) => {
          const date = new Date(c.created_at);
          let key: string;

          if (groupBy === 'year') {
            key = date.getFullYear().toString();
          } else if (groupBy === 'quarter') {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `${date.getFullYear()}-Q${quarter}`;
          } else {
            // month
            key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          }

          if (!acc[key]) {
            acc[key] = {
              period: key,
              contracts: [],
              revenue: 0,
              pending: 0,
            };
          }
          acc[key].contracts.push(c);
          acc[key].revenue += Number(c.total_paid);
          acc[key].pending += Number(c.total_amount_due || 0) - Number(c.total_paid);
          return acc;
        }, {});
        groupedData = Object.values(timeGroups);
      }

      const report = {
        summary: {
          totalContracts: contracts.length,
          totalRevenue,
          totalDue,
          pendingRevenue,
          depositHeld,
          lateFees,
        },
        groupedData,
        rawContracts: contracts,
      };

      return reply.send({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error generating revenue report:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate revenue report',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/sellers/me/rental-contracts - Get seller's contracts with management options
  // ============================================================
  fastify.get('/sellers/me/rental-contracts', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { status, expiringIn } = request.query as any;

      const where: any = {
        seller_id: userId,
        deleted_at: null,
      };

      if (status) {
        where.status = status;
      }

      // Contracts expiring soon
      if (expiringIn) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(expiringIn));

        where.end_date = {
          gte: now,
          lte: futureDate,
        };
        where.status = 'ACTIVE';
      }

      const contracts = await prisma.rental_contracts.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
            },
          },
          buyer: {
            select: {
              id: true,
              display_name: true,
              email: true,
              phone: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              due_date: true,
              paid_at: true,
            },
            orderBy: {
              due_date: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Add management actions to each contract
      const contractsWithActions = contracts.map(contract => {
        const daysUntilEnd = Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        const availableActions = [];
        
        if (contract.status === 'ACTIVE') {
          if (daysUntilEnd <= 30) {
            availableActions.push('EXTEND');
          }
          availableActions.push('TERMINATE');
        }
        
        if (contract.status === 'OVERDUE') {
          availableActions.push('COMPLETE');
          availableActions.push('TERMINATE');
        }

        return {
          ...contract,
          daysUntilEnd,
          availableActions,
        };
      });

      return reply.send({
        success: true,
        data: {
          contracts: contractsWithActions,
          total: contracts.length,
        },
      });
    } catch (error: any) {
      console.error('Error fetching seller contracts:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch contracts',
        error: error.message,
      });
    }
  });
}

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  // Middleware to check authentication
  const requireAuth = async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        message: 'Unauthorized'
      });
    }
  };

  // GET /dashboard/stats - Get user dashboard statistics
  fastify.get('/stats', { preHandler: [requireAuth] }, async (request: any, reply) => {
    try {
      const userId = request.user.sub || request.user.userId;

      // Get user's listings
      const myListings = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
        SELECT status, COUNT(*)::integer as count 
        FROM listings 
        WHERE seller_user_id = ${userId}
        GROUP BY status
      `;

      const totalListings = myListings.reduce((sum: number, l: any) => sum + l.count, 0);
      const activeListings = myListings.find((l: any) => l.status === 'ACTIVE')?.count || 0;
      const pendingListings = myListings.find((l: any) => l.status === 'PENDING_REVIEW')?.count || 0;

      // Get user's RFQs (sent)
      const myRfqsSent = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
        SELECT status, COUNT(*)::integer as count 
        FROM rfqs 
        WHERE buyer_id = ${userId}
        GROUP BY status
      `;

      const totalRfqsSent = myRfqsSent.reduce((sum: number, r: any) => sum + r.count, 0);
      const pendingRfqs = myRfqsSent.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'DRAFT').reduce((sum: number, r: any) => sum + r.count, 0);

      // Get user's RFQs (received) - RFQs on my listings
      const myRfqsReceived = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::integer as count 
        FROM rfqs r
        INNER JOIN listings l ON r.listing_id = l.id
        WHERE l.seller_user_id = ${userId}
      `;

      const totalRfqsReceived = myRfqsReceived[0]?.count || 0;

      // Get user's orders as buyer
      const myOrdersAsBuyer = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
        SELECT status, COUNT(*)::integer as count 
        FROM orders 
        WHERE buyer_id = ${userId}
        GROUP BY status
      `;

      const totalOrdersAsBuyer = myOrdersAsBuyer.reduce((sum: number, o: any) => sum + o.count, 0);
      const pendingPaymentOrders = myOrdersAsBuyer.filter((o: any) => o.status === 'PENDING_PAYMENT' || o.status === 'CREATED').reduce((sum: number, o: any) => sum + o.count, 0);
      const processingOrders = myOrdersAsBuyer.filter((o: any) => o.status === 'PAID' || o.status === 'PROCESSING' || o.status === 'PREPARING_DELIVERY').reduce((sum: number, o: any) => sum + o.count, 0);
      const completedOrders = myOrdersAsBuyer.filter((o: any) => o.status === 'COMPLETED' || o.status === 'DELIVERED').reduce((sum: number, o: any) => sum + o.count, 0);

      // Get user's orders as seller
      const myOrdersAsSeller = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
        SELECT status, COUNT(*)::integer as count 
        FROM orders 
        WHERE seller_id = ${userId}
        GROUP BY status
      `;

      const totalOrdersAsSeller = myOrdersAsSeller.reduce((sum: number, o: any) => sum + o.count, 0);

      // Get deliveries for user's orders
      const myDeliveries = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
        SELECT d.status, COUNT(*)::integer as count 
        FROM deliveries d
        INNER JOIN orders o ON d.order_id = o.id
        WHERE o.buyer_id = ${userId} OR o.seller_id = ${userId}
        GROUP BY d.status
      `;

      const totalDeliveries = myDeliveries.reduce((sum: number, d: any) => sum + d.count, 0);
      const inTransitDeliveries = myDeliveries.filter((d: any) => d.status === 'IN_TRANSIT' || d.status === 'BOOKED').reduce((sum: number, d: any) => sum + d.count, 0);
      const deliveredDeliveries = myDeliveries.find((d: any) => d.status === 'DELIVERED')?.count || 0;

      // Get recent activities
      const recentListings = await prisma.listings.findMany({
        where: { seller_user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true
        }
      });

      const recentRfqs = await prisma.rfqs.findMany({
        where: { buyer_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          status: true,
          created_at: true,
          listings: {
            select: {
              title: true
            }
          }
        }
      });

      const recentOrders = await prisma.orders.findMany({
        where: {
          OR: [
            { buyer_id: userId },
            { seller_id: userId }
          ]
        },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          order_number: true,
          status: true,
          created_at: true,
          buyer_id: true
        }
      });

      return reply.send({
        success: true,
        data: {
          listings: {
            total: totalListings,
            active: activeListings,
            pending: pendingListings,
            byStatus: myListings
          },
          rfqs: {
            sent: totalRfqsSent,
            received: totalRfqsReceived,
            pending: pendingRfqs,
            sentByStatus: myRfqsSent
          },
          orders: {
            asBuyer: totalOrdersAsBuyer,
            asSeller: totalOrdersAsSeller,
            pendingPayment: pendingPaymentOrders,
            processing: processingOrders,
            completed: completedOrders,
            buyerByStatus: myOrdersAsBuyer,
            sellerByStatus: myOrdersAsSeller
          },
          deliveries: {
            total: totalDeliveries,
            inTransit: inTransitDeliveries,
            delivered: deliveredDeliveries,
            byStatus: myDeliveries
          },
          recentActivities: {
            listings: recentListings,
            rfqs: recentRfqs,
            orders: recentOrders
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}

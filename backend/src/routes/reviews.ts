// @ts-nocheck
/**
 * REVIEWS API - Đánh giá sau giao dịch
 */
import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export async function reviewsRoutes(server: FastifyInstance) {
  // POST /reviews - Tạo đánh giá
  server.post<{ Body: { orderId: string; revieweeId: string; rating: number; comment?: string } }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { orderId, revieweeId, rating, comment } = req.body;

      // Validation
      if (!orderId || !revieweeId || !rating) {
        return reply.code(400).send({ success: false, error: 'orderId, revieweeId and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return reply.code(400).send({ success: false, error: 'Rating must be between 1 and 5' });
      }

      // Kiểm tra order
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: { reviews: true },
      });

      if (!order) {
        return reply.code(404).send({ success: false, error: 'Order not found' });
      }

      // Chỉ buyer hoặc seller mới review được
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.code(403).send({ success: false, error: 'You are not part of this order' });
      }

      // Order phải completed
      if (order.status !== 'COMPLETED') {
        return reply.code(400).send({ success: false, error: 'Order must be completed to review' });
      }

      // Kiểm tra đã review chưa
      const existingReview = (order.reviews as any[]).find(r => r.reviewer_id === userId);
      if (existingReview) {
        return reply.code(400).send({ success: false, error: 'You have already reviewed this order' });
      }

      // Tạo review
      const reviewId = randomUUID();
      const review = await prisma.reviews.create({
        data: {
          id: reviewId,
          order_id: orderId,
          reviewer_id: userId,
          reviewee_id: revieweeId,
          rating,
          comment: comment || null,
          updated_at: new Date(),
        },
        include: {
          users_reviews_reviewer_idTousers: { select: { id: true, display_name: true, avatar_url: true } },
          users_reviews_reviewee_idTousers: { select: { id: true, display_name: true, avatar_url: true } },
          orders: { select: { id: true, status: true } },
        },
      });

      reply.code(201).send({ success: true, data: review, message: 'Review created successfully' });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /reviews/user/:userId - Lấy reviews của user
  server.get<{ Params: { userId: string } }>('/user/:userId', async (req, reply) => {
    try {
      const { userId } = req.params;

      const reviews = await prisma.reviews.findMany({
        where: { reviewee_id: userId },
        include: {
          users_reviews_reviewer_idTousers: { select: { id: true, display_name: true, avatar_url: true } },
          orders: { select: { id: true, created_at: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      reply.send({
        success: true,
        data: {
          reviews,
          stats: {
            totalReviews: reviews.length,
            averageRating: parseFloat(avgRating.toFixed(2)),
            ratingBreakdown: {
              5: reviews.filter(r => r.rating === 5).length,
              4: reviews.filter(r => r.rating === 4).length,
              3: reviews.filter(r => r.rating === 3).length,
              2: reviews.filter(r => r.rating === 2).length,
              1: reviews.filter(r => r.rating === 1).length,
            },
          },
        },
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /reviews/order/:orderId
  server.get<{ Params: { orderId: string } }>('/order/:orderId', async (req, reply) => {
    try {
      const { orderId } = req.params;

      const reviews = await prisma.reviews.findMany({
        where: { order_id: orderId },
        include: {
          users_reviews_reviewer_idTousers: { select: { id: true, display_name: true, avatar_url: true } },
          users_reviews_reviewee_idTousers: { select: { id: true, display_name: true, avatar_url: true } },
        },
      });

      reply.send({ success: true, data: reviews });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /reviews/pending - Orders chưa review
  server.get('/pending', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;

      // Lấy completed orders chưa review
      const orders = await prisma.orders.findMany({
        where: {
          OR: [{ buyer_id: userId }, { seller_id: userId }],
          status: 'COMPLETED',
        },
        include: {
          reviews: true,
          users_orders_buyer_idTousers: { select: { id: true, display_name: true } },
          users_orders_seller_idTousers: { select: { id: true, display_name: true } },
          listings: { select: { id: true, title: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      // Filter orders chưa review bởi user này
      const pendingReviews = orders.filter(order => {
        const userReview = (order.reviews as any[]).find(r => r.reviewer_id === userId);
        return !userReview;
      });

      reply.send({
        success: true,
        data: pendingReviews.map((order: any) => ({
          orderId: order.id,
          createdAt: order.created_at,
          otherUser: order.buyer_id === userId ? order.users_orders_seller_idTousers : order.users_orders_buyer_idTousers,
          listing: order.listings,
        })),
        total: pendingReviews.length,
      });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /reviews/sellers/:id - Lấy reviews của seller
  server.get<{ Params: { id: string }; Querystring: { filter?: string } }>('/sellers/:id', async (req, reply) => {
    try {
      const { id: sellerId } = req.params;
      const { filter = 'all' } = req.query;

      // Return realistic mock data for demo
      const mockStats = {
        totalReviews: 15,
        averageRating: 4.3,
        ratingDistribution: { 5: 8, 4: 4, 3: 2, 2: 1, 1: 0 },
        recommendationRate: 87,
        categoryAverages: {
          productQuality: 4.5,
          communication: 4.2,
          delivery: 4.1,
          valueForMoney: 4.0
        }
      };

      const mockReviews = [
        {
          id: 'rev_001',
          rating: 5,
          comment: 'Container chất lượng tốt, giao hàng nhanh chóng. Seller rất hỗ trợ và professional.',
          createdAt: '2024-10-01T10:00:00Z',
          reviewer: {
            id: 'user_001',
            displayName: 'Nguyễn Văn A',
            avatar: null
          },
          order: {
            id: 'ord_001',
            orderNumber: 'ORD-240001',
            listing: {
              title: 'Container 40ft HC - Tình trạng tốt'
            }
          },
          categories: {
            productQuality: 5,
            communication: 5,
            delivery: 4,
            valueForMoney: 5
          },
          tags: ['Chất lượng tốt', 'Giao hàng nhanh'],
          recommend: true,
          helpful: 3
        },
        {
          id: 'rev_002',
          rating: 4,
          comment: 'Container như mô tả, giá hợp lý. Sẽ mua lại lần sau.',
          createdAt: '2024-09-25T14:30:00Z',
          reviewer: {
            id: 'user_002',
            displayName: 'Trần Thị B',
            avatar: null
          },
          order: {
            id: 'ord_002',
            orderNumber: 'ORD-240002',
            listing: {
              title: 'Container 20ft DRY - Used'
            }
          },
          categories: {
            productQuality: 4,
            communication: 4,
            delivery: 4,
            valueForMoney: 4
          },
          tags: ['Giá hợp lý', 'Đúng mô tả'],
          recommend: true,
          helpful: 1
        }
      ];

      // Filter by rating if specified
      let filteredReviews = mockReviews;
      if (filter !== 'all') {
        const rating = parseInt(filter);
        if (rating >= 1 && rating <= 5) {
          filteredReviews = mockReviews.filter(r => r.rating === rating);
        }
      }

      reply.send({
        success: true,
        data: {
          stats: mockStats,
          reviews: filteredReviews
        }
      });
    } catch (error: any) {
      console.error('Reviews API error:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}


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

      console.log('📝 Creating order review:', { userId, orderId, revieweeId, rating });

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
      });

      if (!order) {
        console.error('❌ Order not found:', orderId);
        return reply.code(404).send({ success: false, error: 'Order not found' });
      }

      console.log('✅ Order found:', { buyer_id: order.buyer_id, seller_id: order.seller_id, status: order.status });

      // Chỉ buyer hoặc seller mới review được - Normalize comparison
      const normalizedUserId = String(userId);
      const normalizedBuyerId = String(order.buyer_id);
      const normalizedSellerId = String(order.seller_id);
      
      if (normalizedBuyerId !== normalizedUserId && normalizedSellerId !== normalizedUserId) {
        console.error('❌ User not part of order:', { userId, buyer_id: order.buyer_id, seller_id: order.seller_id });
        return reply.code(403).send({ success: false, error: 'You are not part of this order' });
      }

      // Order phải completed
      if (order.status !== 'COMPLETED') {
        return reply.code(400).send({ success: false, error: 'Order must be completed to review' });
      }

      // Kiểm tra đã review ORDER chưa (chỉ check order-level reviews, không check delivery reviews)
      const existingReview = await prisma.reviews.findFirst({
        where: {
          order_id: orderId,
          reviewer_id: userId,
          delivery_id: null  // CHỈ CHECK ORDER-LEVEL REVIEW
        }
      });
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

  // GET /reviews/order/:orderId - Chỉ lấy ORDER-LEVEL reviews (không có delivery_id)
  server.get<{ Params: { orderId: string } }>('/order/:orderId', async (req, reply) => {
    try {
      const { orderId } = req.params;

      const reviews = await prisma.reviews.findMany({
        where: { 
          order_id: orderId,
          delivery_id: null  // CHỈ LẤY ORDER-LEVEL REVIEWS
        },
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

      // Verify seller exists
      const seller = await prisma.users.findUnique({
        where: { id: sellerId },
        select: { id: true, display_name: true }
      });

      if (!seller) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Seller not found' 
        });
      }

      // Build where clause for filtering
      const whereClause: any = { reviewee_id: sellerId };
      
      if (filter !== 'all') {
        const rating = parseInt(filter);
        if (rating >= 1 && rating <= 5) {
          whereClause.rating = rating;
        }
      }

      // Fetch reviews from database
      const reviews = await prisma.reviews.findMany({
        where: whereClause,
        include: {
          users_reviews_reviewer_idTousers: { 
            select: { 
              id: true, 
              display_name: true, 
              avatar_url: true 
            } 
          },
          orders: {
            select: {
              id: true,
              order_number: true,
              created_at: true,
              listings: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Calculate statistics
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      // Calculate recommendation rate (ratings 4-5 are recommendations)
      const recommendCount = ratingDistribution[4] + ratingDistribution[5];
      const recommendationRate = totalReviews > 0 
        ? Math.round((recommendCount / totalReviews) * 100)
        : 0;

      // Format reviews for response
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        reviewer: {
          id: review.users_reviews_reviewer_idTousers.id,
          displayName: review.users_reviews_reviewer_idTousers.display_name,
          avatar: review.users_reviews_reviewer_idTousers.avatar_url
        },
        order: {
          id: review.orders.id,
          orderNumber: review.orders.order_number,
          listing: review.orders.listings ? {
            id: review.orders.listings.id,
            title: review.orders.listings.title
          } : null
        }
      }));

      const stats = {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        ratingDistribution,
        recommendationRate
      };

      reply.send({
        success: true,
        data: {
          stats,
          reviews: formattedReviews
        }
      });
    } catch (error: any) {
      console.error('Reviews API error:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}


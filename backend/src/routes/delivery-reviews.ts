// @ts-nocheck
/**
 * DELIVERY REVIEWS API - Đánh giá từng lô giao hàng
 * Sử dụng bảng reviews thống nhất (delivery_id != NULL = delivery-level review)
 */
import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export async function deliveryReviewsRoutes(server: FastifyInstance) {
  
  // POST /delivery-reviews - Tạo đánh giá cho delivery batch
  server.post<{ 
    Body: { 
      deliveryId: string;
      orderId: string;
      rating: number;
      comment?: string;
      deliveryQualityRating?: number;
      packagingRating?: number;
      timelinessRating?: number;
      photos?: string[];
    } 
  }>('/', {
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
      const { 
        deliveryId, 
        orderId, 
        rating, 
        comment,
        deliveryQualityRating,
        packagingRating,
        timelinessRating,
        photos 
      } = req.body;

      console.log('📦 Creating delivery review:', { userId, deliveryId, orderId, rating });

      // Validation
      if (!deliveryId || !orderId || !rating) {
        console.error('❌ Missing required fields:', { deliveryId, orderId, rating });
        return reply.code(400).send({ 
          success: false, 
          error: 'deliveryId, orderId and rating are required' 
        });
      }

      if (rating < 1 || rating > 5) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Rating must be between 1 and 5' 
        });
      }

      // Kiểm tra delivery
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: true
        }
      });

      if (!delivery) {
        console.error('❌ Delivery not found:', deliveryId);
        return reply.code(404).send({ 
          success: false, 
          error: 'Delivery not found' 
        });
      }

      console.log('✅ Delivery found:', { order_id: delivery.order_id, buyer_id: delivery.orders.buyer_id });

      // Kiểm tra order thuộc về delivery
      if (delivery.order_id !== orderId) {
        console.error('❌ Order mismatch:', { delivery_order_id: delivery.order_id, provided_orderId: orderId });
        return reply.code(400).send({ 
          success: false, 
          error: 'Delivery does not belong to this order' 
        });
      }

      // Chỉ buyer mới review được delivery - Normalize comparison
      const normalizedUserId = String(userId);
      const normalizedBuyerId = String(delivery.orders.buyer_id);
      
      if (normalizedBuyerId !== normalizedUserId) {
        console.error('❌ User is not buyer:', { userId, buyer_id: delivery.orders.buyer_id });
        return reply.code(403).send({ 
          success: false, 
          error: 'Only buyer can review delivery' 
        });
      }

      // Delivery phải đã receipt confirmed
      if (!delivery.receipt_confirmed_at) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Delivery must be receipt confirmed to review' 
        });
      }

      // Kiểm tra đã review delivery này chưa
      const existingReview = await prisma.reviews.findFirst({
        where: {
          delivery_id: deliveryId,
          reviewer_id: userId
        }
      });

      if (existingReview) {
        return reply.code(400).send({ 
          success: false, 
          error: 'You have already reviewed this delivery' 
        });
      }

      // Tạo review
      const reviewId = randomUUID();
      const review = await prisma.reviews.create({
        data: {
          id: reviewId,
          order_id: orderId,
          delivery_id: deliveryId,
          reviewer_id: userId,
          reviewee_id: delivery.orders.seller_id, // Seller được đánh giá
          rating,
          comment: comment || null,
          delivery_quality_rating: deliveryQualityRating || null,
          packaging_rating: packagingRating || null,
          timeliness_rating: timelinessRating || null,
          photos_json: photos && photos.length > 0 ? JSON.stringify(photos) : null,
          updated_at: new Date(),
        },
        include: {
          users_reviews_reviewer_idTousers: { 
            select: { id: true, display_name: true, avatar_url: true } 
          },
          users_reviews_reviewee_idTousers: { 
            select: { id: true, display_name: true, avatar_url: true } 
          },
          deliveries: {
            select: {
              id: true,
              batch_number: true,
              total_batches: true,
              delivery_date: true,
              delivered_at: true
            }
          }
        },
      });

      return reply.code(201).send({ 
        success: true, 
        data: review, 
        message: 'Delivery review created successfully' 
      });
    } catch (error: any) {
      console.error('Create delivery review error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /delivery-reviews/order/:orderId - Lấy tất cả reviews của các batch trong order
  server.get<{ 
    Params: { orderId: string } 
  }>('/order/:orderId', async (req, reply) => {
    try {
      const { orderId } = req.params;

      const reviews = await prisma.reviews.findMany({
        where: { 
          order_id: orderId,
          delivery_id: { not: null } // Chỉ lấy delivery-level reviews
        },
        include: {
          users_reviews_reviewer_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          },
          users_reviews_reviewee_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          },
          deliveries: {
            select: {
              id: true,
              batch_number: true,
              total_batches: true,
              delivery_date: true,
              delivered_at: true,
              receipt_confirmed_at: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return reply.send({
        success: true,
        data: reviews
      });

    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /delivery-reviews/user/:userId - Lấy tất cả reviews mà user nhận được (as seller)
  // Support cả delivery-level và order-level reviews
  server.get<{ 
    Params: { userId: string };
    Querystring: { filter?: string; type?: 'all' | 'delivery' | 'order' }
  }>('/user/:userId', async (req, reply) => {
    try {
      const { userId } = req.params;
      const { filter = 'all', type = 'all' } = req.query;

      // Build where clause for filtering
      const whereClause: any = { 
        reviewee_id: userId
      };
      
      // Filter by review type
      if (type === 'delivery') {
        whereClause.delivery_id = { not: null }; // Chỉ lấy delivery-level reviews
      } else if (type === 'order') {
        whereClause.delivery_id = null; // Chỉ lấy order-level reviews
      }
      // type === 'all' thì lấy tất cả (không thêm filter delivery_id)
      
      if (filter !== 'all') {
        const rating = parseInt(filter);
        if (rating >= 1 && rating <= 5) {
          whereClause.rating = rating;
        }
      }

      const reviews = await prisma.reviews.findMany({
        where: whereClause,
        include: {
          users_reviews_reviewer_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          },
          users_reviews_reviewee_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          },
          deliveries: true,  // Allow null
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

      // Calculate average for detailed ratings (only for delivery reviews)
      const deliveryReviews = reviews.filter(r => r.delivery_id);
      const avgDeliveryQuality = deliveryReviews.length > 0
        ? deliveryReviews.filter(r => r.delivery_quality_rating).reduce((sum, r) => sum + (r.delivery_quality_rating || 0), 0) / deliveryReviews.filter(r => r.delivery_quality_rating).length
        : 0;
      
      const avgPackaging = deliveryReviews.length > 0
        ? deliveryReviews.filter(r => r.packaging_rating).reduce((sum, r) => sum + (r.packaging_rating || 0), 0) / deliveryReviews.filter(r => r.packaging_rating).length
        : 0;
      
      const avgTimeliness = deliveryReviews.length > 0
        ? deliveryReviews.filter(r => r.timeliness_rating).reduce((sum, r) => sum + (r.timeliness_rating || 0), 0) / deliveryReviews.filter(r => r.timeliness_rating).length
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
        deliveryId: review.delivery_id, // NEW: để frontend phân biệt loại review
        rating: review.rating,
        comment: review.comment,
        deliveryQualityRating: review.delivery_quality_rating,
        packagingRating: review.packaging_rating,
        timelinessRating: review.timeliness_rating,
        photos: review.photos_json ? JSON.parse(review.photos_json as string) : [],
        createdAt: review.created_at,
        response: review.response,
        responseAt: review.response_at,
        reviewer: {
          id: review.users_reviews_reviewer_idTousers.id,
          displayName: review.users_reviews_reviewer_idTousers.display_name,
          avatar: review.users_reviews_reviewer_idTousers.avatar_url
        },
        delivery: review.deliveries ? {
          id: review.deliveries.id,
          batchNumber: review.deliveries.batch_number,
          totalBatches: review.deliveries.total_batches,
          deliveryDate: review.deliveries.delivery_date,
          deliveredAt: review.deliveries.delivered_at
        } : null,
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
        averageDeliveryQuality: parseFloat(avgDeliveryQuality.toFixed(2)),
        averagePackaging: parseFloat(avgPackaging.toFixed(2)),
        averageTimeliness: parseFloat(avgTimeliness.toFixed(2)),
        ratingDistribution,
        recommendationRate
      };

      return reply.send({
        success: true,
        data: {
          stats,
          reviews: formattedReviews
        }
      });

    } catch (error: any) {
      console.error('Delivery Reviews API error:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // GET /delivery-reviews/pending - Lấy các deliveries đã nhận hàng nhưng chưa review
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

      // Lấy các deliveries của user (as buyer) đã receipt confirmed nhưng chưa review
      const deliveries = await prisma.deliveries.findMany({
        where: {
          orders: {
            buyer_id: userId
          },
          receipt_confirmed_at: {
            not: null
          }
        },
        include: {
          reviews: {
            where: {
              reviewer_id: userId
            }
          },
          orders: {
            include: {
              users_orders_seller_idTousers: {
                select: { id: true, display_name: true, avatar_url: true }
              },
              listings: {
                select: { id: true, title: true }
              }
            }
          }
        },
        orderBy: { receipt_confirmed_at: 'desc' }
      });

      // Filter deliveries chưa review
      const pendingReviews = deliveries
        .filter(delivery => delivery.reviews.length === 0)
        .map(delivery => ({
          deliveryId: delivery.id,
          orderId: delivery.order_id,
          orderNumber: delivery.orders.order_number,
          batchNumber: delivery.batch_number,
          totalBatches: delivery.total_batches,
          deliveryDate: delivery.delivery_date,
          deliveredAt: delivery.delivered_at,
          receiptConfirmedAt: delivery.receipt_confirmed_at,
          seller: delivery.orders.users_orders_seller_idTousers,
          listing: delivery.orders.listings
        }));

      return reply.send({
        success: true,
        data: pendingReviews,
        total: pendingReviews.length
      });

    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  });

  // PUT /delivery-reviews/:id/response - Seller phản hồi review
  server.put<{
    Params: { id: string },
    Body: { response: string }
  }>('/:id/response', {
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
      const { id: reviewId } = req.params;
      const { response } = req.body;

      if (!response || response.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Response cannot be empty'
        });
      }

      // Get review
      const review = await prisma.reviews.findUnique({
        where: { id: reviewId },
        include: {
          orders: true
        }
      });

      if (!review) {
        return reply.code(404).send({
          success: false,
          error: 'Review not found'
        });
      }

      // Verify user is the reviewee (seller)
      if (review.reviewee_id !== userId) {
        return reply.code(403).send({
          success: false,
          error: 'Only the reviewee can respond to this review'
        });
      }

      // Update review with response
      const updatedReview = await prisma.reviews.update({
        where: { id: reviewId },
        data: {
          response: response.trim(),
          response_by: userId,
          response_at: new Date(),
          updated_at: new Date()
        },
        include: {
          users_reviews_reviewer_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          },
          users_reviews_reviewee_idTousers: {
            select: { id: true, display_name: true, avatar_url: true }
          }
        }
      });

      // Send notification to reviewer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        await NotificationService.createNotification({
          userId: review.reviewer_id,
          type: 'review_response',
          title: '💬 Seller đã phản hồi đánh giá của bạn',
          message: `Seller đã phản hồi đánh giá của bạn: ${response.substring(0, 50)}...`,
          data: {
            reviewId: reviewId,
            orderId: review.order_id,
            deliveryId: review.delivery_id
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Response added successfully',
        data: updatedReview
      });

    } catch (error: any) {
      console.error('Error adding response:', error);
      reply.code(500).send({ success: false, error: error.message });
    }
  });
}

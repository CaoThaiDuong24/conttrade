// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';

export default async function deliveryRoutes(fastify: FastifyInstance) {
  // GET /deliveries - Get all deliveries for current user
  fastify.get('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;

    try {
      // Get all deliveries where user is buyer or seller
      const deliveries = await prisma.deliveries.findMany({
        where: {
          orders: {
            OR: [
              { buyer_id: userId },
              { seller_id: userId }
            ]
          }
        },
        include: {
          orders: {
            select: {
              id: true,
              order_number: true,
              status: true,
              users_orders_buyer_idTousers: {
                select: { id: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, display_name: true }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return reply.send({
        success: true,
        data: {
          deliveries,
          count: deliveries.length
        }
      });
    } catch (error: any) {
      fastify.log.error('Error fetching deliveries:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch deliveries',
        error: error.message
      });
    }
  });

  // POST /deliveries - Create delivery record (API-G01)
  fastify.post<{ 
    Body: {
      order_id: string,
      address: string,
      schedule_at: string,
      requirements?: any
    }
  }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { order_id, address, schedule_at, requirements } = request.body;

    try {
      // Get order and verify permission
      const order = await prisma.orders.findUnique({
        where: { id: order_id }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is buyer or seller
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

    // Create delivery record
    const delivery = await prisma.deliveries.create({
      data: {
        id: randomUUID(),
        order_id: order_id,
        dropoff_address: address,
        delivery_address: requirements?.deliveryAddress || address,
        delivery_contact: requirements?.deliveryContact || null,
        delivery_phone: requirements?.deliveryPhone || null,
        delivery_date: new Date(schedule_at),
        delivery_time: new Date(schedule_at).toTimeString().slice(0, 5),
        needs_crane: requirements?.needsCrane || false,
        special_instructions: requirements?.specialInstructions || null,
        notes: requirements?.notes || null,
        status: 'PENDING',
        updated_at: new Date()
      }
    });

      return reply.send({
        success: true,
        message: 'Delivery record created successfully',
        data: {
          delivery
        }
      });
    } catch (error: any) {
      fastify.log.error('Error creating delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create delivery record',
        error: error.message
      });
    }
  });

  // GET /deliveries/order/:orderId - Get all deliveries for an order
  fastify.get<{ 
    Params: { orderId: string }
  }>('/order/:orderId', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { orderId } = request.params;

    try {
      // First, verify user has access to this order
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: { 
          id: true, 
          buyer_id: true, 
          seller_id: true 
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is buyer or seller
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      // Get all deliveries for this order with containers
      const deliveries = await prisma.deliveries.findMany({
        where: { order_id: orderId },
        include: {
          delivery_containers: {
            include: {
              listing_container: {
                select: {
                  id: true,
                  container_iso_code: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: {
          batch_number: 'asc'
        }
      });

      // Format the response
      const formattedDeliveries = deliveries.map(delivery => ({
        id: delivery.id,
        order_id: delivery.order_id,
        batch_number: delivery.batch_number,
        total_batches: delivery.total_batches,
        status: delivery.status,
        delivery_address: delivery.delivery_address,
        scheduled_date: delivery.scheduled_date,
        delivered_at: delivery.delivered_at,
        receipt_confirmed_at: delivery.receipt_confirmed_at,
        containers_count: delivery.delivery_containers.length,
        // ✅ Pass delivery-level info to each container
        delivery_method: delivery.delivery_method,
        logistics_company: delivery.logistics_company,
        booked_at: delivery.booked_at,
        delivery_containers: delivery.delivery_containers.map(dc => ({
          id: dc.container_id,  // Use container_id instead of listing_container.id
          container_iso_code: dc.container_iso_code,  // Already in delivery_containers
          delivered_at: dc.delivered_at,  // Individual container delivery time
          received_by: dc.received_by,    // Who received this container
          condition_notes: dc.condition_notes,  // JSON string with condition info
          signature_url: dc.signature_url,
          // ✅ Get transportation info from parent delivery (not from delivery_containers)
          transportation_booked_at: delivery.booked_at,  // From deliveries.booked_at
          transport_method: delivery.delivery_method,  // From deliveries.delivery_method
          logistics_company: delivery.logistics_company,  // From deliveries.logistics_company
          transport_notes: delivery.delivery_address ? JSON.stringify({
            deliveryAddress: delivery.delivery_address,
            deliveryContact: delivery.delivery_contact,
            deliveryPhone: delivery.delivery_phone,
            deliveryDate: delivery.delivery_date,
            deliveryTime: delivery.delivery_time
          }) : null
        }))
      }));

      return reply.send({
        success: true,
        data: formattedDeliveries
      });
    } catch (error: any) {
      fastify.log.error('Error fetching order deliveries:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch deliveries',
        error: error.message
      });
    }
  });

  // GET /deliveries/:id - Get delivery details (API-G02)
  fastify.get<{ 
    Params: { id: string }
  }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      // Get delivery with order info
      const delivery = await prisma.deliveries.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, display_name: true, email: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, display_name: true, email: true }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // Check if user is buyer or seller
      const order = delivery.orders;
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      return reply.send({
        success: true,
        data: {
          delivery
        }
      });
    } catch (error: any) {
      fastify.log.error('Error fetching delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch delivery',
        error: error.message
      });
    }
  });

  // GET /deliveries/:id/track - Track delivery (API-G03)
  fastify.get<{ 
    Params: { id: string }
  }>('/:id/track', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      // Get delivery with tracking info
      const delivery = await prisma.deliveries.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, display_name: true, email: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, display_name: true, email: true }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // Check if user is buyer or seller
      const order = delivery.orders;
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      // Return tracking information
      const trackingInfo = {
        deliveryId: delivery.id,
        status: delivery.status,
        currentLocation: delivery.current_location || 'Đang chuẩn bị',
        estimatedDelivery: delivery.delivery_date,
        driverName: delivery.driver_name,
        driverPhone: delivery.driver_phone,
        vehicleNumber: delivery.vehicle_number,
        notes: delivery.notes,
        createdAt: delivery.created_at,
        updatedAt: delivery.updated_at
      };

      return reply.send({
        success: true,
        data: {
          tracking: trackingInfo
        }
      });
    } catch (error: any) {
      fastify.log.error('Error tracking delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to track delivery',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/mark-delivered - Seller xác nhận giao batch
  fastify.post<{
    Params: { deliveryId: string },
    Body: {
      deliveredAt?: string,
      deliveryLocation?: any,
      deliveryProof?: string[],
      eirData?: any,
      receivedByName?: string,
      receivedBySignature?: string,
      driverNotes?: string,
      containerIds?: string[]
    }
  }>('/:deliveryId/mark-delivered', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId } = request.params;
    const {
      deliveredAt,
      deliveryLocation,
      deliveryProof,
      eirData,
      receivedByName,
      receivedBySignature,
      driverNotes,
      containerIds
    } = request.body;

    try {
      // 1. Get delivery với containers
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, email: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, email: true, display_name: true }
              }
            }
          },
          delivery_containers: {
            include: {
              listing_container: true
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 2. Verify seller permission
      if (delivery.orders.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can mark delivery as delivered'
        });
      }

      // 3. Check delivery status
      if (!['SCHEDULED', 'IN_TRANSIT', 'PICKED_UP', 'PENDING'].includes(delivery.status)) {
        return reply.status(400).send({
          success: false,
          message: `Cannot mark delivered. Current status: ${delivery.status}. Must be SCHEDULED, IN_TRANSIT, or PICKED_UP.`
        });
      }

      // 4. Determine which containers to mark as delivered
      const containersToDeliver = containerIds || 
        delivery.delivery_containers.map(dc => dc.container_id);

      // Validate containerIds if provided
      if (containerIds && containerIds.length > 0) {
        const validContainerIds = delivery.delivery_containers.map(dc => dc.container_id);
        const invalidIds = containerIds.filter(id => !validContainerIds.includes(id));
        
        if (invalidIds.length > 0) {
          return reply.status(400).send({
            success: false,
            message: 'Some container IDs do not belong to this delivery',
            data: { invalidContainerIds: invalidIds }
          });
        }
      }

      // 5. Update trong transaction
      const result = await prisma.$transaction(async (tx) => {
        // 5.1. Check if ALL containers in this delivery will be delivered
        const totalContainersInDelivery = delivery.delivery_containers.length;
        const allContainersBeingDelivered = containersToDeliver.length === totalContainersInDelivery;
        
        // Only mark delivery as DELIVERED if ALL containers are being delivered
        const newDeliveryStatus = allContainersBeingDelivered ? 'DELIVERED' : delivery.status;
        const newDeliveredAt = allContainersBeingDelivered 
          ? (deliveredAt ? new Date(deliveredAt) : new Date())
          : delivery.delivered_at;
        
        // 5.2. Update delivery record
        const updatedDelivery = await tx.deliveries.update({
          where: { id: deliveryId },
          data: {
            status: newDeliveryStatus,
            delivered_at: newDeliveredAt,
            delivery_location_json: deliveryLocation || null,
            delivery_proof_json: deliveryProof || null,
            eir_data_json: eirData || null,
            // ❌ KHÔNG set received_by_name và received_by_signature ở đây
            // Chỉ set khi buyer confirm-receipt
            driver_notes: driverNotes || delivery.driver_notes,
            updated_at: new Date()
          }
        });

        // 5.2. Update delivery_containers (mark individual containers delivered)
        await tx.delivery_containers.updateMany({
          where: {
            delivery_id: deliveryId,
            container_id: { in: containersToDeliver }
          },
          data: {
            delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
            // ❌ KHÔNG set received_by và signature_url ở đây
            // Chỉ set khi buyer confirm-receipt
            updated_at: new Date()
          }
        });

        // 5.3. Update listing_containers status
        await tx.listing_containers.updateMany({
          where: {
            id: { in: containersToDeliver }
          },
          data: {
            delivery_status: 'DELIVERED',
            actual_delivery_date: deliveredAt ? new Date(deliveredAt) : new Date(),
            updated_at: new Date()
          }
        });

        // 5.4. Create delivery event
        await tx.delivery_events.create({
          data: {
            id: randomUUID(),
            delivery_id: deliveryId,
            event_type: 'DELIVERED',
            payload: {
              containersDelivered: containersToDeliver.length,
              totalContainersInDelivery: totalContainersInDelivery,
              isPartialDelivery: !allContainersBeingDelivered,
              receivedBy: receivedByName,
              deliveredAt: deliveredAt || new Date().toISOString()
            },
            occurred_at: new Date()
          }
        });

        // 5.5. Check if ALL containers in this delivery are now delivered (after this update)
        const allContainersInDeliveryAfterUpdate = await tx.delivery_containers.findMany({
          where: { delivery_id: deliveryId },
          select: { delivered_at: true }
        });

        const allContainersInThisDeliveryDelivered = allContainersInDeliveryAfterUpdate.every(
          dc => dc.delivered_at !== null
        );

        // Update delivery status if all containers now delivered
        if (allContainersInThisDeliveryDelivered && !allContainersBeingDelivered) {
          await tx.deliveries.update({
            where: { id: deliveryId },
            data: {
              status: 'DELIVERED',
              delivered_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        // 5.6. Check if ALL deliveries of this order are delivered
        const allDeliveries = await tx.deliveries.findMany({
          where: { order_id: delivery.order_id },
          select: { id: true, status: true }
        });

        const allOrderDeliveriesDelivered = allDeliveries.every(d => 
          d.id === deliveryId 
            ? (allContainersBeingDelivered || allContainersInThisDeliveryDelivered)
            : d.status === 'DELIVERED'
        );

        const partiallyDelivered = allDeliveries.some(d => d.status === 'DELIVERED') && !allOrderDeliveriesDelivered;

        // 5.7. Update order status appropriately
        let newOrderStatus: any = delivery.orders.status;
        
        if (allOrderDeliveriesDelivered) {
          newOrderStatus = 'DELIVERED';
        } else if (partiallyDelivered) {
          newOrderStatus = 'PARTIALLY_DELIVERED';
        }

        if (newOrderStatus !== delivery.orders.status) {
          await tx.orders.update({
            where: { id: delivery.order_id },
            data: {
              status: newOrderStatus,
              delivered_at: allOrderDeliveriesDelivered ? new Date() : delivery.orders.delivered_at,
              updated_at: new Date()
            }
          });
        }

        return { 
          updatedDelivery, 
          allDelivered: allOrderDeliveriesDelivered, 
          partiallyDelivered,
          containersCount: containersToDeliver.length,
          totalContainersInDelivery: totalContainersInDelivery,
          allContainersBeingDelivered: allContainersBeingDelivered,
          newOrderStatus
        };
      });

      // 6. Send notifications
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        const batchInfo = `Batch ${delivery.batch_number}/${delivery.total_batches}`;
        const deliveryMessage = result.allContainersBeingDelivered 
          ? `${result.containersCount} container(s) đã được giao đến địa chỉ của bạn.`
          : `${result.containersCount}/${result.totalContainersInDelivery} container(s) trong ${batchInfo} đã được giao.`;
        
        // Notify buyer
        await NotificationService.createNotification({
          userId: delivery.orders.buyer_id,
          type: 'delivery_batch_completed',
          title: result.allContainersBeingDelivered 
            ? `🚚 ${batchInfo} đã được giao!`
            : `🚚 Một phần ${batchInfo} đã được giao`,
          message: `${deliveryMessage} Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.`,
          data: {
            orderId: delivery.order_id,
            deliveryId: delivery.id,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            containersCount: result.containersCount,
            totalContainersInBatch: result.totalContainersInDelivery,
            isPartialDelivery: !result.allContainersBeingDelivered,
            deliveredAt: deliveredAt || new Date().toISOString()
          }
        });

        // Notify seller
        let sellerMessage = '';
        if (result.allDelivered) {
          sellerMessage = `✅ Tất cả ${delivery.total_batches} batches đã được giao. Chờ buyer xác nhận để hoàn tất thanh toán.`;
        } else if (result.allContainersBeingDelivered) {
          const remainingBatches = delivery.total_batches! - delivery.batch_number!;
          sellerMessage = `${batchInfo} đã giao thành công (${result.containersCount} containers). Còn ${remainingBatches} batch(es) chưa giao.`;
        } else {
          sellerMessage = `Đã giao ${result.containersCount}/${result.totalContainersInDelivery} container trong ${batchInfo}.`;
        }

        await NotificationService.createNotification({
          userId: delivery.orders.seller_id,
          type: 'delivery_marked_complete',
          title: result.allDelivered ? '🎉 Hoàn tất giao hàng!' : `Đã xác nhận ${batchInfo}`,
          message: sellerMessage,
          data: {
            orderId: delivery.order_id,
            deliveryId: delivery.id,
            allDelivered: result.allDelivered,
            orderStatus: result.newOrderStatus,
            containersDelivered: result.containersCount,
            totalContainersInBatch: result.totalContainersInDelivery
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 7. Return response
      const responseMessage = result.allContainersBeingDelivered
        ? `Batch ${delivery.batch_number}/${delivery.total_batches} delivered successfully`
        : `${result.containersCount}/${result.totalContainersInDelivery} containers in Batch ${delivery.batch_number} delivered`;

      return reply.send({
        success: true,
        message: responseMessage,
        data: {
          delivery: {
            id: result.updatedDelivery.id,
            status: result.updatedDelivery.status,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            deliveredAt: result.updatedDelivery.delivered_at,
            containersDelivered: result.containersCount,
            totalContainersInBatch: result.totalContainersInDelivery,
            isPartialDelivery: !result.allContainersBeingDelivered
          },
          order: {
            id: delivery.order_id,
            orderNumber: delivery.orders.order_number,
            allDeliveriesCompleted: result.allDelivered,
            orderStatus: result.newOrderStatus
          },
          summary: {
            message: result.allDelivered 
              ? 'Tất cả batches đã được giao. Chờ buyer xác nhận.'
              : result.allContainersBeingDelivered
                ? `Batch ${delivery.batch_number}/${delivery.total_batches} đã giao. Còn lại chưa giao.`
                : `${result.containersCount}/${result.totalContainersInDelivery} containers trong batch đã giao.`
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error marking delivery delivered:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to mark delivery delivered',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/review - Buyer đánh giá lô giao hàng
  fastify.post<{
    Params: { deliveryId: string },
    Body: {
      rating: number,
      comment?: string,
      deliveryQualityRating?: number,
      packagingRating?: number,
      timelinessRating?: number,
      photos?: string[]
    }
  }>('/:deliveryId/review', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId } = request.params;
    const { 
      rating, 
      comment, 
      deliveryQualityRating, 
      packagingRating, 
      timelinessRating,
      photos 
    } = request.body;

    try {
      // 1. Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return reply.status(400).send({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // 2. Get delivery
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, email: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, email: true, display_name: true }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 3. Verify buyer permission
      if (delivery.orders.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can review delivery'
        });
      }

      // 4. Check delivery status - must be receipt confirmed
      if (!delivery.receipt_confirmed_at) {
        return reply.status(400).send({
          success: false,
          message: 'Can only review after receipt confirmation'
        });
      }

      // 5. Check if already reviewed
      const existingReview = await prisma.reviews.findFirst({
        where: {
          delivery_id: deliveryId,
          reviewer_id: userId
        }
      });

      if (existingReview) {
        return reply.status(400).send({
          success: false,
          message: 'You have already reviewed this delivery'
        });
      }

      // 6. Create review
      const reviewId = randomUUID();
      const review = await prisma.reviews.create({
        data: {
          id: reviewId,
          delivery_id: deliveryId,
          order_id: delivery.order_id,
          reviewer_id: userId,
          reviewee_id: delivery.orders.seller_id,
          rating,
          comment: comment || null,
          delivery_quality_rating: deliveryQualityRating || null,
          packaging_rating: packagingRating || null,
          timeliness_rating: timelinessRating || null,
          photos_json: photos ? JSON.stringify(photos) : null,
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

      // 7. Update delivery review_requested flag
      await prisma.deliveries.update({
        where: { id: deliveryId },
        data: {
          review_requested: true,
          review_requested_at: new Date(),
          updated_at: new Date()
        }
      });

      // 8. Send notification to seller
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        await NotificationService.createNotification({
          userId: delivery.orders.seller_id,
          type: 'delivery_reviewed',
          title: `⭐ Buyer đã đánh giá Batch ${delivery.batch_number}`,
          message: `Batch ${delivery.batch_number}/${delivery.total_batches} nhận được ${rating} sao${comment ? ': ' + comment.substring(0, 50) : ''}`,
          data: {
            orderId: delivery.order_id,
            deliveryId: deliveryId,
            reviewId: reviewId,
            rating: rating,
            batchNumber: delivery.batch_number
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      return reply.status(201).send({
        success: true,
        message: 'Review created successfully',
        data: review
      });

    } catch (error: any) {
      fastify.log.error('Error creating delivery review:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }
  });

  // GET /deliveries/:deliveryId/review - Lấy review của delivery
  fastify.get<{
    Params: { deliveryId: string }
  }>('/:deliveryId/review', async (request, reply) => {
    const { deliveryId } = request.params;

    try {
      const review = await prisma.reviews.findFirst({
        where: { delivery_id: deliveryId },
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
              receipt_confirmed_at: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        data: review
      });

    } catch (error: any) {
      fastify.log.error('Error fetching delivery review:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch review',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/confirm-receipt - Buyer xác nhận nhận batch
  fastify.post<{
    Params: { deliveryId: string },
    Body: {
      receivedAt?: string,
      receivedBy: string,
      conditions: Array<{
        containerId: string,
        condition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE',
        photos?: string[],
        notes?: string
      }>,
      overallNotes?: string,
      signature?: string
    }
  }>('/:deliveryId/confirm-receipt', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId } = request.params;
    const { receivedAt, receivedBy, conditions, overallNotes, signature } = request.body;

    try {
      // 1. Validate conditions array
      if (!conditions || conditions.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Conditions for containers are required'
        });
      }

      // 2. Get delivery
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, email: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, email: true, display_name: true }
              }
            }
          },
          delivery_containers: {
            include: {
              listing_container: true
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 3. Verify buyer permission
      if (delivery.orders.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can confirm receipt'
        });
      }

      // 4. Check delivery status
      if (delivery.status !== 'DELIVERED') {
        return reply.status(400).send({
          success: false,
          message: `Cannot confirm receipt. Delivery must be DELIVERED. Current status: ${delivery.status}`
        });
      }

      // Check if already confirmed
      if (delivery.receipt_confirmed_at) {
        return reply.status(400).send({
          success: false,
          message: 'Receipt already confirmed for this delivery',
          data: {
            confirmedAt: delivery.receipt_confirmed_at
          }
        });
      }

      // 5. Validate conditions - must provide for all containers
      const containerIds = delivery.delivery_containers.map(dc => dc.container_id);
      const providedContainerIds = conditions.map(c => c.containerId);
      const missingContainers = containerIds.filter(id => !providedContainerIds.includes(id));

      if (missingContainers.length > 0) {
        return reply.status(400).send({
          success: false,
          message: 'Must provide condition for all containers in this delivery',
          data: { 
            missingContainerIds: missingContainers,
            requiredContainers: containerIds
          }
        });
      }

      // 6. Check for damages
      const majorDamages = conditions.filter(c => c.condition === 'MAJOR_DAMAGE');
      const minorDamages = conditions.filter(c => c.condition === 'MINOR_DAMAGE');
      const goodCondition = conditions.filter(c => c.condition === 'GOOD');
      const hasMajorDamage = majorDamages.length > 0;

      // 7. Update trong transaction
      const result = await prisma.$transaction(async (tx) => {
        // 7.1. Update delivery_containers với tình trạng từng container
        for (const conditionData of conditions) {
          await tx.delivery_containers.updateMany({
            where: {
              delivery_id: deliveryId,
              container_id: conditionData.containerId
            },
            data: {
              condition_notes: JSON.stringify({
                condition: conditionData.condition,
                photos: conditionData.photos || [],
                notes: conditionData.notes || ''
              }),
              received_by: receivedBy,
              signature_url: signature || null,
              updated_at: new Date()
            }
          });
        }

        // 7.2. Update delivery record
        const receiptData = {
          receivedAt: receivedAt || new Date().toISOString(),
          receivedBy: receivedBy,
          conditions: conditions,
          overallNotes: overallNotes || '',
          signature: signature || '',
          confirmedAt: new Date().toISOString(),
          summary: {
            total: conditions.length,
            good: goodCondition.length,
            minorDamage: minorDamages.length,
            majorDamage: majorDamages.length
          }
        };

        await tx.deliveries.update({
          where: { id: deliveryId },
          data: {
            receipt_confirmed_at: new Date(),
            receipt_data_json: receiptData as any,
            updated_at: new Date()
          }
        });

        // 7.3. Create delivery event
        await tx.delivery_events.create({
          data: {
            id: randomUUID(),
            delivery_id: deliveryId,
            event_type: 'DELIVERED',
            payload: {
              confirmedBy: receivedBy,
              conditionSummary: {
                good: goodCondition.length,
                minorDamage: minorDamages.length,
                majorDamage: majorDamages.length
              }
            },
            occurred_at: new Date()
          }
        });

        // 7.4. Check if ALL deliveries confirmed
        const allDeliveries = await tx.deliveries.findMany({
          where: { order_id: delivery.order_id },
          select: { id: true, receipt_confirmed_at: true }
        });

        const allConfirmed = allDeliveries.every(d => 
          d.id === deliveryId || d.receipt_confirmed_at !== null
        );

        const partiallyConfirmed = allDeliveries.some(d => d.receipt_confirmed_at !== null) && !allConfirmed;

        // 7.5. Determine final order status
        let orderStatus: any = delivery.orders.status;
        
        if (allConfirmed) {
          orderStatus = hasMajorDamage ? 'DISPUTED' : 'COMPLETED';
        } else if (partiallyConfirmed) {
          orderStatus = 'PARTIALLY_CONFIRMED';
        }

        // 7.6. Update order status
        if (orderStatus !== delivery.orders.status) {
          await tx.orders.update({
            where: { id: delivery.order_id },
            data: {
              status: orderStatus,
              receipt_confirmed_at: allConfirmed ? new Date() : delivery.orders.receipt_confirmed_at,
              receipt_confirmed_by: allConfirmed ? userId : delivery.orders.receipt_confirmed_by,
              updated_at: new Date()
            }
          });
        }

        // 7.7. Create dispute if major damage
        let disputeId = null;
        if (hasMajorDamage) {
          disputeId = randomUUID();
          
          await tx.disputes.create({
            data: {
              id: disputeId,
              order_id: delivery.order_id,
              raised_by: userId,
              status: 'OPEN',
              reason: 'Container(s) damaged on delivery',
              description: `Buyer reported MAJOR_DAMAGE for ${majorDamages.length} container(s) in Batch ${delivery.batch_number}/${delivery.total_batches}`,
              evidence_json: {
                deliveryId: deliveryId,
                batchNumber: delivery.batch_number,
                damagedContainers: majorDamages,
                allConditions: conditions
              } as any,
              requested_resolution: 'PARTIAL_REFUND',
              requested_amount: null,
              priority: 'HIGH',
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        return {
          allConfirmed,
          partiallyConfirmed,
          orderStatus,
          disputeId,
          damagedCount: majorDamages.length,
          minorDamageCount: minorDamages.length,
          goodCount: goodCondition.length
        };
      });

      // 8. Send notifications
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        const batchInfo = `Batch ${delivery.batch_number}/${delivery.total_batches}`;

        if (result.disputeId) {
          // Notify seller about dispute
          await NotificationService.createNotification({
            userId: delivery.orders.seller_id,
            type: 'delivery_issue_reported',
            title: `⚠️ Buyer báo cáo vấn đề - ${batchInfo}`,
            message: `${result.damagedCount} container(s) bị hư hỏng nghiêm trọng trong ${batchInfo}. Tranh chấp đã được tạo.`,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              disputeId: result.disputeId,
              damagedCount: result.damagedCount
            }
          });

          // Notify buyer
          await NotificationService.createNotification({
            userId: delivery.orders.buyer_id,
            type: 'dispute_created',
            title: 'Tranh chấp đã được tạo',
            message: `Tranh chấp cho ${batchInfo} đã được tạo. Admin sẽ liên hệ trong vòng 24h để xử lý.`,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              disputeId: result.disputeId
            }
          });

          // Notify admins
          const adminUsers = await prisma.users.findMany({
            where: {
              user_roles_user_roles_user_idTousers: {
                some: {
                  roles: {
                    code: 'ADMIN'
                  }
                }
              }
            },
            select: { id: true }
          });

          for (const admin of adminUsers) {
            await NotificationService.createNotification({
              userId: admin.id,
              type: 'new_dispute',
              title: '🚨 Tranh chấp mới cần xử lý',
              message: `Tranh chấp cho đơn hàng ${delivery.orders.order_number || delivery.order_id.slice(0, 8)} - ${batchInfo} - ${result.damagedCount} container(s) hư hỏng`,
              data: {
                orderId: delivery.order_id,
                deliveryId: deliveryId,
                disputeId: result.disputeId,
                damagedCount: result.damagedCount
              }
            });
          }
        } else {
          // Notify seller about successful confirmation
          let sellerMessage = '';
          if (result.allConfirmed) {
            sellerMessage = `🎉 Buyer đã xác nhận tất cả ${delivery.total_batches} batches. Đơn hàng hoàn tất!`;
          } else {
            const remainingBatches = delivery.total_batches! - delivery.batch_number!;
            sellerMessage = `Buyer đã xác nhận ${batchInfo}. Còn ${remainingBatches} batch(es) chưa xác nhận.`;
          }

          await NotificationService.createNotification({
            userId: delivery.orders.seller_id,
            type: 'delivery_confirmed',
            title: result.allConfirmed ? '🎉 Đơn hàng hoàn tất!' : `✅ Buyer xác nhận ${batchInfo}`,
            message: sellerMessage,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              allConfirmed: result.allConfirmed,
              orderStatus: result.orderStatus,
              conditionSummary: {
                good: result.goodCount,
                minorDamage: result.minorDamageCount,
                majorDamage: result.damagedCount
              }
            }
          });

          // 🆕 Notify buyer to leave a review
          await NotificationService.createNotification({
            userId: delivery.orders.buyer_id,
            type: 'review_request',
            title: '⭐ Đánh giá lô giao hàng',
            message: `Bạn đã nhận ${batchInfo} thành công. Hãy đánh giá để chia sẻ trải nghiệm!`,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              batchNumber: delivery.batch_number,
              totalBatches: delivery.total_batches,
              reviewUrl: `/orders/${delivery.order_id}?reviewDelivery=${deliveryId}`
            }
          });
        }
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 9. Return response
      return reply.send({
        success: true,
        message: result.disputeId 
          ? `Receipt confirmed with ${result.damagedCount} damaged container(s). Dispute created.`
          : `Receipt confirmed for Batch ${delivery.batch_number}/${delivery.total_batches}`,
        data: {
          delivery: {
            id: deliveryId,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            confirmedAt: new Date()
          },
          order: {
            id: delivery.order_id,
            orderNumber: delivery.orders.order_number,
            status: result.orderStatus,
            allConfirmed: result.allConfirmed,
            partiallyConfirmed: result.partiallyConfirmed
          },
          conditionSummary: {
            total: conditions.length,
            good: result.goodCount,
            minorDamage: result.minorDamageCount,
            majorDamage: result.damagedCount
          },
          dispute: result.disputeId ? {
            id: result.disputeId,
            damagedContainers: result.damagedCount,
            status: 'OPEN'
          } : null,
          summary: {
            message: result.allConfirmed 
              ? (result.disputeId 
                  ? 'Tất cả batches đã xác nhận nhưng có tranh chấp. Admin sẽ xử lý.'
                  : 'Tất cả batches đã xác nhận. Đơn hàng hoàn tất!')
              : `Batch ${delivery.batch_number}/${delivery.total_batches} đã xác nhận.`
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error confirming receipt:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to confirm receipt',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/containers/:containerId/mark-delivered - Seller xác nhận giao 1 container
  fastify.post<{
    Params: { deliveryId: string; containerId: string },
    Body: {
      deliveredAt?: string,
      deliveredBy?: string,
      deliveryLocation?: any,
      deliveryProof?: string[],
      notes?: string
    }
  }>('/:deliveryId/containers/:containerId/mark-delivered', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId, containerId } = request.params;
    const { deliveredAt, deliveredBy, deliveryLocation, deliveryProof, notes } = request.body;

    try {
      // 1. Get delivery and verify
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            select: {
              id: true,
              order_number: true,
              seller_id: true,
              buyer_id: true
            }
          },
          delivery_containers: {
            where: { container_id: containerId },
            include: {
              listing_container: {
                select: {
                  id: true,
                  container_iso_code: true,
                  status: true
                }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 2. Verify seller permission
      if (delivery.orders.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can mark container as delivered'
        });
      }

      // 3. Check if container belongs to this delivery
      if (delivery.delivery_containers.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Container not found in this delivery'
        });
      }

      const deliveryContainer = delivery.delivery_containers[0];

      // 4. Check if already delivered
      if (deliveryContainer.delivered_at) {
        return reply.status(400).send({
          success: false,
          message: 'Container already marked as delivered',
          data: {
            deliveredAt: deliveryContainer.delivered_at
          }
        });
      }

      // 5. Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // 5.1. Update delivery_containers
        const updated = await tx.delivery_containers.updateMany({
          where: {
            delivery_id: deliveryId,
            container_id: containerId
          },
          data: {
            delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
            // ❌ KHÔNG set received_by ở đây - chỉ set khi buyer confirm-receipt
            // received_by sẽ được set trong endpoint confirm-receipt
            updated_at: new Date()
          }
        });

        // 5.2. Update listing_containers status
        await tx.listing_containers.update({
          where: { id: containerId },
          data: {
            delivery_status: 'DELIVERED',
            actual_delivery_date: deliveredAt ? new Date(deliveredAt) : new Date(),
            updated_at: new Date()
          }
        });

        // 5.3. Create delivery event
        await tx.delivery_events.create({
          data: {
            id: randomUUID(),
            delivery_id: deliveryId,
            event_type: 'DELIVERED',
            payload: {
              containerId: containerId,
              containerCode: deliveryContainer.listing_container.container_iso_code,
              deliveredBy: deliveredBy || 'Seller',
              deliveredAt: deliveredAt || new Date().toISOString()
            },
            occurred_at: new Date()
          }
        });

        // 5.4. Check if ALL containers in this delivery are delivered
        const allContainersInDelivery = await tx.delivery_containers.findMany({
          where: { delivery_id: deliveryId },
          select: { delivered_at: true }
        });

        const allDelivered = allContainersInDelivery.every(dc => dc.delivered_at !== null);

        // 5.5. Update delivery status if all containers delivered
        if (allDelivered) {
          await tx.deliveries.update({
            where: { id: deliveryId },
            data: {
              status: 'DELIVERED',
              delivered_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        // 5.6. Check if ALL deliveries of order are complete
        const allOrderDeliveries = await tx.deliveries.findMany({
          where: { order_id: delivery.orders.id },
          select: { id: true, status: true }
        });

        const allOrderDeliveriesComplete = allOrderDeliveries.every(d => 
          d.id === deliveryId ? allDelivered : d.status === 'DELIVERED'
        );

        // 5.7. Update order status if needed
        if (allOrderDeliveriesComplete) {
          await tx.orders.update({
            where: { id: delivery.orders.id },
            data: {
              status: 'DELIVERED',
              delivered_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        return {
          allDelivered,
          allOrderDeliveriesComplete,
          deliveredCount: allContainersInDelivery.filter(dc => dc.delivered_at !== null).length,
          totalCount: allContainersInDelivery.length
        };
      });

      // 6. Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        await NotificationService.createNotification({
          userId: delivery.orders.buyer_id,
          type: 'delivery_container_completed',
          title: `📦 Container ${deliveryContainer.listing_container.container_iso_code} đã được giao`,
          message: result.allDelivered 
            ? `Tất cả ${result.totalCount} container trong Batch ${delivery.batch_number} đã được giao. Vui lòng xác nhận.`
            : `Container đã được giao (${result.deliveredCount}/${result.totalCount} trong batch). Vui lòng kiểm tra.`,
          data: {
            orderId: delivery.orders.id,
            deliveryId: deliveryId,
            containerId: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            batchNumber: delivery.batch_number,
            allDelivered: result.allDelivered
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 7. Return response
      return reply.send({
        success: true,
        message: result.allDelivered
          ? `Container delivered. All containers in Batch ${delivery.batch_number} are now delivered.`
          : `Container delivered successfully (${result.deliveredCount}/${result.totalCount} in batch)`,
        data: {
          container: {
            id: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date()
          },
          delivery: {
            id: deliveryId,
            batchNumber: delivery.batch_number,
            allContainersDelivered: result.allDelivered,
            deliveredCount: result.deliveredCount,
            totalCount: result.totalCount
          },
          order: {
            id: delivery.orders.id,
            allDeliveriesComplete: result.allOrderDeliveriesComplete
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error marking container delivered:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to mark container delivered',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/containers/:containerId/confirm-receipt - Buyer xác nhận nhận 1 container
  fastify.post<{
    Params: { deliveryId: string; containerId: string },
    Body: {
      receivedAt?: string,
      receivedBy: string,
      condition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE',
      notes?: string,
      photos?: string[],
      signature?: string
    }
  }>('/:deliveryId/containers/:containerId/confirm-receipt', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId, containerId } = request.params;
    const { receivedAt, receivedBy, condition, notes, photos, signature } = request.body;

    try {
      // 1. Validation
      if (!receivedBy.trim()) {
        return reply.status(400).send({
          success: false,
          message: 'Received by name is required'
        });
      }

      if ((condition === 'MINOR_DAMAGE' || condition === 'MAJOR_DAMAGE') && !notes?.trim()) {
        return reply.status(400).send({
          success: false,
          message: 'Notes are required for damaged containers'
        });
      }

      if (condition === 'MAJOR_DAMAGE' && (!photos || photos.length === 0)) {
        return reply.status(400).send({
          success: false,
          message: 'Photos are required for major damage'
        });
      }

      // 2. Get delivery and verify
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            select: {
              id: true,
              order_number: true,
              seller_id: true,
              buyer_id: true
            }
          },
          delivery_containers: {
            where: { container_id: containerId },
            include: {
              listing_container: {
                select: {
                  id: true,
                  container_iso_code: true
                }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 3. Verify buyer permission
      if (delivery.orders.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can confirm receipt'
        });
      }

      // 4. Check if container belongs to this delivery
      if (delivery.delivery_containers.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Container not found in this delivery'
        });
      }

      const deliveryContainer = delivery.delivery_containers[0];

      // 5. Check if container was delivered
      if (!deliveryContainer.delivered_at) {
        return reply.status(400).send({
          success: false,
          message: 'Container has not been delivered yet'
        });
      }

      // 6. Check if already confirmed
      if (deliveryContainer.received_by && deliveryContainer.signature_url) {
        return reply.status(400).send({
          success: false,
          message: 'Receipt already confirmed for this container'
        });
      }

      // 7. Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // 7.1. Update delivery_containers
        await tx.delivery_containers.updateMany({
          where: {
            delivery_id: deliveryId,
            container_id: containerId
          },
          data: {
            received_by: receivedBy,
            signature_url: signature || null,
            condition_notes: JSON.stringify({
              condition,
              notes: notes || '',
              photos: photos || []
            }),
            photos_json: photos || null,
            updated_at: new Date()
          }
        });

        // 7.2. Create delivery event
        await tx.delivery_events.create({
          data: {
            id: randomUUID(),
            delivery_id: deliveryId,
            event_type: 'DELIVERED',
            payload: {
              containerId: containerId,
              containerCode: deliveryContainer.listing_container.container_iso_code,
              confirmedBy: receivedBy,
              condition: condition
            },
            occurred_at: new Date()
          }
        });

        // 7.3. Create dispute if major damage
        let disputeId = null;
        if (condition === 'MAJOR_DAMAGE') {
          disputeId = randomUUID();
          
          await tx.disputes.create({
            data: {
              id: disputeId,
              order_id: delivery.orders.id,
              raised_by: userId,
              status: 'OPEN',
              reason: 'Container damaged on delivery',
              description: `Container ${deliveryContainer.listing_container.container_iso_code} reported with MAJOR_DAMAGE in Batch ${delivery.batch_number}`,
              evidence_json: {
                deliveryId: deliveryId,
                containerId: containerId,
                containerCode: deliveryContainer.listing_container.container_iso_code,
                condition: condition,
                notes: notes,
                photos: photos
              } as any,
              requested_resolution: 'PARTIAL_REFUND',
              priority: 'HIGH',
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        // 7.4. Check if ALL containers in delivery are confirmed
        const allContainersInDelivery = await tx.delivery_containers.findMany({
          where: { delivery_id: deliveryId },
          select: { received_by: true, signature_url: true }
        });

        const allConfirmed = allContainersInDelivery.every(dc => 
          dc.received_by !== null
        );

        // 7.5. Update delivery if all confirmed
        if (allConfirmed) {
          await tx.deliveries.update({
            where: { id: deliveryId },
            data: {
              receipt_confirmed_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        // 7.6. Check if ALL deliveries of order are confirmed
        const allOrderDeliveries = await tx.deliveries.findMany({
          where: { order_id: delivery.orders.id },
          select: { id: true, receipt_confirmed_at: true }
        });

        const allOrderDeliveriesConfirmed = allOrderDeliveries.every(d => 
          d.id === deliveryId ? allConfirmed : d.receipt_confirmed_at !== null
        );

        // 7.7. Update order status
        let orderStatus: any = 'DELIVERED';
        if (allOrderDeliveriesConfirmed) {
          orderStatus = disputeId ? 'DISPUTED' : 'COMPLETED';
        }

        if (allOrderDeliveriesConfirmed) {
          await tx.orders.update({
            where: { id: delivery.orders.id },
            data: {
              status: orderStatus,
              receipt_confirmed_at: new Date(),
              receipt_confirmed_by: userId,
              updated_at: new Date()
            }
          });
        }

        return {
          disputeId,
          allConfirmed,
          allOrderDeliveriesConfirmed,
          confirmedCount: allContainersInDelivery.filter(dc => dc.received_by !== null).length,
          totalCount: allContainersInDelivery.length,
          orderStatus
        };
      });

      // 8. Send notifications
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        if (result.disputeId) {
          // Notify seller about damage
          await NotificationService.createNotification({
            userId: delivery.orders.seller_id,
            type: 'delivery_issue_reported',
            title: `⚠️ Container ${deliveryContainer.listing_container.container_iso_code} bị hư hỏng`,
            message: `Buyer báo cáo container bị hư hỏng nặng. Tranh chấp đã được tạo.`,
            data: {
              orderId: delivery.orders.id,
              deliveryId: deliveryId,
              containerId: containerId,
              disputeId: result.disputeId
            }
          });

          // Notify admins
          const adminUsers = await prisma.users.findMany({
            where: {
              user_roles_user_roles_user_idTousers: {
                some: {
                  roles: { code: 'ADMIN' }
                }
              }
            },
            select: { id: true }
          });

          for (const admin of adminUsers) {
            await NotificationService.createNotification({
              userId: admin.id,
              type: 'new_dispute',
              title: '🚨 Tranh chấp mới',
              message: `Container ${deliveryContainer.listing_container.container_iso_code} - Order ${delivery.orders.order_number}`,
              data: {
                orderId: delivery.orders.id,
                disputeId: result.disputeId
              }
            });
          }
        } else {
          // Notify seller about confirmation
          await NotificationService.createNotification({
            userId: delivery.orders.seller_id,
            type: 'delivery_confirmed',
            title: result.allOrderDeliveriesConfirmed 
              ? '🎉 Đơn hàng hoàn tất!'
              : `✅ Container ${deliveryContainer.listing_container.container_iso_code} đã xác nhận`,
            message: result.allOrderDeliveriesConfirmed
              ? `Tất cả containers đã được xác nhận. Đơn hàng hoàn tất!`
              : `Buyer đã xác nhận nhận container (${result.confirmedCount}/${result.totalCount} trong batch)`,
            data: {
              orderId: delivery.orders.id,
              deliveryId: deliveryId,
              containerId: containerId,
              allConfirmed: result.allConfirmed
            }
          });
        }
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 9. Return response
      return reply.send({
        success: true,
        message: result.disputeId
          ? `Receipt confirmed with major damage. Dispute created.`
          : result.allOrderDeliveriesConfirmed
            ? `Receipt confirmed. Order completed!`
            : `Receipt confirmed (${result.confirmedCount}/${result.totalCount} in batch)`,
        data: {
          container: {
            id: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            condition: condition,
            confirmedAt: new Date()
          },
          delivery: {
            id: deliveryId,
            batchNumber: delivery.batch_number,
            allContainersConfirmed: result.allConfirmed,
            confirmedCount: result.confirmedCount,
            totalCount: result.totalCount
          },
          order: {
            id: delivery.orders.id,
            status: result.orderStatus,
            allDeliveriesConfirmed: result.allOrderDeliveriesConfirmed
          },
          dispute: result.disputeId ? {
            id: result.disputeId,
            status: 'OPEN'
          } : null
        }
      });

    } catch (error: any) {
      fastify.log.error('Error confirming container receipt:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to confirm container receipt',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/containers/:containerId/book-transportation
  // Buyer đặt vận chuyển cho từng container riêng lẻ
  fastify.post<{
    Params: { deliveryId: string; containerId: string };
    Body: {
      transportMethod: 'self_pickup' | 'logistics' | 'seller_delivers';
      logisticsCompany?: string;
      deliveryAddress: string;
      deliveryContact: string;
      deliveryPhone: string;
      deliveryDate: string;
      deliveryTime?: string;
      needsCrane?: boolean;
      specialInstructions?: string;
      transportationFee?: number;
    };
  }>('/:deliveryId/containers/:containerId/book-transportation', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId, containerId } = request.params;
    const {
      transportMethod,
      logisticsCompany,
      deliveryAddress,
      deliveryContact,
      deliveryPhone,
      deliveryDate,
      deliveryTime = '09:00',
      needsCrane = false,
      specialInstructions,
      transportationFee = 0
    } = request.body;

    try {
      // 1. Verify delivery exists and get order info
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            select: {
              id: true,
              order_number: true,
              buyer_id: true,
              seller_id: true,
              status: true
            }
          },
          delivery_containers: {
            where: { container_id: containerId },
            include: {
              listing_container: {
                select: {
                  container_iso_code: true
                }
              }
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 2. Verify user is buyer
      if (delivery.orders.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can book transportation'
        });
      }

      // 3. Check if container exists in delivery
      if (delivery.delivery_containers.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Container not found in this delivery'
        });
      }

      const deliveryContainer = delivery.delivery_containers[0];

      // 4. Check if already booked
      if (deliveryContainer.transportation_booked_at) {
        return reply.status(400).send({
          success: false,
          message: 'Transportation already booked for this container'
        });
      }

      // 5. Validate transport method
      if (!['self_pickup', 'logistics', 'seller_delivers'].includes(transportMethod)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid transport method'
        });
      }

      if (transportMethod === 'logistics' && !logisticsCompany) {
        return reply.status(400).send({
          success: false,
          message: 'Logistics company is required when using logistics method'
        });
      }

      // 6. Update delivery_containers with transportation info
      await prisma.delivery_containers.update({
        where: {
          delivery_id_container_id: {
            delivery_id: deliveryId,
            container_id: containerId
          }
        },
        data: {
          transportation_booked_at: new Date(),
          transport_method: transportMethod,
          logistics_company: logisticsCompany || null,
          transport_notes: JSON.stringify({
            deliveryAddress,
            deliveryContact,
            deliveryPhone,
            deliveryDate,
            deliveryTime,
            needsCrane,
            specialInstructions: specialInstructions || '',
            transportationFee
          }),
          updated_at: new Date()
        }
      });

      // 7. Create delivery event
      await prisma.delivery_events.create({
        data: {
          id: randomUUID(),
          delivery_id: deliveryId,
          event_type: 'IN_TRANSIT',
          payload: {
            containerId: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            transportMethod: transportMethod,
            logisticsCompany: logisticsCompany || null,
            deliveryDate: deliveryDate
          },
          occurred_at: new Date()
        }
      });

      // 8. Send notification to seller
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: delivery.orders.seller_id,
          type: 'transportation_booked',
          title: '🚚 Vận chuyển đã được đặt',
          message: `Buyer đã đặt vận chuyển cho container ${deliveryContainer.listing_container.container_iso_code}. Phương thức: ${transportMethod === 'logistics' ? 'Logistics' : transportMethod === 'self_pickup' ? 'Tự đến lấy' : 'Seller giao'}`,
          data: {
            orderId: delivery.orders.id,
            deliveryId: deliveryId,
            containerId: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            transportMethod: transportMethod,
            deliveryDate: deliveryDate
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 9. Return response
      return reply.send({
        success: true,
        message: 'Transportation booked successfully',
        data: {
          container: {
            id: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            transportationBookedAt: new Date()
          },
          transport: {
            method: transportMethod,
            logisticsCompany: logisticsCompany || null,
            deliveryDate: deliveryDate,
            deliveryTime: deliveryTime,
            deliveryAddress: deliveryAddress
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error booking container transportation:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to book container transportation',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/containers/:containerId/confirm-delivery - Seller xác nhận đã giao 1 container
  fastify.post<{
    Params: { deliveryId: string, containerId: string },
    Body: {
      deliveredAt?: string,
      notes?: string,
      photos?: string[]
    }
  }>('/:deliveryId/containers/:containerId/confirm-delivery', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId, containerId } = request.params;
    const { deliveredAt, notes, photos } = request.body;

    try {
      // 1. Get delivery with order info
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, email: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, email: true, display_name: true }
              }
            }
          },
          delivery_containers: {
            where: { container_id: containerId },
            include: {
              listing_container: true
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 2. Verify seller permission
      if (delivery.orders.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can confirm delivery'
        });
      }

      // 3. Check if container exists in this delivery
      if (delivery.delivery_containers.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Container not found in this delivery'
        });
      }

      const deliveryContainer = delivery.delivery_containers[0];

      // 4. Check if already delivered
      if (deliveryContainer.delivered_at) {
        return reply.status(400).send({
          success: false,
          message: 'Container already marked as delivered',
          data: {
            deliveredAt: deliveryContainer.delivered_at
          }
        });
      }

      // 5. Update delivery_container
      const updatedContainer = await prisma.delivery_containers.update({
        where: {
          delivery_id_container_id: {
            delivery_id: deliveryId,
            container_id: containerId
          }
        },
        data: {
          delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
          condition_notes: notes || null,
          photos_json: photos && photos.length > 0 ? photos : null,
          updated_at: new Date()
        }
      });

      // 6. Check if all containers in this delivery are delivered
      const allContainers = await prisma.delivery_containers.findMany({
        where: { delivery_id: deliveryId },
        select: { id: true, delivered_at: true }
      });

      const allDelivered = allContainers.every(c => c.delivered_at !== null);

      // 7. If all containers delivered, update delivery status
      if (allDelivered) {
        await prisma.deliveries.update({
          where: { id: deliveryId },
          data: {
            status: 'DELIVERED',
            delivered_at: new Date(),
            updated_at: new Date()
          }
        });

        // 7.1 Create delivery event
        await prisma.delivery_events.create({
          data: {
            id: randomUUID(),
            delivery_id: deliveryId,
            event_type: 'DELIVERED',
            payload: {
              deliveredAt: new Date().toISOString(),
              containersCount: allContainers.length,
              notes: 'All containers delivered'
            },
            occurred_at: new Date()
          }
        });

        // 7.2 Check if all batches delivered
        const allBatches = await prisma.deliveries.findMany({
          where: { order_id: delivery.order_id },
          select: { id: true, status: true }
        });

        const allBatchesDelivered = allBatches.every(d => d.status === 'DELIVERED');

        if (allBatchesDelivered) {
          await prisma.orders.update({
            where: { id: delivery.order_id },
            data: {
              status: 'DELIVERED',
              updated_at: new Date()
            }
          });
        }

        // 7.3 Send notification to buyer
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: delivery.orders.buyer_id,
            type: 'delivery_completed',
            title: '✅ Lô hàng đã được giao',
            message: `Seller đã xác nhận giao xong lô ${delivery.batch_number}/${delivery.total_batches} với ${allContainers.length} container(s). Vui lòng kiểm tra và xác nhận nhận hàng.`,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              batchNumber: delivery.batch_number,
              totalBatches: delivery.total_batches
            }
          });
        } catch (notifError) {
          fastify.log.error('Failed to send notification:', notifError);
        }
      } else {
        // 7.4 Only one container delivered, send notification
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: delivery.orders.buyer_id,
            type: 'container_delivered',
            title: '📦 Container đã được giao',
            message: `Seller đã xác nhận giao container ${deliveryContainer.listing_container.container_iso_code} trong lô ${delivery.batch_number}/${delivery.total_batches}.`,
            data: {
              orderId: delivery.order_id,
              deliveryId: deliveryId,
              containerId: containerId,
              containerCode: deliveryContainer.listing_container.container_iso_code
            }
          });
        } catch (notifError) {
          fastify.log.error('Failed to send notification:', notifError);
        }
      }

      // 8. Return response
      return reply.send({
        success: true,
        message: 'Container delivery confirmed successfully',
        data: {
          container: {
            id: containerId,
            containerCode: deliveryContainer.listing_container.container_iso_code,
            deliveredAt: updatedContainer.delivered_at
          },
          delivery: {
            id: deliveryId,
            batchNumber: delivery.batch_number,
            allDelivered: allDelivered,
            status: allDelivered ? 'DELIVERED' : delivery.status
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error confirming container delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to confirm container delivery',
        error: error.message
      });
    }
  });

  // POST /deliveries/:deliveryId/confirm-all-delivered - Seller xác nhận đã giao tất cả containers trong batch
  fastify.post<{
    Params: { deliveryId: string },
    Body: {
      deliveredAt?: string,
      notes?: string,
      photos?: string[]
    }
  }>('/:deliveryId/confirm-all-delivered', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { deliveryId } = request.params;
    const { deliveredAt, notes, photos } = request.body;

    try {
      // 1. Get delivery with all containers
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: { id: true, email: true, display_name: true }
              },
              users_orders_seller_idTousers: {
                select: { id: true, email: true, display_name: true }
              }
            }
          },
          delivery_containers: {
            include: {
              listing_container: true
            }
          }
        }
      });

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery not found'
        });
      }

      // 2. Verify seller permission
      if (delivery.orders.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can confirm delivery'
        });
      }

      // 3. Check if there are containers
      if (delivery.delivery_containers.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'No containers found in this delivery'
        });
      }

      // 4. Check if already all delivered
      const alreadyDelivered = delivery.delivery_containers.every(c => c.delivered_at !== null);
      if (alreadyDelivered) {
        return reply.status(400).send({
          success: false,
          message: 'All containers already marked as delivered'
        });
      }

      const deliveryTime = deliveredAt ? new Date(deliveredAt) : new Date();

      // 5. Update all delivery_containers
      await prisma.delivery_containers.updateMany({
        where: { 
          delivery_id: deliveryId,
          delivered_at: null // Only update containers not yet delivered
        },
        data: {
          delivered_at: deliveryTime,
          condition_notes: notes || null,
          photos_json: photos && photos.length > 0 ? photos : null,
          updated_at: new Date()
        }
      });

      // 6. Update delivery status to DELIVERED
      await prisma.deliveries.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          delivered_at: deliveryTime,
          updated_at: new Date()
        }
      });

      // 7. Create delivery event
      await prisma.delivery_events.create({
        data: {
          id: randomUUID(),
          delivery_id: deliveryId,
          event_type: 'DELIVERED',
          payload: {
            deliveredAt: deliveryTime.toISOString(),
            containersCount: delivery.delivery_containers.length,
            notes: notes || 'All containers delivered',
            method: 'batch_confirmation'
          },
          occurred_at: deliveryTime
        }
      });

      // 8. Check if all batches delivered
      const allBatches = await prisma.deliveries.findMany({
        where: { order_id: delivery.order_id },
        select: { id: true, status: true }
      });

      const allBatchesDelivered = allBatches.every(d => 
        d.id === deliveryId || d.status === 'DELIVERED'
      );

      if (allBatchesDelivered) {
        await prisma.orders.update({
          where: { id: delivery.order_id },
          data: {
            status: 'DELIVERED',
            updated_at: new Date()
          }
        });
      }

      // 9. Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: delivery.orders.buyer_id,
          type: 'delivery_completed',
          title: '✅ Lô hàng đã được giao',
          message: `Seller đã xác nhận giao xong lô ${delivery.batch_number}/${delivery.total_batches} với ${delivery.delivery_containers.length} container(s). Vui lòng kiểm tra và xác nhận nhận hàng.`,
          data: {
            orderId: delivery.order_id,
            deliveryId: deliveryId,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            containersCount: delivery.delivery_containers.length
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send notification:', notifError);
      }

      // 10. Return response
      return reply.send({
        success: true,
        message: `Successfully confirmed delivery of all ${delivery.delivery_containers.length} containers`,
        data: {
          delivery: {
            id: deliveryId,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            containersCount: delivery.delivery_containers.length,
            deliveredAt: deliveryTime,
            status: 'DELIVERED'
          },
          containers: delivery.delivery_containers.map(dc => ({
            id: dc.container_id,
            containerCode: dc.listing_container.container_iso_code,
            deliveredAt: deliveryTime
          }))
        }
      });

    } catch (error: any) {
      fastify.log.error('Error confirming batch delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to confirm batch delivery',
        error: error.message
      });
    }
  });
}

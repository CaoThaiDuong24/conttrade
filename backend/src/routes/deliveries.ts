// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';

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
}

// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';

interface OrderQueryParams {
  status?: string;
  role?: 'buyer' | 'seller';
}

interface CreateOrderBody {
  quote_id: string;
}

interface CreateOrderFromListingBody {
  listingId: string;
  agreedPrice: number;
  currency: string;
  deliveryAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  notes?: string;
}

interface PayOrderBody {
  method: 'bank' | 'credit_card' | 'wallet';
  amount?: number;
  currency?: string;
  paymentData?: any;
}

export default async function orderRoutes(fastify: FastifyInstance) {
  // GET /orders - Lấy danh sách orders
  fastify.get<{ Querystring: OrderQueryParams }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { status, role = 'buyer' } = request.query;

    try {
      const where: any = {};
      
      if (role === 'buyer') {
        where.buyer_id = userId;
      } else {
        where.seller_id = userId;
      }

      if (status) {
        // Convert status to uppercase to match enum
        where.status = status.toUpperCase();
      }

      const orders = await prisma.orders.findMany({
        where,
        include: {
          listings: {
            select: {
              id: true,
              title: true,
            }
          },
          users_orders_buyer_idTousers: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          users_orders_seller_idTousers: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          order_items: true,
          payments: {
            select: {
              id: true,
              method: true,
              status: true,
              created_at: true,
            }
          },
          deliveries: {
            select: {
              id: true,
              status: true,
              created_at: true,
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return reply.send({
        success: true,
        data: orders
      });
    } catch (error: any) {
      fastify.log.error('Error fetching orders:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
  });

  // GET /orders/tracking - Lấy danh sách orders với tracking info
  fastify.get('/tracking', {
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
      // Get orders that are being shipped or delivered
      // Using actual DB statuses: PROCESSING, SHIPPED, DELIVERED
      const orders = await prisma.orders.findMany({
        where: {
          OR: [
            { buyer_id: userId },
            { seller_id: userId }
          ],
          status: {
            in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        },
        include: {
          listings: {
            include: {
              containers: {
                select: {
                  id: true,
                  size_ft: true,
                  type: true,
                }
              },
              depots: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                }
              }
            }
          },
          order_items: {
            select: {
              id: true,
              quantity: true,
            }
          },
          deliveries: {
            orderBy: {
              created_at: 'desc'
            },
            take: 1,
            include: {
              delivery_events: {
                orderBy: {
                  occurred_at: 'desc'
                },
                take: 10
              }
            }
          },
          users_orders_buyer_idTousers: {
            select: {
              id: true,
              display_name: true,
            }
          },
          users_orders_seller_idTousers: {
            select: {
              id: true,
              display_name: true,
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Log for debugging
      fastify.log.info(`Found ${orders.length} tracking orders for user ${userId}`);

      // Transform data to match frontend interface
      const trackingOrders = orders.map(order => {
        const delivery = order.deliveries?.[0];
        const events = delivery?.delivery_events || [];
        
        // Get origin and destination from delivery or listing
        const listing = order.listings;
        const depotName = listing?.depots?.name || 'Depot';
        const depotAddress = listing?.depots?.address || '';
        const origin = delivery?.pickup_depot_id || depotName;
        const destination = delivery?.dropoff_address || (depotAddress || 'Địa chỉ giao hàng');
        
        // Get container info
        const containerType = listing?.containers?.[0]?.type || 'CONTAINER';
        const containerSize = listing?.containers?.[0]?.size_ft || 20;
        
        // Map DB status to frontend status
        // PAID -> processing (đang chuẩn bị)
        // PROCESSING -> processing (đang chuẩn bị) 
        // SHIPPED -> in-transit (đang vận chuyển)
        // DELIVERED -> delivered (đã giao)
        let frontendStatus = 'processing';
        if (order.status === 'PAID') {
          frontendStatus = 'processing';
        } else if (order.status === 'PROCESSING') {
          frontendStatus = 'processing';
        } else if (order.status === 'SHIPPED') {
          frontendStatus = 'in-transit';
        } else if (order.status === 'DELIVERED') {
          frontendStatus = 'delivered';
        } else if (order.status === 'CANCELLED') {
          frontendStatus = 'cancelled';
        }
        
        // Buyer/Seller info
        const buyerName = order.users_orders_buyer_idTousers?.display_name || 'Buyer';
        const sellerName = order.users_orders_seller_idTousers?.display_name || 'Seller';
        
        return {
          id: order.id,
          orderNumber: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
          status: frontendStatus,
          trackingNumber: delivery?.tracking_number || 'Đang cập nhật',
          items: [
            {
              containerType: containerType,
              size: `${containerSize}ft`,
              quantity: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 1
            }
          ],
          origin: origin,
          destination: destination,
          estimatedDelivery: delivery?.estimated_delivery?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          currentLocation: delivery?.current_location || null,
          carrier: delivery?.carrier_name || null,
          driverName: delivery?.driver_name || null,
          driverPhone: delivery?.driver_phone || null,
          timeline: events.length > 0 ? events.map(event => ({
            status: event.event_type || 'Cập nhật',
            timestamp: event.occurred_at?.toISOString() || new Date().toISOString(),
            location: event.location_address || destination,
            note: event.notes || null
          })) : [
            {
              status: order.status === 'PAID' ? 'Đã thanh toán' : 'Đơn hàng đã tạo',
              timestamp: order.created_at?.toISOString() || new Date().toISOString(),
              location: origin,
              note: `Đơn hàng từ ${sellerName} đến ${buyerName}`
            }
          ]
        };
      });

      return reply.send({
        success: true,
        data: {
          orders: trackingOrders
        }
      });
    } catch (error: any) {
      fastify.log.error('Error fetching tracking orders:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch tracking orders',
        error: error.message
      });
    }
  });

  // GET /orders/:id - Chi tiết order
  fastify.get<{ Params: { id: string } }>('/:id', {
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
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          listings: {
            select: {
              id: true,
              title: true,
              description: true,
              containers: {
                select: {
                  id: true,
                  size_ft: true,
                  type: true,
                  condition: true,
                  serial_no: true,
                }
              },
              depots: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                }
              }
            }
          },
          users_orders_buyer_idTousers: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          users_orders_seller_idTousers: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          order_items: true,
          payments: true,
          deliveries: true,
          quotes: {
            include: {
              quote_items: true,
            }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Check access
      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to view this order'
        });
      }

      return reply.send({
        success: true,
        data: order
      });
    } catch (error: any) {
      fastify.log.error('Error fetching order:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch order',
        error: error.message
      });
    }
  });

  // POST /orders - Tạo order từ quote (should be created automatically when accepting quote)
  fastify.post<{ Body: CreateOrderBody }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { quote_id } = request.body;

    try {
      // Verify quote exists and is accepted
      const quote = await prisma.quotes.findUnique({
        where: { id: quote_id },
        include: {
          rfqs: true,
          quote_items: true,
        }
      });

      if (!quote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (quote.rfqs.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the RFQ buyer can create an order from this quote'
        });
      }

      if (quote.status !== 'accepted') {
        return reply.status(400).send({
          success: false,
          message: 'Quote must be accepted before creating an order'
        });
      }

      // Check if order already exists for this quote
      const existingOrder = await prisma.orders.findFirst({
        where: { quote_id: quote_id }
      });

      if (existingOrder) {
        return reply.status(400).send({
          success: false,
          message: 'Order already exists for this quote',
          data: existingOrder
        });
      }

      // Calculate totals
      const subtotalNum = Number(quote.price_subtotal);
      const tax = subtotalNum * 0.1;
      const fees = 0;
      const total = subtotalNum + tax + fees;

      // Create order
      const order = await prisma.orders.create({
        data: {
          buyer_id: userId,
          seller_id: quote.seller_id,
          listing_id: quote.rfqs.listing_id,
          quote_id: quote_id,
          status: 'PENDING_PAYMENT',
          subtotal: subtotalNum,
          tax,
          fees,
          total,
          currency: quote.currency,
          order_items: {
            create: quote.quote_items.map(item => ({
              item_type: item.item_type,
              ref_id: item.ref_id,
              description: item.description,
              qty: item.qty,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
          }
        },
        include: {
          order_items: true,
        }
      });

      // Send notification to seller about new order
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: quote.seller_id,
          type: 'order_created',
          title: 'Đơn hàng mới',
          message: `Bạn có đơn hàng mới từ quote ${quote_id}. Tổng giá trị: ${total.toLocaleString()} ${quote.currency}`,
          data: {
            orderId: order.id,
            quoteId: quote_id,
            amount: total,
            currency: quote.currency
          }
        });
      } catch (notifError) {
        console.error('Failed to send order notification:', notifError);
        // Don't fail the order creation if notification fails
      }

      return reply.status(201).send({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error: any) {
      fastify.log.error('Error creating order:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  });

  // POST /orders/from-listing - Tạo order trực tiếp từ listing (direct buy)
  fastify.post<{ Body: CreateOrderFromListingBody }>('/from-listing', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { listingId, agreedPrice, currency, deliveryAddress, notes } = request.body;

    try {
      // Verify listing exists and is approved
      const listing = await prisma.listings.findUnique({
        where: { id: listingId },
        include: {
          seller: {
            select: {
              id: true,
              displayName: true,
              email: true,
            }
          }
        }
      });

      if (!listing) {
        return reply.status(404).send({
          success: false,
          message: 'Listing not found'
        });
      }

      if (listing.status !== 'approved') {
        return reply.status(400).send({
          success: false,
          message: 'Listing is not approved for purchase'
        });
      }

      if (listing.seller.id === userId) {
        return reply.status(400).send({
          success: false,
          message: 'You cannot create an order for your own listing'
        });
      }

      // Calculate totals
      const subtotalNum = Number(agreedPrice);
      const tax = subtotalNum * 0.1; // 10% VAT
      const platformFee = subtotalNum * 0.02; // 2% platform fee
      const total = subtotalNum + tax + platformFee;

      // Create order
      const order = await prisma.orders.create({
        data: {
          buyerId: userId,
          sellerId: listing.seller.id,
          listingId: listingId,
          status: 'pending_payment',
          subtotal: subtotalNum,
          tax,
          fees: platformFee,
          total,
          currency: currency || 'VND',
          items: {
            create: {
              itemType: 'listing',
              refId: listingId,
              description: listing.title || 'Container listing',
              qty: 1,
              unitPrice: subtotalNum,
            }
          }
        },
        include: {
          listing: {
            include: {
              container: true,
            }
          },
          buyer: {
            select: {
              id: true,
              displayName: true,
              email: true,
            }
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              email: true,
            }
          },
          items: true,
        }
      });

      // Send notification to seller about new order
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: listing.seller.id,
          type: 'order_created',
          title: 'Đơn hàng mới',
          message: `Bạn có đơn hàng mới từ "${listing.title}". Tổng giá trị: ${total.toLocaleString()} ${currency || 'VND'}`,
          data: {
            orderId: order.id,
            listingId: listingId,
            amount: total,
            currency: currency || 'VND',
            buyerName: order.buyer.displayName
          }
        });
      } catch (notifError) {
        console.error('Failed to send order notification:', notifError);
        // Don't fail the order creation if notification fails
      }

      return reply.status(201).send({
        success: true,
        message: 'Order created successfully from listing',
        data: order
      });
    } catch (error: any) {
      fastify.log.error('Error creating order from listing:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create order from listing',
        error: error.message
      });
    }
  });

  // POST /orders/:id/pay - Thanh toán escrow
  fastify.post<{ 
    Params: { id: string },
    Body: PayOrderBody 
  }>('/:id/pay', {
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
    const { method, amount, currency = 'VND', paymentData } = request.body;

    try {
      const order = await prisma.orders.findUnique({
        where: { id },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Simplified authorization check
      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: `Authorization failed. Order buyer: ${order.buyer_id}, User: ${userId}`
        });
      }

      if (order.status !== 'pending_payment' && order.status !== 'PENDING_PAYMENT') {
        return reply.status(400).send({
          success: false,
          message: `Cannot pay for order with status: ${order.status}`
        });
      }

      // Import simple payment service
      const { paymentService } = await import('../lib/payments/payment-service-simple');

      // Process payment through payment service
      const paymentResult = await paymentService.processEscrowPayment(id, method, amount);

      if (!paymentResult.success) {
        return reply.status(400).send({
          success: false,
          message: paymentResult.message
        });
      }

      // Send notification to seller about payment submission - need verification
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.seller_id,
          type: 'payment_pending_verification',
          title: 'Buyer đã thanh toán - Cần xác nhận',
          message: `Buyer đã xác nhận thanh toán ${new Intl.NumberFormat('vi-VN').format(parseFloat(order.total))} ${order.currency} cho đơn hàng #${order.id.slice(-8).toUpperCase()}. Vui lòng kiểm tra và xác nhận đã nhận được tiền.`,
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            paymentId: paymentResult.paymentId,
            action: 'verify_payment',
            actionUrl: `/sell/orders/${order.id}`
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the payment if notification fails
      }

      // Send notification to buyer confirming payment submission
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'payment_submitted',
          title: 'Đã ghi nhận thanh toán',
          message: `Thanh toán ${new Intl.NumberFormat('vi-VN').format(parseFloat(order.total))} ${order.currency} cho đơn hàng #${order.id.slice(-8).toUpperCase()} đã được ghi nhận. Đang chờ seller xác nhận.`,
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            paymentId: paymentResult.paymentId,
            status: 'PAYMENT_PENDING_VERIFICATION'
          }
        });
      } catch (notifError) {
        console.error('Failed to send buyer notification:', notifError);
      }

      return reply.send({
        success: true,
        message: paymentResult.message,
        data: {
          paymentId: paymentResult.paymentId,
          status: paymentResult.status
        }
      });
    } catch (error: any) {
      fastify.log.error('Error processing payment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to process payment',
        error: error.message
      });
    }
  });

  // POST /orders/:id/payment-verify - Seller xác nhận đã nhận tiền
  fastify.post<{ 
    Params: { id: string },
    Body: { 
      verified: boolean,
      notes?: string,
      paymentProofUrls?: string[]
    }
  }>('/:id/payment-verify', {
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
    const { verified, notes, paymentProofUrls } = request.body;

    try {
      // Get order and check permissions
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Only seller can verify payment
      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the seller can verify payment for this order'
        });
      }

      // Check if order has payment pending verification
      if (order.status !== 'PAYMENT_PENDING_VERIFICATION' && order.status !== 'PENDING_PAYMENT') {
        return reply.status(400).send({
          success: false,
          message: `Cannot verify payment for order with status: ${order.status}. Order must be in PAYMENT_PENDING_VERIFICATION status.`
        });
      }

      // Check if there's a payment record
      if (!order.payments || order.payments.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'No payment record found for this order'
        });
      }

      const payment = order.payments[0];

      if (!verified) {
        // Seller rejected the payment verification
        // Update payment status to FAILED and order back to PENDING_PAYMENT
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            notes: notes || 'Payment verification rejected by seller',
            updated_at: new Date()
          }
        });

        await prisma.orders.update({
          where: { id },
          data: {
            status: 'PENDING_PAYMENT',
            updated_at: new Date()
          }
        });

        // Notify buyer about payment rejection
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: order.buyer_id,
            type: 'payment_rejected',
            title: 'Thanh toán bị từ chối',
            message: `Seller đã từ chối xác nhận thanh toán cho đơn hàng #${order.id.slice(-8).toUpperCase()}. ${notes ? `Lý do: ${notes}` : 'Vui lòng kiểm tra lại thông tin thanh toán.'}`,
            orderData: {
              orderId: order.id,
              reason: notes || 'Payment not verified',
              amount: order.total,
              currency: order.currency
            }
          });
        } catch (notifError) {
          console.error('Failed to send rejection notification:', notifError);
        }

        return reply.send({
          success: true,
          message: 'Payment verification rejected',
          data: {
            orderId: order.id,
            status: 'PENDING_PAYMENT',
            paymentStatus: 'FAILED'
          }
        });
      }

      // Seller verified payment - update statuses
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          verified_at: new Date(),
          verified_by: userId,
          notes: notes || 'Payment verified by seller',
          updated_at: new Date()
        }
      });

      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: 'PAID',
          payment_verified_at: new Date(),
          updated_at: new Date()
        },
        include: {
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          users_orders_seller_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      // Notify buyer about payment confirmation
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'payment_verified',
          title: 'Thanh toán đã được xác nhận',
          message: `Seller đã xác nhận nhận được thanh toán ${new Intl.NumberFormat('vi-VN').format(parseFloat(order.total))} ${order.currency} cho đơn hàng #${order.id.slice(-8).toUpperCase()}. Seller sẽ bắt đầu chuẩn bị hàng.`,
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            verifiedAt: new Date().toISOString(),
            action: 'view_order',
            actionUrl: `/buy/orders/${order.id}`
          }
        });
      } catch (notifError) {
        console.error('Failed to send verification notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Payment verified successfully. You can now prepare the delivery.',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            paymentVerifiedAt: updatedOrder.payment_verified_at,
            updatedAt: updatedOrder.updated_at
          },
          payment: {
            id: payment.id,
            status: 'COMPLETED',
            verifiedAt: new Date(),
            verifiedBy: userId
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Error verifying payment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to verify payment',
        error: error.message
      });
    }
  });

  // POST /orders/:id/prepare-delivery - Seller bắt đầu chuẩn bị giao hàng
  fastify.post<{
    Params: { id: string },
    Body: {
      estimatedReadyDate?: string,
      preparationNotes?: string,
      photos?: string[],
      documents?: Array<{ type: string, url: string, name: string }>,
      conditionNotes?: string
    }
  }>('/:id/prepare-delivery', {
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
    const { estimatedReadyDate, preparationNotes, photos, documents, conditionNotes } = request.body;

    try {
      // Get order and verify seller permission
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the seller can prepare delivery for this order'
        });
      }

      if (order.status !== 'paid' && order.status !== 'PAID') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be paid before preparation can start'
        });
      }

      // Check if preparation already exists
      const existingPreparation = await prisma.order_preparations.findFirst({
        where: { order_id: id }
      });

      if (existingPreparation) {
        return reply.status(400).send({
          success: false,
          message: 'Preparation already started for this order'
        });
      }

      // Create preparation record in order_preparations table
      const preparation = await prisma.order_preparations.create({
        data: {
          id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order_id: id,
          seller_id: userId,
          preparation_started_at: new Date(),
          estimated_ready_date: estimatedReadyDate ? new Date(estimatedReadyDate) : null,
          preparation_notes: preparationNotes || null,
          inspection_photos_json: photos && photos.length > 0 ? photos : null,
          document_urls_json: documents && documents.length > 0 ? documents : null,
          seller_notes: conditionNotes || null,
          status: 'PREPARING',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Update order status to PREPARING_DELIVERY (must match enum)
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: 'PREPARING_DELIVERY',
          updated_at: new Date()
        }
      });

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'preparation_started',
          title: 'Seller đang chuẩn bị hàng',
          message: `Seller đã bắt đầu chuẩn bị container của bạn${estimatedReadyDate ? `, dự kiến sẵn sàng vào ${new Date(estimatedReadyDate).toLocaleDateString('vi-VN')}` : ''}.`,
          orderData: {
            orderId: order.id,
            estimatedReadyDate: estimatedReadyDate || null,
            preparationNotes: preparationNotes || null
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Preparation started successfully',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updated_at
          },
          preparation: {
            id: preparation.id,
            orderId: preparation.order_id,
            sellerId: preparation.seller_id,
            startedAt: preparation.preparation_started_at,
            estimatedReadyDate: preparation.estimated_ready_date,
            preparationNotes: preparation.preparation_notes,
            photos: preparation.inspection_photos_json,
            documents: preparation.document_urls_json,
            status: preparation.status
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Error starting preparation:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to start preparation',
        error: error.message
      });
    }
  });

  // POST /orders/:id/mark-ready - Seller đánh dấu sẵn sàng giao hàng
  fastify.post<{
    Params: { id: string },
    Body: {
      readyDate?: string,
      pickupLocation?: any,
      pickupContact?: any,
      pickupTimeWindow?: { from: string, to: string },
      specialInstructions?: string,
      checklist?: any,
      // Legacy fields for backward compatibility
      pickupInstructions?: string,
      accessHours?: string,
      contactPerson?: any,
      finalPhotos?: string[]
    }
  }>('/:id/mark-ready', {
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
    const { 
      readyDate, 
      pickupLocation, 
      pickupContact, 
      pickupTimeWindow, 
      specialInstructions, 
      checklist,
      // Legacy fields
      pickupInstructions, 
      accessHours, 
      contactPerson, 
      finalPhotos 
    } = request.body;
    
    // Support both new and old format
    const instructions = specialInstructions || pickupInstructions || null;
    const contact = pickupContact || contactPerson || null;
    const timeFrom = pickupTimeWindow?.from ? new Date(pickupTimeWindow.from) : null;
    const timeTo = pickupTimeWindow?.to ? new Date(pickupTimeWindow.to) : null;

    try {
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the seller can mark order as ready'
        });
      }

      if (order.status !== 'PREPARING_DELIVERY') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be in PREPARING_DELIVERY status'
        });
      }

      // Check if order_preparations exists, if not create it
      const existingPrep = await prisma.order_preparations.findFirst({
        where: { order_id: id }
      });

      if (!existingPrep) {
        // Create new preparation record
        await prisma.order_preparations.create({
          data: {
            id: `prep-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            order_id: id,
            seller_id: order.seller_id,
            preparation_started_at: new Date(),
            status: 'READY',
            preparation_completed_at: new Date(),
            pickup_location_json: pickupLocation || null,
            pickup_contact_name: contact?.name || null,
            pickup_contact_phone: contact?.phone || null,
            pickup_instructions: instructions || null,
            pickup_available_from: timeFrom,
            pickup_available_to: timeTo,
            updated_at: new Date()
          }
        });
      } else {
        // Update existing preparation record to READY status
        await prisma.order_preparations.update({
          where: { id: existingPrep.id },
          data: {
            status: 'READY',
            preparation_completed_at: new Date(),
            pickup_location_json: pickupLocation || null,
            pickup_contact_name: contact?.name || null,
            pickup_contact_phone: contact?.phone || null,
            pickup_instructions: instructions || null,
            pickup_available_from: timeFrom,
            pickup_available_to: timeTo,
            updated_at: new Date()
          }
        });
      }

      // Update order to ready_for_pickup
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: 'READY_FOR_PICKUP',
          ready_date: readyDate ? new Date(readyDate) : new Date(),
          updated_at: new Date()
        }
      });

      const pickupDetails = {
        location: pickupLocation || null,
        contact: contact || null,
        instructions: instructions || null,
        timeWindow: pickupTimeWindow || null,
        checklist: checklist || null,
        finalPhotos: finalPhotos || []
      };

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'container_ready',
          title: 'Container sẵn sàng!',
          message: 'Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.',
          orderData: {
            orderId: order.id,
            pickupLocation: pickupLocation,
            pickupContact: contact,
            pickupInstructions: instructions,
            pickupTimeWindow: pickupTimeWindow
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Container marked as ready successfully',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            readyDate: updatedOrder.ready_date,
            updatedAt: updatedOrder.updated_at
          },
          pickupDetails
        }
      });
    } catch (error: any) {
      fastify.log.error('Error marking container as ready:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to mark container as ready',
        error: error.message
      });
    }
  });

  // POST /orders/:id/start-delivering - Bắt đầu vận chuyển
  fastify.post<{ 
    Params: { id: string };
    Body: {
      carrierName?: string;
      trackingNumber?: string;
      estimatedDeliveryDate?: string;
      driverInfo?: any;
      transportMethod?: string;
      route?: string;
      notes?: string;
    }
  }>('/:id/start-delivering', {
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
    const { 
      carrierName, 
      trackingNumber, 
      estimatedDeliveryDate,
      driverInfo,
      transportMethod,
      route,
      notes
    } = request.body;

    try {
      // Get order and verify user is seller
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_seller_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can start delivery'
        });
      }

      // Theo tài liệu: Seller có thể start delivery từ READY_FOR_PICKUP hoặc TRANSPORTATION_BOOKED
      if (order.status !== 'READY_FOR_PICKUP' && order.status !== 'TRANSPORTATION_BOOKED') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be in READY_FOR_PICKUP or TRANSPORTATION_BOOKED status to start delivery'
        });
      }

      // Update order status to IN_TRANSIT (theo tài liệu Giai đoạn 6.1)
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: 'IN_TRANSIT',
          updated_at: new Date()
        }
      });

      // Find existing delivery or create new one
      const existingDelivery = await prisma.deliveries.findFirst({
        where: { order_id: id }
      });

      let delivery;
      if (existingDelivery) {
        // Update existing delivery
        delivery = await prisma.deliveries.update({
          where: { id: existingDelivery.id },
          data: {
            status: 'IN_TRANSIT',
            carrier_name: carrierName,
            tracking_number: trackingNumber,
            estimated_delivery: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
            driver_info_json: driverInfo ? JSON.stringify(driverInfo) : null,
            transport_method: transportMethod,
            route_json: route ? JSON.stringify({ route: route }) : null,
            notes: notes,
            in_transit_at: new Date(),
            updated_at: new Date()
          }
        });
      } else {
        // Create new delivery
        // Note: dropoff_address should ideally come from order/buyer profile
        // For now, use buyer email as placeholder - should be enhanced later
        const dropoffAddress = order.users_orders_buyer_idTousers.display_name 
          ? `Giao hàng cho ${order.users_orders_buyer_idTousers.display_name} (${order.users_orders_buyer_idTousers.email})`
          : `Giao hàng cho ${order.users_orders_buyer_idTousers.email}`;
        
        delivery = await prisma.deliveries.create({
          data: {
            order_id: id,
            status: 'IN_TRANSIT',
            carrier_name: carrierName,
            tracking_number: trackingNumber,
            estimated_delivery: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
            driver_info_json: driverInfo ? JSON.stringify(driverInfo) : null,
            transport_method: transportMethod,
            route_json: route ? JSON.stringify({ route: route }) : null,
            notes: notes,
            in_transit_at: new Date(),
            dropoff_address: dropoffAddress,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'delivery_started',
          title: 'Đơn hàng đang được vận chuyển!',
          message: `Đơn hàng ${order.order_number || order.id.slice(0, 8)} đã bắt đầu vận chuyển.${trackingNumber ? ` Mã vận đơn: ${trackingNumber}` : ''}`,
          orderData: {
            orderId: order.id,
            carrierName: carrierName,
            trackingNumber: trackingNumber,
            estimatedDelivery: estimatedDeliveryDate
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Delivery started successfully',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updated_at
          },
          delivery: {
            id: delivery.id,
            status: delivery.status,
            carrierName: delivery.carrier_name,
            trackingNumber: delivery.tracking_number,
            estimatedDelivery: delivery.estimated_delivery,
            inTransitAt: delivery.in_transit_at
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Error starting delivery:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to start delivery',
        error: error.message
      });
    }
  });

  // POST /orders/:id/cancel - Hủy order
  fastify.post<{ 
    Params: { id: string },
    Body: { reason?: string }
  }>('/:id/cancel', {
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
    const { reason } = request.body;

    try {
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          payments: true,
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to cancel this order'
        });
      }

      // Can only cancel if not completed
      if (order.status === 'completed' || order.status === 'cancelled') {
        return reply.status(400).send({
          success: false,
          message: `Cannot cancel order with status: ${order.status}`
        });
      }

      // Import simple payment service
      const { paymentService } = await import('../lib/payments/payment-service-simple');
      
      let paymentResult = null;
      if (order.payments && order.payments.length > 0) {
        const latestPayment = order.payments[0];
        if (latestPayment.status === 'escrow_funded') {
          paymentResult = await paymentService.refundEscrowPayment(id, reason);
          
          if (!paymentResult.success) {
            return reply.status(400).send({
              success: false,
              message: paymentResult.message
            });
          }
        }
      }

      // Update order to cancelled
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: { 
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      const result = { 
        order: updatedOrder, 
        payment: paymentResult ? { 
          id: paymentResult.paymentId, 
          status: paymentResult.status 
        } : null 
      };

      return reply.send({
        success: true,
        message: 'Order cancelled successfully',
        data: result
      });
    } catch (error: any) {
      fastify.log.error('Error cancelling order:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      });
    }
  });

  // GET /orders/:id/documents - Lấy tài liệu liên quan
  fastify.get<{ Params: { id: string } }>('/:id/documents', {
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
      const order = await prisma.orders.findUnique({
        where: { id },
        select: {
          id: true,
          buyerId: true,
          sellerId: true,
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to view documents for this order'
        });
      }

      // TODO: Implement document retrieval from file storage
      // For now, return placeholder
      const documents = [
        {
          type: 'invoice',
          name: 'Invoice.pdf',
          url: '/documents/invoice.pdf',
          uploadedAt: new Date(),
        },
        {
          type: 'contract',
          name: 'Sales Contract.pdf',
          url: '/documents/contract.pdf',
          uploadedAt: new Date(),
        }
      ];

      return reply.send({
        success: true,
        data: documents
      });
    } catch (error: any) {
      fastify.log.error('Error fetching documents:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch documents',
        error: error.message
      });
    }
  });

  // GET /orders/:id/tracking - Get delivery tracking information (Bước 6.3)
  fastify.get<{ Params: { id: string } }>('/:id/tracking', {
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
      // Get order with delivery info
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          deliveries: {
            orderBy: {
              created_at: 'desc'
            },
            take: 1
          },
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          users_orders_seller_idTousers: {
            select: { id: true, email: true, display_name: true, phone: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Verify user has access (buyer or seller)
      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to view tracking for this order'
        });
      }

      const delivery = order.deliveries[0];

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'No delivery information found for this order'
        });
      }

      // Parse route_json for checkpoints
      let checkpoints = [];
      if (delivery.route_json) {
        try {
          const routeData = typeof delivery.route_json === 'string' 
            ? JSON.parse(delivery.route_json) 
            : delivery.route_json;
          checkpoints = routeData.checkpoints || [];
        } catch (e) {
          console.error('Failed to parse route_json:', e);
        }
      }

      // Parse driver_info_json
      let driverInfo = null;
      if (delivery.driver_info_json) {
        try {
          driverInfo = typeof delivery.driver_info_json === 'string'
            ? JSON.parse(delivery.driver_info_json)
            : delivery.driver_info_json;
        } catch (e) {
          console.error('Failed to parse driver_info_json:', e);
        }
      }

      // Build timeline events
      const events = [];

      if (delivery.booked_at) {
        events.push({
          type: 'booked',
          timestamp: delivery.booked_at,
          title: 'Đã đặt vận chuyển',
          description: 'Buyer đã đặt vận chuyển'
        });
      }

      if (delivery.in_transit_at) {
        events.push({
          type: 'in_transit',
          timestamp: delivery.in_transit_at,
          title: 'Đang vận chuyển',
          description: `Seller đã bắt đầu vận chuyển${delivery.carrier_name ? ` với ${delivery.carrier_name}` : ''}`
        });
      }

      // Add checkpoints
      checkpoints.forEach((checkpoint: any) => {
        events.push({
          type: 'checkpoint',
          timestamp: checkpoint.timestamp,
          title: `Đã qua ${checkpoint.location}`,
          description: checkpoint.notes || ''
        });
      });

      if (delivery.delivered_at) {
        events.push({
          type: 'delivered',
          timestamp: delivery.delivered_at,
          title: 'Đã giao hàng',
          description: 'Hàng đã được giao đến địa chỉ'
        });
      }

      // Sort events by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return reply.send({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          orderStatus: order.status,
          delivery: {
            id: delivery.id,
            status: delivery.status,
            trackingNumber: delivery.tracking_number,
            carrierName: delivery.carrier_name,
            currentLocation: delivery.current_location,
            estimatedDelivery: delivery.estimated_delivery,
            actualDelivery: delivery.actual_delivery,
            dropoffAddress: delivery.dropoff_address,
            transportMethod: delivery.transport_method,
            notes: delivery.notes || delivery.driver_notes,
            driverInfo: driverInfo,
            bookedAt: delivery.booked_at,
            inTransitAt: delivery.in_transit_at,
            deliveredAt: delivery.delivered_at
          },
          timeline: events,
          checkpoints: checkpoints,
          seller: {
            id: order.users_orders_seller_idTousers.id,
            name: order.users_orders_seller_idTousers.display_name,
            email: order.users_orders_seller_idTousers.email,
            phone: order.users_orders_seller_idTousers.phone
          },
          buyer: {
            id: order.users_orders_buyer_idTousers.id,
            name: order.users_orders_buyer_idTousers.display_name,
            email: order.users_orders_buyer_idTousers.email
          }
        }
      });

    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch tracking data',
        error: error.message
      });
    }
  });

  // POST /orders/:id/ship - Seller ships the order
  fastify.post<{ 
    Params: { id: string },
    Body: {
      trackingNumber: string,
      carrier: string,
      estimatedDelivery?: string,
      notes?: string
    }
  }>('/:id/ship', {
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
    const { trackingNumber, carrier, estimatedDelivery, notes } = request.body;

    try {
      // Get order and verify seller permission
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyerIdTousers: {
            select: { id: true, email: true, displayName: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the seller can ship this order'
        });
      }

      if (order.status !== 'paid' && order.status !== 'escrow_funded') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be paid before shipping'
        });
      }

      // Create delivery record
      const delivery = await prisma.deliveries.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          trackingNumber,
          carrier,
          status: 'shipped',
          shippedAt: new Date(),
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
          notes: notes || null,
          updatedAt: new Date()
        }
      });

      // Update order status
      await prisma.orders.update({
        where: { id: order.id },
        data: { 
          status: 'delivering',
          updatedAt: new Date()
        }
      });

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'order_shipped',
          title: 'Đơn hàng đã được giao!',
          message: `Đơn hàng #${order.id.slice(-8).toUpperCase()} đã được giao bởi ${carrier}. Mã vận đơn: ${trackingNumber}`,
          orderData: {
            orderId: order.id,
            trackingNumber,
            carrier,
            estimatedDelivery
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the shipping if notification fails
      }

      return reply.send({
        success: true,
        message: 'Order shipped successfully',
        data: {
          order: {
            id: order.id,
            status: 'delivering',
            updatedAt: new Date()
          },
          delivery
        }
      });
    } catch (error: any) {
      fastify.log.error('Error shipping order:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to ship order',
        error: error.message
      });
    }
  });

  // POST /orders/:id/mark-delivered - Seller/carrier xác nhận đã giao hàng
  fastify.post<{
    Params: { id: string },
    Body: {
      deliveredAt?: string,
      deliveryLocation?: any,
      deliveryProof?: string[],
      eirData?: any,
      receivedByName?: string,
      receivedBySignature?: string,
      driverNotes?: string
    }
  }>('/:id/mark-delivered', {
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
    const {
      deliveredAt,
      deliveryLocation,
      deliveryProof,
      eirData,
      receivedByName,
      receivedBySignature,
      driverNotes
    } = request.body;

    try {
      // Get order and verify seller permission
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          deliveries: true,
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the seller can mark delivery as completed'
        });
      }

      // Check order status - must be IN_TRANSIT or TRANSPORTATION_BOOKED (ready to deliver)
      const validStatuses = ['IN_TRANSIT', 'TRANSPORTATION_BOOKED', 'DELIVERING'];
      if (!validStatuses.includes(order.status)) {
        return reply.status(400).send({
          success: false,
          message: `Order must be in delivering or in_transit status. Current status: ${order.status}`
        });
      }

      // Update delivery record
      const delivery = order.deliveries[0];
      if (delivery) {
        await prisma.deliveries.update({
          where: { id: delivery.id },
          data: {
            status: 'DELIVERED',
            delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
            delivery_location_json: deliveryLocation ? JSON.stringify(deliveryLocation) : null,
            delivery_proof_json: deliveryProof ? JSON.stringify(deliveryProof) : null,
            eir_data_json: eirData ? JSON.stringify(eirData) : null,
            received_by_name: receivedByName || null,
            received_by_signature: receivedBySignature || null,
            driver_notes: driverNotes || delivery.driver_notes,
            updated_at: new Date()
          }
        });
      }

      // Update order status to DELIVERED
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          delivered_at: deliveredAt ? new Date(deliveredAt) : new Date(),
          updated_at: new Date()
        }
      });

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'container_delivered',
          title: 'Container đã được giao!',
          message: `Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.`,
          orderData: {
            orderId: order.id,
            deliveredAt: deliveredAt || new Date().toISOString(),
            eirData: eirData || null
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      // Send notification to seller
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: order.seller_id,
          type: 'delivery_completed',
          title: 'Giao hàng thành công',
          message: `Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.`,
          orderData: {
            orderId: order.id,
            deliveredAt: deliveredAt || new Date().toISOString()
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Delivery confirmed successfully',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            deliveredAt: updatedOrder.delivered_at,
            updatedAt: updatedOrder.updated_at
          },
          delivery: delivery ? {
            id: delivery.id,
            status: 'delivered',
            deliveredAt: deliveredAt || new Date().toISOString()
          } : null
        }
      });
    } catch (error: any) {
      fastify.log.error('Error marking delivery as completed:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to mark delivery as completed',
        error: error.message
      });
    }
  });

  // POST /orders/:id/confirm-receipt - Bước 7.2: Buyer confirms receipt
  fastify.post<{
    Params: { id: string },
    Body: {
      receivedAt?: string,
      receivedBy: string,
      condition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE',
      photos?: string[],
      notes?: string,
      signature?: string
    }
  }>('/:id/confirm-receipt', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;
      const { 
        receivedAt,
        receivedBy,
        condition,
        photos,
        notes,
        signature
      } = request.body;

      // Validate required fields
      if (!receivedBy || !condition) {
        return reply.status(400).send({
          success: false,
          message: 'Received by and condition are required'
        });
      }

      // Get order details
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyer_idTousers: {
            select: {
              id: true,
              email: true,
              display_name: true
            }
          },
          users_orders_seller_idTousers: {
            select: {
              id: true,
              email: true,
              display_name: true
            }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is the buyer
      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can confirm receipt'
        });
      }

      // Check if order is in DELIVERED status
      if (order.status !== 'DELIVERED') {
        return reply.status(400).send({
          success: false,
          message: `Cannot confirm receipt. Order must be in DELIVERED status. Current status: ${order.status}`
        });
      }

      // Determine final status based on condition
      let finalStatus: 'COMPLETED' | 'DISPUTED' = 'COMPLETED';
      if (condition === 'MAJOR_DAMAGE') {
        finalStatus = 'DISPUTED';
      }

      // Prepare receipt confirmation data
      const receiptData = {
        received_at: receivedAt || new Date().toISOString(),
        received_by: receivedBy,
        condition: condition,
        photos: photos || [],
        notes: notes || '',
        signature: signature || '',
        confirmed_at: new Date().toISOString()
      };

      // Update order
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          status: finalStatus,
          receipt_confirmed_at: new Date(),
          receipt_confirmed_by: userId,
          receipt_data_json: receiptData as any,
          updated_at: new Date()
        }
      });

      // Update delivery record if exists
      const delivery = await prisma.deliveries.findFirst({
        where: { order_id: id }
      });

      if (delivery) {
        await prisma.deliveries.update({
          where: { id: delivery.id },
          data: {
            receipt_confirmed_at: new Date(),
            receipt_data_json: receiptData as any,
            updated_at: new Date()
          }
        });
      }

      // If condition is GOOD or MINOR_DAMAGE, complete the order
      if (condition === 'GOOD' || condition === 'MINOR_DAMAGE') {
        // Send success notification to seller
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: order.seller_id,
            type: 'order_completed',
            title: '🎉 Đơn hàng hoàn tất!',
            message: `Buyer đã xác nhận nhận hàng cho đơn #${order.id.slice(0, 8)}. ${condition === 'MINOR_DAMAGE' ? 'Có một số vấn đề nhỏ nhưng đơn hàng được chấp nhận.' : 'Hàng trong tình trạng tốt.'}`,
            orderData: {
              orderId: order.id,
              condition: condition,
              receivedBy: receivedBy,
              notes: notes || ''
            }
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }

        // Send notification to buyer
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: order.buyer_id,
            type: 'receipt_confirmed',
            title: 'Xác nhận nhận hàng thành công',
            message: `Bạn đã xác nhận nhận hàng cho đơn #${order.id.slice(0, 8)}. Cảm ơn bạn đã sử dụng dịch vụ!`,
            orderData: {
              orderId: order.id,
              condition: condition
            }
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      } else {
        // MAJOR_DAMAGE - create dispute
        try {
          // Create dispute record
          const disputeId = `DSP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          await prisma.disputes.create({
            data: {
              id: disputeId,
              order_id: id,
              raised_by: userId,
              status: 'OPEN',
              reason: 'Container damaged on delivery',
              description: notes || 'Buyer reported MAJOR_DAMAGE upon receiving the container',
              evidence_json: {
                condition: condition,
                photos: photos || [],
                notes: notes || '',
                received_by: receivedBy,
                received_at: receivedAt || new Date().toISOString(),
                signature: signature || ''
              },
              requested_resolution: 'FULL_REFUND',
              requested_amount: order.total,
              priority: 'HIGH',
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          console.log(`✅ Dispute created: ${disputeId} for order ${id}`);

          const { NotificationService } = await import('../lib/notifications/notification-service');
          
          // Notify seller
          await NotificationService.createNotification({
            userId: order.seller_id,
            type: 'delivery_issue_reported',
            title: '⚠️ Buyer báo cáo vấn đề',
            message: `Buyer báo cáo hàng hư hỏng nghiêm trọng cho đơn #${order.id.slice(0, 8)}. Admin sẽ xem xét.`,
            orderData: {
              orderId: order.id,
              condition: condition,
              notes: notes || '',
              photos: photos || [],
              disputeId: disputeId
            }
          });

          // Notify buyer
          await NotificationService.createNotification({
            userId: order.buyer_id,
            type: 'dispute_created',
            title: 'Đã tạo tranh chấp',
            message: `Tranh chấp #${disputeId.slice(0, 15)} đã được tạo cho đơn #${order.id.slice(0, 8)}. Admin sẽ liên hệ trong vòng 24h.`,
            orderData: {
              orderId: order.id,
              condition: condition,
              disputeId: disputeId
            }
          });

          // Get all admin users
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

          // Send notification to all admins
          for (const admin of adminUsers) {
            await NotificationService.createNotification({
              userId: admin.id,
              type: 'new_dispute',
              title: '🚨 Tranh chấp mới cần xử lý',
              message: `Tranh chấp #${disputeId.slice(0, 15)} cho đơn #${order.id.slice(0, 8)} - MAJOR_DAMAGE báo cáo bởi buyer`,
              orderData: {
                orderId: order.id,
                disputeId: disputeId,
                condition: condition,
                amount: order.total.toString()
              }
            });
          }

        } catch (notifError) {
          console.error('Failed to create dispute or send notification:', notifError);
        }
      }

      return reply.send({
        success: true,
        message: finalStatus === 'COMPLETED' 
          ? 'Receipt confirmed successfully. Order completed!' 
          : 'Issue reported. Dispute created for admin review.',
        data: {
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            receiptConfirmedAt: updatedOrder.receipt_confirmed_at,
            condition: condition
          }
        }
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Error confirming receipt');
      console.error('Full error confirming receipt:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to confirm receipt',
        error: error?.message || 'Unknown error'
      });
    }
  });

  // POST /orders/:id/raise-dispute - Buyer raise dispute
  fastify.post<{
    Params: { id: string },
    Body: {
      reason: string,
      description: string,
      evidence?: Array<{ type: string, url: string, description: string }>,
      requestedResolution?: string,
      requestedAmount?: number,
      additionalNotes?: string
    }
  }>('/:id/raise-dispute', {
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
    const {
      reason,
      description,
      evidence,
      requestedResolution,
      requestedAmount,
      additionalNotes
    } = request.body;

    try {
      // Get order and verify buyer permission
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          payments: true
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the buyer can raise a dispute'
        });
      }

      if (order.status !== 'delivered' && order.status !== 'completed') {
        return reply.status(400).send({
          success: false,
          message: 'Can only raise dispute after delivery'
        });
      }

      // Check if dispute already exists
      const existingDispute = await prisma.disputes.findFirst({
        where: { orderId: id }
      });

      if (existingDispute) {
        return reply.status(400).send({
          success: false,
          message: 'A dispute has already been raised for this order'
        });
      }

      // Create dispute record
      const dispute = await prisma.disputes.create({
        data: {
          id: randomUUID(),
          orderId: id,
          raisedBy: userId,
          reason,
          description,
          evidenceJson: evidence ? JSON.stringify(evidence) : null,
          requestedResolution: requestedResolution || null,
          requestedAmount: requestedAmount || null,
          status: 'OPEN',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Hold escrow payment
      if (order.payments && order.payments.length > 0) {
        await prisma.payments.update({
          where: { id: order.payments[0].id },
          data: {
            status: 'on_hold',
            updatedAt: new Date()
          }
        });
      }

      // Update order status
      await prisma.orders.update({
        where: { id },
        data: {
          status: 'disputed',
          updated_at: new Date()
        }
      });

      // Notify admin
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        // Get admin users
        const admins = await prisma.users.findMany({
          where: { role: 'ADMIN' }
        });

        for (const admin of admins) {
          await NotificationService.createNotification({
            userId: admin.id,
            type: 'dispute_raised',
            title: '⚠️ URGENT: Dispute cần xử lý',
            message: `Buyer đã raise dispute cho order #${order.id.slice(-8).toUpperCase()}. Lý do: ${reason}`,
            orderData: {
              disputeId: dispute.id,
              orderId: order.id,
              reason,
              requestedAmount: requestedAmount || null
            }
          });
        }

        // Notify seller
        await NotificationService.createNotification({
          userId: order.seller_id,
          type: 'dispute_notification',
          title: '⚠️ Buyer đã raise dispute',
          message: `Buyer báo cáo vấn đề với đơn hàng. Lý do: ${reason}`,
          orderData: {
            disputeId: dispute.id,
            orderId: order.id,
            reason
          }
        });
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Dispute raised successfully',
        data: {
          dispute: {
            id: dispute.id,
            orderId: dispute.orderId,
            reason: dispute.reason,
            status: dispute.status,
            createdAt: dispute.createdAt
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Error raising dispute:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to raise dispute',
        error: error.message
      });
    }
  });

  // PUT /orders/:id/status - Update order status (API-F03)
  fastify.put<{ 
    Params: { id: string },
    Body: { status: string }
  }>('/:id/status', {
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
    const { status } = request.body;

    try {
      // Get order and verify permission
      const order = await prisma.orders.findUnique({
        where: { id }
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

      // Validate status value against OrderStatus enum
      const validStatuses = [
        'CREATED', 'PENDING_PAYMENT', 'AWAITING_FUNDS', 'ESCROW_FUNDED',
        'PREPARING_DELIVERY', 'READY_FOR_PICKUP', 'DOCUMENTS_READY',
        'TRANSPORTATION_BOOKED', 'IN_TRANSIT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERING', 'DELIVERED', 'COMPLETED',
        'PAYMENT_RELEASED', 'CANCELLED', 'REFUNDED', 'DISPUTED'
      ];

      // Normalize status to uppercase
      const normalizedStatus = status.toUpperCase();

      if (!validStatuses.includes(normalizedStatus)) {
        return reply.status(400).send({
          success: false,
          message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
        });
      }

      // Update order status
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: { 
          status: normalizedStatus,
          updated_at: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order: updatedOrder
        }
      });
    } catch (error: any) {
      fastify.log.error('Error updating order status:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update order status',
        error: error.message
      });
    }
  });

  // POST /orders/:id/process-documents - Process EDO/D/O documents (WF-011)
  fastify.post<{ 
    Params: { id: string }
  }>('/:id/process-documents', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      // Get order and verify it's ready for document processing
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyerIdTousers: {
            select: { id: true, email: true, displayName: true }
          },
          users_orders_sellerIdTousers: {
            select: { id: true, email: true, displayName: true }
          },
          listings: {
            select: { id: true, title: true, containerNumber: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'preparing_delivery') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be in preparing_delivery status to process documents'
        });
      }

      // Generate EDO/D/O document
      const edoNumber = `EDO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const pickupCode = Math.random().toString(36).substr(2, 8).toUpperCase();

      // Create document record
      const document = await prisma.documents.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          type: 'EDO',
          documentNumber: edoNumber,
          status: 'issued',
          issuedAt: new Date(),
          pickupCode: pickupCode,
          metadata: {
            containerNumber: order.listings?.containerNumber,
            depotLocation: 'To be specified by seller',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        }
      });

      // Update order status
      await prisma.orders.update({
        where: { id },
        data: {
          status: 'documents_ready',
          updatedAt: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Documents processed successfully',
        data: {
          orderId: order.id,
          edoNumber,
          pickupCode,
          documentId: document.id,
          status: 'documents_ready',
          validUntil: document.metadata.validUntil
        }
      });

    } catch (error) {
      console.error('Process documents error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // POST /orders/:id/book-transportation - Buyer books transportation (WF-012)
  fastify.post<{ 
    Params: { id: string },
    Body: {
      deliveryMethod: 'self_pickup' | 'logistics' | 'seller_delivers',
      logisticsCompany?: string,
      deliveryAddress: string,
      deliveryContact: string,
      deliveryPhone: string,
      deliveryDate: string,
      deliveryTime: string,
      needsCrane: boolean,
      specialInstructions?: string,
      transportationFee: number
    }
  }>('/:id/book-transportation', {
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
    const { 
      deliveryMethod,
      logisticsCompany,
      deliveryAddress, 
      deliveryContact, 
      deliveryPhone, 
      deliveryDate, 
      deliveryTime,
      needsCrane,
      specialInstructions,
      transportationFee
    } = request.body;

    try {
      // Get order and verify buyer permission
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the buyer can book transportation for this order'
        });
      }

      // Check if order is ready for pickup (buyer can book transportation)
      if (order.status !== 'READY_FOR_PICKUP' && order.status !== 'ready_for_pickup' && order.status !== 'documents_ready') {
        return reply.status(400).send({
          success: false,
          message: `Order must be ready for pickup before booking transportation. Current status: ${order.status}`
        });
      }

      // Create delivery record with new fields
      const deliveryData: any = {
        id: randomUUID(),
        order_id: order.id,
        dropoff_address: deliveryAddress,
        delivery_address: deliveryAddress,
        delivery_contact: deliveryContact,
        delivery_phone: deliveryPhone,
        delivery_date: new Date(deliveryDate),
        delivery_time: deliveryTime,
        needs_crane: needsCrane,
        special_instructions: specialInstructions || null,
        transportation_fee: transportationFee,
        status: 'SCHEDULED',
        booked_at: new Date(),
        updated_at: new Date()
      };

      // Add delivery_method and logistics_company if columns exist
      if (deliveryMethod) {
        try {
          deliveryData.delivery_method = deliveryMethod;
          if (deliveryMethod === 'logistics' && logisticsCompany) {
            deliveryData.logistics_company = logisticsCompany;
          }
        } catch (err) {
          // Columns may not exist yet, skip
          console.log('Note: delivery_method/logistics_company columns not available yet');
        }
      }

      const delivery = await prisma.deliveries.create({
        data: deliveryData
      });

      // Update order status to TRANSPORTATION_BOOKED
      await prisma.orders.update({
        where: { id },
        data: {
          status: 'TRANSPORTATION_BOOKED',
          updated_at: new Date()
        }
      });

      // Create notification for seller
      await prisma.notifications.create({
        data: {
          id: randomUUID(),
          user_id: order.seller_id,
          type: 'transportation_booked',
          title: 'Vận chuyển đã được đặt',
          message: `Buyer đã đặt vận chuyển cho đơn hàng #${order.order_number}. Ngày giao: ${new Date(deliveryDate).toLocaleDateString('vi-VN')}`,
          data: {
            order_id: order.id,
            delivery_date: deliveryDate,
            delivery_method: deliveryMethod
          },
          read: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Đã đặt vận chuyển thành công',
        data: {
          orderId: order.id,
          deliveryId: delivery.id,
          status: 'TRANSPORTATION_BOOKED',
          deliveryDate,
          deliveryTime,
          transportationFee
        }
      });

    } catch (error) {
      console.error('Book transportation error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // POST /orders/:id/update-delivery-status - Update delivery status (WF-013) - Bước 6.2
  fastify.post<{ 
    Params: { id: string },
    Body: {
      location?: string,
      notes?: string,
      eta?: string,
      checkpoint?: string,
      photos?: string[]
    }
  }>('/:id/update-delivery-status', {
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
    const { location, notes, eta, checkpoint, photos } = request.body;

    try {
      // Get order and verify user is seller
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          deliveries: true,
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          users_orders_seller_idTousers: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Only seller can update delivery status
      if (order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only seller can update delivery status'
        });
      }

      // Order must be IN_TRANSIT
      if (order.status !== 'IN_TRANSIT') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be IN_TRANSIT to update delivery status'
        });
      }

      // Find delivery record
      const delivery = order.deliveries[0];
      if (!delivery) {
        return reply.status(404).send({
          success: false,
          message: 'Delivery record not found'
        });
      }

      // Update delivery record
      const updateData: any = {
        updated_at: new Date()
      };

      if (location) {
        updateData.current_location = location;
      }

      if (notes) {
        updateData.driver_notes = notes;
      }

      if (eta) {
        updateData.estimated_delivery = new Date(eta);
      }

      // Store checkpoint and photos in route_json
      const routeData = delivery.route_json ? JSON.parse(delivery.route_json as string) : { checkpoints: [], photos: [] };
      
      if (checkpoint) {
        if (!routeData.checkpoints) routeData.checkpoints = [];
        routeData.checkpoints.push({
          location: checkpoint,
          timestamp: new Date().toISOString(),
          notes: notes
        });
      }

      if (photos && photos.length > 0) {
        if (!routeData.photos) routeData.photos = [];
        routeData.photos.push(...photos.map(photo => ({
          url: photo,
          timestamp: new Date().toISOString()
        })));
      }

      updateData.route_json = JSON.stringify(routeData);

      const updatedDelivery = await prisma.deliveries.update({
        where: { id: delivery.id },
        data: updateData
      });

      // Send notification to buyer
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        let message = `Cập nhật vận chuyển đơn hàng ${order.order_number || order.id.slice(0, 8)}`;
        if (location) {
          message += `\n📍 Vị trí hiện tại: ${location}`;
        }
        if (checkpoint) {
          message += `\n✓ Đã qua: ${checkpoint}`;
        }
        if (eta) {
          message += `\n⏰ Dự kiến giao: ${new Date(eta).toLocaleString('vi-VN')}`;
        }

        await NotificationService.createNotification({
          userId: order.buyer_id,
          type: 'delivery_update',
          title: 'Cập nhật trạng thái vận chuyển',
          message: message,
          orderData: {
            orderId: order.id,
            location: location,
            eta: eta,
            checkpoint: checkpoint
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Delivery status updated successfully',
        data: {
          orderId: order.id,
          delivery: {
            id: updatedDelivery.id,
            currentLocation: updatedDelivery.current_location,
            estimatedDelivery: updatedDelivery.estimated_delivery,
            notes: updatedDelivery.driver_notes,
            checkpoints: routeData.checkpoints || [],
            updatedAt: updatedDelivery.updated_at
          }
        }
      });

    } catch (error) {
      console.error('Update delivery status error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update delivery status'
      });
    }
  });

  // POST /orders/:id/release-escrow - Release escrow payment (WF-014)
  fastify.post<{ 
    Params: { id: string }
  }>('/:id/release-escrow', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      // Get order
      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          payments: true
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'delivered') {
        return reply.status(400).send({
          success: false,
          message: 'Order must be delivered before releasing escrow'
        });
      }

      // Update payment status to released
      await prisma.payments.updateMany({
        where: { orderId: id },
        data: {
          status: 'released',
          releasedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update order status
      await prisma.orders.update({
        where: { id },
        data: {
          status: 'payment_released',
          updatedAt: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Escrow payment released successfully',
        data: {
          orderId: order.id,
          status: 'payment_released',
          releasedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Release escrow error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}


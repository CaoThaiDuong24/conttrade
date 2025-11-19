// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';

// Ensure randomUUID is properly imported for use in transactions
const generateId = () => randomUUID();

interface OrderQueryParams {
  status?: string;
  role?: 'buyer' | 'seller';
}

interface CreateOrderBody {
  quote_id: string;
}

interface CreateOrderFromListingBody {
  listingId: string;
  quantity?: number; // 🆕 Số lượng muốn mua (mặc định = 1)
  agreedPrice: number;
  currency: string;
  deliveryAddress: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
  };
  notes?: string;
  selected_container_ids?: string[]; // 🆕 Danh sách container IDs được chọn
  deal_type?: 'SALE' | 'RENTAL'; // ✅ FIX #9: Add deal_type
  rental_duration_months?: number; // ✅ FIX #9: Add rental_duration_months
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
              deal_type: true,
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
          },
          // Include containers that are sold or rented to this order
          listing_containers_sold: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
              sold_at: true,
              notes: true,
              // ✅ Include delivery_containers để biết container nào đã được lên lịch
              delivery_containers: {
                select: {
                  id: true,
                  delivery_id: true,
                  container_id: true,
                  loaded_at: true,
                  delivered_at: true
                }
              }
            }
          },
          listing_containers_rented: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
              rented_at: true,
              rental_return_date: true,
              notes: true,
              // ✅ Include delivery_containers để biết container nào đã được lên lịch
              delivery_containers: {
                select: {
                  id: true,
                  delivery_id: true,
                  container_id: true,
                  loaded_at: true,
                  delivered_at: true
                }
              }
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

      // 🆕 Format response with containers info for easier frontend consumption
      const containers = [
        ...(order.listing_containers_sold || []),
        ...(order.listing_containers_rented || [])
      ];

      // 🔍 DEBUG LOGGING
      console.log('📦 [ORDER API] Order ID:', id);
      console.log('📦 [ORDER API] listing_containers_sold count:', order.listing_containers_sold?.length || 0);
      console.log('📦 [ORDER API] listing_containers_rented count:', order.listing_containers_rented?.length || 0);
      console.log('📦 [ORDER API] Total containers:', containers.length);
      if (containers.length > 0) {
        console.log('📦 [ORDER API] Container ISO codes:', containers.map(c => c.container_iso_code));
      }

      const formattedOrder = {
        ...order,
        // Add a top-level containers array for easy access
        containers: containers.map(c => ({
          id: c.id,
          isoCode: c.container_iso_code,
          shippingLine: c.shipping_line,
          manufacturedYear: c.manufactured_year,
          status: c.status,
          soldAt: (c as any).sold_at || null,
          rentedAt: (c as any).rented_at || null,
          rentalReturnDate: (c as any).rental_return_date || null,
          notes: c.notes
        })),
        containerCount: containers.length
      };

      return reply.send({
        success: true,
        data: formattedOrder
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
          rfqs: {
            include: {
              listings: {
                select: {
                  deal_type: true
                }
              }
            }
          },
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

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // 🆕 Get selected containers from RFQ
      const selectedContainerIds = quote.rfqs.selected_container_ids || [];
      console.log(`📦 Creating order from quote with ${selectedContainerIds.length} selected containers:`, selectedContainerIds);

      // 🆕 Use transaction to ensure atomicity
      const order = await prisma.$transaction(async (tx) => {
        // ✅ FIX: Get deal_type from listing, fallback to RFQ purpose
        fastify.log.info(`🔍 DEBUG - quote.rfqs:`, {
          listing_id: quote.rfqs.listing_id,
          purpose: quote.rfqs.purpose,
          rental_duration: quote.rfqs.rental_duration_months,
          has_listings: !!quote.rfqs.listings,
          listing_deal_type: quote.rfqs.listings?.deal_type
        });
        
        let dealType = quote.rfqs.listings?.deal_type;
        
        // If no listing deal_type, infer from RFQ purpose
        if (!dealType) {
          dealType = quote.rfqs.purpose === 'RENTAL' ? 'RENTAL' : 'SALE';
          fastify.log.warn(`⚠️  No listing deal_type, inferred from RFQ purpose: ${dealType}`);
        }
        
        const rentalDurationMonths = quote.rfqs.rental_duration_months || null;
        
        fastify.log.info(`📋 Creating order from quote - deal_type: ${dealType}, rental_duration: ${rentalDurationMonths} months`);
        
        // Create order
        const newOrder = await tx.orders.create({
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
            order_number: orderNumber,
            deal_type: dealType, // ✅ FIX: Save deal_type from listing
            rental_duration_months: dealType === 'RENTAL' ? rentalDurationMonths : null, // ✅ FIX: Save rental_duration_months from RFQ
            order_items: {
              create: quote.quote_items.map(item => ({
                item_type: item.item_type,
                ref_id: item.ref_id,
                description: item.description,
                qty: item.qty,
                unit_price: item.unit_price,
                total_price: item.total_price,
                deal_type: dealType, // ✅ FIX: Save deal_type
                rental_duration_months: dealType === 'RENTAL' ? rentalDurationMonths : null // ✅ FIX: Save rental_duration_months
              }))
            }
          },
          include: {
            order_items: true,
          }
        });

        // ============ ✅ FIX: USE INVENTORY SERVICE TO RESERVE ============
        // Trước đây chỉ update containers status, KHÔNG trừ available_quantity
        // Bây giờ dùng InventoryService để đảm bảo đồng bộ
        if (quote.rfqs.listing_id && selectedContainerIds.length > 0) {
          const { InventoryService } = await import('../lib/inventory/inventory-service');
          const inventoryService = new InventoryService(tx as any);
          
          // Calculate quantity from order items
          const totalQty = newOrder.order_items.reduce((sum, item) => sum + item.qty, 0);
          
          // ✅ FIX: Use dealType and rentalDurationMonths from the variables above, not from order_items
          // This ensures correct values are passed to InventoryService
          fastify.log.info(`📦 Reserving inventory - Deal Type: ${dealType}, Rental Duration: ${rentalDurationMonths} months`);
          
          await inventoryService.reserveInventory(
            newOrder.id,
            quote.rfqs.listing_id,
            totalQty,
            selectedContainerIds,
            dealType,  // ✅ Use dealType from quote.rfqs.listing
            rentalDurationMonths  // ✅ Use rentalDurationMonths from quote.rfqs
          );

          fastify.log.info(`✅ Order from quote created with inventory reserved: Order ${newOrder.id}, Listing ${quote.rfqs.listing_id}, Quantity: ${totalQty}, Containers: ${selectedContainerIds.length}, Deal Type: ${dealType}`);
        }

        return newOrder;
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
    const { 
      listingId, 
      quantity = 1, 
      agreedPrice, 
      currency, 
      deliveryAddress, 
      notes, 
      selected_container_ids,
      deal_type, // ✅ FIX #9: Extract deal_type
      rental_duration_months // ✅ FIX #9: Extract rental_duration_months
    } = request.body;

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
      
      // ============ 🆕 VALIDATE SELECTED CONTAINERS ============
      let effectiveQuantity = quantity;
      if (selected_container_ids && selected_container_ids.length > 0) {
        // Validate all selected containers exist and are AVAILABLE
        const containers = await prisma.listing_containers.findMany({
          where: {
            listing_id: listingId,
            container_iso_code: { in: selected_container_ids }
          }
        });
        
        if (containers.length !== selected_container_ids.length) {
          return reply.status(400).send({
            success: false,
            message: 'Some selected containers do not exist'
          });
        }
        
        const unavailableContainers = containers.filter(c => c.status !== 'AVAILABLE');
        if (unavailableContainers.length > 0) {
          return reply.status(400).send({
            success: false,
            message: `${unavailableContainers.length} container(s) not available: ${unavailableContainers.map(c => c.container_iso_code).join(', ')}`
          });
        }
        
        // Use selected containers count as effective quantity
        effectiveQuantity = selected_container_ids.length;
      }

      // ============ 🆕 VALIDATE QUANTITY ============
      // Kiểm tra quantity hợp lệ
      if (effectiveQuantity < 1) {
        return reply.status(400).send({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      // Kiểm tra số lượng có đủ không
      if (listing.available_quantity < effectiveQuantity) {
        return reply.status(400).send({
          success: false,
          message: `Not enough quantity available. Available: ${listing.available_quantity}, Requested: ${effectiveQuantity}`,
          data: {
            availableQuantity: listing.available_quantity,
            requestedQuantity: effectiveQuantity
          }
        });
      }

      // ✅ FIX #9: Determine deal_type and validate rental_duration_months
      const effectiveDealType = deal_type || listing.deal_type || 'SALE';
      let effectiveRentalMonths: number | null = null;
      
      if (effectiveDealType === 'RENTAL') {
        // ✅ FIX: Require rental_duration_months from user input (không fallback về min_rental_duration)
        if (!rental_duration_months || rental_duration_months <= 0) {
          return reply.status(400).send({
            success: false,
            message: `Rental duration is required for rental orders. Please specify rental duration in months.`,
            data: {
              minRentalDuration: listing.min_rental_duration,
              maxRentalDuration: listing.max_rental_duration
            }
          });
        }
        
        effectiveRentalMonths = rental_duration_months;
        
        if (listing.min_rental_duration && effectiveRentalMonths < listing.min_rental_duration) {
          return reply.status(400).send({
            success: false,
            message: `Rental duration must be at least ${listing.min_rental_duration} month(s)`,
            data: {
              minRentalDuration: listing.min_rental_duration,
              providedDuration: effectiveRentalMonths
            }
          });
        }
        
        if (listing.max_rental_duration && effectiveRentalMonths > listing.max_rental_duration) {
          return reply.status(400).send({
            success: false,
            message: `Rental duration cannot exceed ${listing.max_rental_duration} month(s)`,
            data: {
              maxRentalDuration: listing.max_rental_duration,
              providedDuration: effectiveRentalMonths
            }
          });
        }
        
        fastify.log.info(`✅ Rental order validated: duration = ${effectiveRentalMonths} month(s)`);
      }

      // Calculate totals (nhân với quantity)
      // ✅ FIX #9: For RENTAL, calculate based on months
      const months = effectiveDealType === 'RENTAL' && effectiveRentalMonths 
        ? effectiveRentalMonths 
        : 1;
      const rentalSubtotal = Number(agreedPrice) * effectiveQuantity * months;
      
      // ✅ FIX #2: Add deposit for RENTAL orders
      let depositAmount = 0;
      if (effectiveDealType === 'RENTAL' && listing.deposit_required) {
        depositAmount = Number(listing.deposit_amount || 0) * effectiveQuantity;
        fastify.log.info(`💰 Deposit required: ${depositAmount} ${currency || 'VND'} for ${effectiveQuantity} container(s)`);
      }
      
      const subtotalNum = rentalSubtotal + depositAmount; // Include deposit in subtotal
      const tax = subtotalNum * 0.1; // 10% VAT
      const platformFee = subtotalNum * 0.02; // 2% platform fee
      const total = subtotalNum + tax + platformFee;

      fastify.log.info(`💰 Order totals:`, {
        rentalSubtotal,
        depositAmount,
        subtotalWithDeposit: subtotalNum,
        tax,
        platformFee,
        total,
        currency: currency || 'VND'
      });

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // ============ 🆕 CREATE ORDER WITH TRANSACTION ============
      // Sử dụng transaction để đảm bảo tính nhất quán
      const order = await prisma.$transaction(async (tx) => {
        // 🆕 AUTO-SELECT CONTAINERS if not provided
        let finalContainerIds = selected_container_ids;
        
        if (!finalContainerIds || finalContainerIds.length === 0) {
          // Buyer didn't select specific containers, auto-select available ones
          const availableContainers = await tx.listing_containers.findMany({
            where: {
              listing_id: listingId,
              status: 'AVAILABLE'
            },
            select: {
              container_iso_code: true
            },
            take: effectiveQuantity
          });
          
          finalContainerIds = availableContainers.map(c => c.container_iso_code);
          
          fastify.log.info(`🔄 Auto-selected ${finalContainerIds.length} containers for order: ${finalContainerIds.join(', ')}`);
        }
        
        // Create order
        const newOrder = await tx.orders.create({
          data: {
            buyer_id: userId,
            seller_id: listing.seller.id,
            listing_id: listingId,
            status: 'pending_payment',
            subtotal: subtotalNum,
            tax,
            fees: platformFee,
            total,
            currency: currency || 'VND',
            order_number: orderNumber,
            notes: notes || null,
            deal_type: effectiveDealType, // ✅ FIX #9: Save deal_type
            rental_duration_months: effectiveRentalMonths, // ✅ FIX #9: Save rental_duration_months
            updated_at: new Date(),
            order_items: {
              create: {
                item_type: 'listing',
                ref_id: listingId,
                description: listing.title || 'Container listing',
                qty: effectiveQuantity, // 🆕 Sử dụng effectiveQuantity
                unit_price: Number(agreedPrice),
                total_price: Number(agreedPrice) * effectiveQuantity * months, // ✅ FIX #9: Multiply by months
                deal_type: effectiveDealType, // ✅ FIX #9: Save deal_type in order_items
                rental_duration_months: effectiveRentalMonths, // ✅ FIX #9: Save rental_duration_months in order_items
              }
            }
          },
          include: {
            listings: {
              include: {
                containers: true,
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
          }
        });

        // ============ 🆕 USE INVENTORY SERVICE TO RESERVE ============
        const { InventoryService } = await import('../lib/inventory/inventory-service');
        const inventoryService = new InventoryService(tx as any);
        
        await inventoryService.reserveInventory(
          newOrder.id,
          listingId,
          effectiveQuantity,
          finalContainerIds, // 🆕 Use auto-selected or provided container IDs
          effectiveDealType,  // ✅ Pass deal_type to determine SOLD vs RESERVED status
          effectiveRentalMonths  // ✅ Pass rental duration
        );

        fastify.log.info(`✅ Order created with inventory reserved: Order ${newOrder.id}, Listing ${listingId}, Quantity: ${effectiveQuantity}, Containers: ${finalContainerIds?.length || 0}`);

        return newOrder;
      });

      // Send notification to seller about new order
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: listing.seller.id,
          type: 'order_created',
          title: 'Đơn hàng mới',
          message: `Bạn có đơn hàng mới từ "${listing.title}" với số lượng ${effectiveQuantity} container. Tổng giá trị: ${total.toLocaleString()} ${currency || 'VND'}`,
          data: {
            orderId: order.id,
            listingId: listingId,
            quantity: effectiveQuantity,
            amount: total,
            currency: currency || 'VND',
            buyerName: order.users_orders_buyer_idTousers?.display_name || 'Buyer',
            selectedContainers: selected_container_ids || []
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

  // ✅ FIX #13: POST /orders/:id/retry-payment - Retry failed payment
  fastify.post<{ 
    Params: { id: string },
    Body: { method: string } 
  }>('/:id/retry-payment', {
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
    const { method } = request.body;

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

      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (order.status !== 'PAYMENT_FAILED' && order.status !== 'PENDING_PAYMENT') {
        return reply.status(400).send({
          success: false,
          message: `Cannot retry payment for order with status: ${order.status}`
        });
      }

      const { paymentService } = await import('../lib/payments/payment-service-simple');
      const result = await paymentService.retryPayment(id, method);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: result.message
        });
      }

      return reply.send({
        success: true,
        message: 'Payment retry initiated successfully',
        data: {
          paymentId: result.paymentId,
          status: result.status
        }
      });
    } catch (error: any) {
      fastify.log.error('Error retrying payment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to retry payment',
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
          },
          order_items: true,
          listings: {
            select: {
              id: true,
              title: true,
              available_quantity: true
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
        // ============ 🆕 SELLER REJECTED PAYMENT - RESTORE INVENTORY ============
        await prisma.$transaction(async (tx) => {
          // Update payment status to FAILED
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              notes: notes || 'Payment verification rejected by seller',
              updated_at: new Date()
            }
          });

          // Update order back to PENDING_PAYMENT
          await tx.orders.update({
            where: { id },
            data: {
              status: 'PENDING_PAYMENT',
              updated_at: new Date()
            }
          });

          // 🆕 RESTORE INVENTORY - Give buyer chance to repay or cancel
          // When payment is rejected, we should NOT keep inventory reserved
          if (order.listing_id && order.order_items && order.order_items.length > 0) {
            const orderQty = Number(order.order_items[0]?.qty || 0);
            
            if (orderQty > 0) {
              // Import and use InventoryService
              const { InventoryService } = await import('../lib/inventory/inventory-service');
              const inventoryService = new InventoryService(tx as any);
              
              await inventoryService.releaseInventory(
                order.id,
                order.listing_id,
                orderQty
              );

              fastify.log.info(`✅ Released ${orderQty} containers back to listing ${order.listing_id} due to payment rejection for order ${order.id}`);
            }
          }
        });

        // Notify buyer about payment rejection
        try {
          const { NotificationService } = await import('../lib/notifications/notification-service');
          await NotificationService.createNotification({
            userId: order.buyer_id,
            type: 'payment_rejected',
            title: 'Thanh toán bị từ chối',
            message: `Seller đã từ chối xác nhận thanh toán cho đơn hàng #${order.id.slice(-8).toUpperCase()}. ${notes ? `Lý do: ${notes}` : 'Vui lòng kiểm tra lại thông tin thanh toán.'} Bạn cần thanh toán lại để giữ đơn hàng này.`,
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
          message: 'Payment verification rejected and inventory restored. Buyer needs to make payment again or order will be auto-cancelled.',
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
          },
          listings: {
            select: {
              id: true,
              deal_type: true,
            }
          }
        }
      });

      // 🆕 AUTO-CREATE RENTAL CONTRACT if order is for rental
      if (updatedOrder.listings?.deal_type === 'RENTAL') {
        try {
          const { RentalContractService } = await import('../services/rental-contract-service');
          const contractResult = await RentalContractService.createContractFromOrder(updatedOrder.id);
          
          if (contractResult.success) {
            fastify.log.info(`✅ Rental contract created: ${contractResult.contractId} for order ${updatedOrder.id}`);
          } else {
            fastify.log.warn(`⚠️  Failed to auto-create rental contract: ${contractResult.message}`);
          }
        } catch (contractError: any) {
          fastify.log.error('Error auto-creating rental contract:', contractError);
          // Don't fail payment verification if contract creation fails
        }
      }

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
          order_items: true,
          listing: {
            select: {
              id: true,
              title: true,
              available_quantity: true,
              total_quantity: true
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

      // ============ 🆕 USE TRANSACTION FOR CANCELLATION ============
      const result = await prisma.$transaction(async (tx) => {
        // 1. Refund payment if needed
        let paymentResult = null;
        if (order.payments && order.payments.length > 0) {
          const latestPayment = order.payments[0];
          if (latestPayment.status === 'escrow_funded' || latestPayment.status === 'COMPLETED') {
            const { paymentService } = await import('../lib/payments/payment-service-simple');
            paymentResult = await paymentService.refundEscrowPayment(id, reason);
            
            if (!paymentResult.success) {
              throw new Error(paymentResult.message);
            }
          }
        }

        // 2. Update order to cancelled
        const updatedOrder = await tx.orders.update({
          where: { id },
          data: { 
            status: 'cancelled',
            updated_at: new Date()
          }
        });

        // 3. 🆕 RESTORE INVENTORY - Release containers back to listing
        if (order.listing_id && order.order_items && order.order_items.length > 0) {
          const orderQty = Number(order.order_items[0]?.qty || 0);
          
          if (orderQty > 0) {
            // Import and use InventoryService
            const { InventoryService } = await import('../lib/inventory/inventory-service');
            const inventoryService = new InventoryService(tx as any);
            
            await inventoryService.releaseInventory(
              order.id,
              order.listing_id,
              orderQty
            );

            fastify.log.info(`✅ Released ${orderQty} containers back to listing ${order.listing_id} for cancelled order ${order.id}`);
          }
        }

        return { 
          order: updatedOrder, 
          payment: paymentResult ? { 
            id: paymentResult.paymentId, 
            status: paymentResult.status 
          } : null 
        };
      });

      // Send notification about cancellation
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        const notifyUserId = isBuyer ? order.seller_id : order.buyer_id;
        const role = isBuyer ? 'Buyer' : 'Seller';
        
        await NotificationService.createNotification({
          userId: notifyUserId,
          type: 'order_cancelled',
          title: 'Đơn hàng đã bị hủy',
          message: `${role} đã hủy đơn hàng #${order.id.slice(-8).toUpperCase()}. ${reason ? `Lý do: ${reason}` : ''}`,
          data: {
            orderId: order.id,
            cancelledBy: userId,
            reason: reason || 'No reason provided'
          }
        });
      } catch (notifError) {
        fastify.log.error('Failed to send cancellation notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Order cancelled successfully and inventory restored',
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
          buyer_id: true,
          seller_id: true,
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

      // Update delivery record(s) if exists - handle multiple batches
      const deliveries = await prisma.deliveries.findMany({
        where: { order_id: id }
      });

      if (deliveries.length > 0) {
        // Update all delivery records
        await prisma.deliveries.updateMany({
          where: { order_id: id },
          data: {
            receipt_confirmed_at: new Date(),
            receipt_data_json: receiptData as any,
            updated_at: new Date()
          }
        });

        // ✅ IMPORTANT: Update ALL delivery_containers across all batches with received_by info
        // So that individual container buttons will be hidden after order-level confirmation
        const deliveryIds = deliveries.map(d => d.id);
        await prisma.delivery_containers.updateMany({
          where: { 
            delivery_id: { in: deliveryIds }
          },
          data: {
            received_by: receivedBy,
            signature_url: signature || null,
            condition_notes: JSON.stringify({
              condition,
              notes: notes || '',
              photos: photos || []
            }),
            updated_at: new Date()
          }
        });
      }

      // If condition is GOOD or MINOR_DAMAGE, complete the order
      if (condition === 'GOOD' || condition === 'MINOR_DAMAGE') {
        // ✅ UPDATE CONTAINERS TO RENTED STATUS if this is a rental order
        if (order.deal_type === 'RENTAL') {
          // Find all containers for this rental order
          const rentalContainers = await prisma.listing_containers.findMany({
            where: {
              rented_to_order_id: id,
              status: 'RESERVED' // Containers should be RESERVED after order creation
            }
          });

          if (rentalContainers.length > 0) {
            // Update containers to RENTED status with rented_at timestamp
            await prisma.listing_containers.updateMany({
              where: {
                rented_to_order_id: id,
                status: 'RESERVED'
              },
              data: {
                status: 'RENTED',
                rented_at: new Date(),
                updated_at: new Date()
              }
            });

            console.log(`✅ Updated ${rentalContainers.length} containers to RENTED status for order ${id}`);
            console.log(`   Container codes: ${rentalContainers.map(c => c.container_iso_code).join(', ')}`);
          } else {
            console.warn(`⚠️  No RESERVED containers found for rental order ${id}`);
          }
        }
        
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
          users_orders_buyer_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          users_orders_seller_idTousers: {
            select: { id: true, email: true, display_name: true }
          },
          listings: {
            select: { id: true, title: true }
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

  // 🆕 POST /orders/:id/schedule-delivery-batch - Schedule delivery for selected containers
  fastify.post<{
    Params: { id: string },
    Body: {
      containerIds: string[],
      deliveryAddress: string,
      deliveryContact: string,
      deliveryPhone: string,
      deliveryDate: string,
      deliveryTime?: string,
      needsCrane?: boolean,
      specialInstructions?: string,
      transportationFee?: number,
      deliveryMethod?: 'self_pickup' | 'logistics' | 'seller_delivers',
      logisticsCompany?: string,
      carrierInfo?: {
        name: string,
        phone: string,
        vehiclePlate?: string,
        driverName?: string
      }
    }
  }>('/:id/schedule-delivery-batch', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id: orderId } = request.params;
    const {
      containerIds,
      deliveryAddress,
      deliveryContact,
      deliveryPhone,
      deliveryDate,
      deliveryTime = '09:00',
      needsCrane = false,
      specialInstructions,
      transportationFee = 0,
      deliveryMethod = 'logistics',
      logisticsCompany,
      carrierInfo
    } = request.body;

    try {
      // ============ VALIDATION ============
      
      // 1. Validate order exists and user has permission
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          deliveries: {
            include: {
              delivery_containers: true
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

      // Only buyer can schedule delivery (or admin)
      if (order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only buyer can schedule delivery for this order'
        });
      }

      // Order must be ready for pickup
      if (!['READY_FOR_PICKUP', 'TRANSPORTATION_BOOKED'].includes(order.status)) {
        return reply.status(400).send({
          success: false,
          message: `Order must be ready for pickup. Current status: ${order.status}`
        });
      }

      // 🆕 Get containers for this order directly from listing_containers
      const orderContainers = await prisma.listing_containers.findMany({
        where: {
          OR: [
            { sold_to_order_id: orderId },
            { rented_to_order_id: orderId }
          ]
        }
      });

      console.log('📦 Order containers found:', orderContainers.length);
      console.log('📦 Container IDs:', orderContainers.map(c => c.id));

      // 2. Validate containers
      if (!containerIds || containerIds.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'At least one container must be selected for delivery'
        });
      }

      // ✅ Validate deliveryDate format
      if (!deliveryDate || isNaN(Date.parse(deliveryDate))) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid delivery date format. Please provide a valid date.'
        });
      }

      // ✅ Validate required fields
      if (!deliveryAddress || !deliveryContact || !deliveryPhone) {
        return reply.status(400).send({
          success: false,
          message: 'Delivery address, contact name, and phone number are required.'
        });
      }

      // Check if order has any containers
      if (orderContainers.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'This order has no containers assigned. Please check order status.'
        });
      }

      // Get containers for this order
      const validContainerIds = orderContainers.map(c => c.id);

      // Check all requested containers belong to this order
      const invalidContainers = containerIds.filter(id => !validContainerIds.includes(id));
      if (invalidContainers.length > 0) {
        return reply.status(400).send({
          success: false,
          message: 'Some containers do not belong to this order',
          data: { invalidContainerIds: invalidContainers }
        });
      }

      // 3. Check if containers already scheduled/delivered
      const alreadyScheduledContainers = await prisma.delivery_containers.findMany({
        where: {
          container_id: { in: containerIds }
        },
        include: {
          delivery: {
            select: {
              id: true,
              status: true,
              delivery_date: true,
              batch_number: true
            }
          }
        }
      });

      // Filter out CANCELLED deliveries - those containers can be rescheduled
      const activeDeliveries = alreadyScheduledContainers.filter(dc => 
        dc.delivery && dc.delivery.status !== 'CANCELLED'
      );

      if (activeDeliveries.length > 0) {
        const containerCodes = activeDeliveries.map(dc => {
          const container = orderContainers.find(c => c.id === dc.container_id);
          return container?.container_iso_code || dc.container_id;
        });

        return reply.status(400).send({
          success: false,
          message: `Các container sau đã được lên lịch giao hàng: ${containerCodes.join(', ')}. Vui lòng chọn các container khác.`,
          data: {
            alreadyScheduledIds: activeDeliveries.map(dc => dc.container_id),
            containerCodes: containerCodes,
            deliveryStatuses: activeDeliveries.map(dc => ({
              containerId: dc.container_id,
              containerCode: orderContainers.find(c => c.id === dc.container_id)?.container_iso_code,
              batchNumber: dc.delivery.batch_number,
              status: dc.delivery.status,
              deliveryDate: dc.delivery.delivery_date
            }))
          }
        });
      }

      // ============ CALCULATE BATCH INFO ============
      
      const totalContainers = orderContainers.length;
      const existingDeliveries = order.deliveries.filter(d => d.status !== 'CANCELLED');
      const batchNumber = existingDeliveries.length + 1;
      
      // Calculate how many containers already scheduled (exclude CANCELLED)
      const alreadyScheduledCount = activeDeliveries.length;
      const thisDeliveryCount = containerIds.length;
      
      // Estimate total batches needed
      const estimatedTotalBatches = Math.ceil(totalContainers / thisDeliveryCount);

      // ============ CREATE DELIVERY IN TRANSACTION ============
      
      console.log('🚚 Creating delivery batch:', {
        batchNumber,
        estimatedTotalBatches,
        containerIds,
        deliveryDate,
        deliveryAddress
      });

      let result;
      try {
        result = await prisma.$transaction(async (tx) => {
        // 1. Create delivery record
        console.log('📝 Creating delivery record...');
        const delivery = await tx.deliveries.create({
          data: {
            id: generateId(),
            order_id: orderId,
            dropoff_address: deliveryAddress,
            delivery_address: deliveryAddress,
            delivery_contact: deliveryContact,
            delivery_phone: deliveryPhone,
            delivery_date: new Date(deliveryDate),
            delivery_time: deliveryTime,
            needs_crane: needsCrane,
            special_instructions: specialInstructions || null,
            transportation_fee: transportationFee,
            delivery_method: deliveryMethod,
            logistics_company: logisticsCompany || null,
            carrier_name: carrierInfo?.name || null,
            driver_info_json: carrierInfo || null,
            status: 'SCHEDULED',
            booked_at: new Date(),
            
            // 🆕 Batch tracking
            batch_number: batchNumber,
            total_batches: estimatedTotalBatches,
            containers_count: thisDeliveryCount,
            is_partial_delivery: totalContainers > thisDeliveryCount,
            
            updated_at: new Date()
          }
        });

        console.log('✅ Delivery created:', delivery.id);

        // 2. Link containers to this delivery
        const deliveryContainersData = containerIds.map(containerId => {
          const container = orderContainers.find(c => c.id === containerId);
          if (!container) {
            throw new Error(`Container ${containerId} not found in order containers`);
          }
          return {
            id: generateId(),
            delivery_id: delivery.id,
            container_id: containerId,
            container_iso_code: container.container_iso_code || '',
            pickup_date: new Date(deliveryDate)
            // Note: Transportation details are stored in deliveries table, not here
            // created_at and updated_at are auto-managed by Prisma (@default and @updatedAt)
          };
        });

        console.log('📦 Creating delivery_containers:', deliveryContainersData.length);

        await tx.delivery_containers.createMany({
          data: deliveryContainersData
        });

        console.log('✅ Delivery containers created');

        // 3. Update listing_containers status
        await tx.listing_containers.updateMany({
          where: {
            id: { in: containerIds }
          },
          data: {
            delivery_status: 'SCHEDULED',
            scheduled_delivery_date: new Date(deliveryDate),
            updated_at: new Date()
          }
        });

        console.log('✅ Listing containers updated');

        // 4. Update order status
        await tx.orders.update({
          where: { id: orderId },
          data: {
            status: 'TRANSPORTATION_BOOKED',
            updated_at: new Date()
          }
        });

        console.log('✅ Order status updated');

        // 5. Create delivery event
        await tx.delivery_events.create({
          data: {
            id: generateId(),
            delivery_id: delivery.id,
            event_type: 'SCHEDULED',
            payload: {
              batchNumber: batchNumber,
              totalBatches: estimatedTotalBatches,
              containersCount: thisDeliveryCount,
              containerIds: containerIds,
              deliveryDate: deliveryDate,
              deliveryAddress: deliveryAddress
            }
            // ❌ REMOVED: occurred_at and created_at - Prisma tự động set vì có @default(now())
          }
        });

        console.log('✅ Delivery event created');

        return { delivery, deliveryContainersData };
      });
      } catch (transactionError: any) {
        console.error('❌ Transaction failed:', transactionError);
        throw new Error(`Transaction error: ${transactionError.message}`);
      }

      console.log('✅ Transaction completed successfully');

      // ============ SEND NOTIFICATIONS ============
      
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        // Notify seller
        await NotificationService.createNotification({
          userId: order.seller_id,
          type: 'delivery_scheduled',
          title: `Vận chuyển Batch ${batchNumber} đã được đặt`,
          message: `Buyer đã đặt vận chuyển ${thisDeliveryCount} container (Batch ${batchNumber}/${estimatedTotalBatches}). Ngày giao: ${new Date(deliveryDate).toLocaleDateString('vi-VN')}`,
          data: {
            orderId: order.id,
            deliveryId: result.delivery.id,
            batchNumber,
            totalBatches: estimatedTotalBatches,
            containersCount: thisDeliveryCount,
            deliveryDate
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      // ============ RETURN RESPONSE ============
      
      return reply.send({
        success: true,
        message: `Đã đặt vận chuyển thành công cho Batch ${batchNumber}/${estimatedTotalBatches}`,
        data: {
          delivery: {
            id: result.delivery.id,
            orderId: order.id,
            status: 'SCHEDULED',
            batchNumber,
            totalBatches: estimatedTotalBatches,
            containersCount: thisDeliveryCount,
            deliveryDate: result.delivery.delivery_date,
            deliveryTime: result.delivery.delivery_time,
            transportationFee: result.delivery.transportation_fee,
            isPartialDelivery: result.delivery.is_partial_delivery
          },
          containers: result.deliveryContainersData.map(dc => ({
            containerId: dc.container_id,
            containerIsoCode: dc.container_iso_code,
            pickupDate: dc.pickup_date
          })),
          summary: {
            totalContainersInOrder: totalContainers,
            containersInThisBatch: thisDeliveryCount,
            alreadyScheduled: alreadyScheduledCount,
            remainingToSchedule: totalContainers - alreadyScheduledCount - thisDeliveryCount
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error scheduling delivery batch:', error);
      
      // Log detailed error for debugging
      console.error('❌ ERROR in schedule-delivery-batch:');
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      if (error.code) console.error('   Code:', error.code);
      if (error.meta) console.error('   Meta:', JSON.stringify(error.meta, null, 2));
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to schedule delivery batch',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          meta: error.meta
        } : undefined
      });
    }
  });

  // 🆕 GET /orders/:id/delivery-schedule - Get delivery schedule for order
  fastify.get<{
    Params: { id: string }
  }>('/:id/delivery-schedule', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id: orderId } = request.params;

    try {
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          listing_containers_sold: {
            where: {
              sold_to_order_id: orderId
            },
            include: {
              delivery_containers: {
                include: {
                  delivery: {
                    select: {
                      id: true,
                      status: true,
                      delivery_date: true,
                      delivery_time: true,
                      carrier_name: true,
                      tracking_number: true,
                      batch_number: true,
                      total_batches: true
                    }
                  }
                }
              }
            }
          },
          deliveries: {
            include: {
              delivery_containers: {
                include: {
                  listing_container: {
                    select: {
                      id: true,
                      container_iso_code: true,
                      shipping_line: true,
                      manufactured_year: true
                    }
                  }
                }
              }
            },
            orderBy: {
              batch_number: 'asc'
            }
          },
          order_preparations: {
            select: {
              id: true,
              status: true,
              preparation_started_at: true,
              preparation_completed_at: true,
              pickup_location_json: true,
              pickup_contact_name: true,
              pickup_contact_phone: true,
              pickup_instructions: true,
              pickup_available_from: true,
              pickup_available_to: true,
              updated_at: true
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

      // Check permission
      if (order.buyer_id !== userId && order.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      // ✅ FIX: Chỉ hiển thị delivery schedule khi order đã READY_FOR_PICKUP trở đi
      // Nếu order chưa ready, trả về empty schedule
      const orderStatusUpper = order.status?.toUpperCase();
      const validDeliveryStatuses = [
        'READY_FOR_PICKUP',
        'DOCUMENTS_READY', 
        'TRANSPORTATION_BOOKED',
        'IN_TRANSIT',
        'DELIVERING',
        'DELIVERED',
        'COMPLETED'
      ];

      const isOrderReadyForDelivery = validDeliveryStatuses.includes(orderStatusUpper);

      // Group containers by delivery status
      const allContainers = order.listing_containers_sold || [];
      
      const containersByStatus = {
        delivered: [] as any[],
        inTransit: [] as any[],
        scheduled: [] as any[],
        pendingSchedule: [] as any[]
      };

      // ✅ Chỉ group containers nếu order đã sẵn sàng cho delivery
      if (isOrderReadyForDelivery) {
        allContainers.forEach(container => {
          const deliveryInfo = container.delivery_containers[0];
          
          if (!deliveryInfo) {
            containersByStatus.pendingSchedule.push({
              id: container.id,
              isoCode: container.container_iso_code,
              shippingLine: container.shipping_line,
              manufacturedYear: container.manufactured_year,
              status: container.delivery_status || 'PENDING_PICKUP'
            });
          } else {
            const status = deliveryInfo.delivery.status;
            const containerData = {
              id: container.id,
              isoCode: container.container_iso_code,
              shippingLine: container.shipping_line,
              manufacturedYear: container.manufactured_year,
              deliveryId: deliveryInfo.delivery_id,
              deliveryStatus: status,
              deliveryDate: deliveryInfo.delivery.delivery_date,
              batchNumber: deliveryInfo.delivery.batch_number,
              trackingNumber: deliveryInfo.delivery.tracking_number,
              deliveredAt: deliveryInfo.delivered_at
            };

            if (status === 'DELIVERED') {
              containersByStatus.delivered.push(containerData);
            } else if (status === 'IN_TRANSIT' || status === 'PICKED_UP') {
              containersByStatus.inTransit.push(containerData);
            } else {
              containersByStatus.scheduled.push(containerData);
            }
          }
        });
      }
      // ✅ Nếu order chưa ready, tất cả containers đều là pendingSchedule nhưng không hiển thị
      // (Frontend sẽ hiển thị message thay vì danh sách)

      // ✅ Format deliveries - chỉ khi order đã ready
      const deliveryBatches = isOrderReadyForDelivery 
        ? order.deliveries.map(delivery => ({
            id: delivery.id,
            batchNumber: delivery.batch_number,
            totalBatches: delivery.total_batches,
            status: delivery.status,
            deliveryDate: delivery.delivery_date,
            deliveryTime: delivery.delivery_time,
            containersCount: delivery.containers_count,
            transportationFee: delivery.transportation_fee,
            carrierName: delivery.carrier_name,
            trackingNumber: delivery.tracking_number,
            deliveryAddress: delivery.delivery_address,
            deliveryContact: delivery.delivery_contact,
            deliveryPhone: delivery.delivery_phone,
            containers: delivery.delivery_containers.map(dc => ({
              id: dc.listing_container.id,
              isoCode: dc.listing_container.container_iso_code,
              shippingLine: dc.listing_container.shipping_line,
              manufacturedYear: dc.listing_container.manufactured_year,
              pickedUpAt: dc.loaded_at,
              deliveredAt: dc.delivered_at
            }))
          }))
        : [];

      // ✅ Format order preparation info (seller's ready info)
      const preparationInfo = order.order_preparations[0] || null;
      const sellerPreparationDetails = preparationInfo ? {
        status: preparationInfo.status,
        completedAt: preparationInfo.preparation_completed_at,
        pickupLocation: preparationInfo.pickup_location_json 
          ? (typeof preparationInfo.pickup_location_json === 'string' 
              ? JSON.parse(preparationInfo.pickup_location_json) 
              : preparationInfo.pickup_location_json)
          : null,
        pickupContact: {
          name: preparationInfo.pickup_contact_name,
          phone: preparationInfo.pickup_contact_phone
        },
        pickupInstructions: preparationInfo.pickup_instructions,
        pickupTimeWindow: {
          from: preparationInfo.pickup_available_from,
          to: preparationInfo.pickup_available_to
        }
      } : null;

      return reply.send({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          orderStatus: order.status,
          totalContainers: allContainers.length,
          isReadyForDelivery: isOrderReadyForDelivery, // ✅ Thêm flag để frontend biết
          sellerPreparation: sellerPreparationDetails, // ✅ Thêm thông tin chuẩn bị từ seller
          summary: {
            delivered: containersByStatus.delivered.length,
            inTransit: containersByStatus.inTransit.length,
            scheduled: containersByStatus.scheduled.length,
            pendingSchedule: containersByStatus.pendingSchedule.length
          },
          containers: containersByStatus,
          deliveryBatches
        }
      });

    } catch (error: any) {
      fastify.log.error('Error fetching delivery schedule:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch delivery schedule',
        error: error.message
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


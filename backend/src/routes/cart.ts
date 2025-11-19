// @ts-nocheck
/**
 * CART API - Shopping Cart
 * Chá»©c nÄƒng giá» hÃ ng cho B2B marketplace
 */
import type { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export async function cartRoutes(server: FastifyInstance) {
  // Middleware: Require authentication for all cart routes
  const authPreHandler = async (request, reply) => {
    console.log('ðŸ” Cart Auth Middleware - START');
    console.log('ðŸ” Authorization Header:', request.headers.authorization?.substring(0, 50) + '...');
    console.log('ðŸ” Has Cookie:', !!request.cookies?.accessToken);
    
    try {
      await request.jwtVerify();
      console.log('âœ… JWT Verified - User ID:', (request.user as any)?.userId);
    } catch (err: any) {
      console.error('âŒ JWT Verification failed:', err.message);
      return reply.status(401).send({ 
        success: false, 
        message: 'Unauthorized',
        error: err.message 
      });
    }
  };

  /**
   * GET /cart
   * Láº¥y giá» hÃ ng hiá»‡n táº¡i cá»§a user
   */
  server.get('/', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      console.log('ðŸ›’ GET /cart - Request received');
      console.log('ðŸ›’ User from JWT:', req.user);
      const userId = (req.user as any).userId;
      console.log('ðŸ›’ User ID:', userId);
      
      let cart = await prisma.carts.findUnique({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: {
              listing: {
                include: {
                  depots: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      province: true,
                      city: true
                    }
                  },
                  users: {
                    select: {
                      id: true,
                      display_name: true,
                      email: true,
                      avatar_url: true
                    }
                  },
                  listing_containers: {
                    select: {
                      id: true,
                      container_iso_code: true,
                      status: true
                    }
                  }
                }
              }
            },
            orderBy: { added_at: 'desc' }
          }
        }
      });
      
      // Auto-create empty cart if not exists
      if (!cart) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
        
        cart = await prisma.carts.create({
          data: {
            user_id: userId,
            expires_at: expiresAt,
            status: 'ACTIVE'
          },
          include: {
            cart_items: true
          }
        });
      }
      
      return reply.send({
        success: true,
        data: cart
      });
    } catch (error: any) {
      console.error('Get cart error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * POST /cart/items
   * ThÃªm item vÃ o giá» hÃ ng
   */
  server.post<{ 
    Body: { 
      listing_id: string;
      quantity: number;
      deal_type?: 'SALE' | 'RENTAL';
      rental_duration_months?: number;
      notes?: string;
      selected_container_ids?: string[];
    } 
  }>('/items', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { listing_id, quantity, deal_type, rental_duration_months, notes, selected_container_ids } = req.body;
      
      // ✅ DEBUG: Log incoming request
      console.log('🛒 POST /cart/items - Incoming Request:', {
        userId,
        body: req.body
      });
      
      // Validate input
      if (!listing_id) {
        console.error('❌ Validation failed: listing_id is required');
        return reply.code(400).send({ success: false, error: 'listing_id is required' });
      }
      
      if (!quantity || quantity < 1 || quantity > 1000) {
        console.error('❌ Validation failed: invalid quantity', { quantity });
        return reply.code(400).send({ success: false, error: 'quantity must be between 1 and 1000' });
      }
      
      // Validate listing exists and is available
      const listing = await prisma.listings.findUnique({
        where: { id: listing_id }
      });
      
      if (!listing) {
        console.error('❌ Listing not found:', listing_id);
        return reply.code(404).send({ success: false, error: 'Listing not found' });
      }
      
      console.log('✅ Listing found:', {
        id: listing.id,
        title: listing.title,
        deal_type: listing.deal_type,
        status: listing.status,
        available_quantity: listing.available_quantity
      });
      
      if (listing.status !== 'ACTIVE') {
        console.error('❌ Listing not active:', { status: listing.status });
        return reply.code(400).send({ success: false, error: 'Listing is not available' });
      }
      
      // Determine effective deal_type
      const effectiveDealType = deal_type || listing.deal_type;
      
      console.log('📋 Deal type determination:', {
        provided_deal_type: deal_type,
        listing_deal_type: listing.deal_type,
        effectiveDealType
      });
      
      // Validate rental duration for RENTAL type
      if (effectiveDealType === 'RENTAL') {
        const months = Number(rental_duration_months ?? 0);
        console.log('📅 Rental validation:', {
          rental_duration_months,
          parsed_months: months
        });
        
        if (!months || months < 1) {
          console.error('❌ Invalid rental duration:', { rental_duration_months, months });
          return reply.code(400).send({ 
            success: false, 
            error: 'Please enter valid rental duration (>= 1 month)' 
          });
        }
      }
      
      // Validate selected_container_ids if provided
      if (selected_container_ids && selected_container_ids.length > 0) {
        console.log('🔍 Validating selected containers:', selected_container_ids);
        
        // ✅ FIX: Search by ID instead of container_iso_code
        const containers = await prisma.listing_containers.findMany({
          where: {
            listing_id: listing_id,
            id: { in: selected_container_ids }
          }
        });
        
        console.log('✅ Found containers:', containers.length);
        
        if (containers.length !== selected_container_ids.length) {
          console.error('❌ Container count mismatch:', {
            requested: selected_container_ids.length,
            found: containers.length,
            requested_ids: selected_container_ids,
            found_ids: containers.map(c => c.id)
          });
          return reply.code(400).send({ 
            success: false, 
            error: 'Some selected containers do not exist' 
          });
        }
        
        const unavailableContainers = containers.filter(c => c.status !== 'AVAILABLE');
        if (unavailableContainers.length > 0) {
          console.error('❌ Unavailable containers:', unavailableContainers.map(c => ({ id: c.id, status: c.status })));
          return reply.code(400).send({ 
            success: false, 
            error: `${unavailableContainers.length} container(s) not available (${unavailableContainers.map(c => c.container_iso_code).join(', ')})` 
          });
        }
        
        // Override quantity with selected containers length
        if (selected_container_ids.length !== quantity) {
          console.log(`Quantity mismatch: selected ${selected_container_ids.length} containers but requested ${quantity}. Using selected count.`);
        }
      }
      
      // Check stock availability
      const availableQty = listing.available_quantity || 0;
      if (availableQty < quantity) {
        return reply.code(400).send({ 
          success: false, 
          error: `Only ${availableQty} container(s) available` 
          });
      }
      
      // Get or create cart
      let cart = await prisma.carts.findUnique({
        where: { user_id: userId }
      });
      
      if (!cart) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        cart = await prisma.carts.create({
          data: {
            user_id: userId,
            expires_at: expiresAt,
            status: 'ACTIVE'
          }
        });
      }
      
      // Prepare composite key for upsert
      const effectiveRentalMonths = effectiveDealType === 'RENTAL' 
        ? Number(rental_duration_months || 0) 
        : 0;
      
      // Check if item already exists in cart
      const existingItem = await prisma.cart_items.findFirst({
        where: {
          cart_id: cart.id,
          listing_id: listing_id,
          deal_type: effectiveDealType,
          rental_duration_months: effectiveRentalMonths
        }
      });
      
      let cartItem;
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check total quantity doesn't exceed availability
        if (availableQty < newQuantity) {
          return reply.code(400).send({ 
            success: false, 
            error: `Chá»‰ cÃ²n ${availableQty} container kháº£ dá»¥ng` 
          });
        }
        
        // Merge selected container IDs if provided
        const mergedContainerIds = selected_container_ids && selected_container_ids.length > 0
          ? [...new Set([...(existingItem.selected_container_ids || []), ...selected_container_ids])]
          : existingItem.selected_container_ids;
        
        cartItem = await prisma.cart_items.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            selected_container_ids: mergedContainerIds,
            updated_at: new Date()
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price_amount: true,
                price_currency: true,
                available_quantity: true
              }
            }
          }
        });
      } else {
        // Create new cart item
        cartItem = await prisma.cart_items.create({
          data: {
            cart_id: cart.id,
            listing_id: listing_id,
            quantity: selected_container_ids && selected_container_ids.length > 0 
              ? selected_container_ids.length 
              : quantity,
            deal_type: effectiveDealType,
            rental_duration_months: effectiveRentalMonths,
            price_snapshot: listing.price_amount,
            currency: listing.price_currency,
            notes: notes || null,
            selected_container_ids: selected_container_ids || []
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price_amount: true,
                price_currency: true,
                available_quantity: true
              }
            }
          }
        });
      }
      
      return reply.code(201).send({
        success: true,
        message: 'ÄÃ£ thÃªm vÃ o giá» hÃ ng',
        data: cartItem
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * PUT /cart/items/:itemId
   * Cáº­p nháº­t sá»‘ lÆ°á»£ng item trong giá»
   */
  server.put<{ 
    Params: { itemId: string };
    Body: { quantity: number };
  }>('/items/:itemId', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      // Validate quantity
      if (!quantity || quantity < 1 || quantity > 1000) {
        return reply.code(400).send({ 
          success: false, 
          error: 'quantity must be between 1 and 1000' 
        });
      }
      
      // Verify cart item ownership
      const cartItem = await prisma.cart_items.findUnique({
        where: { id: itemId },
        include: { 
          cart: true, 
          listing: true 
        }
      });
      
      if (!cartItem) {
        return reply.code(404).send({ success: false, error: 'Cart item not found' });
      }
      
      if (cartItem.cart.user_id !== userId) {
        return reply.code(403).send({ success: false, error: 'Forbidden' });
      }
      
      // Check availability
      const availableQty = cartItem.listing.available_quantity || 0;
      if (availableQty < quantity) {
        return reply.code(400).send({ 
          success: false, 
          error: `Chá»‰ cÃ²n ${availableQty} container kháº£ dá»¥ng` 
        });
      }
      
      // Update quantity
      const updated = await prisma.cart_items.update({
        where: { id: itemId },
        data: {
          quantity: quantity,
          updated_at: new Date()
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price_amount: true,
              price_currency: true
            }
          }
        }
      });
      
      return reply.send({
        success: true,
        message: 'ÄÃ£ cáº­p nháº­t sá»‘ lÆ°á»£ng',
        data: updated
      });
    } catch (error: any) {
      console.error('Update cart item error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * DELETE /cart/items/:itemId
   * XÃ³a item khá»i giá» hÃ ng
   */
  server.delete<{ Params: { itemId: string } }>('/items/:itemId', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { itemId } = req.params;
      
      // Verify ownership
      const cartItem = await prisma.cart_items.findUnique({
        where: { id: itemId },
        include: { cart: true }
      });
      
      if (!cartItem) {
        return reply.code(404).send({ success: false, error: 'Cart item not found' });
      }
      
      if (cartItem.cart.user_id !== userId) {
        return reply.code(403).send({ success: false, error: 'Forbidden' });
      }
      
      // Delete item
      await prisma.cart_items.delete({
        where: { id: itemId }
      });
      
      return reply.send({
        success: true,
        message: 'ÄÃ£ xÃ³a khá»i giá» hÃ ng'
      });
    } catch (error: any) {
      console.error('Delete cart item error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * DELETE /cart
   * XÃ³a toÃ n bá»™ giá» hÃ ng (clear cart)
   */
  server.delete('/', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      
      const cart = await prisma.carts.findUnique({
        where: { user_id: userId }
      });
      
      if (cart) {
        // Delete all cart items
        await prisma.cart_items.deleteMany({
          where: { cart_id: cart.id }
        });
      }
      
      return reply.send({
        success: true,
        message: 'ÄÃ£ xÃ³a toÃ n bá»™ giá» hÃ ng'
      });
    } catch (error: any) {
      console.error('Clear cart error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * GET /cart/summary
   * TÃ­nh tá»•ng giá» hÃ ng
   */
  server.get('/summary', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      
      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: { listing: true }
          }
        }
      });
      
      if (!cart || cart.cart_items.length === 0) {
        return reply.send({
          success: true,
          data: {
            total_items: 0,
            items_count: 0,
            totals_by_currency: []
          }
        });
      }
      
      // Calculate total items
      const totalItems = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Group by currency and calculate totals
      const byCurrency = new Map<string, number>();
      
      for (const item of cart.cart_items) {
        const unitPrice = parseFloat(item.price_snapshot.toString());
        const months = item.deal_type === 'RENTAL' ? (item.rental_duration_months || 1) : 1;
        const lineTotal = unitPrice * item.quantity * months;
        
        const currentTotal = byCurrency.get(item.currency) || 0;
        byCurrency.set(item.currency, currentTotal + lineTotal);
      }
      
      const totalsByCurrency = Array.from(byCurrency.entries()).map(
        ([currency, amount]) => ({ currency, amount })
      );
      
      return reply.send({
        success: true,
        data: {
          total_items: totalItems,
          items_count: cart.cart_items.length,
          totals_by_currency: totalsByCurrency
        }
      });
    } catch (error: any) {
      console.error('Get cart summary error:', error);
      return reply.code(500).send({ success: false, error: error.message });
    }
  });

  /**
   * POST /cart/checkout
   * Convert cart to RFQ or Order
   */
  server.post<{ 
    Body: { 
      checkout_type: 'rfq' | 'order';
      delivery_address_id?: string;
      cart_item_ids?: string[]; // Optional: for partial checkout (not used yet)
    } 
  }>('/checkout', {
    preHandler: authPreHandler
  }, async (req, reply) => {
    try {
      const userId = (req.user as any).userId;
      const { checkout_type, delivery_address_id, cart_item_ids } = req.body;
      
      console.log('🛒 POST /cart/checkout - Request:', {
        userId,
        checkout_type,
        delivery_address_id,
        cart_item_ids: cart_item_ids?.length || 'all items'
      });
      
      // Validate checkout_type
      if (!checkout_type || !['rfq', 'order'].includes(checkout_type)) {
        return reply.code(400).send({ 
          success: false, 
          error: 'checkout_type must be either "rfq" or "order"' 
        });
      }
      
      // Get cart with items
      const cart = await prisma.carts.findUnique({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: {
              listing: {
                include: { 
                  users: true  // Relation name is 'users', not 'seller'
                }
              }
            }
          }
        }
      });
      
      if (!cart || cart.cart_items.length === 0) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Giá» hÃ ng trá»‘ng' 
        });
      }
      
      // Validate all items are still available
      for (const item of cart.cart_items) {
        if (item.listing.status !== 'ACTIVE') {
          return reply.code(400).send({ 
            success: false, 
            error: `Sáº£n pháº©m "${item.listing.title}" khÃ´ng cÃ²n kháº£ dá»¥ng` 
          });
        }
        
        const availableQty = item.listing.available_quantity || 0;
        if (availableQty < item.quantity) {
          return reply.code(400).send({ 
            success: false, 
            error: `Sáº£n pháº©m "${item.listing.title}" khÃ´ng cÃ²n Ä‘á»§ sá»‘ lÆ°á»£ng` 
          });
        }
      }
      
      // Group items by seller
      const itemsBySeller = cart.cart_items.reduce((acc, item) => {
        const sellerId = item.listing.seller_user_id;
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof cart.cart_items>);
      
      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        const createdIds: string[] = [];
        
        if (checkout_type === 'rfq') {
          // Create RFQs (one per seller)
          for (const [sellerId, items] of Object.entries(itemsBySeller)) {
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            
            const rfq = await tx.rfqs.create({
              data: {
                buyer_id: userId,
                purpose: 'PURCHASE',
                quantity: totalQty,
                status: 'DRAFT',
                listing_id: items[0].listing_id // First listing as primary
              }
            });
            
            createdIds.push(rfq.id);
          }
          
          // Mark cart as converted
          await tx.carts.update({
            where: { id: cart.id },
            data: {
              status: 'CONVERTED',
              converted_to_rfq_id: createdIds[0]
            }
          });
          
        } else {
          // Create Orders (one per seller)
          for (const [sellerId, items] of Object.entries(itemsBySeller)) {
            // ✅ FIX #2: Get listing info for deposit calculation
            const firstItem = items[0];
            const listing = firstItem.listing;
            
            // Calculate subtotal (rental fee only, without deposit)
            const subtotal = items.reduce((sum, item) => {
              const unitPrice = parseFloat(item.price_snapshot.toString());
              const months = item.deal_type === 'RENTAL' 
                ? (item.rental_duration_months || 1) 
                : 1;
              return sum + (unitPrice * item.quantity * months);
            }, 0);
            
            // ✅ FIX #2: Calculate deposit for RENTAL orders
            let depositAmount = 0;
            if (firstItem.deal_type === 'RENTAL' && listing?.deposit_required) {
              depositAmount = Number(listing.deposit_amount || 0) * items.reduce((sum, item) => sum + item.quantity, 0);
            }
            
            // Calculate tax and fees (on subtotal + deposit)
            const totalBeforeTax = subtotal + depositAmount;
            const tax = totalBeforeTax * 0.1;      // 10% VAT
            const fees = totalBeforeTax * 0.02;    // 2% platform fee
            const total = totalBeforeTax + tax + fees;
            
            console.log(`💰 Order calculation for seller ${sellerId}:`, {
              deal_type: firstItem.deal_type,
              subtotal,
              depositAmount,
              tax,
              fees,
              total
            });
            
            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            const order = await tx.orders.create({
              data: {
                id: orderId,
                buyer_id: userId,
                seller_id: sellerId,
                status: 'PENDING_PAYMENT',
                subtotal: subtotal,
                tax: tax,
                fees: fees,
                total: total,
                currency: items[0].currency,
                order_number: orderNumber,
                listing_id: items[0].listing_id,
                updated_at: new Date(),
                // ✅ FIX: Save deal_type and rental_duration_months
                deal_type: items[0].deal_type,
                rental_duration_months: items[0].deal_type === 'RENTAL' 
                  ? items[0].rental_duration_months 
                  : null
              }
            });
            
            // Create order items and reserve inventory
            for (const item of items) {
              const unitPrice = parseFloat(item.price_snapshot.toString());
              const months = item.deal_type === 'RENTAL' 
                ? (item.rental_duration_months || 1) 
                : 1;
              const totalPrice = unitPrice * item.quantity * months;
              const orderItemId = `order-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              
              await tx.order_items.create({
                data: {
                  id: orderItemId,
                  order_id: order.id,
                  item_type: 'CONTAINER',
                  ref_id: item.listing_id,
                  description: item.listing.title,
                  qty: item.quantity,
                  unit_price: unitPrice,
                  total_price: totalPrice,
                  deal_type: item.deal_type,
                  rental_duration_months: item.deal_type === 'RENTAL' 
                    ? item.rental_duration_months 
                    : null
                }
              });
              
              // ============ ✅ FIX: USE INVENTORY SERVICE ============
              // Thay vì trực tiếp decrement, dùng InventoryService để đồng bộ
              const { InventoryService } = await import('../lib/inventory/inventory-service.js');
              const inventoryService = new InventoryService(tx as any);
              
              // Get selected container IDs if any
              const selectedContainerIds = item.selected_container_ids as string[] | undefined;
              
              // Get deal_type from cart item
              const dealType = item.deal_type || 'SALE';
              const rentalDurationMonths = item.rental_duration_months || null;
              
              await inventoryService.reserveInventory(
                order.id,
                item.listing_id,
                item.quantity,
                selectedContainerIds,
                dealType,  // ✅ Pass deal_type
                rentalDurationMonths  // ✅ Pass rental duration
              );
              
              console.log(`✅ Cart checkout: Reserved ${item.quantity} containers from listing ${item.listing_id} for order ${order.id}, Deal Type: ${dealType}`);
            }
            
            createdIds.push(order.id);
            
            // Send notification to seller about new order
            try {
              const { NotificationService } = await import('../lib/notifications/notification-service.js');
              await NotificationService.createNotification({
                userId: sellerId,
                type: 'order_created',
                title: 'Đơn hàng mới từ giỏ hàng',
                message: `Bạn có đơn hàng mới với ${items.length} sản phẩm. Tổng giá trị: ${total.toLocaleString()} ${items[0].currency}`,
                data: {
                  orderId: order.id,
                  orderNumber: orderNumber,
                  itemCount: items.length,
                  amount: total,
                  currency: items[0].currency,
                  source: 'cart'
                }
              });
            } catch (notifError) {
              console.error('Failed to send order notification to seller:', notifError);
              // Don't fail the order creation if notification fails
            }
          }
          
          // Mark cart as converted
          await tx.carts.update({
            where: { id: cart.id },
            data: {
              status: 'CONVERTED',
              converted_to_order_id: createdIds[0]
            }
          });
        }
        
        return createdIds;
      });
      
      const entityType = checkout_type === 'rfq' ? 'RFQ' : 'Ä‘Æ¡n hÃ ng';
      
      return reply.send({
        success: true,
        message: `Đã tạo thành công ${result.length} ${entityType}`,
        data: { 
          ids: result,
          type: checkout_type
        }
      });
    } catch (error: any) {
      console.error('❌ Checkout error FULL:', error);
      console.error('❌ Checkout error stack:', error.stack);
      console.error('❌ Checkout error message:', error.message);
      return reply.code(500).send({ 
        success: false, 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
}


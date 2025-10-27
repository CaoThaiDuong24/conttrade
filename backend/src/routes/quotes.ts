// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../lib/notifications/notification-service.js';

interface QuoteItem {
  item_type: 'CONTAINER' | 'INSPECTION' | 'REPAIR' | 'DELIVERY' | 'OTHER';
  ref_id?: string;
  description: string;
  qty: number;
  unit_price: number;
}

interface CreateQuoteBody {
  rfq_id: string;
  items: QuoteItem[];
  fees?: any[];
  total: number;
  currency: string;
  valid_days?: number;
}

export default async function quoteRoutes(fastify: FastifyInstance) {
  // GET /quotes/my-quotes - Lấy danh sách quotes của seller hiện tại (TEMPORARY: NO AUTH FOR TESTING)
  fastify.get<{
    Querystring: {
      status?: string;
      search?: string;
      limit?: string;
      offset?: string;
    }
  }>('/my-quotes', async (request, reply) => {
    // TEMPORARY: Use specific seller user for testing, remove auth
    const sampleUser = await prisma.users.findFirst({
      where: { id: 'user-seller' }
    });
    let userId: string;
    
    if (!sampleUser) {
      // Fallback to any user if user-seller not found
      const fallbackUser = await prisma.users.findFirst();
      if (!fallbackUser) {
        return reply.status(404).send({
          success: false,
          message: 'No users found in database'
        });
      }
      userId = fallbackUser.id;
      console.log('🧪 [TEMP] Using fallback user for testing:', userId);
    } else {
      userId = sampleUser.id;
      console.log('🧪 [TEMP] Using seller user for testing:', userId);
    }

    const { status, search, limit, offset } = request.query;

    try {
      // Parse pagination parameters
      const limitNum = limit ? parseInt(limit) : 10;
      const offsetNum = offset ? parseInt(offset) : 0;

      // Build where conditions
      const whereConditions: any = {
        seller_id: userId
      };

      if (status && status !== 'all') {
        whereConditions.status = status.toUpperCase();
      }

      if (search) {
        whereConditions.OR = [
          {
            rfqs: {
              listings: {
                title: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            rfqs: {
              users: {
                display_name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ];
      }

      // Get quotes with related data
      const quotes = await prisma.quotes.findMany({
        where: whereConditions,
        include: {
          rfqs: {
            include: {
              listings: {
                select: {
                  title: true,
                  description: true,
                  containers: {
                    select: {
                      type: true,
                      size_ft: true
                    }
                  }
                }
              },
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              }
            }
          },
          quote_items: true
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offsetNum,
        take: limitNum
      });

      // Get total count for pagination
      const total = await prisma.quotes.count({
        where: whereConditions
      });

      // Get stats
      const stats = await prisma.quotes.groupBy({
        by: ['status'],
        where: {
          seller_id: userId
        },
        _count: {
          status: true
        },
        _sum: {
          total: true
        }
      });

      // Process stats
      const processedStats = {
        total: total,
        sent: 0,
        accepted: 0,
        rejected: 0,
        draft: 0,
        expired: 0,
        total_value: 0
      };

      stats.forEach(stat => {
        const status = stat.status.toLowerCase();
        const count = stat._count.status;
        const value = stat._sum.total || 0;

        if (status === 'sent' || status === 'submitted') {
          processedStats.sent += count;
        } else if (status === 'accepted') {
          processedStats.accepted += count;
        } else if (status === 'rejected' || status === 'declined') {
          processedStats.rejected += count;
        } else if (status === 'draft') {
          processedStats.draft += count;
        } else if (status === 'expired') {
          processedStats.expired += count;
        }

        processedStats.total_value += Number(value);
      });

      // Format quotes for frontend
      const formattedQuotes = quotes.map(quote => ({
        id: quote.id,
        rfq_id: quote.rfq_id,
        rfq_title: quote.rfqs?.listings?.title || 'N/A',
        buyer_name: quote.rfqs?.buyer?.display_name || 'N/A',
        seller_id: quote.seller_id,
        total_amount: Number(quote.total),
        currency: quote.currency,
        status: quote.status.toLowerCase(),
        valid_until: quote.valid_until?.toISOString(),
        created_at: quote.created_at.toISOString(),
        updated_at: quote.updated_at.toISOString(),
        items_count: quote.quote_items?.length || 0,
        items: quote.quote_items || [],
        fees: quote.fees_json || [],
        notes: quote.notes,
        delivery_terms: quote.delivery_terms,
        payment_terms: quote.payment_terms
      }));

      const totalPages = Math.ceil(total / limitNum);
      const currentPage = Math.floor(offsetNum / limitNum) + 1;

      return reply.send({
        quotes: formattedQuotes,
        stats: processedStats,
        pagination: {
          total,
          page: currentPage,
          limit: limitNum,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      fastify.log.error('Error fetching my quotes:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch quotes',
        error: error.message
      });
    }
  });

  // POST /quotes - Tạo quote mới (seller only)
  fastify.post<{ Body: CreateQuoteBody }>('/', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Manually verify JWT
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          // Try default jwtVerify (cookies, etc.)
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in create quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { rfq_id, rfqId, items, fees = [], total, currency, valid_days = 7, priceAmount, priceCurrency, validUntil, notes, servicesOffered, totalAmount } = request.body;
    
    // Support both formats: rfqId (camelCase) and rfq_id (snake_case)
    const actualRfqId = rfqId || rfq_id;

    console.log('=== QUOTE CREATION DEBUG ===');
    console.log('Raw request body:', JSON.stringify(request.body, null, 2));
    console.log('Items received:', JSON.stringify(items, null, 2));
    console.log('actualRfqId:', actualRfqId);
    console.log('================');

    try {
      // Verify RFQ exists and user is the seller
      const rfq = await prisma.rfqs.findUnique({
        where: { id: actualRfqId },
        include: {
          listings: true,
        }
      });

      if (!rfq) {
        return reply.status(404).send({
          success: false,
          message: 'RFQ not found'
        });
      }

      if (rfq.listings.seller_user_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the listing seller can create quotes for this RFQ'
        });
      }

      if (rfq.status === 'expired' || rfq.status === 'withdrawn') {
        return reply.status(400).send({
          success: false,
          message: 'Cannot create quote for an expired or withdrawn RFQ'
        });
      }

      // Check if seller already has a quote for this RFQ
      const existingQuote = await prisma.quotes.findFirst({
        where: {
          rfq_id: actualRfqId,
          seller_id: userId,
          status: { in: ['DRAFT', 'SUBMITTED'] }
        }
      });

      if (existingQuote) {
        return reply.status(400).send({
          success: false,
          message: 'You already have a pending quote for this RFQ'
        });
      }

      // Support both simple quotes and detailed quotes
      const finalTotal = totalAmount || total || priceAmount || 0;
      const finalCurrency = priceCurrency || currency || 'VND';
      const finalValidUntil = validUntil ? new Date(validUntil) : (() => {
        const date = new Date();
        date.setDate(date.getDate() + (valid_days || 7));
        return date;
      })();

      // Generate quote ID
      const { v4: uuidv4 } = await import('uuid');
      const quoteId = uuidv4();

      // Prepare items if provided
      console.log('Raw items received:', JSON.stringify(items, null, 2));
      
      let quoteItems = [];
      if (items && Array.isArray(items) && items.length > 0) {
        quoteItems = items.map(item => {
          console.log('Processing item:', JSON.stringify(item, null, 2));
          const processedItem = {
            id: uuidv4(), // Generate ID for quote item
            // Handle both backend format (item_type, unit_price) and frontend format (containerType, unitPrice)
            item_type: item.item_type || 'CONTAINER',
            ref_id: item.ref_id || item.rfqItemId || null,
            description: item.description || `${item.containerType || 'Container'} - ${item.size || 'N/A'}`,
            qty: item.qty || item.quantity || 1,
            unit_price: item.unit_price || item.unitPrice || 0,
            total_price: (item.qty || item.quantity || 1) * (item.unit_price || item.unitPrice || 0)
          };
          console.log('Processed item:', JSON.stringify(processedItem, null, 2));
          return processedItem;
        }).filter(item => {
          const isValid = item.unit_price > 0;
          console.log('Item valid?', isValid, 'unit_price:', item.unit_price);
          return isValid;
        });
      }

      console.log('Final quoteItems:', JSON.stringify(quoteItems, null, 2));
      console.log('Quote items count:', quoteItems.length);

      // Create quote with items
      const quote = await prisma.quotes.create({
        data: {
          id: quoteId,
          rfq_id: actualRfqId,
          seller_id: userId,
          price_subtotal: finalTotal,
          total: finalTotal,
          currency: finalCurrency,
          valid_until: finalValidUntil,
          status: 'SUBMITTED',
          fees_json: fees || [],
          updated_at: new Date(),
          // Only create items if provided and valid
          ...(quoteItems.length > 0 ? {
            quote_items: {
              create: quoteItems
            }
          } : {})
        },
        include: {
          quote_items: true,
          users: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          }
        }
      });

      // Update RFQ status
      await prisma.rfqs.update({
        where: { id: actualRfqId },
        data: { status: 'QUOTED' }
      });

      // 🔔 Notify buyer about new quote
      const rfqData = await prisma.rfqs.findUnique({
        where: { id: actualRfqId },
        include: {
          listings: { select: { title: true } },
          users: { select: { display_name: true, email: true } }
        }
      });

      if (rfqData) {
        const sellerName = (request.user as any).name || (request.user as any).email || 'Người bán';
        const listingTitle = rfqData.listings?.title || 'Container';
        
        await NotificationService.createNotification({
          userId: rfqData.buyer_user_id,
          type: 'quote_received',
          title: 'Báo giá mới',
          message: `${sellerName} đã gửi báo giá cho yêu cầu của bạn - ${listingTitle}`,
          orderData: {
            quoteId: quote.id,
            rfqId: actualRfqId,
            sellerName: sellerName,
            total: finalTotal,
            currency: finalCurrency
          }
        });
        
        console.log('✅ Sent Quote notification to buyer:', rfqData.buyer_user_id);
      }

      return reply.status(201).send({
        success: true,
        message: 'Quote created successfully',
        data: quote
      });
    } catch (error: any) {
      fastify.log.error('Error creating quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create quote',
        error: error.message
      });
    }
  });

  // GET /quotes/:id - Lấy chi tiết quote
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in get quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      const quote = await prisma.quotes.findUnique({
        where: { id },
        include: {
          rfqs: {
            include: {
              listings: {
                select: {
                  title: true,
                  description: true,
                  containers: {
                    select: {
                      type: true,
                      size_ft: true
                    }
                  }
                }
              },
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              }
            }
          },
          quote_items: true,
          users: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          }
        }
      });

      if (!quote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      // Check permissions - seller can view their own quotes, buyer can view quotes for their RFQs
      if (quote.seller_id !== userId && quote.rfqs?.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      // Format quote for frontend
      const formattedQuote = {
        id: quote.id,
        rfq_id: quote.rfq_id,
        rfq_title: quote.rfqs?.listings?.title || 'N/A',
        buyer_name: quote.rfqs?.buyer?.display_name || 'N/A',
        seller_id: quote.seller_id,
        total_amount: Number(quote.total),
        currency: quote.currency,
        status: quote.status.toLowerCase(),
        valid_until: quote.valid_until?.toISOString(),
        created_at: quote.created_at.toISOString(),
        updated_at: quote.updated_at.toISOString(),
        items_count: quote.quote_items?.length || 0,
        items: quote.quote_items || [],
        fees: quote.fees_json || [],
        notes: quote.notes,
        delivery_terms: quote.delivery_terms,
        payment_terms: quote.payment_terms
      };

      return reply.send({
        success: true,
        data: { quote: formattedQuote }
      });

    } catch (error: any) {
      fastify.log.error('Error fetching quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch quote',
        error: error.message
      });
    }
  });

  // PUT /quotes/:id - Cập nhật quote (chỉ status draft)
  fastify.put<{ 
    Params: { id: string },
    Body: {
      items?: QuoteItem[];
      fees?: any[];
      total_amount?: number;
      currency?: string;
      valid_until?: string;
      delivery_terms?: string;
      payment_terms?: string;
      notes?: string;
    }
  }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in update quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;
    const updateData = request.body;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id },
        include: { quote_items: true }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can update this quote'
        });
      }

      if (existingQuote.status !== 'DRAFT') {
        return reply.status(400).send({
          success: false,
          message: 'Only draft quotes can be updated'
        });
      }

      // Prepare update data
      const updateFields: any = {
        updated_at: new Date()
      };

      if (updateData.total_amount !== undefined) {
        updateFields.total = updateData.total_amount;
        updateFields.price_subtotal = updateData.total_amount;
      }
      if (updateData.currency) updateFields.currency = updateData.currency;
      if (updateData.valid_until) updateFields.valid_until = new Date(updateData.valid_until);
      if (updateData.delivery_terms) updateFields.delivery_terms = updateData.delivery_terms;
      if (updateData.payment_terms) updateFields.payment_terms = updateData.payment_terms;
      if (updateData.notes) updateFields.notes = updateData.notes;
      if (updateData.fees) updateFields.fees_json = updateData.fees;

      // Update quote in transaction if items are being updated
      if (updateData.items && Array.isArray(updateData.items)) {
        const result = await prisma.$transaction(async (tx) => {
          // Delete existing items
          await tx.quote_items.deleteMany({
            where: { quote_id: id }
          });

          // Add new items
          const quoteItems = updateData.items!.map(item => ({
            id: uuidv4(),
            quote_id: id,
            item_type: item.item_type || 'CONTAINER',
            ref_id: item.ref_id,
            description: item.description,
            qty: item.qty,
            unit_price: item.unit_price,
            total_price: item.qty * item.unit_price
          }));

          if (quoteItems.length > 0) {
            await tx.quote_items.createMany({
              data: quoteItems
            });
          }

          // Update quote
          return await tx.quotes.update({
            where: { id },
            data: updateFields,
            include: {
              quote_items: true,
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              }
            }
          });
        });

        return reply.send({
          success: true,
          message: 'Quote updated successfully',
          data: { quote: result }
        });
      } else {
        // Update quote without changing items
        const updatedQuote = await prisma.quotes.update({
          where: { id },
          data: updateFields,
          include: {
            quote_items: true,
            users: {
              select: {
                id: true,
                display_name: true,
                email: true
              }
            }
          }
        });

        return reply.send({
          success: true,
          message: 'Quote updated successfully',
          data: { quote: updatedQuote }
        });
      }

    } catch (error: any) {
      fastify.log.error('Error updating quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update quote',
        error: error.message
      });
    }
  });

  // DELETE /quotes/:id - Xóa quote (chỉ status draft)
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in delete quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can delete this quote'
        });
      }

      if (existingQuote.status !== 'DRAFT') {
        return reply.status(400).send({
          success: false,
          message: 'Only draft quotes can be deleted'
        });
      }

      // Delete quote and related items in transaction
      await prisma.$transaction(async (tx) => {
        // Delete quote items first
        await tx.quote_items.deleteMany({
          where: { quote_id: id }
        });

        // Delete quote
        await tx.quotes.delete({
          where: { id }
        });
      });

      return reply.send({
        success: true,
        message: 'Quote deleted successfully'
      });

    } catch (error: any) {
      fastify.log.error('Error deleting quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete quote',
        error: error.message
      });
    }
  });

  // POST /quotes/:id/send - Gửi quote cho buyer
  fastify.post<{ Params: { id: string } }>('/:id/send', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in send quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can send this quote'
        });
      }

      if (existingQuote.status !== 'DRAFT') {
        return reply.status(400).send({
          success: false,
          message: 'Only draft quotes can be sent'
        });
      }

      // Update quote status to sent
      const updatedQuote = await prisma.quotes.update({
        where: { id },
        data: {
          status: 'SENT',
          updated_at: new Date()
        },
        include: {
          quote_items: true,
          users: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        message: 'Quote sent successfully',
        data: { quote: updatedQuote }
      });

    } catch (error: any) {
      fastify.log.error('Error sending quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to send quote',
        error: error.message
      });
    }
  });

  // POST /quotes/:id/withdraw - Rút quote (chuyển từ sent về draft)
  fastify.post<{ Params: { id: string } }>('/:id/withdraw', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in withdraw quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can withdraw this quote'
        });
      }

      if (existingQuote.status !== 'SENT') {
        return reply.status(400).send({
          success: false,
          message: 'Only sent quotes can be withdrawn'
        });
      }

      // Update quote status back to draft
      const updatedQuote = await prisma.quotes.update({
        where: { id },
        data: {
          status: 'DRAFT',
          updated_at: new Date()
        },
        include: {
          quote_items: true,
          users: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        message: 'Quote withdrawn successfully',
        data: { quote: updatedQuote }
      });

    } catch (error: any) {
      fastify.log.error('Error withdrawing quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to withdraw quote',
        error: error.message
      });
    }
  });

  // POST /quotes/:id/extend - Gia hạn quote
  fastify.post<{ 
    Params: { id: string },
    Body: { valid_until: string }
  }>('/:id/extend', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in extend quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;
    const { valid_until } = request.body;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can extend this quote'
        });
      }

      if (existingQuote.status === 'ACCEPTED' || existingQuote.status === 'REJECTED' || existingQuote.status === 'EXPIRED') {
        return reply.status(400).send({
          success: false,
          message: 'Cannot extend quotes that are already accepted, rejected, or expired'
        });
      }

      const newValidUntil = new Date(valid_until);
      if (newValidUntil <= new Date()) {
        return reply.status(400).send({
          success: false,
          message: 'New validity date must be in the future'
        });
      }

      // Update quote validity
      const updatedQuote = await prisma.quotes.update({
        where: { id },
        data: {
          valid_until: newValidUntil,
          updated_at: new Date()
        },
        include: {
          quote_items: true,
          users: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        message: 'Quote validity extended successfully',
        data: { quote: updatedQuote }
      });

    } catch (error: any) {
      fastify.log.error('Error extending quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to extend quote',
        error: error.message
      });
    }
  });

  // GET /quotes/templates - Lấy danh sách quote templates
  fastify.get('/templates', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in get templates:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;

    try {
      // For now, return empty templates array since we don't have a templates table yet
      // This can be implemented later when quote templates feature is needed
      return reply.send({
        success: true,
        data: { templates: [] }
      });

    } catch (error: any) {
      fastify.log.error('Error fetching quote templates:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch quote templates',
        error: error.message
      });
    }
  });

  // POST /quotes/:id/save-template - Lưu quote thành template
  fastify.post<{ 
    Params: { id: string },
    Body: { name: string }
  }>('/:id/save-template', {
    preHandler: async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in save template:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { id } = request.params;
    const { name } = request.body;

    try {
      // Check if quote exists and user is the seller
      const existingQuote = await prisma.quotes.findUnique({
        where: { id },
        include: { quote_items: true }
      });

      if (!existingQuote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      if (existingQuote.seller_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the quote seller can save this quote as template'
        });
      }

      // For now, just return success message since we don't have templates table yet
      // This can be implemented later when quote templates feature is needed
      return reply.send({
        success: true,
        message: 'Quote saved as template successfully',
        data: {
          template: {
            id: uuidv4(),
            name: name,
            quote_id: id,
            created_at: new Date().toISOString()
          }
        }
      });

    } catch (error: any) {
      fastify.log.error('Error saving quote template:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to save quote template',
        error: error.message
      });
    }
  });

  // TEST endpoint to accept quote without auth - REMOVE IN PRODUCTION
  fastify.get<{ Params: { id: string } }>('/:id/test-accept', async (request, reply) => {
    // Use test user for testing
    const userId = 'user-seller'; // Or any valid user ID
    const { id } = request.params;

    try {
      console.log('🧪 [TEST] Testing accept quote for ID:', id);
      
      // Verify quote exists
      const quote = await prisma.quotes.findUnique({
        where: { id },
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

      console.log('🧪 [TEST] Quote found:', {
        id: quote.id,
        status: quote.status,
        seller_id: quote.seller_id,
        rfq_buyer_id: quote.rfqs.buyer_id
      });

      // Skip buyer verification for test
      console.log('🧪 [TEST] Skipping buyer verification');

      // Check quote status
      if (quote.status !== 'SENT' && quote.status !== 'SUBMITTED' && 
          quote.status !== 'DRAFT' && quote.status !== 'PENDING') {
        return reply.status(400).send({
          success: false,
          message: `Cannot accept quote with status: ${quote.status}`
        });
      }

      console.log('🧪 [TEST] Starting transaction...');

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        console.log('🧪 [TEST] Updating quote status...');
        
        // Update quote status
        const updatedQuote = await tx.quotes.update({
          where: { id },
          data: {
            status: 'ACCEPTED',
          }
        });

        console.log('🧪 [TEST] Updating RFQ status...');
        
        // Update RFQ status
        await tx.rfqs.update({
          where: { id: quote.rfq_id },
          data: { status: 'ACCEPTED' }
        });

        console.log('🧪 [TEST] Declining other quotes...');
        
        // Decline other quotes for this RFQ
        await tx.quotes.updateMany({
          where: {
            rfq_id: quote.rfq_id,
            id: { not: id },
            status: { in: ['SENT', 'SUBMITTED', 'DRAFT', 'PENDING'] }
          },
          data: {
            status: 'REJECTED',
          }
        });

        console.log('🧪 [TEST] Creating order...');

        // Calculate order totals
        const subtotalNum = Number(quote.price_subtotal);
        const tax = subtotalNum * 0.1;
        const fees = 0;
        const total = subtotalNum + tax + fees;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Create order
        const orderId = uuidv4();
        const order = await tx.orders.create({
          data: {
            id: orderId,
            buyer_id: quote.rfqs.buyer_id, // Use actual buyer from RFQ
            seller_id: quote.seller_id,
            listing_id: quote.rfqs.listing_id,
            quote_id: id,
            status: 'PENDING_PAYMENT',
            order_number: orderNumber,
            subtotal: subtotalNum,
            tax,
            fees,
            total,
            currency: quote.currency,
            updated_at: new Date(),
            order_items: {
              create: quote.quote_items.map(item => ({
                id: uuidv4(),
                item_type: item.itemType,
                ref_id: item.refId,
                description: item.description,
                qty: item.qty,
                unit_price: item.unitPrice,
                total_price: Number(item.qty) * Number(item.unitPrice),
              }))
            }
          },
          include: {
            order_items: true,
          }
        });

        console.log('🧪 [TEST] Order created successfully:', order.id);

        // 🔔 Notify seller about accepted quote
        const buyerName = quote.rfqs.users?.display_name || quote.rfqs.users?.email || 'Người mua';
        const listingTitle = quote.rfqs.listings?.title || 'Container';
        
        await NotificationService.createNotification({
          userId: quote.seller_id,
          type: 'quote_accepted',
          title: 'Báo giá được chấp nhận',
          message: `${buyerName} đã chấp nhận báo giá của bạn cho ${listingTitle}`,
          orderData: {
            quoteId: id,
            orderId: order.id,
            orderNumber: orderNumber,
            buyerName: buyerName,
            total: total,
            currency: quote.currency
          }
        });
        
        console.log('✅ Sent Quote Accepted notification to seller:', quote.seller_id);

        return { quote: updatedQuote, order };
      });

      return reply.send({
        success: true,
        message: 'Quote accepted and order created successfully',
        data: result
      });
    } catch (error: any) {
      console.error('🧪 [TEST] Error accepting quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to accept quote',
        error: error.message,
        details: error.stack
      });
    }
  });

  // POST /quotes/:id/accept - Buyer chấp nhận quote
  fastify.post<{ Params: { id: string } }>('/:id/accept', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Manually verify JWT
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          // Try default jwtVerify (cookies, etc.)
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in accept quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).user_id || (request.user as any).userId;
    console.log('🔍 DEBUG Accept Quote:');
    console.log('  - JWT payload:', request.user);
    console.log('  - Extracted userId:', userId);
    const { id } = request.params;

    try {
      // Verify quote exists
      const quote = await prisma.quotes.findUnique({
        where: { id },
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

      // Verify user is the buyer
      console.log('🔍 DEBUG Authorization check:');
      console.log('  - Quote RFQ buyer_id:', quote.rfqs.buyer_id);
      console.log('  - Current userId:', userId);
      console.log('  - Match?', quote.rfqs.buyer_id === userId);
      
      if (quote.rfqs.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the RFQ buyer can accept this quote'
        });
      }

      // Check quote status - with debug logging
      console.log(`[DEBUG] Quote ${id} status: "${quote.status}" (type: ${typeof quote.status})`);
      console.log(`[DEBUG] Valid statuses: sent, pending, SENT, PENDING`);
      
      if (quote.status !== 'SENT' && quote.status !== 'SUBMITTED' && 
          quote.status !== 'DRAFT' && quote.status !== 'PENDING') {
        return reply.status(400).send({
          success: false,
          message: `Cannot accept quote with status: ${quote.status}. Valid statuses: SENT, SUBMITTED, DRAFT, PENDING`
        });
      }

      // Check if quote is still valid
      if (quote.valid_until && new Date() > quote.valid_until) {
        return reply.status(400).send({
          success: false,
          message: 'Quote has expired'
        });
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update quote status
        const updatedQuote = await tx.quotes.update({
          where: { id },
          data: {
            status: 'ACCEPTED', // Use UPPERCASE enum value
          }
        });

        // Update RFQ status
        await tx.rfqs.update({
          where: { id: quote.rfq_id },
          data: { status: 'ACCEPTED' } // Use UPPERCASE enum value
        });

        // Decline other quotes for this RFQ
        await tx.quotes.updateMany({
          where: {
            rfq_id: quote.rfq_id,
            id: { not: id },
            status: { in: ['SUBMITTED', 'DRAFT'] }
          },
          data: {
            status: 'REJECTED', // Use UPPERCASE enum value
          }
        });

        // Calculate order totals
        const subtotalNum = Number(quote.price_subtotal);
        const tax = subtotalNum * 0.1; // 10% VAT
        const fees = 0; // Platform fees if any
        const total = subtotalNum + tax + fees;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Create order
        const orderId = uuidv4();
        const order = await tx.orders.create({
          data: {
            id: orderId,
            buyer_id: userId,
            seller_id: quote.seller_id,
            listing_id: quote.rfqs.listing_id,
            quote_id: id,
            status: 'PENDING_PAYMENT',
            order_number: orderNumber,
            subtotal: subtotalNum,
            tax,
            fees,
            total,
            currency: quote.currency,
            updated_at: new Date(),
            order_items: {
              create: quote.quote_items.map(item => ({
                id: uuidv4(),
                item_type: item.item_type,
                ref_id: item.ref_id,
                description: item.description,
                qty: item.qty,
                unit_price: item.unit_price,
                total_price: Number(item.qty) * Number(item.unit_price),
              }))
            }
          },
          include: {
            order_items: true,
          }
        });

        return { quote: updatedQuote, order };
      });

      return reply.send({
        success: true,
        message: 'Quote accepted and order created',
        data: result
      });
    } catch (error: any) {
      fastify.log.error('Error accepting quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to accept quote',
        error: error.message
      });
    }
  });

  // Helper function for rejecting/declining quote
  const handleQuoteRejection = async (request: any, reply: any) => {
    const userId = (request.user as any).user_id || (request.user as any).userId;
    const { id } = request.params;
    const { reason } = request.body;

    try {
      // Verify quote exists
      const quote = await prisma.quotes.findUnique({
        where: { id },
        include: {
          rfqs: true
        }
      });

      if (!quote) {
        return reply.status(404).send({
          success: false,
          message: 'Quote not found'
        });
      }

      // Verify user is the buyer
      if (quote.rfqs.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Only the RFQ buyer can reject this quote'
        });
      }

      // Check quote status  
      console.log(`[DEBUG] Reject Quote ${id} status: "${quote.status}"`);
      
      if (quote.status !== 'sent' && quote.status !== 'pending' && 
          quote.status !== 'SENT' && quote.status !== 'PENDING') {
        return reply.status(400).send({
          success: false,
          message: `Cannot reject quote with status: ${quote.status}. Valid statuses: sent, pending, SENT, PENDING`
        });
      }

      // Update quote
      const updatedQuote = await prisma.quotes.update({
        where: { id },
        data: {
          status: 'rejected',
          // Could add a notes field to store reason
        },
        include: {
          rfqs: {
            include: {
              listings: { select: { title: true } },
              users: { select: { display_name: true, email: true } }
            }
          }
        }
      });

      // 🔔 Notify seller about rejected quote
      const buyerName = updatedQuote.rfqs.users?.display_name || updatedQuote.rfqs.users?.email || 'Người mua';
      const listingTitle = updatedQuote.rfqs.listings?.title || 'Container';
      
      await NotificationService.createNotification({
        userId: updatedQuote.seller_id,
        type: 'quote_rejected',
        title: 'Báo giá bị từ chối',
        message: `${buyerName} đã từ chối báo giá của bạn cho ${listingTitle}`,
        orderData: {
          quoteId: id,
          rfqId: updatedQuote.rfq_id,
          buyerName: buyerName,
          total: updatedQuote.total,
          currency: updatedQuote.currency
        }
      });
      
      console.log('✅ Sent Quote Rejected notification to seller:', updatedQuote.seller_id);

      return reply.send({
        success: true,
        message: 'Quote rejected',
        data: updatedQuote
      });
    } catch (error: any) {
      fastify.log.error('Error rejecting quote:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to reject quote',
        error: error.message
      });
    }
  };

  // POST /quotes/:id/reject - Buyer từ chối quote (Frontend gọi endpoint này)
  fastify.post<{ 
    Params: { id: string },
    Body: { reason?: string }
  }>('/:id/reject', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Manually verify JWT
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          // Try default jwtVerify (cookies, etc.)
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in reject quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, handleQuoteRejection);

  // POST /quotes/:id/decline - Buyer từ chối quote (Alias cho tương thích)
  fastify.post<{ 
    Params: { id: string },
    Body: { reason?: string }
  }>('/:id/decline', {
    preHandler: async (request, reply) => {
      try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // Manually verify JWT
          const decoded = fastify.jwt.verify(token);
          request.user = decoded;
        } else {
          // Try default jwtVerify (cookies, etc.)
          await request.jwtVerify();
        }
      } catch (err) {
        console.log('JWT verification error in decline quote:', err.message);
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, handleQuoteRejection);

  // TEMPORARY DEBUG ROUTE - Get test token
  fastify.get('/get-test-token', async (request, reply) => {
    try {
      // Get a sample user from database for testing
      const sampleUser = await prisma.users.findFirst();
      if (!sampleUser) {
        return reply.status(404).send({
          success: false,
          message: 'No users found in database'
        });
      }

      // Generate token for this user
      const token = fastify.jwt.sign({
        userId: sampleUser.id,
        email: sampleUser.email,
        role: 'SELLER'
      });

      return reply.send({
        success: true,
        token: token,
        user: {
          id: sampleUser.id,
          email: sampleUser.email,
          display_name: sampleUser.display_name
        }
      });

    } catch (error: any) {
      console.error('❌ Error generating test token:', error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // TEMPORARY DEBUG ROUTE - Get buyer token for testing
  fastify.get('/get-buyer-token', async (request, reply) => {
    try {
      // Try to find user-buyer first
      let buyerUser = await prisma.users.findUnique({
        where: { id: 'user-buyer' }
      });

      if (!buyerUser) {
        // If user-buyer doesn't exist, create it for testing
        buyerUser = await prisma.users.create({
          data: {
            id: 'user-buyer',
            email: 'testbuyer@email.com',
            display_name: 'Test Buyer',
            username: 'testbuyer',
            password_hash: 'test-hash', // This is just for testing
            profile_json: {},
            settings_json: {},
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        console.log('✅ Created user-buyer for testing');
      }

      // Generate token for buyer
      const token = fastify.jwt.sign({
        user_id: buyerUser.id,
        username: buyerUser.username,
        email: buyerUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      });

      return reply.send({
        success: true,
        token: token,
        user: {
          id: buyerUser.id,
          email: buyerUser.email,
          display_name: buyerUser.display_name
        }
      });

    } catch (error: any) {
      console.error('❌ Error generating buyer token:', error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // TEMPORARY DEBUG ROUTE - Test my-quotes endpoint without auth
  fastify.get('/test-my-quotes', async (request, reply) => {
    try {
      // Get a sample user from database for testing
      const sampleUser = await prisma.users.findFirst();
      if (!sampleUser) {
        return reply.status(404).send({
          success: false,
          message: 'No users found in database'
        });
      }

      console.log('🧪 Testing my-quotes with user:', sampleUser.id);

      // Get quotes for this user
      const quotes = await prisma.quotes.findMany({
        where: {
          seller_id: sampleUser.id
        },
        include: {
          rfqs: {
            include: {
              listings: {
                select: {
                  title: true,
                  description: true,
                  containers: {
                    select: {
                      type: true,
                      size_ft: true
                    }
                  }
                }
              },
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              }
            }
          },
          quote_items: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      });

      console.log('📊 Found quotes:', quotes.length);

      // Format quotes for frontend
      const formattedQuotes = quotes.map(quote => ({
        id: quote.id,
        rfq_id: quote.rfq_id,
        rfq_title: quote.rfqs?.listings?.title || 'N/A',
        buyer_name: quote.rfqs?.buyer?.display_name || 'N/A',
        seller_id: quote.seller_id,
        total_amount: Number(quote.total),
        currency: quote.currency,
        status: quote.status.toLowerCase(),
        valid_until: quote.valid_until?.toISOString(),
        created_at: quote.created_at.toISOString(),
        updated_at: quote.updated_at.toISOString(),
        items_count: quote.quote_items?.length || 0,
        items: quote.quote_items || [],
        fees: quote.fees_json || [],
        notes: quote.notes,
        delivery_terms: quote.delivery_terms,
        payment_terms: quote.payment_terms
      }));

      const stats = {
        total: quotes.length,
        sent: 0,
        accepted: 0,
        rejected: 0,
        draft: 0,
        expired: 0,
        total_value: 0
      };

      return reply.send({
        quotes: formattedQuotes,
        stats: stats,
        pagination: {
          total: quotes.length,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

    } catch (error: any) {
      console.error('❌ Test my-quotes error:', error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // TEMPORARY DEBUG ROUTE - Check quote statuses (no auth)
  fastify.get('/debug-statuses', async (request, reply) => {
    try {
      const quotes = await prisma.quotes.findMany({
        select: {
          id: true,
          status: true,  
          seller_id: true,
          rfq_id: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });
      
      return reply.send({
        success: true,
        data: quotes,
        message: `Found ${quotes.length} quotes`
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch quotes',
        error: error.message
      });
    }
  });

  // TEMPORARY ADMIN ROUTE - Reset quotes to 'sent' status
  fastify.get('/reset-to-sent', async (request, reply) => {
    try {
      const result = await prisma.quotes.updateMany({
        data: {
          status: 'sent'
        }
      });
      
      return reply.send({
        success: true,
        message: `Updated ${result.count} quotes to 'sent' status`
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: 'Failed to reset quotes',
        error: error.message
      });
    }
  });

  // TEMPORARY - Test accept without auth with full order creation
  fastify.post('/test-accept/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { buy_request_id } = request.body as { buy_request_id: string };
    console.log('🧪 TEST ACCEPT WITH ORDER - Quote ID:', id, 'Buy Request ID:', buy_request_id);
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Check quote exists and status
        const quote = await tx.quotes.findUnique({
          where: { id },
          include: {
            rfqs: {
              include: {
                listings: {
                  include: {
                    containers: true
                  }
                },
                users: true
              }
            },
            quote_items: true
          }
        });

        if (!quote) {
          throw new Error('Quote not found');
        }

        if (quote.status === 'ACCEPTED') {
          throw new Error('Quote already accepted');
        }

        console.log('📋 Quote found:', {
          id: quote.id,
          status: quote.status,
          total: quote.total,
          rfq_id: quote.rfq_id
        });

        // 2. Update quote status
        const updatedQuote = await tx.quotes.update({
          where: { id },
          data: { 
            status: 'ACCEPTED',
            updated_at: new Date()
          }
        });

        console.log('✅ Quote updated to ACCEPTED');

        // 3. Generate order number and ID
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('📄 Generated order:', { orderNumber, orderId });

        // 4. Create order
        const order = await tx.orders.create({
          data: {
            id: orderId,
            order_number: orderNumber,
            buyer_id: 'user-buyer', // Hardcode for test
            seller_id: quote.seller_id,
            quote_id: quote.id,
            subtotal: Number(quote.price_subtotal), // Use price_subtotal from quote
            total: Number(quote.total), // Use correct field name
            currency: quote.currency,
            status: 'PENDING_PAYMENT', // Use correct enum value
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        console.log('📦 Order created:', {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount
        });

        // 5. Create order items from quote items
        if (quote.quote_items && quote.quote_items.length > 0) {
          for (const quoteItem of quote.quote_items) {
            // Generate unique ID for order item
            const orderItemId = `order-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            await tx.order_items.create({
              data: {
                id: orderItemId,
                order_id: order.id,
                ref_id: quote.rfq_id,
                item_type: quoteItem.item_type,
                description: quoteItem.description || 'Order item',
                qty: quoteItem.qty || 1,
                unit_price: Number(quoteItem.unit_price),
                total_price: Number(quoteItem.total_price),
                created_at: new Date()
              }
            });
          }
          console.log(`📋 Created ${quote.quote_items.length} order items`);
        }

        return {
          quote: updatedQuote,
          order: order
        };
      });

      console.log('🎉 Transaction completed successfully');

      return reply.send({
        success: true,
        message: 'Quote accepted and order created successfully',
        data: result
      });

    } catch (error: any) {
      console.error('❌ Test accept with order error:', error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // TEMPORARY ADMIN ROUTE - Reset quote status for testing
  fastify.get('/reset-status/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const updatedQuote = await prisma.quotes.update({
        where: { id },
        data: { 
          status: 'SUBMITTED', // Use SUBMITTED instead of PENDING
          updated_at: new Date()
        }
      });
      
      return reply.send({
        success: true,
        message: 'Quote status reset to SUBMITTED',
        data: updatedQuote
      });
      
    } catch (error: any) {
      console.error('❌ Reset status error:', error);
      return reply.status(500).send({
        success: false,
        message: error.message
      });
    }
  });

  // TEMPORARY ADMIN ROUTE - Update quote validity for testing
  fastify.get('/update-validity', async (request, reply) => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      const result = await prisma.quotes.updateMany({
        where: {
          status: { in: ['sent', 'pending'] }
        },
        data: {
          validUntil: futureDate
        }
      });
      
      return reply.send({
        success: true,
        message: `Updated ${result.count} quotes with new validity date`,
        validUntil: futureDate
      });
    } catch (error: any) {
      fastify.log.error('Error updating quote validity:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update quote validity',
        error: error.message
      });
    }
  });

  // TEMPORARY ADMIN ROUTE - Reset quote status for testing
  fastify.get('/reset-status', async (request, reply) => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      // Reset quotes
      const quoteResult = await prisma.quotes.updateMany({
        data: {
          status: 'sent',
          validUntil: futureDate
        }
      });

      // Reset RFQs to awaiting_response
      const rfqResult = await prisma.rfqs.updateMany({
        where: {
          status: 'completed'
        },
        data: {
          status: 'awaiting_response'
        }
      });
      
      return reply.send({
        success: true,
        message: `Reset ${quoteResult.count} quotes to 'sent' status and ${rfqResult.count} RFQs to 'awaiting_response'`,
        validUntil: futureDate
      });
    } catch (error: any) {
      fastify.log.error('Error resetting quote status:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to reset quote status',
        error: error.message
      });
    }
  });
}


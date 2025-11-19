// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';
import { NotificationService } from '../lib/notifications/notification-service.js';

interface CreateRFQBody {
  listing_id: string;
  purpose: 'sale' | 'rental';
  quantity: number;
  need_by?: string;
  services?: {
    inspection?: boolean;
    repair_estimate?: boolean;
    certification?: boolean;
    delivery_estimate?: boolean;
  };
  selected_container_ids?: string[]; // 🆕 Danh sách container IDs được chọn
  rental_duration_months?: number; // 🆕 Thời gian thuê (tháng) cho RENTAL purpose
}

interface RFQQueryParams {
  view?: 'sent' | 'received';
}

export default async function rfqRoutes(fastify: FastifyInstance) {
  // GET /rfqs - Lấy danh sách RFQs
  fastify.get<{ Querystring: RFQQueryParams }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { view = 'sent' } = request.query;

    console.log('\n========================================');
    console.log('🔔 GET /rfqs called');
    console.log('User ID:', userId);
    console.log('View:', view);
    console.log('Headers:', request.headers.authorization?.substring(0, 50) + '...');
    console.log('========================================\n');

    try {
      let rfqs: any[] = [];

      if (view === 'sent') {
        // Buyer xem RFQs mình đã gửi
        console.log('📊 Query WHERE clause:', { buyer_id: userId });
        
        // First check total count
        const totalCount = await prisma.rfqs.count({
          where: { buyer_id: userId }
        });
        console.log(`📊 Total RFQs for buyer_id="${userId}": ${totalCount}`);
        
        rfqs = await prisma.rfqs.findMany({
          where: { buyer_id: userId },
          include: {
            listings: {
              include: {
                containers: true,
                listing_facets: true,
                users: {
                  select: {
                    id: true,
                    display_name: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                  }
                },
                depots: true
              }
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true,
                first_name: true,
                last_name: true,
              }
            },
            quotes: {
              select: {
                id: true,
                status: true,
                total: true,
                currency: true,
                created_at: true,
                seller_id: true,
              },
              orderBy: { created_at: 'desc' }
            }
          },
          orderBy: { submitted_at: 'desc' }
        });
        
        console.log(`✅ Query completed. Found ${rfqs.length} RFQs`);
        if (rfqs.length > 0) {
          console.log('First RFQ:', {
            id: rfqs[0].id.substring(0, 8),
            buyer_id: rfqs[0].buyer_id,
            status: rfqs[0].status,
            listing: rfqs[0].listings?.title?.substring(0, 30)
          });
        }
        if (rfqs.length !== totalCount) {
          console.warn(`⚠️ WARNING: Query returned ${rfqs.length} but count was ${totalCount}`);
        }
        
      } else if (view === 'received') {
        // Seller xem RFQs cho listings của mình
        console.log('\n' + '='.repeat(80));
        console.log('🔍 RECEIVED RFQs DETAILED DEBUG');
        console.log('='.repeat(80));
        console.log('📍 Step 1: Get Seller Listings');
        console.log('   User ID:', userId);
        
        const sellerListings = await prisma.listings.findMany({
          where: { seller_user_id: userId },
          select: { id: true, title: true }
        });
        
        console.log('   ✅ Found', sellerListings.length, 'listings');
        if (sellerListings.length > 0) {
          console.log('   First 3 listings:', sellerListings.slice(0, 3).map(l => ({
            id: l.id.substring(0, 8) + '...',
            title: l.title?.substring(0, 30)
          })));
        }
        
        const listingIds = sellerListings.map(l => l.id);
        
        if (listingIds.length === 0) {
          console.log('❌ No listings found for seller - returning empty array');
          console.log('='.repeat(80) + '\n');
          rfqs = [];
        } else {
          console.log('\n📍 Step 2: Query RFQs with WHERE clause:');
          console.log('   listing_id IN:', listingIds.length, 'IDs');
          console.log('   status IN: [SUBMITTED, QUOTED, ACCEPTED, REJECTED]');
          
          rfqs = await prisma.rfqs.findMany({
            where: { 
              listing_id: { in: listingIds },
              status: { in: ['SUBMITTED', 'QUOTED', 'ACCEPTED', 'REJECTED'] }
            },
            include: {
              listings: {
                select: {
                  id: true,
                  title: true,
                }
              },
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                }
              },
              quotes: {
                where: { seller_id: userId },
                select: {
                  id: true,
                  status: true,
                }
              }
            },
            orderBy: { submitted_at: 'desc' }
          });
          
          console.log('\n📍 Step 3: Query Results');
          console.log('   ✅ Found', rfqs.length, 'RFQs');
          
          if (rfqs.length > 0) {
            console.log('\n   First 3 RFQs:');
            rfqs.slice(0, 3).forEach((rfq, i) => {
              console.log(`   ${i + 1}. ID: ${rfq.id.substring(0, 8)}...`);
              console.log(`      Buyer: ${rfq.buyer_id}`);
              console.log(`      Status: ${rfq.status}`);
              console.log(`      Listing: ${rfq.listings?.title?.substring(0, 40) || 'N/A'}`);
              console.log(`      User object: ${rfq.users ? '✅ EXISTS' : '❌ NULL'}`);
              if (rfq.users) {
                console.log(`        - email: ${rfq.users.email}`);
                console.log(`        - display_name: ${rfq.users.display_name || '(null)'}`);
              }
            });
            
            // Check for missing users
            const missingUsers = rfqs.filter(r => !r.users);
            if (missingUsers.length > 0) {
              console.log(`\n   ⚠️ WARNING: ${missingUsers.length} RFQs have NULL users!`);
              console.log(`   Missing user RFQ IDs:`, missingUsers.slice(0, 3).map(r => r.id.substring(0, 8)));
            }
          }
          
          console.log('='.repeat(80) + '\n');
        }
      } else {
        // Default case - return empty or error
        console.log('=== UNKNOWN VIEW TYPE ===');
        console.log('View parameter:', view);
        console.log('Valid options: sent, received');
        
        return reply.status(400).send({
          success: false,
          message: 'Invalid view parameter. Use "sent" or "received"'
        });
      }

      console.log(`\n✅ FINAL: Returning ${rfqs.length} RFQs to frontend`);
      console.log(`Response data type: ${Array.isArray(rfqs) ? 'Array' : typeof rfqs}`);
      console.log(`Response structure: { success: true, data: Array(${rfqs.length}) }\n`);

      return reply.send({
        success: true,
        data: rfqs
      });
    } catch (error: any) {
      fastify.log.error('Error fetching RFQs:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch RFQs',
        error: error.message
      });
    }
  });

  // GET /rfqs/:id - Chi tiết RFQ
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
      const rfq = await prisma.rfqs.findUnique({
        where: { id },
        include: {
          listings: {
            select: {
              id: true,
              title: true,
              description: true,
              price_amount: true,
              price_currency: true,
              rental_unit: true,
              min_rental_duration: true,
              max_rental_duration: true,
              deal_type: true,
              status: true,
              seller_user_id: true,
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                }
              },
              containers: {
                select: {
                  id: true,
                  type: true,
                  size_ft: true,
                  iso_code: true,
                  condition: true,
                }
              },
              listing_facets: {
                select: {
                  key: true,
                  value: true,
                }
              }
            }
          },
          users: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          quotes: {
            include: {
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                }
              },
              quote_items: true,
            },
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!rfq) {
        return reply.status(404).send({
          success: false,
          message: 'RFQ not found'
        });
      }

      // Check access: buyer or seller của listing
      const isBuyer = rfq.buyer_id === userId;
      
      // Get seller from included listing data
      const isSeller = rfq.listings?.seller_user_id === userId;

      console.log('=== RFQ DETAIL ACCESS CHECK ===');
      console.log('RFQ ID:', id);
      console.log('Current User ID:', userId);
      console.log('Buyer ID:', rfq.buyer_id);
      console.log('Seller ID:', rfq.listings?.seller_user_id);
      console.log('Is Buyer:', isBuyer);
      console.log('Is Seller:', isSeller);
      console.log('================================');

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to view this RFQ'
        });
      }

      // 🆕 Fetch detailed container information if selected_container_ids exists
      let selectedContainersDetails = null;
      if (rfq.selected_container_ids && rfq.selected_container_ids.length > 0) {
        selectedContainersDetails = await prisma.listing_containers.findMany({
          where: {
            listing_id: rfq.listing_id,
            container_iso_code: { in: rfq.selected_container_ids as string[] }
          },
          select: {
            id: true,
            container_iso_code: true,
            shipping_line: true,
            manufactured_year: true,
            status: true,
          }
        });
      }

      // 🆕 Add selected containers details to response
      const rfqWithContainers = {
        ...rfq,
        selected_containers_details: selectedContainersDetails
      };

      return reply.send({
        success: true,
        data: rfqWithContainers
      });
    } catch (error: any) {
      fastify.log.error('Error fetching RFQ:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch RFQ',
        error: error.message
      });
    }
  });

  // POST /rfqs - Tạo RFQ mới
  fastify.post<{ Body: CreateRFQBody }>('/', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err: any) {
        console.error('JWT Verification failed for RFQ creation:', {
          error: err.message,
          hasAuthHeader: !!request.headers.authorization,
          authHeaderPreview: request.headers.authorization?.substring(0, 20),
          hasCookie: !!request.cookies?.accessToken,
          cookiePreview: request.cookies?.accessToken?.substring(0, 20),
          url: request.url,
          method: request.method
        });
        
        return reply.status(401).send({ 
          success: false, 
          message: 'Unauthorized',
          error: 'TOKEN_INVALID_OR_EXPIRED',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    }
  }, async (request, reply) => {
    const userId = (request.user as any).userId;
    const { 
      listing_id, 
      purpose, 
      quantity, 
      need_by, 
      services,
      selected_container_ids,
      rental_duration_months
    } = request.body;

    console.log('=== CREATE RFQ DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', request.body);
    console.log('listing_id:', listing_id);
    console.log('purpose:', purpose);
    console.log('quantity:', quantity);
    console.log('services:', services);
    console.log('selected_container_ids:', selected_container_ids);
    console.log('rental_duration_months:', rental_duration_months);
    console.log('========================');

    try {
      // Validate listing exists
      const listing = await prisma.listings.findUnique({
        where: { id: listing_id }
      });

      if (!listing) {
        return reply.status(404).send({
          success: false,
          message: 'Listing not found'
        });
      }

      if (listing.seller_user_id === userId) {
        return reply.status(400).send({
          success: false,
          message: 'Cannot create RFQ for your own listing'
        });
      }

      // Validate listing status
      const allowedStatuses = ['APPROVED', 'PUBLISHED', 'ACTIVE', 'AVAILABLE'];
      if (!allowedStatuses.includes(listing.status)) {
        return reply.status(400).send({
          success: false,
          message: `Listing is not available for RFQ. Current status: ${listing.status}`
        });
      }
      
      // ============ 🆕 VALIDATE & RESERVE SELECTED CONTAINERS ============
      let effectiveQuantity = quantity;
      let finalSelectedContainerIds = selected_container_ids || [];
      
      // Use transaction to ensure atomicity
      const rfq = await prisma.$transaction(async (tx) => {
        // 🔧 AUTO-SELECT CONTAINERS when quantity mode is used
        if (!selected_container_ids || selected_container_ids.length === 0) {
          console.log('🔧 [RFQ] AUTO-SELECT MODE: Selecting first', quantity, 'available containers');
          
          // Get first N available containers ordered by creation date (first in, first out)
          const availableContainers = await tx.listing_containers.findMany({
            where: {
              listing_id: listing_id,
              status: 'AVAILABLE',
              deleted_at: null
            },
            select: {
              container_iso_code: true
            },
            orderBy: {
              created_at: 'asc' // First created first (FIFO)
            },
            take: quantity
          });
          
          console.log('🔍 [RFQ] Found', availableContainers.length, 'available containers');
          
          if (availableContainers.length < quantity) {
            throw new Error(`Not enough containers available. Requested: ${quantity}, Available: ${availableContainers.length}`);
          }
          
          // Extract container ISO codes
          finalSelectedContainerIds = availableContainers.map(c => c.container_iso_code);
          console.log('✅ [RFQ] Auto-selected containers:', finalSelectedContainerIds);
        }
        
        // Validate selected containers if provided
        if (finalSelectedContainerIds && finalSelectedContainerIds.length > 0) {
          console.log('🔒 [RFQ] Validating and reserving containers:', finalSelectedContainerIds);
          
          // Lock containers with FOR UPDATE to prevent race conditions
          const containers = await tx.$queryRaw<any[]>`
            SELECT * FROM listing_containers
            WHERE listing_id = ${listing_id}
              AND container_iso_code = ANY(${finalSelectedContainerIds}::text[])
              AND deleted_at IS NULL
            FOR UPDATE NOWAIT
          `;
          
          console.log('🔍 [RFQ] Found containers:', containers.length);
          
          if (containers.length !== finalSelectedContainerIds.length) {
            throw new Error(`Some selected containers do not exist. Requested: ${finalSelectedContainerIds.length}, Found: ${containers.length}`);
          }
          
          // Check if all containers are AVAILABLE
          const unavailableContainers = containers.filter(c => c.status !== 'AVAILABLE');
          if (unavailableContainers.length > 0) {
            const unavailableCodes = unavailableContainers.map(c => `${c.container_iso_code} (${c.status})`).join(', ');
            throw new Error(`${unavailableContainers.length} container(s) not available: ${unavailableCodes}`);
          }
          
          // Use selected containers count as effective quantity
          effectiveQuantity = finalSelectedContainerIds.length;
        }

        // Calculate reservation expiry (7 days from now)
        const reservedUntil = new Date();
        reservedUntil.setDate(reservedUntil.getDate() + 7);

        // Calculate RFQ expired date (7 days from now)
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 7);

        // Convert purpose to RFQPurpose enum
        let purposeEnum: string;
        const purposeLower = purpose?.toLowerCase();
        if (purposeLower === 'sale' || purposeLower === 'purchase') {
          purposeEnum = 'PURCHASE';
        } else if (purposeLower === 'rental' || purposeLower === 'rent') {
          purposeEnum = 'RENTAL';
        } else if (purposeLower === 'inquiry' || purposeLower === 'question') {
          purposeEnum = 'INQUIRY';
        } else {
          purposeEnum = 'PURCHASE'; // default
        }

        // Create RFQ
        const newRfq = await tx.rfqs.create({
          data: {
            id: randomUUID(),
            listing_id: listing_id,
            buyer_id: userId,
            purpose: purposeEnum as any,
            quantity: effectiveQuantity,
            need_by: need_by ? new Date(need_by) : null,
            services_json: services || {},
            selected_container_ids: finalSelectedContainerIds || [],
            rental_duration_months: rental_duration_months || null, // 🆕 Lưu thời gian thuê
            status: 'SUBMITTED',
            submitted_at: new Date(),
            expired_at: expiredAt,
            updated_at: new Date(),
          },
          include: {
            listings: {
              select: {
                id: true,
                title: true,
                price_amount: true,
                price_currency: true,
                seller_user_id: true,
                containers: {
                  select: {
                    type: true,
                    size_ft: true,
                  }
                }
              }
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true,
              }
            }
          }
        });

        // ============ 🔒 RESERVE CONTAINERS FOR THIS RFQ ============
        if (finalSelectedContainerIds && finalSelectedContainerIds.length > 0) {
          const updateResult = await tx.listing_containers.updateMany({
            where: {
              listing_id: listing_id,
              container_iso_code: { in: finalSelectedContainerIds },
              status: 'AVAILABLE' // Only update if still AVAILABLE
            },
            data: {
              status: 'RESERVED',
              reserved_by_rfq_id: newRfq.id,
              reserved_until: reservedUntil,
              updated_at: new Date()
            }
          });

          console.log(`✅ [RFQ] Reserved ${updateResult.count} containers for RFQ ${newRfq.id}`);
          console.log(`   Container codes: ${finalSelectedContainerIds.join(', ')}`);
          console.log(`   Reserved until: ${reservedUntil.toISOString()}`);

          if (updateResult.count !== finalSelectedContainerIds.length) {
            console.warn(`⚠️  [RFQ] Expected to reserve ${finalSelectedContainerIds.length} containers, but only reserved ${updateResult.count}`);
            throw new Error(`Failed to reserve all containers. Some may have been reserved by others.`);
          }

          // ✅ DECREMENT available_quantity and INCREMENT reserved_quantity when reserving containers
          console.log(`⬇️  [RFQ] Decrementing available_quantity and incrementing reserved_quantity by ${updateResult.count} for listing ${listing_id}`);
          await tx.listings.update({
            where: { id: listing_id },
            data: {
              available_quantity: {
                decrement: updateResult.count
              },
              reserved_quantity: {
                increment: updateResult.count
              },
              updated_at: new Date()
            }
          });
          console.log(`✅ [RFQ] Updated quantities successfully`);
        }

        return newRfq;
      });

      // 🔔 Notify seller about new RFQ
      if (rfq.listings && rfq.users) {
        const buyerName = rfq.users.display_name || rfq.users.email || 'Người mua';
        const listingTitle = rfq.listings.title || 'Container';
        
        await NotificationService.createNotification({
          userId: rfq.listings.seller_user_id,
          type: 'rfq_received',
          title: 'Yêu cầu báo giá mới',
          message: `${buyerName} đã gửi yêu cầu báo giá cho ${listingTitle} (${effectiveQuantity} container)`,
          orderData: {
            rfqId: rfq.id,
            listingId: rfq.listing_id,
            buyerName: buyerName,
            quantity: effectiveQuantity,
            purpose: rfq.purpose,
            selectedContainers: finalSelectedContainerIds || []
          }
        });
        
        console.log('✅ Sent RFQ notification to seller:', rfq.listings.seller_user_id);
      }

      return reply.status(201).send({
        success: true,
        message: 'RFQ created successfully',
        data: rfq
      });
    } catch (error: any) {
      fastify.log.error('Error creating RFQ:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create RFQ',
        error: error.message
      });
    }
  });

  // GET /rfqs/:id/quotes - Lấy tất cả quotes cho một RFQ
  fastify.get<{ Params: { id: string } }>('/:id/quotes', {
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
      // Verify RFQ exists and user has access
      const rfq = await prisma.rfqs.findUnique({
        where: { id },
        include: {
          listings: {
            select: { seller_user_id: true }
          }
        }
      });

      if (!rfq) {
        return reply.status(404).send({
          success: false,
          message: 'RFQ not found'
        });
      }

      const isBuyer = rfq.buyer_id === userId;
      const isSeller = rfq.listings.seller_user_id === userId;

      console.log('=== RFQ QUOTES ACCESS CHECK ===');
      console.log('RFQ ID:', id);
      console.log('Current User ID:', userId);
      console.log('Buyer ID:', rfq.buyer_id);
      console.log('Seller ID:', rfq.listings.seller_user_id);
      console.log('Is Buyer:', isBuyer);
      console.log('Is Seller:', isSeller);
      console.log('================================');

      if (!isBuyer && !isSeller) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to view quotes for this RFQ'
        });
      }

      // Fetch quotes
      const quotes = await prisma.quotes.findMany({
        where: { rfq_id: id },
        include: {
          users: {
            select: {
              id: true,
              display_name: true,
              email: true,
            }
          },
          quote_items: true,
        },
        orderBy: { created_at: 'desc' }
      });

      return reply.send({
        success: true,
        data: quotes
      });
    } catch (error: any) {
      fastify.log.error('Error fetching quotes:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch quotes',
        error: error.message
      });
    }
  });
}


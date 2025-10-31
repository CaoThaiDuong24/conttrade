// @ts-nocheck
import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma.js';
import { ListingNotificationService } from '../../lib/notifications/listing-notifications.js';

export default async function adminListingsRoutes(fastify: FastifyInstance) {
  // Admin authentication middleware
  const adminAuth = async (request: any, reply: any) => {
    try {
      console.log('=== ADMIN AUTH DEBUG ===');
      
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Token found:', token.substring(0, 20) + '...');
        
        // Manually verify JWT
        const decoded = fastify.jwt.verify(token);
        request.user = decoded;
        console.log('JWT decoded user:', decoded);
      } else {
        console.log('No Bearer token, trying jwtVerify');
        // Try default jwtVerify (cookies, etc.)
        await request.jwtVerify();
        console.log('jwtVerify success, user:', request.user);
      }
      
      // Check if user has admin role
      const user = await prisma.users.findUnique({
        where: { id: request.user.userId },
        include: { 
          user_roles_user_roles_user_idTousers: { 
            include: { roles: true } 
          } 
        }
      });
      
      console.log('User lookup result:', user ? 'Found' : 'Not found');
      if (user) {
        console.log('User roles:', user.user_roles_user_roles_user_idTousers);
      }
      
      if (!user || !user.user_roles_user_roles_user_idTousers.some((ur: any) => ur.roles.code === 'admin')) {
        console.log('Access denied - not admin');
        return reply.status(403).send({ success: false, message: 'Access denied - Admin role required' });
      }
      
      console.log('Admin authentication successful');
    } catch (err: any) {
      console.log('Admin auth error:', err.message);
      return reply.status(401).send({ success: false, message: 'Unauthorized', error: err.message });
    }
  };

  /**
   * ROUTE ORDER IS CRITICAL!
   * Specific routes MUST come before dynamic parameter routes
   * Order: /pending -> / -> /:id/status -> /:id
   */

  // GET /admin/listings/pending - Get pending listings
  fastify.get('/pending', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const listings = await prisma.listings.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: {
          users: {
            select: { id: true, email: true, display_name: true }
          },
          depots: {
            select: { id: true, name: true, province: true }
          },
          listing_media: true
        },
        orderBy: { created_at: 'asc' }
      });

      return reply.send({
        success: true,
        data: listings,
        count: listings.length
      });
    } catch (error) {
      console.error('Admin get pending listings error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  });

  // GET /admin/listings - Get all listings (admin view)
  fastify.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, status, search, sellerId } = request.query as any;
      
      // Convert to numbers (query params are strings)
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      let where: any = {};
      if (status) where.status = status;
      if (sellerId) where.seller_user_id = sellerId;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [listings, totalCount] = await Promise.all([
        prisma.listings.findMany({
          where,
          skip: offset,
          take: limitNum,
          include: {
            users: {
              select: { id: true, email: true, display_name: true }
            },
            depots: {
              select: { id: true, name: true, province: true }
            },
            listing_facets: true,
            listing_media: true
          },
          orderBy: { created_at: 'desc' }
        }),
        prisma.listings.count({ where })
      ]);

      // Add status info for admin listings
      const listingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status }
          });
          
          return {
            ...listing,
            statusName: statusInfo?.name_vi || listing.status,
            statusColor: statusInfo?.metadata?.color || '#gray'
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          listings: listingsWithStatusNames,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Admin get listings error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  });

  // PUT /admin/listings/:id/status - Approve/Reject listing (MUST be before /:id)
  fastify.put('/:id/status', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { status, rejectionReason } = request.body as any;

      console.log('=== ADMIN APPROVE/REJECT LISTING ===');
      console.log('Listing ID:', id);
      console.log('New status:', status);
      console.log('Rejection reason:', rejectionReason);
      console.log('Admin user:', request.user);

      // Validate status - Admin can only APPROVE (ACTIVE) or REJECT
      if (!['ACTIVE', 'REJECTED'].includes(status)) {
        return reply.status(400).send({
          success: false,
          message: 'Admin can only APPROVE (set to ACTIVE) or REJECT listings'
        });
      }

      // Check listing exists and is PENDING_REVIEW
      const existingListing = await prisma.listings.findUnique({
        where: { id },
        include: {
          users: {
            select: { id: true, email: true, display_name: true }
          }
        }
      });

      if (!existingListing) {
        return reply.status(404).send({
          success: false,
          message: 'Listing not found'
        });
      }

      // Update status
      const updatedListing = await prisma.listings.update({
        where: { id },
        data: {
          status,
          rejection_reason: status === 'REJECTED' ? rejectionReason : null,
          approved_at: status === 'ACTIVE' ? new Date() : null,
          approved_by: status === 'ACTIVE' ? request.user.userId : null
        }
      });

      // Send notification to seller
      try {
        if (status === 'ACTIVE') {
          await ListingNotificationService.notifyListingApproved(
            existingListing.seller_user_id,
            id,
            existingListing.title
          );
        } else if (status === 'REJECTED') {
          await ListingNotificationService.notifyListingRejected(
            existingListing.seller_user_id,
            id,
            existingListing.title,
            rejectionReason || 'No reason provided'
          );
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }

      return reply.send({
        success: true,
        message: `Listing ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully`,
        data: updatedListing
      });
    } catch (error) {
      console.error('=== ADMIN APPROVE/REJECT ERROR ===');
      console.error('Error details:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  });

  // GET /admin/listings/:id - Get listing details (MUST be last among :id routes)
  fastify.get('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      console.log('📄 Admin GET listing detail - ID:', id);
      console.log('📄 User from token:', (request.user as any)?.userId);

      const listing = await prisma.listings.findUnique({
        where: { id },
        include: {
          users: {
            select: { id: true, email: true, display_name: true }
          },
          depots: {
            select: { id: true, name: true, province: true }
          },
          listing_facets: true,
          listing_media: true
          // md_listing_statuses removed - not a relation in schema
        }
      });

      if (!listing) {
        console.log('❌ Listing not found:', id);
        return reply.status(404).send({
          success: false,
          message: 'Listing not found'
        });
      }

      console.log('✅ Listing found:', listing.id, listing.title);
      return reply.send({
        success: true,
        data: {
          listing: listing
        }
      });
    } catch (error) {
      console.error('❌ Admin get listing detail error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  });
}

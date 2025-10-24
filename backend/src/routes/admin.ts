// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';
import adminUserRoutes from './admin/users';
import { ListingNotificationService } from '../lib/notifications/listing-notifications';
import { runAllCronJobs } from '../services/cron-jobs.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  
  // Test route không cần auth để debug
  fastify.get('/test', async (request, reply) => {
    return reply.send({
      success: true,
      message: 'Admin route working',
      timestamp: new Date()
    });
  });

  // Register admin user management routes
  await fastify.register(adminUserRoutes, { prefix: '/users' });
  // Admin authentication middleware with proper role checking
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
      
      // Check if user has admin role with correct relation name
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

  // Approve/Reject listing - This is the main route for admin approval
  fastify.put('/listings/:id/status', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { status, rejectionReason } = request.body as any;

      console.log('=== ADMIN APPROVE/REJECT LISTING ===');
      console.log('Listing ID:', id);
      console.log('New status:', status);
      console.log('Rejection reason:', rejectionReason);
      console.log('Admin user:', request.user);

      // Validate status - Theo tài liệu: Admin chỉ có thể APPROVE (ACTIVE) hoặc REJECT
      if (!['ACTIVE', 'REJECTED'].includes(status)) {
        return reply.status(400).send({
          success: false,
          message: 'Admin can only APPROVE (set to ACTIVE) or REJECT listings'
        });
      }

      // Kiểm tra listing tồn tại và đang ở trạng thái PENDING_REVIEW  
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

      // Theo tài liệu: Chỉ có thể duyệt listing đang chờ duyệt
      if (existingListing.status !== 'PENDING_REVIEW') {
        return reply.status(400).send({
          success: false,
          message: `Cannot change status. Listing is currently ${existingListing.status}. Only PENDING_REVIEW listings can be approved/rejected.`
        });
      }

      // Update listing status theo tài liệu
      const updateData: any = { 
        status,
        updated_at: new Date(),
        admin_reviewed_by: (request.user as any).userId,
        admin_reviewed_at: new Date()
      };

      // Nếu approve, set published_at 
      if (status === 'ACTIVE') {
        updateData.published_at = new Date();
      }
      
      // Nếu reject, save rejection reason
      if (status === 'REJECTED' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const updatedListing = await prisma.listings.update({
        where: { id },
        data: updateData,
        include: {
          users: {
            select: { id: true, email: true, display_name: true }
          },
          depots: {
            select: { id: true, name: true, province: true }
          },
          listing_facets: true,
          listing_media: true
        }
      });

      console.log('✅ Listing status updated successfully');

      // 🔔 Send notifications after successful update
      if (status === 'ACTIVE') {
        // Notify seller: listing approved
        await ListingNotificationService.notifyListingApproved(
          updatedListing.id,
          updatedListing.seller_user_id,
          updatedListing.title
        );
        console.log('✅ Sent approval notification to seller');
      } else if (status === 'REJECTED' && rejectionReason) {
        // Notify seller: listing rejected
        await ListingNotificationService.notifyListingRejected(
          updatedListing.id,
          updatedListing.seller_user_id,
          updatedListing.title,
          rejectionReason
        );
        console.log('✅ Sent rejection notification to seller');
      }

      return reply.send({
        success: true,
        data: { listing: updatedListing },
        message: `Listing ${status} successfully`
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

  // Admin Listings Management
  fastify.get('/listings', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, status, search, sellerId } = request.query as any;
      const offset = (page - 1) * limit;

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
          take: limit,
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

      // Thêm thông tin status tiếng Việt cho admin listings
      const listingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status },
            select: { name: true, description: true }
          });
          
          return {
            ...listing,
            status_info: statusInfo ? {
              code: listing.status,
              name: statusInfo.name,
              description: statusInfo.description
            } : {
              code: listing.status,
              name: listing.status,
              description: null
            }
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          listings: listingsWithStatusNames,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get admin listings error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get listing details for admin
  fastify.get('/listings/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const listing = await prisma.listings.findUnique({
        where: { id },
        include: {
          users: {
            select: { id: true, email: true, display_name: true, phone: true }
          },
          depots: {
            select: { id: true, name: true, province: true, address: true }
          },
          listing_facets: true,
          listing_media: true
        }
      });

      if (!listing) {
        return reply.status(404).send({
          success: false,
          message: 'Listing not found'
        });
      }

      return reply.send({
        success: true,
        data: { listing }
      });
    } catch (error) {
      console.error('Get listing details error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get pending listings for admin approval (temporary no auth for testing)
  fastify.get('/listings/pending-test', async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 20
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const where = { status: 'PENDING_REVIEW' };

      const [listings, total] = await Promise.all([
        prisma.listings.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: {
            depots: {
              select: {
                id: true,
                name: true,
                province: true,
                address: true
              }
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true
              }
            },
            listing_facets: true,
            listing_media: {
              select: {
                id: true,
                media_url: true,
                media_type: true
              }
            }
          }
        }),
        prisma.listings.count({ where })
      ]);

      // Thêm thông tin status tiếng Việt cho pending listings
      const listingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status },
            select: { name: true, description: true }
          });
          
          return {
            ...listing,
            status_info: statusInfo ? {
              code: listing.status,
              name: statusInfo.name,
              description: statusInfo.description
            } : {
              code: listing.status,
              name: listing.status,
              description: null
            }
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          listings: listingsWithStatusNames,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get pending listings error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get pending listings for admin approval
  fastify.get('/listings/pending', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 20
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const where = { status: 'PENDING_REVIEW' };

      const [listings, total] = await Promise.all([
        prisma.listings.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: {
            depots: {
              select: {
                id: true,
                name: true,
                province: true,
                address: true
              }
            },
            users: {
              select: {
                id: true,
                display_name: true,
                email: true
              }
            },
            listing_facets: true,
            listing_media: {
              select: {
                id: true,
                media_url: true,
                media_type: true
              }
            }
          }
        }),
        prisma.listings.count({ where })
      ]);

      // Thêm thông tin status tiếng Việt cho pending listings
      const listingsWithStatusNames = await Promise.all(
        listings.map(async (listing) => {
          const statusInfo = await prisma.md_listing_statuses.findFirst({
            where: { code: listing.status },
            select: { name: true, description: true }
          });
          
          return {
            ...listing,
            status_info: statusInfo ? {
              code: listing.status,
              name: statusInfo.name,
              description: statusInfo.description
            } : {
              code: listing.status,
              name: listing.status,
              description: null
            }
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          listings: listingsWithStatusNames,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get pending listings error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get dashboard stats
  fastify.get('/stats', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const [
        totalUsers,
        totalListings,
        pendingListings,
        approvedListings,
        rejectedListings,
        activeUsers
      ] = await Promise.all([
        prisma.users.count(),
        prisma.listings.count(),
        prisma.listings.count({ where: { status: 'PENDING_REVIEW' } }),
        prisma.listings.count({ where: { status: 'ACTIVE' } }),
        prisma.listings.count({ where: { status: 'REJECTED' } }),
        prisma.users.count({ where: { status: 'active' } })
      ]);

      return reply.send({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers
          },
          listings: {
            total: totalListings,
            pending: pendingListings,
            approved: approvedListings,
            rejected: rejectedListings
          }
        }
      });
    } catch (error) {
      console.error('Get admin stats error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // ==================== DISPUTE MANAGEMENT ====================

  // GET /admin/disputes - List all disputes with filters
  fastify.get('/disputes', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { status, priority, page = 1, limit = 20 } = request.query as any;
      
      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const [disputes, total] = await Promise.all([
        prisma.disputes.findMany({
          where,
          include: {
            orders: {
              select: {
                id: true,
                order_number: true,
                status: true,
                total: true,
                currency: true
              }
            },
            users_disputes_raised_byTousers: {
              select: {
                id: true,
                display_name: true,
                email: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.disputes.count({ where })
      ]);

      return reply.send({
        success: true,
        data: {
          disputes,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get disputes error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get disputes'
      });
    }
  });

  // GET /admin/disputes/:id - Get dispute details
  fastify.get('/disputes/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              },
              users_orders_seller_idTousers: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              },
              deliveries: {
                select: {
                  id: true,
                  delivery_proof_json: true,
                  receipt_data_json: true,
                  delivered_at: true
                }
              }
            }
          },
          users_disputes_raised_byTousers: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          },
          users_disputes_resolved_byTousers: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          },
          dispute_messages: {
            include: {
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true
                }
              }
            },
            orderBy: { created_at: 'asc' }
          }
        }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      return reply.send({
        success: true,
        data: dispute
      });
    } catch (error) {
      console.error('Get dispute details error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get dispute details'
      });
    }
  });

  // PUT /admin/disputes/:id/resolve - Resolve dispute
  fastify.put('/disputes/:id/resolve', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { 
        resolution_type, 
        resolution_amount, 
        resolution_notes, 
        admin_notes 
      } = request.body as any;

      const adminId = (request.user as any).userId;

      // Validate resolution type
      if (!['FULL_REFUND', 'PARTIAL_REFUND', 'REPLACEMENT', 'REJECT_DISPUTE'].includes(resolution_type)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid resolution type'
        });
      }

      // Get dispute details
      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              users_orders_buyer_idTousers: true,
              users_orders_seller_idTousers: true
            }
          }
        }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      // Update dispute status
      const updatedDispute = await prisma.disputes.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolution: resolution_type,
          resolution_amount: resolution_amount ? Number(resolution_amount) : null,
          resolution_notes,
          admin_notes,
          resolved_by: adminId,
          resolved_at: new Date(),
          updated_at: new Date()
        }
      });

      // Update order status based on resolution
      let newOrderStatus: any = 'COMPLETED';
      if (resolution_type === 'FULL_REFUND') {
        newOrderStatus = 'CANCELLED';
      } else if (resolution_type === 'REPLACEMENT') {
        newOrderStatus = 'READY_FOR_PICKUP'; // Reset to ready for new delivery
      } else if (resolution_type === 'REJECT_DISPUTE') {
        newOrderStatus = 'COMPLETED'; // Dispute rejected, order completed
      }

      await prisma.orders.update({
        where: { id: dispute.order_id },
        data: {
          status: newOrderStatus,
          updated_at: new Date()
        }
      });

      // Send notifications
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        // Notify buyer
        await NotificationService.createNotification({
          userId: dispute.orders.buyer_id,
          type: 'dispute_resolved',
          title: '✅ Tranh chấp đã được giải quyết',
          message: `Tranh chấp #${id.slice(0, 15)} của bạn đã được admin xử lý: ${resolution_type}`,
          orderData: {
            orderId: dispute.order_id,
            disputeId: id,
            resolution: resolution_type,
            notes: resolution_notes
          }
        });

        // Notify seller
        await NotificationService.createNotification({
          userId: dispute.orders.seller_id,
          type: 'dispute_resolved',
          title: 'Tranh chấp đã giải quyết',
          message: `Tranh chấp #${id.slice(0, 15)} cho đơn hàng của bạn đã được xử lý: ${resolution_type}`,
          orderData: {
            orderId: dispute.order_id,
            disputeId: id,
            resolution: resolution_type,
            notes: resolution_notes
          }
        });
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Dispute resolved successfully',
        data: updatedDispute
      });
    } catch (error) {
      console.error('Resolve dispute error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to resolve dispute'
      });
    }
  });

  // POST /api/v1/admin/disputes/:id/messages - Send message in dispute
  fastify.post('/disputes/:id/messages', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { message, is_internal } = request.body as { 
        message: string;
        is_internal?: boolean;
      };
      const adminId = request.user.userId;

      // Check if dispute exists
      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            select: {
              buyer_id: true,
              seller_id: true
            }
          }
        }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      // Create message
      const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newMessage = await prisma.dispute_messages.create({
        data: {
          id: messageId,
          dispute_id: id,
          sender_id: adminId,
          message: message,
          is_internal: is_internal || false,
          created_at: new Date()
        },
        include: {
          users: {
            select: {
              id: true,
              display_name: true,
              email: true
            }
          }
        }
      });

      // Update dispute status to IN_REVIEW if it's OPEN
      if (dispute.status === 'OPEN') {
        await prisma.disputes.update({
          where: { id },
          data: {
            status: 'IN_REVIEW',
            updated_at: new Date()
          }
        });
      }

      // Send notifications if not internal message
      if (!is_internal) {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        
        // Notify buyer
        await NotificationService.createNotification({
          userId: dispute.orders.buyer_id,
          type: 'dispute_message',
          title: '💬 Tin nhắn mới từ Admin',
          message: `Admin đã gửi tin nhắn về tranh chấp #${id.slice(0, 15)}`,
          orderData: {
            orderId: dispute.order_id,
            disputeId: id,
            messageId: messageId
          }
        });

        // Notify seller
        await NotificationService.createNotification({
          userId: dispute.orders.seller_id,
          type: 'dispute_message',
          title: '💬 Tin nhắn mới từ Admin',
          message: `Admin đã gửi tin nhắn về tranh chấp #${id.slice(0, 15)}`,
          orderData: {
            orderId: dispute.order_id,
            disputeId: id,
            messageId: messageId
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Message sent successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Send dispute message error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to send message'
      });
    }
  });

  // PUT /api/v1/admin/disputes/:id/status - Update dispute status
  fastify.put('/disputes/:id/status', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };
      const adminId = request.user.userId;

      // Validate status
      const validStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'ESCALATED'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid status'
        });
      }

      // Update dispute
      const updatedDispute = await prisma.disputes.update({
        where: { id },
        data: {
          status: status as any,
          updated_at: new Date(),
          ...(status === 'IN_REVIEW' ? { assigned_to: adminId } : {})
        }
      });

      return reply.send({
        success: true,
        message: 'Dispute status updated',
        data: updatedDispute
      });
    } catch (error) {
      console.error('Update dispute status error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update status'
      });
    }
  });

  // Manual trigger for cron jobs (testing only)
  fastify.post('/cron/run', { preHandler: adminAuth }, async (request, reply) => {
    try {
      console.log('🔄 [ADMIN] Manual trigger for cron jobs');
      
      const results = await runAllCronJobs();
      
      return reply.send({
        success: true,
        message: 'Cron jobs executed successfully',
        data: results
      });
    } catch (error) {
      console.error('Manual cron trigger error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to run cron jobs',
        error: error.message
      });
    }
  });
}
// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DisputeQueryParams {
  page?: string;
  limit?: string;
  status?: string;
  orderId?: string;
}

interface CreateDisputeBody {
  orderId: string;
  reason: string;
  description: string;
}

interface RespondDisputeBody {
  response: string;
  evidence?: Array<{
    fileUrl: string;
    fileType?: string;
    note?: string;
  }>;
}

interface ResolveDisputeBody {
  resolution: string;
  newStatus: 'RESOLVED' | 'CLOSED' | 'ESCALATED';
}

interface UpdateDisputeStatusBody {
  status: string;
}

interface UploadEvidenceBody {
  fileUrl: string;
  fileType?: string;
  note?: string;
}

// ============================================================================
// ROUTES
// ============================================================================

export default async function disputesRoutes(fastify: FastifyInstance) {
  
  // --------------------------------------------------------------------------
  // GET /api/v1/disputes - List all disputes with filters
  // --------------------------------------------------------------------------
  fastify.get('/api/v1/disputes', async (request: FastifyRequest<{ Querystring: DisputeQueryParams }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { page = '1', limit = '20', status, orderId } = request.query;
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      
      // Filter by status
      if (status) {
        where.status = status.toUpperCase();
      }

      // Filter by orderId
      if (orderId) {
        where.order_id = orderId;
      }

      // User can only see disputes they raised or are involved in (via order)
      // Admin can see all - for now allow all users to see all disputes
      // TODO: Implement proper role-based filtering
      
      // Fetch disputes with pagination
      const [disputes, total] = await Promise.all([
        prisma.disputes.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { created_at: 'desc' },
          include: {
            orders: {
              select: {
                id: true,
                order_number: true,
                status: true,
                users_orders_seller_idTousers: {
                  select: { id: true, display_name: true, email: true }
                },
                users_orders_buyer_idTousers: {
                  select: { id: true, display_name: true, email: true }
                }
              }
            },
            users_disputes_raised_byTousers: {
              select: { id: true, display_name: true, email: true }
            },
            users_disputes_resolved_byTousers: {
              select: { id: true, display_name: true, email: true }
            },
            dispute_evidence: {
              select: {
                id: true,
                file_url: true,
                file_type: true,
                note: true,
                created_at: true,
                users: {
                  select: { id: true, display_name: true }
                }
              },
              orderBy: { created_at: 'desc' },
              take: 3 // Only show first 3 evidence in list view
            }
          }
        }),
        prisma.disputes.count({ where })
      ]);

      return reply.send({
        success: true,
        data: {
          disputes: disputes.map(dispute => ({
            id: dispute.id,
            orderId: dispute.order_id,
            orderNumber: dispute.orders.order_number,
            status: dispute.status,
            reason: dispute.reason,
            description: dispute.description,
            resolution: dispute.resolution,
            raisedBy: dispute.users_disputes_raised_byTousers ? {
              id: dispute.users_disputes_raised_byTousers.id,
              displayName: dispute.users_disputes_raised_byTousers.display_name,
              email: dispute.users_disputes_raised_byTousers.email
            } : null,
            resolvedBy: dispute.users_disputes_resolved_byTousers ? {
              id: dispute.users_disputes_resolved_byTousers.id,
              displayName: dispute.users_disputes_resolved_byTousers.display_name,
              email: dispute.users_disputes_resolved_byTousers.email
            } : null,
            seller: {
              id: dispute.orders.users_orders_seller_idTousers.id,
              displayName: dispute.orders.users_orders_seller_idTousers.display_name,
              email: dispute.orders.users_orders_seller_idTousers.email
            },
            buyer: {
              id: dispute.orders.users_orders_buyer_idTousers.id,
              displayName: dispute.orders.users_orders_buyer_idTousers.display_name,
              email: dispute.orders.users_orders_buyer_idTousers.email
            },
            evidenceCount: dispute.dispute_evidence.length,
            priority: dispute.priority,
            createdAt: dispute.created_at,
            updatedAt: dispute.updated_at,
            resolvedAt: dispute.resolved_at,
            closedAt: dispute.closed_at
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch disputes',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // GET /api/v1/disputes/:id - Get dispute details
  // --------------------------------------------------------------------------
  fastify.get('/api/v1/disputes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;

      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              users_orders_seller_idTousers: {
                select: { id: true, display_name: true, email: true, phone: true }
              },
              users_orders_buyer_idTousers: {
                select: { id: true, display_name: true, email: true, phone: true }
              }
            }
          },
          users_disputes_raised_byTousers: {
            select: { id: true, display_name: true, email: true, phone: true }
          },
          users_disputes_resolved_byTousers: {
            select: { id: true, display_name: true, email: true, phone: true }
          },
          users_disputes_assigned_toTousers: {
            select: { id: true, display_name: true, email: true, phone: true }
          },
          dispute_evidence: {
            include: {
              users: {
                select: { id: true, display_name: true, email: true }
              }
            },
            orderBy: { created_at: 'asc' }
          },
          dispute_messages: {
            include: {
              users: {
                select: { id: true, display_name: true, email: true }
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

      // TODO: Check permissions - for now allow access
      // const isInvolved = 
      //   dispute.raised_by === userId ||
      //   dispute.orders.seller_id === userId ||
      //   dispute.orders.buyer_id === userId;

      return reply.send({
        success: true,
        data: {
          dispute: {
            id: dispute.id,
            orderId: dispute.order_id,
            orderNumber: dispute.orders.order_number,
            orderStatus: dispute.orders.status,
            status: dispute.status,
            priority: dispute.priority,
            reason: dispute.reason,
            description: dispute.description,
            resolution: dispute.resolution,
            resolutionNotes: dispute.resolution_notes,
            requestedResolution: dispute.requested_resolution,
            requestedAmount: dispute.requested_amount,
            resolutionAmount: dispute.resolution_amount,
            adminNotes: dispute.admin_notes,
            raisedBy: dispute.users_disputes_raised_byTousers ? {
              id: dispute.users_disputes_raised_byTousers.id,
              displayName: dispute.users_disputes_raised_byTousers.display_name,
              email: dispute.users_disputes_raised_byTousers.email,
              phone: dispute.users_disputes_raised_byTousers.phone
            } : null,
            resolvedBy: dispute.users_disputes_resolved_byTousers ? {
              id: dispute.users_disputes_resolved_byTousers.id,
              displayName: dispute.users_disputes_resolved_byTousers.display_name,
              email: dispute.users_disputes_resolved_byTousers.email,
              phone: dispute.users_disputes_resolved_byTousers.phone
            } : null,
            assignedTo: dispute.users_disputes_assigned_toTousers ? {
              id: dispute.users_disputes_assigned_toTousers.id,
              displayName: dispute.users_disputes_assigned_toTousers.display_name,
              email: dispute.users_disputes_assigned_toTousers.email,
              phone: dispute.users_disputes_assigned_toTousers.phone
            } : null,
            seller: {
              id: dispute.orders.users_orders_seller_idTousers.id,
              displayName: dispute.orders.users_orders_seller_idTousers.display_name,
              email: dispute.orders.users_orders_seller_idTousers.email,
              phone: dispute.orders.users_orders_seller_idTousers.phone
            },
            buyer: {
              id: dispute.orders.users_orders_buyer_idTousers.id,
              displayName: dispute.orders.users_orders_buyer_idTousers.display_name,
              email: dispute.orders.users_orders_buyer_idTousers.email,
              phone: dispute.orders.users_orders_buyer_idTousers.phone
            },
            evidence: dispute.dispute_evidence.map(ev => ({
              id: ev.id,
              fileUrl: ev.file_url,
              fileType: ev.file_type,
              note: ev.note,
              uploadedBy: ev.users ? {
                id: ev.users.id,
                displayName: ev.users.display_name,
                email: ev.users.email
              } : null,
              createdAt: ev.created_at
            })),
            messages: dispute.dispute_messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              messageType: msg.message_type,
              isInternal: msg.is_internal,
              sender: msg.users ? {
                id: msg.users.id,
                displayName: msg.users.display_name,
                email: msg.users.email
              } : null,
              createdAt: msg.created_at
            })),
            createdAt: dispute.created_at,
            updatedAt: dispute.updated_at,
            resolvedAt: dispute.resolved_at,
            respondedAt: dispute.responded_at,
            escalatedAt: dispute.escalated_at,
            closedAt: dispute.closed_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch dispute details',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // POST /api/v1/disputes - Create a new dispute (raise dispute)
  // --------------------------------------------------------------------------
  fastify.post('/api/v1/disputes', async (request: FastifyRequest<{ Body: CreateDisputeBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { orderId, reason, description } = request.body;

      // Validate input
      if (!orderId || !reason || !description) {
        return reply.status(400).send({
          success: false,
          message: 'orderId, reason, and description are required'
        });
      }

      if (reason.length < 5 || reason.length > 200) {
        return reply.status(400).send({
          success: false,
          message: 'Reason must be between 5 and 200 characters'
        });
      }

      if (description.length < 20 || description.length > 2000) {
        return reply.status(400).send({
          success: false,
          message: 'Description must be between 20 and 2000 characters'
        });
      }

      // Check if order exists
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: { 
          id: true, 
          status: true, 
          seller_id: true, 
          buyer_id: true,
          order_number: true
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        });
      }

      // Only buyer or seller can raise dispute
      if (order.seller_id !== userId && order.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to raise a dispute for this order'
        });
      }

      // Check if order status allows disputes
      const allowedStatuses = ['DELIVERED', 'IN_TRANSIT', 'READY_FOR_PICKUP', 'PAID'];
      if (!allowedStatuses.includes(order.status)) {
        return reply.status(400).send({
          success: false,
          message: `Disputes can only be raised for orders with status: ${allowedStatuses.join(', ')}`
        });
      }

      // Check if there's already an open dispute
      const existingDispute = await prisma.disputes.findFirst({
        where: {
          order_id: orderId,
          status: {
            in: ['OPEN', 'INVESTIGATING', 'ESCALATED']
          }
        }
      });

      if (existingDispute) {
        return reply.status(400).send({
          success: false,
          message: 'There is already an active dispute for this order'
        });
      }

      // Create dispute
      const now = new Date();
      const dispute = await prisma.disputes.create({
        data: {
          id: randomUUID(),
          order_id: orderId,
          raised_by: userId,
          status: 'OPEN',
          reason,
          description,
          priority: 'MEDIUM',
          created_at: now,
          updated_at: now
        },
        include: {
          orders: {
            select: { order_number: true }
          },
          users_disputes_raised_byTousers: {
            select: { id: true, display_name: true, email: true }
          }
        }
      });

      // Update order status to DISPUTED
      await prisma.orders.update({
        where: { id: orderId },
        data: { 
          status: 'DISPUTED',
          updated_at: now
        }
      });

      // TODO: Send notification to admin and other party
      // await notificationService.sendDisputeOpenedNotification(dispute);

      return reply.status(201).send({
        success: true,
        message: 'Dispute created successfully',
        data: {
          dispute: {
            id: dispute.id,
            orderId: dispute.order_id,
            orderNumber: dispute.orders.order_number,
            status: dispute.status,
            reason: dispute.reason,
            description: dispute.description,
            raisedBy: dispute.users_disputes_raised_byTousers ? {
              id: dispute.users_disputes_raised_byTousers.id,
              displayName: dispute.users_disputes_raised_byTousers.display_name,
              email: dispute.users_disputes_raised_byTousers.email
            } : null,
            createdAt: dispute.created_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create dispute',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // POST /api/v1/disputes/:id/respond - Respond to a dispute
  // --------------------------------------------------------------------------
  fastify.post('/api/v1/disputes/:id/respond', async (request: FastifyRequest<{ Params: { id: string }; Body: RespondDisputeBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;
      const { response, evidence } = request.body;

      if (!response || response.length < 10) {
        return reply.status(400).send({
          success: false,
          message: 'Response must be at least 10 characters'
        });
      }

      // Get dispute
      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            select: { seller_id: true, buyer_id: true }
          }
        }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      // Check permissions - only involved parties can respond
      const isInvolved = 
        dispute.raised_by === userId ||
        dispute.orders.seller_id === userId ||
        dispute.orders.buyer_id === userId;

      if (!isInvolved) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to respond to this dispute'
        });
      }

      // Upload evidence if provided
      if (evidence && evidence.length > 0) {
        const evidenceRecords = evidence.map(ev => ({
          id: randomUUID(),
          dispute_id: id,
          uploader_id: userId,
          file_url: ev.fileUrl,
          file_type: ev.fileType || null,
          note: ev.note || null,
          created_at: new Date()
        }));

        await prisma.dispute_evidence.createMany({
          data: evidenceRecords
        });
      }

      // Create response message
      const now = new Date();
      await prisma.dispute_messages.create({
        data: {
          id: randomUUID(),
          dispute_id: id,
          sender_id: userId,
          content: response,
          message_type: 'RESPONSE',
          is_internal: false,
          created_at: now
        }
      });

      // Update dispute status
      const updatedDispute = await prisma.disputes.update({
        where: { id },
        data: {
          status: dispute.status === 'OPEN' ? 'INVESTIGATING' : dispute.status,
          responded_at: now,
          updated_at: now
        }
      });

      // TODO: Send notification to other party and admin
      // await notificationService.sendDisputeResponseNotification(updatedDispute);

      return reply.send({
        success: true,
        message: 'Response submitted successfully',
        data: {
          dispute: {
            id: updatedDispute.id,
            status: updatedDispute.status,
            updatedAt: updatedDispute.updated_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to submit response',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // PATCH /api/v1/disputes/:id/resolve - Resolve a dispute (Admin only)
  // --------------------------------------------------------------------------
  fastify.patch('/api/v1/disputes/:id/resolve', async (request: FastifyRequest<{ Params: { id: string }; Body: ResolveDisputeBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;
      const { resolution, newStatus } = request.body;

      if (!resolution || resolution.length < 10) {
        return reply.status(400).send({
          success: false,
          message: 'Resolution must be at least 10 characters'
        });
      }

      if (!['RESOLVED', 'CLOSED', 'ESCALATED'].includes(newStatus)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid status. Must be RESOLVED, CLOSED, or ESCALATED'
        });
      }

      // TODO: Check if user is admin
      // For now, allow all users

      // Get dispute
      const dispute = await prisma.disputes.findUnique({
        where: { id },
        select: { id: true, order_id: true, status: true }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      if (dispute.status === 'CLOSED') {
        return reply.status(400).send({
          success: false,
          message: 'Cannot resolve a closed dispute'
        });
      }

      // Update dispute
      const now = new Date();
      const updatedDispute = await prisma.disputes.update({
        where: { id },
        data: {
          status: newStatus,
          resolution,
          resolved_by: userId,
          resolved_at: now,
          closed_at: newStatus === 'CLOSED' ? now : null,
          updated_at: now
        }
      });

      // Update order status back to DELIVERED if resolved/closed
      if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
        await prisma.orders.update({
          where: { id: dispute.order_id },
          data: { 
            status: 'DELIVERED',
            updated_at: now
          }
        });
      }

      // TODO: Send notification to all parties
      // await notificationService.sendDisputeResolvedNotification(updatedDispute);

      return reply.send({
        success: true,
        message: 'Dispute resolved successfully',
        data: {
          dispute: {
            id: updatedDispute.id,
            status: updatedDispute.status,
            resolution: updatedDispute.resolution,
            resolvedAt: updatedDispute.resolved_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to resolve dispute',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // PATCH /api/v1/disputes/:id/status - Update dispute status
  // --------------------------------------------------------------------------
  fastify.patch('/api/v1/disputes/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateDisputeStatusBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;
      const { status } = request.body;

      // Validate status
      const validStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'ESCALATED'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // TODO: Check if user is admin

      // Update dispute
      const updatedDispute = await prisma.disputes.update({
        where: { id },
        data: {
          status,
          updated_at: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Dispute status updated successfully',
        data: {
          dispute: {
            id: updatedDispute.id,
            status: updatedDispute.status,
            updatedAt: updatedDispute.updated_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update dispute status',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // POST /api/v1/disputes/:id/evidence - Upload evidence
  // --------------------------------------------------------------------------
  fastify.post('/api/v1/disputes/:id/evidence', async (request: FastifyRequest<{ Params: { id: string }; Body: UploadEvidenceBody }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params;
      const { fileUrl, fileType, note } = request.body;

      if (!fileUrl) {
        return reply.status(400).send({
          success: false,
          message: 'fileUrl is required'
        });
      }

      // Get dispute
      const dispute = await prisma.disputes.findUnique({
        where: { id },
        include: {
          orders: {
            select: { seller_id: true, buyer_id: true }
          }
        }
      });

      if (!dispute) {
        return reply.status(404).send({
          success: false,
          message: 'Dispute not found'
        });
      }

      // Check permissions
      const isInvolved = 
        dispute.raised_by === userId ||
        dispute.orders.seller_id === userId ||
        dispute.orders.buyer_id === userId;

      if (!isInvolved) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to upload evidence for this dispute'
        });
      }

      // Create evidence record
      const evidence = await prisma.dispute_evidence.create({
        data: {
          id: randomUUID(),
          dispute_id: id,
          uploader_id: userId,
          file_url: fileUrl,
          file_type: fileType || null,
          note: note || null,
          created_at: new Date()
        },
        include: {
          users: {
            select: { id: true, display_name: true, email: true }
          }
        }
      });

      return reply.status(201).send({
        success: true,
        message: 'Evidence uploaded successfully',
        data: {
          evidence: {
            id: evidence.id,
            fileUrl: evidence.file_url,
            fileType: evidence.file_type,
            note: evidence.note,
            uploadedBy: evidence.users ? {
              id: evidence.users.id,
              displayName: evidence.users.display_name,
              email: evidence.users.email
            } : null,
            createdAt: evidence.created_at
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to upload evidence',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // DELETE /api/v1/disputes/:id/evidence/:evidenceId - Delete evidence
  // --------------------------------------------------------------------------
  fastify.delete('/api/v1/disputes/:id/evidence/:evidenceId', async (request: FastifyRequest<{ Params: { id: string; evidenceId: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;
      const { id, evidenceId } = request.params;

      // Get evidence
      const evidence = await prisma.dispute_evidence.findUnique({
        where: { id: evidenceId },
        select: { uploader_id: true, dispute_id: true }
      });

      if (!evidence) {
        return reply.status(404).send({
          success: false,
          message: 'Evidence not found'
        });
      }

      if (evidence.dispute_id !== id) {
        return reply.status(400).send({
          success: false,
          message: 'Evidence does not belong to this dispute'
        });
      }

      // Check permissions - only uploader can delete (or admin)
      const isUploader = evidence.uploader_id === userId;
      // TODO: Check if user is admin

      if (!isUploader) {
        return reply.status(403).send({
          success: false,
          message: 'You do not have permission to delete this evidence'
        });
      }

      // Delete evidence
      await prisma.dispute_evidence.delete({
        where: { id: evidenceId }
      });

      return reply.send({
        success: true,
        message: 'Evidence deleted successfully'
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete evidence',
        error: error.message
      });
    }
  });

  // --------------------------------------------------------------------------
  // GET /api/v1/disputes/stats - Get dispute statistics (Admin only)
  // --------------------------------------------------------------------------
  fastify.get('/api/v1/disputes/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).userId;

      // TODO: Check if user is admin
      // For now, allow all users

      // Get counts by status
      const [
        totalDisputes,
        openDisputes,
        investigatingDisputes,
        resolvedDisputes,
        closedDisputes,
        escalatedDisputes
      ] = await Promise.all([
        prisma.disputes.count(),
        prisma.disputes.count({ where: { status: 'OPEN' } }),
        prisma.disputes.count({ where: { status: 'INVESTIGATING' } }),
        prisma.disputes.count({ where: { status: 'RESOLVED' } }),
        prisma.disputes.count({ where: { status: 'CLOSED' } }),
        prisma.disputes.count({ where: { status: 'ESCALATED' } })
      ]);

      // Average resolution time (in days)
      const resolvedDisputesWithTime = await prisma.disputes.findMany({
        where: { 
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolved_at: { not: null }
        },
        select: { created_at: true, resolved_at: true }
      });

      let avgResolutionTime = 0;
      if (resolvedDisputesWithTime.length > 0) {
        const totalTime = resolvedDisputesWithTime.reduce((sum, dispute) => {
          const time = (dispute.resolved_at!.getTime() - dispute.created_at.getTime()) / (1000 * 60 * 60 * 24);
          return sum + time;
        }, 0);
        avgResolutionTime = totalTime / resolvedDisputesWithTime.length;
      }

      return reply.send({
        success: true,
        data: {
          stats: {
            total: totalDisputes,
            byStatus: {
              open: openDisputes,
              investigating: investigatingDisputes,
              resolved: resolvedDisputes,
              closed: closedDisputes,
              escalated: escalatedDisputes
            },
            active: openDisputes + investigatingDisputes + escalatedDisputes,
            resolutionRate: totalDisputes > 0 ? ((resolvedDisputes + closedDisputes) / totalDisputes * 100).toFixed(2) : '0',
            avgResolutionTimeDays: avgResolutionTime.toFixed(1)
          }
        }
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch dispute statistics',
        error: error.message
      });
    }
  });
}

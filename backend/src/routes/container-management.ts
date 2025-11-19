/**
 * Container Management Routes for Rental Listings
 * Handles container status, maintenance, and inventory
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function containerManagementRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/listings/:listingId/containers - Get containers by status
  // ============================================================
  fastify.get('/listings/:listingId/containers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { listingId } = request.params as { listingId: string };
      const { status, groupBy } = request.query as any;

      const where: any = {
        listing_id: listingId,
        deleted_at: null,
      };

      if (status) {
        where.status = status;
      }

      const containers = await prisma.listing_containers.findMany({
        where,
        include: {
          rental_contracts: {
            where: {
              status: 'ACTIVE',
              deleted_at: null,
            },
            include: {
              buyer: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  phone: true,
                  avatar_url: true,
                },
              },
            },
            take: 1,
            orderBy: {
              created_at: 'desc',
            },
          },
          maintenance_logs: {
            where: {
              deleted_at: null,
              status: {
                in: ['SCHEDULED', 'IN_PROGRESS'],
              },
            },
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Group by status if requested
      let groupedData = null;
      if (groupBy === 'status') {
        groupedData = {
          available: containers.filter(c => c.status === 'AVAILABLE'),
          rented: containers.filter(c => c.status === 'RENTED'),
          maintenance: containers.filter(c => c.status === 'IN_MAINTENANCE'),
          reserved: containers.filter(c => c.status === 'RESERVED'),
          sold: containers.filter(c => c.status === 'SOLD'),
        };
      }

      // Get summary
      const summary = {
        total: containers.length,
        available: containers.filter(c => c.status === 'AVAILABLE').length,
        rented: containers.filter(c => c.status === 'RENTED').length,
        maintenance: containers.filter(c => c.status === 'IN_MAINTENANCE').length,
        reserved: containers.filter(c => c.status === 'RESERVED').length,
        sold: containers.filter(c => c.status === 'SOLD').length,
      };

      return reply.send({
        success: true,
        data: {
          containers: groupBy === 'status' ? groupedData : containers,
          summary,
        },
      });
    } catch (error: any) {
      console.error('Error fetching containers:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch containers',
        error: error.message,
      });
    }
  });

  // ============================================================
  // POST /api/v1/listings/:listingId/containers/:containerId/maintenance
  // Create maintenance log for a container
  // ============================================================
  fastify.post('/listings/:listingId/containers/:containerId/maintenance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { listingId, containerId } = request.params as { listingId: string; containerId: string };
      const {
        maintenanceType,
        reason,
        description,
        priority = 'MEDIUM',
        startDate,
        estimatedCompletionDate,
        estimatedCost,
        estimatedDurationDays,
        performedBy,
        technicianName,
        technicianContact,
      } = request.body as any;

      // Validate container exists and belongs to listing
      const container = await prisma.listing_containers.findFirst({
        where: {
          id: containerId,
          listing_id: listingId,
          deleted_at: null,
        },
        include: {
          listing: {
            select: {
              id: true,
              maintenance_quantity: true,
              available_quantity: true,
            },
          },
        },
      });

      if (!container) {
        return reply.status(404).send({
          success: false,
          message: 'Container not found or does not belong to this listing',
        });
      }

      // Check if container is available
      if (container.status !== 'AVAILABLE') {
        return reply.status(400).send({
          success: false,
          message: `Container must be AVAILABLE to move to maintenance. Current status: ${container.status}`,
        });
      }

      // Create maintenance log
      const maintenanceLog = await prisma.container_maintenance_logs.create({
        data: {
          listing_id: listingId,
          container_id: containerId,
          maintenance_type: maintenanceType || 'REPAIR',
          reason,
          description,
          priority,
          start_date: startDate ? new Date(startDate) : new Date(),
          estimated_completion_date: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
          estimated_cost: estimatedCost ? Number(estimatedCost) : null,
          estimated_duration_days: estimatedDurationDays ? Number(estimatedDurationDays) : null,
          performed_by: performedBy,
          technician_name: technicianName,
          technician_contact: technicianContact,
          status: 'SCHEDULED',
        },
      });

      // Update container status to IN_MAINTENANCE
      await prisma.listing_containers.update({
        where: { id: containerId },
        data: {
          status: 'IN_MAINTENANCE',
          notes: `${container.notes || ''}\n[${new Date().toISOString()}] Moved to maintenance: ${reason}`,
        },
      });

      // Update listing quantities
      await prisma.listings.update({
        where: { id: listingId },
        data: {
          available_quantity: {
            decrement: 1,
          },
          maintenance_quantity: {
            increment: 1,
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Container moved to maintenance successfully',
        data: maintenanceLog,
      });
    } catch (error: any) {
      console.error('Error creating maintenance log:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create maintenance log',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/maintenance-logs - Get all maintenance logs
  // ============================================================
  fastify.get('/maintenance-logs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        listingId,
        containerId,
        status,
        priority,
        maintenanceType,
        page = 1,
        limit = 20,
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        deleted_at: null,
      };

      if (listingId) where.listing_id = listingId;
      if (containerId) where.container_id = containerId;
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (maintenanceType) where.maintenance_type = maintenanceType;

      const total = await prisma.container_maintenance_logs.count({ where });

      const logs = await prisma.container_maintenance_logs.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      });

      return reply.send({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching maintenance logs:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch maintenance logs',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/maintenance-logs/:id - Get maintenance log details
  // ============================================================
  fastify.get('/maintenance-logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const log = await prisma.container_maintenance_logs.findUnique({
        where: { id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              seller_user_id: true,
            },
          },
          container: true,
          rental_contract: {
            include: {
              buyer: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!log || log.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Maintenance log not found',
        });
      }

      return reply.send({
        success: true,
        data: log,
      });
    } catch (error: any) {
      console.error('Error fetching maintenance log:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch maintenance log',
        error: error.message,
      });
    }
  });

  // ============================================================
  // PATCH /api/v1/maintenance-logs/:id/complete - Complete maintenance
  // ============================================================
  fastify.patch('/maintenance-logs/:id/complete', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        actualCost,
        actualCompletionDate,
        afterPhotos,
        technicianNotes,
        qualityChecked = false,
        qualityNotes,
        qualityCheckerName,
        partsUsed,
        materialsUsed,
      } = request.body as any;

      // Get maintenance log
      const log = await prisma.container_maintenance_logs.findUnique({
        where: { id },
        include: {
          container: true,
          listing: true,
        },
      });

      if (!log || log.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Maintenance log not found',
        });
      }

      if (log.status === 'COMPLETED') {
        return reply.status(400).send({
          success: false,
          message: 'Maintenance already completed',
        });
      }

      const completionDate = actualCompletionDate ? new Date(actualCompletionDate) : new Date();
      const durationDays = Math.ceil((completionDate.getTime() - new Date(log.start_date).getTime()) / (1000 * 60 * 60 * 24));

      // Update maintenance log
      const updatedLog = await prisma.container_maintenance_logs.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actual_cost: actualCost ? Number(actualCost) : null,
          actual_completion_date: completionDate,
          actual_duration_days: durationDays,
          after_photos: afterPhotos || [],
          technician_notes: technicianNotes,
          quality_checked: qualityChecked,
          quality_check_date: qualityChecked ? new Date() : null,
          quality_notes: qualityNotes,
          quality_checker_name: qualityCheckerName,
          parts_used: partsUsed,
          materials_used: materialsUsed,
          completed_at: new Date(),
        },
      });

      // Update container status back to AVAILABLE
      if (log.container_id) {
        await prisma.listing_containers.update({
          where: { id: log.container_id },
          data: {
            status: 'AVAILABLE',
            notes: `${log.container?.notes || ''}\n[${new Date().toISOString()}] Maintenance completed`,
          },
        });
      }

      // Update listing quantities
      await prisma.listings.update({
        where: { id: log.listing_id },
        data: {
          maintenance_quantity: {
            decrement: 1,
          },
          available_quantity: {
            increment: 1,
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Maintenance completed successfully',
        data: updatedLog,
      });
    } catch (error: any) {
      console.error('Error completing maintenance:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to complete maintenance',
        error: error.message,
      });
    }
  });

  // ============================================================
  // PATCH /api/v1/maintenance-logs/:id - Update maintenance log
  // ============================================================
  fastify.patch('/maintenance-logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.listing_id;
      delete updateData.container_id;
      delete updateData.created_at;
      delete updateData.deleted_at;

      const updatedLog = await prisma.container_maintenance_logs.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
      });

      return reply.send({
        success: true,
        message: 'Maintenance log updated successfully',
        data: updatedLog,
      });
    } catch (error: any) {
      console.error('Error updating maintenance log:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to update maintenance log',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/containers/:containerId/maintenance-history
  // Get maintenance history for a container
  // ============================================================
  fastify.get('/containers/:containerId/maintenance-history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { containerId } = request.params as { containerId: string };

      const history = await prisma.container_maintenance_logs.findMany({
        where: {
          container_id: containerId,
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Calculate statistics
      const stats = {
        totalMaintenances: history.length,
        totalCost: history.reduce((sum, log) => sum + Number(log.actual_cost || 0), 0),
        averageCost: 0,
        totalDowntimeDays: history.reduce((sum, log) => sum + Number(log.actual_duration_days || 0), 0),
        byType: {} as any,
        byStatus: {} as any,
      };

      if (history.length > 0) {
        stats.averageCost = stats.totalCost / history.filter(h => h.actual_cost).length;

        // Group by type
        history.forEach(log => {
          stats.byType[log.maintenance_type] = (stats.byType[log.maintenance_type] || 0) + 1;
          stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
        });
      }

      return reply.send({
        success: true,
        data: {
          history,
          statistics: stats,
        },
      });
    } catch (error: any) {
      console.error('Error fetching maintenance history:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch maintenance history',
        error: error.message,
      });
    }
  });
}

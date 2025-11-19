/**
 * Container Maintenance Logs Routes
 * Handles maintenance tracking, scheduling, and cost management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function maintenanceLogsRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/maintenance-logs - Get all maintenance logs
  // ============================================================
  fastify.get('/maintenance-logs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        listingId,
        containerId,
        status,
        maintenanceType,
        priority,
        page = 1,
        limit = 20,
      } = request.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        deleted_at: null,
      };

      if (listingId) where.listing_id = listingId;
      if (containerId) where.container_id = containerId;
      if (status) where.status = status;
      if (maintenanceType) where.maintenance_type = maintenanceType;
      if (priority) where.priority = priority;

      // Get total count
      const total = await prisma.container_maintenance_logs.count({ where });

      // Get logs with relations
      const logs = await prisma.container_maintenance_logs.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              seller_user_id: true,
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
            },
          },
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              buyer: {
                select: {
                  id: true,
                  display_name: true,
                },
              },
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
  // GET /api/v1/listings/:listingId/maintenance-logs - Get logs for a listing
  // ============================================================
  fastify.get('/listings/:listingId/maintenance-logs', async (request: FastifyRequest, reply: FastifyReply) => {
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

      const logs = await prisma.container_maintenance_logs.findMany({
        where,
        include: {
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              status: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Calculate summary
      const summary = {
        total: logs.length,
        scheduled: logs.filter(l => l.status === 'SCHEDULED').length,
        in_progress: logs.filter(l => l.status === 'IN_PROGRESS').length,
        completed: logs.filter(l => l.status === 'COMPLETED').length,
        cancelled: logs.filter(l => l.status === 'CANCELLED').length,
        totalEstimatedCost: logs.reduce((sum, l) => sum + Number(l.estimated_cost || 0), 0),
        totalActualCost: logs.reduce((sum, l) => sum + Number(l.actual_cost || 0), 0),
      };

      // Group by status if requested
      let groupedData = null;
      if (groupBy === 'status') {
        groupedData = {
          SCHEDULED: logs.filter(l => l.status === 'SCHEDULED'),
          IN_PROGRESS: logs.filter(l => l.status === 'IN_PROGRESS'),
          COMPLETED: logs.filter(l => l.status === 'COMPLETED'),
          CANCELLED: logs.filter(l => l.status === 'CANCELLED'),
        };
      }

      return reply.send({
        success: true,
        data: {
          logs: groupBy === 'status' ? groupedData : logs,
          summary,
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
  // POST /api/v1/maintenance-logs - Create new maintenance log
  // ============================================================
  fastify.post('/maintenance-logs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        listingId,
        containerId,
        rentalContractId,
        maintenanceType,
        reason,
        description,
        priority = 'MEDIUM',
        startDate,
        estimatedCompletionDate,
        estimatedCost,
        costCurrency = 'VND',
        performedBy,
        technicianName,
        technicianContact,
        beforePhotos = [],
        estimatedDurationDays,
        partsUsed,
        materialsUsed,
      } = request.body as any;

      // Validate required fields
      if (!listingId || !maintenanceType || !reason || !startDate) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: listingId, maintenanceType, reason, startDate',
        });
      }

      // Create maintenance log
      const log = await prisma.container_maintenance_logs.create({
        data: {
          listing_id: listingId,
          container_id: containerId || null,
          rental_contract_id: rentalContractId || null,
          maintenance_type: maintenanceType,
          reason,
          description: description || null,
          priority,
          start_date: new Date(startDate),
          estimated_completion_date: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
          estimated_duration_days: estimatedDurationDays || null,
          estimated_cost: estimatedCost ? Number(estimatedCost) : null,
          cost_currency: costCurrency,
          status: 'SCHEDULED',
          performed_by: performedBy || null,
          technician_name: technicianName || null,
          technician_contact: technicianContact || null,
          before_photos: beforePhotos,
          parts_used: partsUsed || null,
          materials_used: materialsUsed || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
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
            },
          },
        },
      });

      // Update container status to IN_MAINTENANCE if containerId provided
      if (containerId) {
        await prisma.listing_containers.update({
          where: { id: containerId },
          data: {
            status: 'IN_MAINTENANCE',
          },
        });

        // Update listing quantity
        await prisma.listings.update({
          where: { id: listingId },
          data: {
            available_quantity: { decrement: 1 },
            maintenance_quantity: { increment: 1 },
          },
        });
      }

      return reply.status(201).send({
        success: true,
        message: 'Maintenance log created successfully',
        data: log,
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
  // PATCH /api/v1/maintenance-logs/:id - Update maintenance log
  // ============================================================
  fastify.patch('/maintenance-logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        status,
        progress,
        technicianNotes,
        actualCost,
        actualCompletionDate,
        afterPhotos,
        qualityChecked,
        qualityNotes,
        qualityCheckerName,
        description,
        estimatedCost,
      } = request.body as any;

      // Get existing log
      const existingLog = await prisma.container_maintenance_logs.findUnique({
        where: { id },
        include: {
          listing: true,
          container: true,
        },
      });

      if (!existingLog || existingLog.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Maintenance log not found',
        });
      }

      const updateData: any = {
        updated_at: new Date(),
      };

      if (status) updateData.status = status;
      if (description) updateData.description = description;
      if (estimatedCost !== undefined) updateData.estimated_cost = Number(estimatedCost);
      if (technicianNotes) updateData.technician_notes = technicianNotes;
      if (actualCost !== undefined) updateData.actual_cost = Number(actualCost);
      if (actualCompletionDate) updateData.actual_completion_date = new Date(actualCompletionDate);
      if (afterPhotos) updateData.after_photos = afterPhotos;
      if (qualityChecked !== undefined) {
        updateData.quality_checked = qualityChecked;
        if (qualityChecked) {
          updateData.quality_check_date = new Date();
        }
      }
      if (qualityNotes) updateData.quality_notes = qualityNotes;
      if (qualityCheckerName) updateData.quality_checker_name = qualityCheckerName;

      // If status changes to IN_PROGRESS, set start if not set
      if (status === 'IN_PROGRESS' && !existingLog.start_date) {
        updateData.start_date = new Date();
      }

      // If status changes to COMPLETED
      if (status === 'COMPLETED') {
        updateData.completed_at = new Date();
        if (!actualCompletionDate) {
          updateData.actual_completion_date = new Date();
        }

        // Calculate actual duration
        const start = new Date(existingLog.start_date);
        const end = new Date(updateData.actual_completion_date || new Date());
        const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        updateData.actual_duration_days = durationDays;

        // Update container status back to AVAILABLE
        if (existingLog.container_id) {
          await prisma.listing_containers.update({
            where: { id: existingLog.container_id },
            data: {
              status: 'AVAILABLE',
            },
          });

          // Update listing quantity
          await prisma.listings.update({
            where: { id: existingLog.listing_id },
            data: {
              maintenance_quantity: { decrement: 1 },
              available_quantity: { increment: 1 },
            },
          });
        }
      }

      // Update log
      const updatedLog = await prisma.container_maintenance_logs.update({
        where: { id },
        data: updateData,
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
              status: true,
            },
          },
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
  // DELETE /api/v1/maintenance-logs/:id - Soft delete maintenance log
  // ============================================================
  fastify.delete('/maintenance-logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const log = await prisma.container_maintenance_logs.findUnique({
        where: { id },
        include: {
          container: true,
        },
      });

      if (!log || log.deleted_at) {
        return reply.status(404).send({
          success: false,
          message: 'Maintenance log not found',
        });
      }

      // Soft delete
      await prisma.container_maintenance_logs.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      // If log was not completed, restore container to AVAILABLE
      if (log.status !== 'COMPLETED' && log.container_id) {
        await prisma.listing_containers.update({
          where: { id: log.container_id },
          data: {
            status: 'AVAILABLE',
          },
        });

        // Update listing quantity
        await prisma.listings.update({
          where: { id: log.listing_id },
          data: {
            maintenance_quantity: { decrement: 1 },
            available_quantity: { increment: 1 },
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Maintenance log deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting maintenance log:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete maintenance log',
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
              users: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          container: {
            select: {
              id: true,
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
              status: true,
            },
          },
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
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
}

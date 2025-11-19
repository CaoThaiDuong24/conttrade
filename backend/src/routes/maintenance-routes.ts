/**
 * Container Maintenance Routes
 * Handles maintenance tracking for rental containers
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export default async function maintenanceRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // POST /api/v1/maintenance-logs - Create maintenance log
  // ============================================================
  fastify.post<{
    Body: {
      listing_id: string;
      container_id?: string;
      rental_contract_id?: string;
      maintenance_type: 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'CLEANING' | 'DAMAGE_REPAIR';
      reason: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      start_date: string;
      estimated_completion_date?: string;
      estimated_cost?: number;
      performed_by?: string;
    };
  }>('/maintenance-logs', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const {
        listing_id,
        container_id,
        rental_contract_id,
        maintenance_type,
        reason,
        description,
        priority = 'MEDIUM',
        start_date,
        estimated_completion_date,
        estimated_cost,
        performed_by,
      } = request.body;

      // Verify user is seller of the listing
      const listing = await prisma.listings.findUnique({
        where: { id: listing_id },
        select: { seller_user_id: true },
      });

      if (!listing) {
        return reply.status(404).send({
          success: false,
          message: 'Listing not found',
        });
      }

      if (listing.seller_user_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to create maintenance log for this listing',
        });
      }

      const logId = randomUUID();
      const maintenanceLog = await prisma.container_maintenance_logs.create({
        data: {
          id: logId,
          listing_id,
          container_id: container_id || null,
          rental_contract_id: rental_contract_id || null,
          maintenance_type,
          reason,
          description: description || null,
          priority,
          start_date: new Date(start_date),
          estimated_completion_date: estimated_completion_date ? new Date(estimated_completion_date) : null,
          estimated_cost: estimated_cost || null,
          status: 'SCHEDULED',
          performed_by: performed_by || userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // If container is assigned, update its status to IN_MAINTENANCE
      if (container_id) {
        await prisma.listing_containers.update({
          where: { id: container_id },
          data: {
            status: 'IN_MAINTENANCE',
            updated_at: new Date(),
          },
        });

        // Update listing maintenance_quantity
        await prisma.listings.update({
          where: { id: listing_id },
          data: {
            maintenance_quantity: {
              increment: 1,
            },
            available_quantity: {
              decrement: 1,
            },
            updated_at: new Date(),
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Maintenance log created successfully',
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
  // GET /api/v1/maintenance-logs - Get maintenance logs
  // ============================================================
  fastify.get('/maintenance-logs', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const {
        listingId,
        containerId,
        contractId,
        status,
        maintenanceType,
      } = request.query as any;

      const where: any = {
        deleted_at: null,
      };

      if (listingId) where.listing_id = listingId;
      if (containerId) where.container_id = containerId;
      if (contractId) where.rental_contract_id = contractId;
      if (status) where.status = status;
      if (maintenanceType) where.maintenance_type = maintenanceType;

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
            },
          },
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return reply.send({
        success: true,
        data: {
          logs,
          total: logs.length,
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
  // PATCH /api/v1/maintenance-logs/:id - Update maintenance log
  // ============================================================
  fastify.patch<{
    Params: { id: string };
    Body: {
      status?: 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
      actual_completion_date?: string;
      actual_cost?: number;
      after_photos?: string[];
      maintenance_report_url?: string;
      quality_checked?: boolean;
      quality_notes?: string;
      technician_notes?: string;
    };
  }>('/maintenance-logs/:id', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const existingLog = await prisma.container_maintenance_logs.findUnique({
        where: { id },
        select: {
          id: true,
          container_id: true,
          listing_id: true,
          status: true,
        },
      });

      if (!existingLog) {
        return reply.status(404).send({
          success: false,
          message: 'Maintenance log not found',
        });
      }

      const updatedLog = await prisma.container_maintenance_logs.update({
        where: { id },
        data: {
          ...updateData,
          actual_completion_date: updateData.actual_completion_date ? new Date(updateData.actual_completion_date) : undefined,
          completed_at: updateData.status === 'COMPLETED' ? new Date() : undefined,
          updated_at: new Date(),
        },
      });

      // If maintenance completed, update container status back to AVAILABLE
      if (updateData.status === 'COMPLETED' && existingLog.container_id) {
        await prisma.listing_containers.update({
          where: { id: existingLog.container_id },
          data: {
            status: 'AVAILABLE',
            updated_at: new Date(),
          },
        });

        // Update listing quantities
        await prisma.listings.update({
          where: { id: existingLog.listing_id },
          data: {
            maintenance_quantity: {
              decrement: 1,
            },
            available_quantity: {
              increment: 1,
            },
            updated_at: new Date(),
          },
        });
      }

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
}

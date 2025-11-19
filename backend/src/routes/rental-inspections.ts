/**
 * Rental Inspection Routes
 * Handles inspection records for rental containers (pickup and return)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export default async function rentalInspectionRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // POST /api/v1/rental-contracts/:contractId/inspections - Create inspection record
  // ============================================================
  fastify.post<{
    Params: { contractId: string };
    Body: {
      inspection_type: 'PICKUP' | 'RETURN';
      condition: string;
      photos?: string[];
      inspector_name?: string;
      damage_report?: string;
      damage_cost?: number;
      notes?: string;
    };
  }>('/rental-contracts/:contractId/inspections', {
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
      const { contractId } = request.params;
      const {
        inspection_type,
        condition,
        photos = [],
        inspector_name,
        damage_report,
        damage_cost,
        notes,
      } = request.body;

      // Get contract and verify permission
      const contract = await prisma.rental_contracts.findUnique({
        where: { id: contractId },
        include: {
          seller: { select: { id: true, display_name: true } },
          buyer: { select: { id: true, display_name: true } },
        },
      });

      if (!contract) {
        return reply.status(404).send({
          success: false,
          message: 'Rental contract not found',
        });
      }

      // Verify user is seller or buyer
      if (contract.seller_id !== userId && contract.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to create inspection for this contract',
        });
      }

      const now = new Date();
      
      // Update contract with inspection data
      const updateData: any = {};
      
      if (inspection_type === 'PICKUP') {
        updateData.pickup_condition = condition;
        updateData.pickup_photos = photos;
        updateData.pickup_inspection_date = now;
        updateData.pickup_inspector_name = inspector_name || (request.user as any).display_name || 'Inspector';
      } else if (inspection_type === 'RETURN') {
        updateData.return_condition = condition;
        updateData.return_photos = photos;
        updateData.return_inspection_date = now;
        updateData.return_inspector_name = inspector_name || (request.user as any).display_name || 'Inspector';
        updateData.damage_report = damage_report || null;
        updateData.damage_cost = damage_cost || null;
      }

      const updatedContract = await prisma.rental_contracts.update({
        where: { id: contractId },
        data: updateData,
      });

      // Send notification to the other party
      const recipientId = userId === contract.seller_id ? contract.buyer_id : contract.seller_id;
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: recipientId,
          type: 'order_update',
          title: `Inspection ${inspection_type === 'PICKUP' ? 'lúc giao' : 'lúc nhận'} container`,
          message: `${inspection_type === 'PICKUP' ? 'Pickup' : 'Return'} inspection đã được ghi nhận cho hợp đồng ${contract.contract_number}. Tình trạng: ${condition}`,
          actionUrl: `/rental-contracts/${contractId}`,
          orderData: {
            contractId,
            inspectionType: inspection_type,
            condition,
            hasPhotos: photos.length > 0,
            hasDamage: !!damage_report,
          },
        });
      } catch (notifError) {
        console.error('Failed to send inspection notification:', notifError);
      }

      return reply.send({
        success: true,
        message: `${inspection_type} inspection recorded successfully`,
        data: {
          contractId: updatedContract.id,
          inspectionType: inspection_type,
          condition,
          inspectionDate: now,
          inspectorName: inspector_name,
        },
      });
    } catch (error: any) {
      console.error('Error creating rental inspection:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to create rental inspection',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/rental-contracts/:contractId/inspections - Get inspections for contract
  // ============================================================
  fastify.get<{
    Params: { contractId: string };
  }>('/rental-contracts/:contractId/inspections', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    try {
      const { contractId } = request.params;

      const contract = await prisma.rental_contracts.findUnique({
        where: { id: contractId },
        select: {
          id: true,
          contract_number: true,
          pickup_condition: true,
          pickup_photos: true,
          pickup_inspection_date: true,
          pickup_inspector_name: true,
          return_condition: true,
          return_photos: true,
          return_inspection_date: true,
          return_inspector_name: true,
          damage_report: true,
          damage_cost: true,
        },
      });

      if (!contract) {
        return reply.status(404).send({
          success: false,
          message: 'Rental contract not found',
        });
      }

      const inspections = [];

      // Pickup inspection
      if (contract.pickup_inspection_date) {
        inspections.push({
          type: 'PICKUP',
          condition: contract.pickup_condition,
          photos: contract.pickup_photos || [],
          inspectionDate: contract.pickup_inspection_date,
          inspectorName: contract.pickup_inspector_name,
        });
      }

      // Return inspection
      if (contract.return_inspection_date) {
        inspections.push({
          type: 'RETURN',
          condition: contract.return_condition,
          photos: contract.return_photos || [],
          inspectionDate: contract.return_inspection_date,
          inspectorName: contract.return_inspector_name,
          damageReport: contract.damage_report,
          damageCost: contract.damage_cost,
        });
      }

      return reply.send({
        success: true,
        data: {
          contractId: contract.id,
          contractNumber: contract.contract_number,
          inspections,
        },
      });
    } catch (error: any) {
      console.error('Error fetching rental inspections:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental inspections',
        error: error.message,
      });
    }
  });
}

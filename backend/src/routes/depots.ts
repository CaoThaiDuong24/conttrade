// @ts-nocheck
import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export default async function depotRoutes(fastify: FastifyInstance) {
  // GET /depots - Lấy danh sách depots
  fastify.get('/', async (request, reply) => {
    try {
      const depots = await prisma.depots.findMany({
        orderBy: { name: 'asc' },
        include: {
          containers: {
            where: {
              status: 'AVAILABLE'
            }
          }
        }
      });

      // Tính available slots cho mỗi depot
      const depotsWithSlots = depots.map(depot => {
        const usedSlots = depot.containers.length;
        const totalSlots = depot.capacity_teu || 1000; // Default 1000 nếu không có
        const availableSlots = Math.max(0, totalSlots - usedSlots);

        return {
          ...depot,
          totalSlots,
          usedSlots,
          availableSlots,
          containers: undefined // Không trả về chi tiết containers
        };
      });

      return reply.send({
        success: true,
        data: { depots: depotsWithSlots }
      });
    } catch (error) {
      fastify.log.error('Get depots error:', error as any);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống' 
      });
    }
  });

  // POST /depots - Tạo depot mới (tạm thời cho test)
  fastify.post('/', async (request, reply) => {
    try {
      const { name, code, address, province, capacityTeu } = request.body as any;

      const depot = await prisma.depots.create({
        data: {
          name,
          code,
          address,
          province,
          capacityTeu: capacityTeu || 1000
        }
      });

      return reply.send({
        success: true,
        data: { depot }
      });
    } catch (error: any) {
      fastify.log.error('Create depot error:', error as any);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: error?.message
      });
    }
  });

  // GET /depots/init - Tạo depot mẫu nếu chưa có
  fastify.get('/init', async (request, reply) => {
    try {
      const existingDepots = await prisma.depots.count();
      
      if (existingDepots === 0) {
        const depot = await prisma.depots.create({
          data: {
            name: 'Depot TP.HCM',
            code: 'HCM01',
            address: 'Quận 7, TP.HCM',
            province: 'TP.HCM',
            capacityTeu: 5000
          }
        });

        return reply.send({
          success: true,
          message: 'Depot mẫu đã được tạo',
          data: { depot }
        });
      } else {
        const depots = await prisma.depots.findMany();
        return reply.send({
          success: true,
          message: 'Depots đã tồn tại',
          data: { depots }
        });
      }
    } catch (error: any) {
      fastify.log.error('Init depot error:', error as any);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: error?.message 
      });
    }
  });
}

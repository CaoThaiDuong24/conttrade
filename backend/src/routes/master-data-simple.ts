// @ts-nocheck
/**
 * MASTER DATA API ROUTES - i-ContExchange (Simplified)
 * Tất cả các API endpoints để lấy master data
 */

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export default async function masterDataRoutes(fastify: FastifyInstance) {
  
  // GET /master-data/countries
  fastify.get('/countries', async (request, reply) => {
    try {
      const countries = await prisma.$queryRaw`SELECT * FROM md_countries ORDER BY name ASC` as any[];
      return reply.send({ success: true, data: countries });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/provinces
  fastify.get('/provinces', async (request, reply) => {
    try {
      const provinces = await prisma.$queryRaw`SELECT * FROM md_provinces ORDER BY name ASC` as any[];
      return reply.send({ success: true, data: provinces });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/currencies
  fastify.get('/currencies', async (request, reply) => {
    try {
      const currencies = await prisma.$queryRaw`SELECT * FROM md_currencies ORDER BY code ASC` as any[];
      return reply.send({ success: true, data: currencies });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/container-sizes
  fastify.get('/container-sizes', async (request, reply) => {
    try {
      const sizes = await prisma.$queryRaw`SELECT * FROM md_container_sizes ORDER BY size_ft ASC` as any[];
      return reply.send({ success: true, data: sizes });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/container-types
  fastify.get('/container-types', async (request, reply) => {
    try {
      const types = await prisma.$queryRaw`SELECT * FROM md_container_types ORDER BY code ASC` as any[];
      return reply.send({ success: true, data: types });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/quality-standards
  fastify.get('/quality-standards', async (request, reply) => {
    try {
      const standards = await prisma.$queryRaw`SELECT * FROM md_quality_standards ORDER BY code ASC` as any[];
      return reply.send({ success: true, data: standards });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/deal-types
  fastify.get('/deal-types', async (request, reply) => {
    try {
      const types = await prisma.$queryRaw`SELECT * FROM md_deal_types ORDER BY code ASC` as any[];
      return reply.send({ success: true, data: types });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/listing-statuses
  fastify.get('/listing-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.md_listing_statuses.findMany({
        orderBy: { code: 'asc' }
      });
      return reply.send({ success: true, data: statuses });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/order-statuses
  fastify.get('/order-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.$queryRaw`SELECT * FROM md_order_statuses ORDER BY sort_order ASC` as any[];
      return reply.send({ success: true, data: statuses });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/rental-units
  fastify.get('/rental-units', async (request, reply) => {
    try {
      const units = await prisma.$queryRaw`SELECT * FROM md_rental_units ORDER BY code ASC` as any[];
      return reply.send({ success: true, data: units });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/cities
  fastify.get('/cities', async (request, reply) => {
    try {
      const cities = await prisma.$queryRaw`SELECT * FROM md_cities ORDER BY name ASC` as any[];
      return reply.send({ success: true, data: cities });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/all - Lấy tất cả master data
  fastify.get('/all', async (request, reply) => {
    try {
      const [
        countries,
        provinces,
        currencies,
        containerSizes,
        containerTypes,
        qualityStandards,
        dealTypes,
        listingStatuses,
        orderStatuses,
        rentalUnits,
        cities
      ] = await Promise.all([
        prisma.$queryRaw`SELECT * FROM md_countries ORDER BY name ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_provinces ORDER BY name ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_currencies ORDER BY code ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_container_sizes ORDER BY size_ft ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_container_types ORDER BY code ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_quality_standards ORDER BY code ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_deal_types ORDER BY code ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_listing_statuses ORDER BY sort_order ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_order_statuses ORDER BY sort_order ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_rental_units ORDER BY code ASC` as Promise<any[]>,
        prisma.$queryRaw`SELECT * FROM md_cities ORDER BY name ASC` as Promise<any[]>
      ]);

      return reply.send({
        success: true,
        data: {
          countries,
          provinces,
          currencies,
          containerSizes,
          containerTypes,
          qualityStandards,
          dealTypes,
          listingStatuses,
          orderStatuses,
          rentalUnits,
          cities
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });
}


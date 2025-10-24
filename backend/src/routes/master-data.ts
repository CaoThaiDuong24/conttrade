// @ts-nocheck
/**
 * MASTER DATA API ROUTES - i-ContExchange
 * Tất cả các API endpoints để lấy master data
 */

import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function masterDataRoutes(fastify: FastifyInstance) {
  
  // ===========================================
  // 1. GEO & CURRENCY
  // ===========================================
  
  // GET /master-data/countries
  fastify.get('/countries', async (request, reply) => {
    try {
      const countries = await prisma.md_countries.findMany({
        orderBy: { name: 'asc' }
      });

      return reply.send({
        success: true,
        data: countries
      });
    } catch (error: any) {
      fastify.log.error('Get countries error:', error);
      console.error('=== GET COUNTRIES ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /master-data/provinces
  fastify.get('/provinces', async (request, reply) => {
    try {
      const { country_id } = request.query as any;
      
      let where: any = {};
      
      if (country_id) {
        where.country_id = country_id;
      }
      
      const provinces = await prisma.md_provinces.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      return reply.send({
        success: true,
        data: provinces
      });
    } catch (error: any) {
      fastify.log.error('Get provinces error:', error);
      console.error('=== GET PROVINCES ERROR ===');
      console.error('Error:', error.message);
      return reply.status(500).send({ 
        success: false, 
        message: 'Lỗi hệ thống',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /master-data/currencies
  fastify.get('/currencies', async (request, reply) => {
    try {
      const currencies = await prisma.md_currencies.findMany({
        orderBy: { code: 'asc' }
      });

      return reply.send({
        success: true,
        data: currencies
      });
    } catch (error) {
      fastify.log.error('Get currencies error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/timezones
  fastify.get('/timezones', async (request, reply) => {
    try {
      const timezones = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_timezones ORDER BY tzid ASC
      `;

      return reply.send({
        success: true,
        data: timezones
      });
    } catch (error) {
      fastify.log.error('Get timezones error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 2. CONTAINER
  // ===========================================
  
  // GET /master-data/container-sizes
  fastify.get('/container-sizes', async (request, reply) => {
    try {
      const sizes = await prisma.md_container_sizes.findMany({
        orderBy: { size_ft: 'asc' }
      });

      return reply.send({
        success: true,
        data: sizes
      });
    } catch (error) {
      fastify.log.error('Get container sizes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/container-types
  fastify.get('/container-types', async (request, reply) => {
    try {
      const types = await prisma.md_container_types.findMany({
        orderBy: { code: 'asc' }
      });

      return reply.send({
        success: true,
        data: types
      });
    } catch (error) {
      fastify.log.error('Get container types error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/quality-standards
  fastify.get('/quality-standards', async (request, reply) => {
    try {
      const standards = await prisma.md_quality_standards.findMany({
        orderBy: { code: 'asc' }
      });

      return reply.send({
        success: true,
        data: standards
      });
    } catch (error) {
      fastify.log.error('Get quality standards error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/iso-codes
  fastify.get('/iso-codes', async (request, reply) => {
    try {
      const codes = await prisma.md_iso_container_codes.findMany({
        orderBy: { iso_code: 'asc' }
      });

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get ISO codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 3. BUSINESS
  // ===========================================
  
  // GET /master-data/deal-types
  fastify.get('/deal-types', async (request, reply) => {
    try {
      const types = await prisma.md_deal_types.findMany({
        orderBy: { code: 'asc' }
      });

      return reply.send({
        success: true,
        data: types
      });
    } catch (error) {
      fastify.log.error('Get deal types error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/listing-statuses
  fastify.get('/listing-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.md_listing_statuses.findMany({
        orderBy: { code: 'asc' }
      });

      return reply.send({
        success: true,
        data: statuses
      });
    } catch (error) {
      fastify.log.error('Get listing statuses error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/order-statuses
  fastify.get('/order-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_order_statuses ORDER BY sort_order ASC
      `;

      return reply.send({
        success: true,
        data: statuses
      });
    } catch (error) {
      fastify.log.error('Get order statuses error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/payment-statuses
  fastify.get('/payment-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_payment_statuses ORDER BY sort_order ASC
      `;

      return reply.send({
        success: true,
        data: statuses
      });
    } catch (error) {
      fastify.log.error('Get payment statuses error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/delivery-statuses
  fastify.get('/delivery-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_delivery_statuses ORDER BY sort_order ASC
      `;

      return reply.send({
        success: true,
        data: statuses
      });
    } catch (error) {
      fastify.log.error('Get delivery statuses error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/dispute-statuses
  fastify.get('/dispute-statuses', async (request, reply) => {
    try {
      const statuses = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_dispute_statuses ORDER BY sort_order ASC
      `;

      return reply.send({
        success: true,
        data: statuses
      });
    } catch (error) {
      fastify.log.error('Get dispute statuses error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/document-types
  fastify.get('/document-types', async (request, reply) => {
    try {
      const types = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_document_types ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: types
      });
    } catch (error) {
      fastify.log.error('Get document types error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/service-codes
  fastify.get('/service-codes', async (request, reply) => {
    try {
      const codes = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_service_codes ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get service codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 4. PRICING & UNITS
  // ===========================================
  
  // GET /master-data/rental-units
  fastify.get('/rental-units', async (request, reply) => {
    try {
      const units = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_rental_units ORDER BY days ASC
      `;

      return reply.send({
        success: true,
        data: units
      });
    } catch (error) {
      fastify.log.error('Get rental units error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/units
  fastify.get('/units', async (request, reply) => {
    try {
      const { type } = request.query as any;
      
      let units;
      if (type) {
        units = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_units WHERE unit_type = '${type}' ORDER BY code ASC
        `);
      } else {
        units = await prisma.$queryRaw<any[]>`
          SELECT * FROM md_units ORDER BY code ASC
        `;
      }

      return reply.send({
        success: true,
        data: units
      });
    } catch (error) {
      fastify.log.error('Get units error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/fee-codes
  fastify.get('/fee-codes', async (request, reply) => {
    try {
      const codes = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_fee_codes ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get fee codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/tax-codes
  fastify.get('/tax-codes', async (request, reply) => {
    try {
      const codes = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_tax_codes ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get tax codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 5. LOGISTICS
  // ===========================================
  
  // GET /master-data/incoterms
  fastify.get('/incoterms', async (request, reply) => {
    try {
      const incoterms = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_incoterms ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: incoterms
      });
    } catch (error) {
      fastify.log.error('Get incoterms error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/delivery-event-types
  fastify.get('/delivery-event-types', async (request, reply) => {
    try {
      const types = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_delivery_event_types ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: types
      });
    } catch (error) {
      fastify.log.error('Get delivery event types error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/cities
  fastify.get('/cities', async (request, reply) => {
    try {
      const { province, country = 'VN' } = request.query as any;
      
      let cities;
      if (province) {
        cities = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_cities 
          WHERE province_code = '${province}' AND country_code = '${country}'
          ORDER BY name ASC
        `);
      } else {
        cities = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_cities WHERE country_code = '${country}' ORDER BY name ASC
        `);
      }

      return reply.send({
        success: true,
        data: cities
      });
    } catch (error) {
      fastify.log.error('Get cities error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/unlocodes
  fastify.get('/unlocodes', async (request, reply) => {
    try {
      const { country } = request.query as any;
      
      let codes;
      if (country) {
        codes = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_unlocodes WHERE country_code = '${country}' ORDER BY code ASC
        `);
      } else {
        codes = await prisma.$queryRaw<any[]>`
          SELECT * FROM md_unlocodes ORDER BY code ASC
        `;
      }

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get unlocodes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 6. REASONS
  // ===========================================
  
  // GET /master-data/dispute-reasons
  fastify.get('/dispute-reasons', async (request, reply) => {
    try {
      const reasons = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_dispute_reasons ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: reasons
      });
    } catch (error) {
      fastify.log.error('Get dispute reasons error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/cancel-reasons
  fastify.get('/cancel-reasons', async (request, reply) => {
    try {
      const reasons = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_cancel_reasons ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: reasons
      });
    } catch (error) {
      fastify.log.error('Get cancel reasons error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/payment-failure-reasons
  fastify.get('/payment-failure-reasons', async (request, reply) => {
    try {
      const reasons = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_payment_failure_reasons ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: reasons
      });
    } catch (error) {
      fastify.log.error('Get payment failure reasons error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 7. INSPECTION & REPAIR
  // ===========================================
  
  // GET /master-data/inspection-item-codes
  fastify.get('/inspection-item-codes', async (request, reply) => {
    try {
      const { category } = request.query as any;
      
      let codes;
      if (category) {
        codes = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_inspection_item_codes WHERE category = '${category}' ORDER BY code ASC
        `);
      } else {
        codes = await prisma.$queryRaw<any[]>`
          SELECT * FROM md_inspection_item_codes ORDER BY code ASC
        `;
      }

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get inspection item codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/repair-item-codes
  fastify.get('/repair-item-codes', async (request, reply) => {
    try {
      const { category } = request.query as any;
      
      let codes;
      if (category) {
        codes = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_repair_item_codes WHERE category = '${category}' ORDER BY code ASC
        `);
      } else {
        codes = await prisma.$queryRaw<any[]>`
          SELECT * FROM md_repair_item_codes ORDER BY code ASC
        `;
      }

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get repair item codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 8. NOTIFICATION
  // ===========================================
  
  // GET /master-data/notification-channels
  fastify.get('/notification-channels', async (request, reply) => {
    try {
      const channels = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_notification_channels ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: channels
      });
    } catch (error) {
      fastify.log.error('Get notification channels error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/notification-event-types
  fastify.get('/notification-event-types', async (request, reply) => {
    try {
      const types = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_notification_event_types ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: types
      });
    } catch (error) {
      fastify.log.error('Get notification event types error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/template-codes
  fastify.get('/template-codes', async (request, reply) => {
    try {
      const { channel } = request.query as any;
      
      let codes;
      if (channel) {
        codes = await prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM md_template_codes WHERE channel = '${channel}' ORDER BY code ASC
        `);
      } else {
        codes = await prisma.$queryRaw<any[]>`
          SELECT * FROM md_template_codes ORDER BY channel, code ASC
        `;
      }

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get template codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 9. INSURANCE
  // ===========================================
  
  // GET /master-data/insurance-coverages
  fastify.get('/insurance-coverages', async (request, reply) => {
    try {
      const coverages = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_insurance_coverages ORDER BY code ASC
      `;

      return reply.send({
        success: true,
        data: coverages
      });
    } catch (error) {
      fastify.log.error('Get insurance coverages error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 10. ADMIN & CONFIG
  // ===========================================
  
  // GET /master-data/rating-scales
  fastify.get('/rating-scales', async (request, reply) => {
    try {
      const scales = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_rating_scales ORDER BY value ASC
      `;

      return reply.send({
        success: true,
        data: scales
      });
    } catch (error) {
      fastify.log.error('Get rating scales error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // GET /master-data/violation-codes
  fastify.get('/violation-codes', async (request, reply) => {
    try {
      const codes = await prisma.$queryRaw<any[]>`
        SELECT * FROM md_violation_codes ORDER BY severity DESC, code ASC
      `;

      return reply.send({
        success: true,
        data: codes
      });
    } catch (error) {
      fastify.log.error('Get violation codes error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });

  // ===========================================
  // 11. BULK GET - Lấy tất cả master data cùng lúc
  // ===========================================
  
  // GET /master-data/all
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
        paymentStatuses,
        deliveryStatuses,
        rentalUnits,
        cities
      ] = await Promise.all([
        prisma.$queryRaw`SELECT * FROM md_countries WHERE active = true ORDER BY name ASC`,
        prisma.$queryRaw`SELECT * FROM md_provinces WHERE active = true AND country_code = 'VN' ORDER BY name ASC`,
        prisma.$queryRaw`SELECT * FROM md_currencies WHERE active = true ORDER BY code ASC`,
        prisma.$queryRaw`SELECT * FROM md_container_sizes ORDER BY size_ft ASC`,
        prisma.$queryRaw`SELECT * FROM md_container_types ORDER BY code ASC`,
        prisma.$queryRaw`SELECT * FROM md_quality_standards ORDER BY code ASC`,
        prisma.$queryRaw`SELECT * FROM md_deal_types ORDER BY code ASC`,
        prisma.$queryRaw`SELECT * FROM md_listing_statuses ORDER BY sort_order ASC`,
        prisma.$queryRaw`SELECT * FROM md_order_statuses ORDER BY sort_order ASC`,
        prisma.$queryRaw`SELECT * FROM md_payment_statuses ORDER BY sort_order ASC`,
        prisma.$queryRaw`SELECT * FROM md_delivery_statuses ORDER BY sort_order ASC`,
        prisma.$queryRaw`SELECT * FROM md_rental_units ORDER BY days ASC`,
        prisma.$queryRaw`SELECT * FROM md_cities WHERE country_code = 'VN' ORDER BY name ASC`
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
          paymentStatuses,
          deliveryStatuses,
          rentalUnits,
          cities
        }
      });
    } catch (error) {
      fastify.log.error('Get all master data error:', error);
      return reply.status(500).send({ success: false, message: 'Lỗi hệ thống' });
    }
  });
}


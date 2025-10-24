// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { paymentService } from '../lib/payments/payment-service-simple';

export default async function paymentRoutes(fastify: FastifyInstance) {
  // GET /payments/status - Get general payment status 
  fastify.get('/status', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      return reply.send({
        success: true,
        data: {
          status: 'operational',
          methods: ['bank', 'card', 'ewallet'],
          fees: {
            bank: '0%',
            card: '2.9% + 2000₫',
            ewallet: '1.5%'
          }
        }
      });
    } catch (error: any) {
      fastify.log.error('Error getting payment status:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get payment status'
      });
    }
  });

  // GET /payments/history - Get payment history for user
  fastify.get('/history', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      
      return reply.send({
        success: true,
        data: [
          {
            id: `PAY-${Date.now()}-001`,
            orderId: 'ORD-123',
            amount: 50000000,
            currency: 'VND',
            method: 'bank',
            status: 'completed',
            type: 'escrow_fund',
            createdAt: new Date().toISOString()
          }
        ]
      });
    } catch (error: any) {
      fastify.log.error('Error getting payment history:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get payment history'
      });
    }
  });

  // GET /payments/order/:orderId/status - Get payment status for order
  fastify.get<{ Params: { orderId: string } }>('/order/:orderId/status', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { orderId } = request.params;

    try {
      const result = await paymentService.getPaymentStatus(orderId);
      
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error('Error getting payment status:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get payment status',
        error: error.message
      });
    }
  });

  // POST /payments/escrow/:orderId/fund - Simulate escrow funding (for testing)
  fastify.post<{ 
    Params: { orderId: string },
    Body: { method: string; amount: number; currency?: string; paymentData?: any }
  }>('/escrow/:orderId/fund', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { orderId } = request.params;
    const { method, amount, currency = 'VND', paymentData } = request.body;

    try {
      const result = await paymentService.processEscrowPayment(orderId, method);
      
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error('Error funding escrow:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fund escrow',
        error: error.message
      });
    }
  });

  // POST /payments/escrow/:orderId/release - Release escrow payment
  fastify.post<{ Params: { orderId: string } }>('/escrow/:orderId/release', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { orderId } = request.params;

    try {
      const result = await paymentService.releaseEscrowPayment(orderId);
      
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error('Error releasing escrow:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to release escrow',
        error: error.message
      });
    }
  });

  // POST /payments/escrow/:orderId/refund - Refund escrow payment
  fastify.post<{ 
    Params: { orderId: string },
    Body: { reason?: string }
  }>('/escrow/:orderId/refund', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    }
  }, async (request, reply) => {
    const { orderId } = request.params;
    const { reason } = request.body;

    try {
      const result = await paymentService.refundEscrowPayment(orderId, reason);
      
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error('Error refunding escrow:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to refund escrow',
        error: error.message
      });
    }
  });
}

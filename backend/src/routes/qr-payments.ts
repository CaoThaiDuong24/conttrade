// @ts-nocheck
/**
 * QR PAYMENT ROUTES
 * Handle QR code generation and payment webhooks for all payment methods
 */

import { FastifyInstance } from 'fastify';
import vnpayService from '../lib/payments/vnpay-service.js';
import momoService from '../lib/payments/momo-service.js';
import vietQRService from '../lib/payments/vietqr-service.js';
import stripeService from '../lib/payments/stripe-service.js';
import prisma from '../lib/prisma.js';

export default async function qrPaymentRoutes(fastify: FastifyInstance) {
  
  // POST /api/v1/qr/generate - Generate QR code for payment
  fastify.post<{
    Body: {
      orderId: string;
      method: 'vnpay' | 'momo' | 'bank' | 'credit_card';
      amount: number;
      currency?: string;
    };
  }>('/generate', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ success: false, message: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    const { orderId, method, amount, currency = 'VND' } = request.body;
    const user = request.user as any;

    try {
      // Verify order exists and belongs to user
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          users_orders_buyer_idTousers: true,
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.buyer_id !== user.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Unauthorized to pay for this order',
        });
      }

      let qrResult: any = {};

      switch (method) {
        case 'vnpay':
          // Generate VNPay payment URL
          const vnpayUrl = vnpayService.createPaymentUrl({
            orderId,
            amount,
            orderInfo: `Thanh toan don hang ${orderId}`,
            ipAddr: request.ip,
          });
          
          qrResult = {
            method: 'vnpay',
            paymentUrl: vnpayUrl,
            qrCodeData: vnpayUrl,
            message: 'Vui lòng quét mã QR hoặc click vào link để thanh toán',
          };
          break;

        case 'momo':
          // Generate MoMo QR
          const momoResult = await momoService.createPaymentQR({
            orderId,
            amount,
            orderInfo: `Thanh toan don hang ${orderId}`,
          });
          
          qrResult = {
            method: 'momo',
            qrCodeUrl: momoResult.qrCodeUrl,
            deeplink: momoResult.deeplink,
            payUrl: momoResult.payUrl,
            message: 'Vui lòng quét mã QR bằng ứng dụng MoMo',
          };
          break;

        case 'bank':
          // Generate VietQR for bank transfer
          const bankResult = await vietQRService.generateQR({
            amount,
            description: `Thanh toan ${orderId}`,
          });
          
          qrResult = {
            method: 'bank',
            qrCodeUrl: bankResult.qrCodeUrl,
            qrCodeData: bankResult.qrCodeData,
            message: 'Vui lòng quét mã QR bằng ứng dụng ngân hàng',
            bankInfo: {
              bankName: bankResult.bankInfo.bankName,
              accountNo: bankResult.bankInfo.accountNo,
              accountName: bankResult.bankInfo.accountName,
              amount: bankResult.bankInfo.amount,
              content: bankResult.bankInfo.content,
            },
          };
          break;

        case 'credit_card':
          // Generate Stripe payment intent
          const stripeResult = await stripeService.createPaymentIntent({
            amount,
            currency: currency.toLowerCase(),
            orderId,
            description: `Payment for order ${orderId}`,
            metadata: {
              orderId,
              buyerId: user.userId,
            },
          });

          if (!stripeResult.success) {
            throw new Error(stripeResult.error || 'Failed to create payment intent');
          }

          qrResult = {
            method: 'credit_card',
            clientSecret: stripeResult.data.clientSecret,
            paymentIntentId: stripeResult.data.id,
            message: 'Vui lòng nhập thông tin thẻ để thanh toán',
          };
          break;

        default:
          return reply.status(400).send({
            success: false,
            message: 'Invalid payment method',
          });
      }

      fastify.log.info(`QR generated for order ${orderId} using ${method}`);

      return reply.send({
        success: true,
        data: {
          orderId,
          ...qrResult,
        },
      });
    } catch (error: any) {
      fastify.log.error('QR generation error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message,
      });
    }
  });

  // POST /api/v1/qr/webhook/vnpay - VNPay webhook
  fastify.post('/webhook/vnpay', async (request, reply) => {
    const params = request.body as any;

    try {
      const verification = vnpayService.verifyReturnUrl(params);

      if (verification.isValid) {
        const orderId = params.vnp_TxnRef;
        const responseCode = params.vnp_ResponseCode;
        const amount = parseInt(params.vnp_Amount) / 100;

        if (responseCode === '00') {
          // Payment successful
          fastify.log.info(`VNPay payment successful for order ${orderId}`);
          
          // Update order status
          await prisma.orders.update({
            where: { id: orderId },
            data: { status: 'PAYMENT_PENDING_VERIFICATION' },
          });

          // Create payment record
          const paymentId = `PAY-${Date.now()}-${orderId.slice(-4)}`;
          await prisma.payments.create({
            data: {
              id: paymentId,
              order_id: orderId,
              amount,
              currency: 'VND',
              provider: 'VNPAY',
              method: 'VNPAY',
              status: 'PENDING',
              paid_at: new Date(),
              updated_at: new Date(),
            },
          });
          
          return reply.send({ RspCode: '00', Message: 'Confirm Success' });
        } else {
          // Payment failed
          fastify.log.warn(`VNPay payment failed for order ${orderId}: ${responseCode}`);
          return reply.send({ RspCode: '00', Message: 'Confirm Success' });
        }
      } else {
        return reply.status(400).send({ RspCode: '97', Message: 'Invalid Signature' });
      }
    } catch (error: any) {
      fastify.log.error('VNPay webhook error:', error);
      return reply.status(500).send({ RspCode: '99', Message: 'System Error' });
    }
  });

  // POST /api/v1/qr/webhook/momo - MoMo webhook
  fastify.post('/webhook/momo', async (request, reply) => {
    const params = request.body as any;

    try {
      const verification = momoService.verifyCallback(params);

      if (verification.isValid) {
        const orderId = params.orderId;
        const resultCode = params.resultCode;
        const amount = params.amount;

        if (resultCode === 0) {
          // Payment successful
          fastify.log.info(`MoMo payment successful for order ${orderId}`);
          
          // Update order status
          await prisma.orders.update({
            where: { id: orderId },
            data: { status: 'PAYMENT_PENDING_VERIFICATION' },
          });

          // Create payment record
          const paymentId = `PAY-${Date.now()}-${orderId.slice(-4)}`;
          await prisma.payments.create({
            data: {
              id: paymentId,
              order_id: orderId,
              amount,
              currency: 'VND',
              provider: 'MOMO',
              method: 'MOMO',
              status: 'PENDING',
              paid_at: new Date(),
              updated_at: new Date(),
            },
          });
          
          return reply.send({ resultCode: 0, message: 'Success' });
        } else {
          // Payment failed
          fastify.log.warn(`MoMo payment failed for order ${orderId}: ${resultCode}`);
          return reply.send({ resultCode: 0, message: 'Success' });
        }
      } else {
        return reply.status(400).send({ resultCode: 1, message: 'Invalid Signature' });
      }
    } catch (error: any) {
      fastify.log.error('MoMo webhook error:', error);
      return reply.status(500).send({ resultCode: 99, message: 'System Error' });
    }
  });

  // POST /api/v1/qr/webhook/stripe - Stripe webhook
  fastify.post('/webhook/stripe', {
    config: {
      rawBody: true, // Required for Stripe signature verification
    },
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;

    try {
      const event = stripeService.verifyWebhookSignature(
        request.rawBody || request.body,
        signature
      );

      if (!event.success) {
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      // Process webhook event
      const result = await stripeService.processWebhookEvent(event.event);

      // Handle specific events
      if (event.event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.event.data.object as any;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status
          await prisma.orders.update({
            where: { id: orderId },
            data: { status: 'PAYMENT_PENDING_VERIFICATION' },
          });

          // Create payment record
          const paymentId = `PAY-${Date.now()}-${orderId.slice(-4)}`;
          await prisma.payments.create({
            data: {
              id: paymentId,
              order_id: orderId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              provider: 'STRIPE',
              method: 'CARD',
              status: 'PENDING',
              paid_at: new Date(),
              updated_at: new Date(),
            },
          });

          fastify.log.info(`Stripe payment successful for order ${orderId}`);
        }
      }

      return reply.send({ received: true });
    } catch (error: any) {
      fastify.log.error('Stripe webhook error:', error);
      return reply.status(400).send({ error: error.message });
    }
  });
}

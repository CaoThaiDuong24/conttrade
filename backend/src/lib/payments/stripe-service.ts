// @ts-nocheck
/**
 * STRIPE PAYMENT GATEWAY INTEGRATION
 * Stripe API integration for international payments
 * Documentation: https://stripe.com/docs/api
 */

import Stripe from 'stripe';

interface StripeConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
  currency: string;
}

class StripeService {
  private stripe: Stripe | null = null;
  private config: StripeConfig;

  constructor() {
    // Load from environment variables
    this.config = {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publicKey: process.env.STRIPE_PUBLIC_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      currency: process.env.STRIPE_CURRENCY || 'usd'
    };

    // Initialize Stripe if credentials are available
    if (this.config.secretKey) {
      try {
        this.stripe = new Stripe(this.config.secretKey, {
          apiVersion: '2024-11-20.acacia',
          typescript: true
        });
        console.log('✅ Stripe initialized successfully');
      } catch (error) {
        console.error('❌ Stripe initialization failed:', error);
      }
    } else {
      console.warn('⚠️ Stripe not configured. Set STRIPE_SECRET_KEY in .env');
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    orderId: string;
    customerId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency || this.config.currency,
        description: params.description || `Payment for order ${params.orderId}`,
        customer: params.customerId,
        metadata: {
          orderId: params.orderId,
          ...(params.metadata || {})
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      console.log('✅ Stripe payment intent created:', paymentIntent.id);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata
      });

      console.log('✅ Stripe customer created:', customer.id);

      return {
        success: true,
        data: {
          id: customer.id,
          email: customer.email,
          name: customer.name
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe customer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe payment intent retrieval failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const confirmParams: any = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      console.log('✅ Stripe payment intent confirmed:', paymentIntent.id);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe payment intent confirmation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      console.log('✅ Stripe payment intent canceled:', paymentIntent.id);

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe payment intent cancellation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create refund
   */
  async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const refundParams: any = {
        payment_intent: params.paymentIntentId,
        metadata: params.metadata
      };

      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100);
      }

      if (params.reason) {
        refundParams.reason = params.reason as Stripe.RefundCreateParams.Reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      console.log('✅ Stripe refund created:', refund.id);

      return {
        success: true,
        data: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason
        }
      };
    } catch (error: any) {
      console.error('❌ Stripe refund creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): any {
    try {
      if (!this.stripe || !this.config.webhookSecret) {
        throw new Error('Stripe webhook not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      console.log('✅ Stripe webhook verified:', event.type);

      return {
        success: true,
        event
      };
    } catch (error: any) {
      console.error('❌ Stripe webhook verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: Stripe.Event): Promise<any> {
    try {
      console.log('📥 Processing Stripe webhook event:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('✅ Payment succeeded:', paymentIntent.id);
          // TODO: Update order status in database
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('❌ Payment failed:', failedPayment.id);
          // TODO: Handle failed payment
          break;

        case 'charge.refunded':
          const refund = event.data.object as Stripe.Charge;
          console.log('💰 Refund processed:', refund.id);
          // TODO: Update order with refund status
          break;

        default:
          console.log('ℹ️ Unhandled event type:', event.type);
      }

      return {
        success: true,
        eventType: event.type
      };
    } catch (error: any) {
      console.error('❌ Webhook event processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!this.stripe;
  }

  /**
   * Get public key
   */
  getPublicKey(): string {
    return this.config.publicKey;
  }
}

// Export singleton
const stripeService = new StripeService();
export default stripeService;
export { StripeService };

console.log('💳 Stripe Service Loaded');
console.log('🔧 Configured:', stripeService.isConfigured() ? 'Yes' : 'No - Set environment variables');

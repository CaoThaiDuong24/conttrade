/**
 * Buyer Rental Payment Routes
 * Handles buyer experience for rental payments: schedule view, 1-click payment, contract terms
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function buyerRentalPaymentRoutes(fastify: FastifyInstance) {
  
  // ============================================================
  // GET /api/v1/buyers/me/rental-payments - Get buyer's payment schedule
  // ============================================================
  fastify.get('/buyers/me/rental-payments', {
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
      const { contractId, status, upcoming } = request.query as any;

      // Build where clause
      const where: any = {
        rental_contract: {
          buyer_id: userId,
        },
      };

      if (contractId) {
        where.rental_contract_id = contractId;
      }

      if (status) {
        where.status = status;
      }

      // If upcoming=true, filter for payments due in next 30 days
      if (upcoming === 'true') {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        where.due_date = {
          gte: now,
          lte: futureDate,
        };
        where.status = 'PENDING';
      }

      // Get payments with contract details
      const payments = await prisma.rental_payments.findMany({
        where,
        include: {
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              listing_id: true,
              container_id: true,
              rental_price: true,
              rental_currency: true,
              start_date: true,
              end_date: true,
              status: true,
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
          },
        },
        orderBy: {
          due_date: 'asc',
        },
      });

      // Calculate summary
      const summary = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        overdue: payments.filter(p => {
          if (p.status === 'PENDING' && p.due_date) {
            return new Date(p.due_date) < new Date();
          }
          return false;
        }).length,
        paid: payments.filter(p => p.status === 'COMPLETED').length,
        totalDue: payments
          .filter(p => p.status === 'PENDING')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        nextPaymentDue: payments.find(p => p.status === 'PENDING' && p.due_date)?.due_date || null,
      };

      return reply.send({
        success: true,
        data: {
          payments,
          summary,
        },
      });
    } catch (error: any) {
      console.error('Error fetching buyer rental payments:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch rental payments',
        error: error.message,
      });
    }
  });

  // ============================================================
  // POST /api/v1/rental-payments/:id/pay-now - 1-click payment for rental
  // ============================================================
  fastify.post<{
    Params: { id: string };
    Body: {
      payment_method?: string;
      transaction_id?: string;
      notes?: string;
    };
  }>('/rental-payments/:id/pay-now', {
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
      const { id } = request.params;
      const { payment_method = 'BANK_TRANSFER', transaction_id, notes } = request.body;

      // Get payment record
      const payment = await prisma.rental_payments.findUnique({
        where: { id },
        include: {
          rental_contract: {
            select: {
              id: true,
              contract_number: true,
              buyer_id: true,
              seller_id: true,
              rental_price: true,
              rental_currency: true,
              total_paid: true,
              total_amount_due: true,
            },
          },
        },
      });

      if (!payment) {
        return reply.status(404).send({
          success: false,
          message: 'Payment record not found',
        });
      }

      // Verify buyer
      if (payment.rental_contract.buyer_id !== userId) {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to make this payment',
        });
      }

      // Check if already paid
      if (payment.status === 'COMPLETED') {
        return reply.status(400).send({
          success: false,
          message: 'Payment already completed',
        });
      }

      const now = new Date();

      // Update payment record
      const updatedPayment = await prisma.rental_payments.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          payment_method: payment_method as any,
          transaction_id: transaction_id || `TXN-${Date.now()}`,
          paid_at: now,
          notes: notes || 'Paid via 1-click payment',
          updated_at: now,
        },
      });

      // Update contract total_paid and payment_status
      const newTotalPaid = Number(payment.rental_contract.total_paid) + Number(payment.amount);
      const totalDue = Number(payment.rental_contract.total_amount_due) || 0;
      
      let newPaymentStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' = 'PARTIALLY_PAID';
      if (newTotalPaid >= totalDue) {
        newPaymentStatus = 'PAID';
      } else if (newTotalPaid === 0) {
        newPaymentStatus = 'PENDING';
      }

      await prisma.rental_contracts.update({
        where: { id: payment.rental_contract_id },
        data: {
          total_paid: newTotalPaid,
          payment_status: newPaymentStatus,
          updated_at: now,
        },
      });

      // Send notification to seller
      try {
        const { NotificationService } = await import('../lib/notifications/notification-service');
        await NotificationService.createNotification({
          userId: payment.rental_contract.seller_id,
          type: 'payment_received',
          title: 'Thanh toán tiền thuê đã nhận',
          message: `Buyer đã thanh toán ${new Intl.NumberFormat('vi-VN').format(Number(payment.amount))} ${payment.rental_contract.rental_currency} cho hợp đồng ${payment.rental_contract.contract_number}`,
          actionUrl: `/sell/rental-contracts/${payment.rental_contract_id}`,
          orderData: {
            paymentId: payment.id,
            contractId: payment.rental_contract_id,
            amount: payment.amount,
            currency: payment.rental_contract.rental_currency,
          },
        });
      } catch (notifError) {
        console.error('Failed to send payment notification:', notifError);
      }

      return reply.send({
        success: true,
        message: 'Payment completed successfully',
        data: {
          paymentId: updatedPayment.id,
          amount: updatedPayment.amount,
          currency: payment.currency,
          paidAt: updatedPayment.paid_at,
          transactionId: updatedPayment.transaction_id,
          contractPaymentStatus: newPaymentStatus,
        },
      });
    } catch (error: any) {
      console.error('Error processing rental payment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to process payment',
        error: error.message,
      });
    }
  });

  // ============================================================
  // GET /api/v1/rental-contracts/:id/terms - Get contract terms (clear display)
  // ============================================================
  fastify.get<{
    Params: { id: string };
  }>('/rental-contracts/:id/terms', {
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

      const contract = await prisma.rental_contracts.findUnique({
        where: { id },
        include: {
          listing: {
            select: {
              title: true,
              description: true,
            },
          },
          container: {
            select: {
              container_iso_code: true,
              shipping_line: true,
              manufactured_year: true,
            },
          },
          seller: {
            select: {
              display_name: true,
              email: true,
              phone: true,
            },
          },
          buyer: {
            select: {
              display_name: true,
              email: true,
              phone: true,
            },
          },
          pickup_depot: {
            select: {
              name: true,
              address: true,
              contact: true,
            },
          },
          return_depot: {
            select: {
              name: true,
              address: true,
              contact: true,
            },
          },
        },
      });

      if (!contract) {
        return reply.status(404).send({
          success: false,
          message: 'Contract not found',
        });
      }

      // Format contract terms for clear display
      const terms = {
        contractInfo: {
          contractNumber: contract.contract_number,
          status: contract.status,
          createdDate: contract.created_at,
        },
        parties: {
          seller: contract.seller,
          buyer: contract.buyer,
        },
        containerDetails: {
          listing: contract.listing,
          container: contract.container,
        },
        rentalPeriod: {
          startDate: contract.start_date,
          endDate: contract.end_date,
          durationDays: Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        },
        pricing: {
          rentalPrice: contract.rental_price,
          currency: contract.rental_currency,
          rentalUnit: contract.rental_unit,
          totalAmountDue: contract.total_amount_due,
          totalPaid: contract.total_paid,
          balance: Number(contract.total_amount_due || 0) - Number(contract.total_paid),
          paymentStatus: contract.payment_status,
        },
        deposit: {
          required: Number(contract.deposit_amount || 0) > 0,
          amount: contract.deposit_amount,
          currency: contract.deposit_currency,
          paid: contract.deposit_paid,
          paidAt: contract.deposit_paid_at,
          returned: contract.deposit_returned,
          returnDate: contract.deposit_return_date,
          returnAmount: contract.deposit_return_amount,
        },
        lateFees: {
          ratePerDay: contract.late_fee_rate,
          unit: contract.late_fee_unit,
          currentLateFees: contract.late_fees,
          daysOverdue: contract.days_overdue,
        },
        locations: {
          pickupDepot: contract.pickup_depot,
          returnDepot: contract.return_depot,
        },
        autoRenewal: {
          enabled: contract.auto_renewal,
          renewalCount: contract.renewal_count,
          lastRenewedAt: contract.last_renewed_at,
          nextRenewalDate: contract.next_renewal_date,
        },
        inspections: {
          pickup: {
            condition: contract.pickup_condition,
            photos: contract.pickup_photos || [],
            date: contract.pickup_inspection_date,
            inspector: contract.pickup_inspector_name,
          },
          return: {
            condition: contract.return_condition,
            photos: contract.return_photos || [],
            date: contract.return_inspection_date,
            inspector: contract.return_inspector_name,
            damageReport: contract.damage_report,
            damageCost: contract.damage_cost,
          },
        },
        additionalTerms: {
          termsAndConditions: contract.terms_and_conditions,
          specialNotes: contract.special_notes,
          contractPdfUrl: contract.contract_pdf_url,
        },
      };

      return reply.send({
        success: true,
        data: terms,
      });
    } catch (error: any) {
      console.error('Error fetching contract terms:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to fetch contract terms',
        error: error.message,
      });
    }
  });
}

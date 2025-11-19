# 📋 PHASE 1 IMPLEMENTATION PLAN - HOÀN THIỆN LUỒNG THUÊ CONTAINER

**Dựa trên:** BAO-CAO-DANH-GIA-CUOI-CUNG-RENTAL-WORKFLOW.md  
**Sau khi:** Fix critical bug rental_duration_months ✅  
**Thời gian:** 2-3 tuần  
**Mục tiêu:** Đưa hệ thống rental lên production-ready

---

## 🎯 MỤC TIÊU PHASE 1

### Đạt được 95% hoàn thiện cho rental workflow:
- ✅ Core workflow đã hoạt động (75%)
- 🔄 Bổ sung notifications (thêm 10%)
- 🔄 Bổ sung automation logic (thêm 10%)
- 🔄 Testing & documentation (thêm 5%)

**Kết quả:** Hệ thống sẵn sàng deploy production

---

## 📅 LỊCH TRÌNH CHI TIẾT

### **Week 1: Email Notifications & Templates (5 ngày)**

#### Day 1-2: Email Infrastructure Setup
**Mục tiêu:** Thiết lập email service hoàn chỉnh

**Tasks:**
- [ ] **1.1. Setup Email Provider**
  - Configure SendGrid/Mailgun/AWS SES
  - Get API keys & verify sender domain
  - Create email templates structure
  - Test basic send functionality

  ```typescript
  // backend/src/lib/email/email-config.ts
  export const emailConfig = {
    provider: 'sendgrid', // or 'mailgun', 'ses'
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: 'noreply@i-contexchange.com',
    fromName: 'i-ContExchange',
    replyTo: 'support@i-contexchange.com',
  };
  ```

- [ ] **1.2. Create Base Email Service**
  ```typescript
  // backend/src/lib/email/email-service.ts
  export class EmailService {
    static async send(options: EmailOptions): Promise<boolean>
    static async sendTemplate(templateName: string, data: any): Promise<boolean>
    static async sendBatch(emails: EmailOptions[]): Promise<boolean>
  }
  ```

- [ ] **1.3. Create Email Templates Base**
  ```
  backend/src/lib/email/templates/
  ├── base/
  │   ├── header.html
  │   ├── footer.html
  │   └── layout.html
  ├── rental/
  │   └── (will add in Day 3-4)
  └── helpers/
      ├── format-currency.ts
      ├── format-date.ts
      └── template-compiler.ts
  ```

**Deliverables:**
- Email service hoạt động
- Test email gửi thành công
- Base templates sẵn sàng

---

#### Day 3-4: Rental Email Templates
**Mục tiêu:** Tạo đầy đủ email templates cho rental events

**Tasks:**

- [ ] **2.1. Contract Created Email**
  ```html
  <!-- backend/src/lib/email/templates/rental/contract-created.html -->
  
  Subject: 🎉 Hợp Đồng Thuê Container Đã Được Tạo - {{contract_number}}
  
  Body:
  - Welcome message
  - Contract summary (number, duration, price)
  - Container details
  - Payment schedule overview
  - Next steps
  - Contact support
  - CTA: View Contract Details
  ```

  ```typescript
  // backend/src/lib/email/rental-email-service.ts
  export class RentalEmailService {
    static async sendContractCreated(contractId: string): Promise<boolean> {
      const contract = await getContractWithDetails(contractId);
      return EmailService.sendTemplate('rental/contract-created', {
        contract_number: contract.contract_number,
        buyer_name: contract.buyer.full_name,
        seller_name: contract.seller.full_name,
        start_date: formatDate(contract.start_date),
        end_date: formatDate(contract.end_date),
        rental_price: formatCurrency(contract.rental_price),
        total_amount: formatCurrency(contract.total_amount_due),
        container_details: contract.container,
        payment_schedule_url: `${BASE_URL}/my-rentals/${contractId}/payments`,
      });
    }
  }
  ```

- [ ] **2.2. Payment Due Reminder Email** (3 days before)
  ```html
  Subject: 💳 Nhắc Nhở Thanh Toán - Kỳ {{payment_period}} - {{contract_number}}
  
  Body:
  - Friendly reminder
  - Payment details (period, amount, due date)
  - Payment methods
  - Consequences of late payment
  - CTA: Pay Now
  ```

- [ ] **2.3. Payment Overdue Email**
  ```html
  Subject: ⚠️ Thanh Toán Quá Hạn - {{contract_number}}
  
  Body:
  - Urgent notice
  - Overdue details (days, late fee)
  - Total amount due
  - Next actions
  - CTA: Pay Immediately
  ```

- [ ] **2.4. Contract Expiring Soon Email** (7 days before)
  ```html
  Subject: 📅 Hợp Đồng Sắp Hết Hạn - {{contract_number}}
  
  Body:
  - Expiration notice
  - Current contract summary
  - Renewal options
  - Extension process
  - Contact seller
  - CTA: Request Extension / View Options
  ```

- [ ] **2.5. Contract Extended Email**
  ```html
  Subject: ✅ Hợp Đồng Đã Được Gia Hạn - {{contract_number}}
  
  Body:
  - Extension confirmation
  - New end date
  - Additional charges
  - Updated payment schedule
  - CTA: View Updated Contract
  ```

- [ ] **2.6. Contract Completed Email**
  ```html
  Subject: 🎊 Hoàn Tất Hợp Đồng Thuê - {{contract_number}}
  
  Body:
  - Completion notice
  - Final summary
  - Deposit refund (if any)
  - Request for review
  - Thank you message
  - CTA: Rate Your Experience
  ```

**Deliverables:**
- 6 email templates hoàn chỉnh
- RentalEmailService với 6 methods
- Unit tests cho email sending

---

#### Day 5: Email Integration & Testing
**Mục tiêu:** Tích hợp emails vào workflow

**Tasks:**

- [ ] **3.1. Integrate vào RentalContractService**
  ```typescript
  // backend/src/services/rental-contract-service.ts
  
  static async createContractFromOrder(orderId: string) {
    // ... existing logic ...
    
    // ✅ Send email after contract created
    await RentalEmailService.sendContractCreated(contract.id);
    
    return { success: true, contractId: contract.id };
  }
  ```

- [ ] **3.2. Integrate vào Cron Jobs**
  ```typescript
  // backend/src/services/cron-jobs.ts
  
  // Daily at 9:00 AM - Send payment reminders
  cron.schedule('0 9 * * *', async () => {
    const upcomingPayments = await getPaymentsDueInDays(3);
    
    for (const payment of upcomingPayments) {
      await RentalEmailService.sendPaymentReminder(payment.id);
    }
  });
  ```

- [ ] **3.3. Testing**
  - Test mỗi email template
  - Test với real data
  - Test unsubscribe links
  - Test email deliverability
  - Load testing (100+ emails)

**Deliverables:**
- Emails tự động gửi
- Tests passed
- Documentation

---

### **Week 2: Automation Logic (5 ngày)**

#### Day 6-7: Auto Late Fee Calculation
**Mục tiêu:** Tự động tính phí trễ hạn

**Tasks:**

- [ ] **4.1. Create LateFeeService**
  ```typescript
  // backend/src/services/late-fee-service.ts
  
  export class LateFeeService {
    /**
     * Calculate late fees for overdue payments
     * Called by cron job daily
     */
    static async calculateOverdueLateFees(): Promise<void> {
      // 1. Find all overdue payments (due_date < today, status != PAID)
      const overduePayments = await prisma.rental_payments.findMany({
        where: {
          due_date: { lt: new Date() },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
        include: {
          rental_contracts: {
            select: {
              id: true,
              late_fee_rate: true,
              late_fee_unit: true,
              rental_price: true,
              rental_currency: true,
            },
          },
        },
      });

      // 2. Calculate late fee for each
      for (const payment of overduePayments) {
        const contract = payment.rental_contracts;
        const daysOverdue = getDaysOverdue(payment.due_date);
        
        let lateFee = 0;
        if (contract.late_fee_unit === 'DAY') {
          // Per day: late_fee_rate × days
          lateFee = Number(contract.late_fee_rate) * daysOverdue;
        } else if (contract.late_fee_unit === 'PERCENT') {
          // Percentage: rental_price × late_fee_rate% × days
          lateFee = Number(contract.rental_price) * 
                    (Number(contract.late_fee_rate) / 100) * 
                    daysOverdue;
        }
        
        // 3. Update payment with late fee
        await prisma.rental_payments.update({
          where: { id: payment.id },
          data: {
            late_fee_amount: lateFee,
            late_fee_currency: contract.rental_currency,
          },
        });
        
        // 4. Update contract total_amount_due
        await prisma.rental_contracts.update({
          where: { id: contract.id },
          data: {
            total_amount_due: {
              increment: lateFee,
            },
          },
        });
        
        console.log(`✅ Late fee calculated: Payment ${payment.id}, Fee ${lateFee}`);
      }
    }
    
    /**
     * Get total late fees for a contract
     */
    static async getContractLateFees(contractId: string): Promise<number> {
      const payments = await prisma.rental_payments.findMany({
        where: { contract_id: contractId },
        select: { late_fee_amount: true },
      });
      
      return payments.reduce((sum, p) => sum + Number(p.late_fee_amount || 0), 0);
    }
  }
  ```

- [ ] **4.2. Add Cron Job**
  ```typescript
  // backend/src/services/cron-jobs.ts
  
  // Daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Calculating late fees...');
    await LateFeeService.calculateOverdueLateFees();
  });
  ```

- [ ] **4.3. Update Contract API**
  - Add endpoint: `GET /api/v1/rental-contracts/:id/late-fees`
  - Show late fees in contract details
  - Update frontend to display late fees

**Deliverables:**
- LateFeeService hoạt động
- Cron job tự động chạy
- Frontend hiển thị late fees

---

#### Day 8-9: Auto-Renewal Logic
**Mục tiêu:** Tự động gia hạn hợp đồng

**Tasks:**

- [ ] **5.1. Create AutoRenewalService**
  ```typescript
  // backend/src/services/auto-renewal-service.ts
  
  export class AutoRenewalService {
    /**
     * Process auto-renewals for contracts expiring soon
     * Called by cron job daily
     */
    static async processAutoRenewals(): Promise<void> {
      // 1. Find contracts expiring in 7 days with auto_renewal_enabled
      const expiringContracts = await prisma.rental_contracts.findMany({
        where: {
          end_date: {
            gte: addDays(new Date(), 7),
            lte: addDays(new Date(), 8),
          },
          auto_renewal_enabled: true,
          status: 'ACTIVE',
          deleted_at: null,
        },
        include: {
          listings: true,
          buyer: true,
          seller: true,
        },
      });

      for (const contract of expiringContracts) {
        // 2. Check buyer payment history (must be good standing)
        const hasOverduePayments = await this.hasOverduePayments(contract.id);
        if (hasOverduePayments) {
          console.log(`⚠️  Contract ${contract.contract_number} has overdue payments. Skipping auto-renewal.`);
          
          // Send notification to buyer
          await RentalEmailService.sendAutoRenewalBlocked(contract.id, 'overdue_payments');
          continue;
        }
        
        // 3. Calculate renewal duration
        const renewalMonths = contract.auto_renewal_duration_months || 
                              contract.listings.min_rental_duration || 
                              1;
        
        // 4. Create renewal contract
        const renewalContractId = randomUUID();
        const newStartDate = contract.end_date;
        const newEndDate = addMonths(newStartDate, renewalMonths);
        
        const renewalContract = await prisma.rental_contracts.create({
          data: {
            id: renewalContractId,
            contract_number: `RC-RENEW-${Date.now()}`,
            listing_id: contract.listing_id,
            seller_id: contract.seller_id,
            buyer_id: contract.buyer_id,
            container_id: contract.container_id,
            
            // Renewal from previous contract
            previous_contract_id: contract.id,
            
            // Contract terms (same as previous)
            start_date: newStartDate,
            end_date: newEndDate,
            rental_price: contract.rental_price,
            rental_currency: contract.rental_currency,
            rental_unit: contract.rental_unit,
            
            // Deposit (no need to collect again)
            deposit_amount: 0, // Already collected
            deposit_paid: true,
            deposit_paid_at: contract.deposit_paid_at,
            
            // Same terms
            late_fee_rate: contract.late_fee_rate,
            late_fee_unit: contract.late_fee_unit,
            pickup_depot_id: contract.pickup_depot_id,
            return_depot_id: contract.return_depot_id,
            
            // Financial
            total_amount_due: Number(contract.rental_price) * renewalMonths,
            total_paid: 0,
            payment_status: 'PENDING',
            
            // Auto-renewal settings (carry forward)
            auto_renewal_enabled: contract.auto_renewal_enabled,
            auto_renewal_duration_months: contract.auto_renewal_duration_months,
            
            // Status
            status: 'ACTIVE',
            
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        
        // 5. Generate payment schedule for renewal
        await this.generatePaymentSchedule(renewalContract.id, renewalMonths);
        
        // 6. Update previous contract status
        await prisma.rental_contracts.update({
          where: { id: contract.id },
          data: {
            status: 'RENEWED',
            renewal_contract_id: renewalContractId,
          },
        });
        
        // 7. Send notifications
        await RentalEmailService.sendContractRenewed(renewalContractId);
        
        console.log(`✅ Auto-renewed contract: ${contract.contract_number} → ${renewalContract.contract_number}`);
      }
    }
    
    /**
     * Check if contract has overdue payments
     */
    private static async hasOverduePayments(contractId: string): Promise<boolean> {
      const overdueCount = await prisma.rental_payments.count({
        where: {
          contract_id: contractId,
          due_date: { lt: new Date() },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
      });
      
      return overdueCount > 0;
    }
    
    /**
     * Generate payment schedule for renewed contract
     */
    private static async generatePaymentSchedule(contractId: string, months: number): Promise<void> {
      // Same logic as RentalContractService.generatePaymentSchedule
      // ...
    }
  }
  ```

- [ ] **5.2. Add Cron Job**
  ```typescript
  // backend/src/services/cron-jobs.ts
  
  // Daily at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🔄 Processing auto-renewals...');
    await AutoRenewalService.processAutoRenewals();
  });
  ```

- [ ] **5.3. Update Schema (if needed)**
  ```prisma
  model rental_contracts {
    // ... existing fields
    
    // ✅ Add renewal tracking
    previous_contract_id String?
    renewal_contract_id  String?
    
    previous_contract rental_contracts? @relation("contract_renewal", fields: [previous_contract_id], references: [id])
    renewed_contract  rental_contracts? @relation("contract_renewal")
  }
  ```

**Deliverables:**
- AutoRenewalService hoạt động
- Cron job tự động chạy
- Email notifications gửi
- Frontend hiển thị renewal info

---

#### Day 10: Payment Retry Logic
**Mục tiêu:** Tự động retry failed payments

**Tasks:**

- [ ] **6.1. Create PaymentRetryService**
  ```typescript
  // backend/src/services/payment-retry-service.ts
  
  export class PaymentRetryService {
    /**
     * Retry failed payments
     * Called by cron job or manually
     */
    static async retryFailedPayments(): Promise<void> {
      // 1. Find failed payments (retry_count < max_retries)
      const failedPayments = await prisma.rental_payments.findMany({
        where: {
          status: 'FAILED',
          retry_count: { lt: 3 }, // Max 3 retries
          next_retry_date: { lte: new Date() },
        },
        include: {
          rental_contracts: {
            include: {
              buyer: true,
            },
          },
        },
      });

      for (const payment of failedPayments) {
        try {
          // 2. Retry payment via VNPay/Momo
          const paymentResult = await this.retryPayment(payment);
          
          if (paymentResult.success) {
            // Success
            await prisma.rental_payments.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                paid_at: new Date(),
                transaction_id: paymentResult.transactionId,
              },
            });
            
            console.log(`✅ Payment retry successful: ${payment.id}`);
          } else {
            // Failed again
            const retryCount = payment.retry_count + 1;
            const nextRetryDate = addDays(new Date(), Math.pow(2, retryCount)); // Exponential backoff
            
            await prisma.rental_payments.update({
              where: { id: payment.id },
              data: {
                retry_count: retryCount,
                next_retry_date: nextRetryDate,
                last_error: paymentResult.error,
              },
            });
            
            // If max retries reached, notify
            if (retryCount >= 3) {
              await RentalEmailService.sendPaymentRetryExhausted(payment.id);
            }
          }
        } catch (error) {
          console.error(`❌ Payment retry error: ${payment.id}`, error);
        }
      }
    }
    
    /**
     * Retry single payment
     */
    private static async retryPayment(payment: any): Promise<PaymentResult> {
      // Implement VNPay/Momo retry logic
      // ...
    }
  }
  ```

- [ ] **6.2. Add to Cron Jobs**
  ```typescript
  // Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Retrying failed payments...');
    await PaymentRetryService.retryFailedPayments();
  });
  ```

**Deliverables:**
- PaymentRetryService hoạt động
- Exponential backoff implemented
- Email notifications

---

### **Week 3: Testing & Documentation (5 ngày)**

#### Day 11-12: Comprehensive Testing
**Mục tiêu:** Test toàn bộ workflow

**Tasks:**

- [ ] **7.1. Unit Tests**
  - LateFeeService tests
  - AutoRenewalService tests
  - PaymentRetryService tests
  - Email service tests

- [ ] **7.2. Integration Tests**
  - Cart → Order → Contract workflow
  - Payment → Contract activation
  - Auto-renewal workflow
  - Late fee calculation workflow

- [ ] **7.3. End-to-End Tests**
  - Buyer complete rental flow
  - Seller manage rental flow
  - Extension request flow
  - Payment flow

- [ ] **7.4. Load Testing**
  - 1000 concurrent users
  - 100 contracts auto-renewed
  - 500 emails sent
  - Performance metrics

**Deliverables:**
- Test coverage > 80%
- All tests pass
- Performance report

---

#### Day 13-14: Documentation & Deployment Prep
**Mục tiêu:** Chuẩn bị deploy production

**Tasks:**

- [ ] **8.1. API Documentation**
  - Update Swagger/OpenAPI specs
  - Add rental endpoints
  - Add examples

- [ ] **8.2. User Documentation**
  - Buyer guide: How to rent
  - Seller guide: How to manage rentals
  - FAQ for rental

- [ ] **8.3. Admin Documentation**
  - System overview
  - Cron jobs documentation
  - Troubleshooting guide
  - Database schema docs

- [ ] **8.4. Deployment Checklist**
  - Environment variables
  - Email provider setup
  - Cron jobs configuration
  - Database migration
  - Rollback plan

**Deliverables:**
- Complete documentation
- Deployment guide
- Training materials

---

#### Day 15: Final Review & Deploy
**Mục tiêu:** Deploy production

**Tasks:**

- [ ] **9.1. Final Code Review**
  - Security review
  - Performance review
  - Best practices check

- [ ] **9.2. Staging Deployment**
  - Deploy to staging
  - Run full test suite
  - Smoke tests

- [ ] **9.3. Production Deployment**
  - Database migration
  - Deploy backend
  - Deploy frontend
  - Enable cron jobs
  - Monitor logs

- [ ] **9.4. Post-Deployment Monitoring**
  - Error rate monitoring
  - Email delivery monitoring
  - Performance monitoring
  - User feedback collection

**Deliverables:**
- Production deployment
- Monitoring dashboard
- Post-deployment report

---

## 📊 SUCCESS METRICS

### Technical Metrics:
- [ ] Test coverage ≥ 80%
- [ ] API response time < 500ms (p95)
- [ ] Email delivery rate ≥ 95%
- [ ] Cron job success rate ≥ 99%
- [ ] Zero critical bugs

### Business Metrics:
- [ ] Contract creation success rate ≥ 98%
- [ ] Payment success rate ≥ 90%
- [ ] Auto-renewal success rate ≥ 85%
- [ ] Late fee collection rate ≥ 70%
- [ ] User satisfaction ≥ 4.0/5.0

---

## 🚨 RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Email deliverability issues | Medium | High | Multiple email providers, SPF/DKIM setup |
| Cron job failures | Low | Medium | Retry logic, monitoring, alerts |
| Payment provider downtime | Low | High | Multiple payment methods, queue system |
| Database performance | Medium | Medium | Indexing, query optimization, caching |
| User adoption slow | Medium | Low | Training, documentation, support |

---

## 💰 RESOURCE REQUIREMENTS

### Team:
- 1 Backend Developer (full-time, 3 weeks)
- 1 Frontend Developer (part-time, 1 week)
- 1 QA Engineer (part-time, 1 week)
- 1 DevOps (part-time, 3 days)

### Infrastructure:
- Email service subscription (~$50/month)
- Monitoring tools (free tier OK)
- Staging environment

### Estimated Cost:
- Development: 3 developer-weeks
- Infrastructure: ~$100 setup + $50/month
- **Total: ~$150 one-time + $50/month**

---

## ✅ FINAL CHECKLIST

### Before Starting:
- [ ] Critical bug fix completed ✅
- [ ] Team assigned
- [ ] Environment setup
- [ ] Kickoff meeting

### During Implementation:
- [ ] Daily standup
- [ ] Code reviews
- [ ] Progress tracking
- [ ] Blockers resolved

### Before Deployment:
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Deployment plan approved
- [ ] Rollback plan ready

### After Deployment:
- [ ] Monitoring active
- [ ] Team on-call
- [ ] User feedback collected
- [ ] Retrospective meeting

---

**Start Date:** 18/11/2025  
**Target Completion:** 08/12/2025  
**Review Date:** 10/12/2025

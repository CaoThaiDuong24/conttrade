# 🚀 QUICK START GUIDE - RENTAL WORKFLOW FIX

**For:** Developers, QA, DevOps  
**Updated:** 14/11/2025

---

## ⚡ TL;DR

**Problem:** Orders lose `rental_duration_months` → Contracts have wrong duration  
**Solution:** Added columns to `orders` & `order_items` tables  
**Status:** ✅ Fixed, ⏳ Testing needed  
**Time:** 2 hours implementation, 1 hour testing

---

## 🔥 WHAT CHANGED

```diff
# Database
+ orders.deal_type
+ orders.rental_duration_months
+ order_items.deal_type
+ order_items.rental_duration_months

# Code
backend/src/routes/cart.ts
  - description: "Container - 6 tháng"
  + deal_type: "RENTAL"
  + rental_duration_months: 6

backend/src/services/rental-contract-service.ts
  - const duration = listing.min_rental_duration
  + const duration = order.rental_duration_months || ...
```

---

## ✅ TO TEST (5 minutes)

### Test Case: Rent for 6 Months

```bash
# 1. Add to cart (as buyer)
POST /api/v1/cart
{
  "listing_id": "...",
  "quantity": 1,
  "deal_type": "RENTAL",
  "rental_duration_months": 6
}

# 2. Checkout
POST /api/v1/cart/checkout
{ "checkout_type": "order" }

# 3. Check order in database
SELECT 
  order_number,
  deal_type,
  rental_duration_months,
  total
FROM orders 
WHERE id = 'order-id-here';

# Expected:
# deal_type = 'RENTAL'
# rental_duration_months = 6
# total = (price × 6)

# 4. Mark order as paid (simulate payment)
UPDATE orders 
SET status = 'PAID', payment_verified_at = NOW()
WHERE id = 'order-id-here';

# 5. Check contract
SELECT 
  contract_number,
  EXTRACT(MONTH FROM AGE(end_date, start_date)) AS duration_months,
  total_amount_due
FROM rental_contracts
WHERE order_id = 'order-id-here';

# Expected:
# duration_months = 6
# total_amount_due ≈ order.total

# 6. Check payment schedule
SELECT COUNT(*) FROM rental_payments
WHERE contract_id = (
  SELECT id FROM rental_contracts WHERE order_id = 'order-id-here'
);

# Expected: 6 payments
```

---

## 🐛 IF SOMETHING BREAKS

### TypeScript Errors?
```bash
cd backend
taskkill /F /IM node.exe
npx prisma generate
# Restart VS Code
```

### Database Issues?
```bash
# Rollback (see migration file for full script)
psql -h localhost -U postgres -d i_contexchange

ALTER TABLE orders DROP COLUMN deal_type, DROP COLUMN rental_duration_months;
ALTER TABLE order_items DROP COLUMN deal_type, DROP COLUMN rental_duration_months;
```

### Need Logs?
```typescript
// Check console for:
"📅 Rental duration: X month(s) (source: order)"
"✅ Rental contract created: ..."
```

---

## 📦 DEPLOYMENT CHECKLIST

### Before Deploy:
- [ ] Backup database
- [ ] Test on staging
- [ ] Prisma Client generated
- [ ] Environment variables OK

### Deploy Steps:
```bash
# 1. Stop services
pm2 stop conttrade-backend

# 2. Pull code
git pull origin main

# 3. Install dependencies
cd backend
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema (creates columns)
npx prisma db push

# 6. (Optional) Run full migration with indexes
psql -h localhost -U postgres -d i_contexchange \
  -f migrations/20251114_add_rental_duration_to_orders.sql

# 7. Restart services
pm2 restart conttrade-backend

# 8. Verify
pm2 logs conttrade-backend --lines 50
```

### After Deploy:
- [ ] Run test script: `psql ... -f scripts/test-rental-workflow.sql`
- [ ] Test cart → order → contract workflow
- [ ] Monitor logs for errors
- [ ] Check first real rental order

---

## 📚 FULL DOCUMENTATION

- **Bug Report:** `PHAT-HIEN-LOI-NGHIEM-TRONG-RENTAL-WORKFLOW.md`
- **Fix Guide:** `HUONG-DAN-FIX-RENTAL-DURATION-BUG.md`
- **Fix Summary:** `FIX-RENTAL-DURATION-COMPLETE.md`
- **Next Steps:** `PHASE-1-IMPLEMENTATION-PLAN.md`
- **Full Report:** `SUMMARY-RENTAL-FIX-AND-ROADMAP.md`

---

## 🆘 EMERGENCY CONTACTS

**Critical Issues:**
1. Check logs: `pm2 logs conttrade-backend`
2. Check database: Run test script
3. Rollback: See migration file
4. Contact: Development team

---

**Last Updated:** 14/11/2025  
**Version:** 1.0

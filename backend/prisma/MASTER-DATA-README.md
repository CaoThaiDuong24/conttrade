# 📚 Master Data Management - i-ContExchange

Hệ thống quản lý 47 bảng Master Data cho dự án i-ContExchange.

## 📋 Tổng Quan

- **Tổng số bảng:** 47 bảng
- **Tổng số records:** ~329 records
- **Nhóm chức năng:** 13 nhóm

## 🚀 Quick Start

### 1. Tạo bảng Master Data

```bash
cd backend
psql -U postgres -d i_contexchange -f "prisma/migrations/create_master_data_tables.sql"
```

### 2. Seed dữ liệu

```bash
npx tsx prisma/seed-master-data.ts
```

### 3. Verify dữ liệu

```bash
npx tsx prisma/verify-master-data.ts
```

## 📊 Danh Sách Bảng

### 1. Địa lý & Tiền tệ (4 bảng)
- `md_countries` - 15 records
- `md_provinces` - 10 records
- `md_currencies` - 10 records
- `md_timezones` - 8 records

### 2. Container (4 bảng)
- `md_container_sizes` - 4 records
- `md_container_types` - 8 records
- `md_quality_standards` - 4 records
- `md_iso_container_codes` - 10 records

### 3. Nghiệp vụ (8 bảng)
- `md_deal_types` - 2 records
- `md_listing_statuses` - 8 records
- `md_order_statuses` - 9 records
- `md_payment_statuses` - 5 records
- `md_delivery_statuses` - 5 records
- `md_dispute_statuses` - 6 records
- `md_document_types` - 9 records
- `md_service_codes` - 8 records

### 4. Depot (3 bảng)
- `md_movement_types` - 3 records
- `md_ref_doc_types` - 5 records
- `md_adjust_reasons` - 6 records

### 5. Quản trị (11 bảng)
- `md_feature_flag_codes` - 6 records
- `md_tax_codes` - 5 records
- `md_fee_codes` - 6 records
- `md_commission_codes` - 4 records
- `md_notification_channels` - 4 records
- `md_template_codes` - 7 records
- `md_i18n_namespaces` - 5 records
- `md_form_schema_codes` - 5 records
- `md_sla_codes` - 6 records
- `md_business_hours_policies` - 4 records
- `md_integration_vendor_codes` - 6 records
- `md_payment_method_types` - 3 records
- `md_partner_types` - 6 records

### 6. Moderation (3 bảng)
- `md_violation_codes` - 6 records
- `md_redaction_channels` - 4 records
- `md_rating_scales` - 5 records

### 7. Pricing (1 bảng)
- `md_pricing_regions` - 6 records

### 8. Logistics (4 bảng)
- `md_units` - 9 records
- `md_rental_units` - 5 records
- `md_incoterms` - 11 records
- `md_delivery_event_types` - 8 records

### 9. Reasons (3 bảng)
- `md_dispute_reasons` - 7 records
- `md_cancel_reasons` - 7 records
- `md_payment_failure_reasons` - 8 records

### 10. Inspection/Repair (2 bảng)
- `md_inspection_item_codes` - 12 records
- `md_repair_item_codes` - 10 records

### 11. Notification (1 bảng)
- `md_notification_event_types` - 12 records

### 12. Cities (2 bảng)
- `md_cities` - 5 records
- `md_unlocodes` - 5 records

### 13. Insurance (1 bảng)
- `md_insurance_coverages` - 7 records

## 🔧 Quản Lý Master Data

### Thêm dữ liệu mới

1. **Chỉnh sửa file seed:**
```bash
backend/prisma/seed-master-data.ts
```

2. **Chạy lại seed:**
```bash
npx tsx prisma/seed-master-data.ts
```

### Xóa và tạo lại

```sql
-- Drop tất cả bảng master data
DROP TABLE IF EXISTS md_countries CASCADE;
DROP TABLE IF EXISTS md_provinces CASCADE;
-- ... (drop tất cả 47 bảng)

-- Tạo lại
\i prisma/migrations/create_master_data_tables.sql
```

### Export dữ liệu

```bash
# Export sang CSV
psql -U postgres -d i_contexchange -c "COPY md_countries TO '/tmp/countries.csv' CSV HEADER;"
```

### Import dữ liệu

```bash
# Import từ CSV
psql -U postgres -d i_contexchange -c "COPY md_countries FROM '/tmp/countries.csv' CSV HEADER;"
```

## 📝 Sử Dụng Trong Code

### Backend API

```typescript
// Get all countries
const countries = await prisma.$queryRaw`SELECT * FROM md_countries WHERE active = true`;

// Get provinces by country
const provinces = await prisma.$queryRaw`
  SELECT * FROM md_provinces 
  WHERE country_code = 'VN' AND active = true
`;

// Get container types
const containerTypes = await prisma.$queryRaw`SELECT * FROM md_container_types`;
```

### Frontend

```typescript
// Fetch master data
const countries = await fetch('/api/master-data/countries');
const provinces = await fetch('/api/master-data/provinces?country=VN');
```

## 🎯 Best Practices

### 1. Caching
```typescript
// Cache master data in Redis/Memory
const CACHE_TTL = 3600; // 1 hour

async function getCountries() {
  const cached = await redis.get('master:countries');
  if (cached) return JSON.parse(cached);
  
  const data = await prisma.$queryRaw`SELECT * FROM md_countries`;
  await redis.setex('master:countries', CACHE_TTL, JSON.stringify(data));
  return data;
}
```

### 2. Validation
```typescript
// Validate container type
const validTypes = await prisma.$queryRaw`SELECT code FROM md_container_types`;
if (!validTypes.some(t => t.code === inputType)) {
  throw new Error('Invalid container type');
}
```

### 3. Dropdown Options
```typescript
// Generate select options
const containerTypes = await prisma.$queryRaw`
  SELECT code as value, name as label 
  FROM md_container_types
`;
// Returns: [{ value: 'DRY', label: 'Dry Cargo' }, ...]
```

## 📖 Tài Liệu Tham Khảo

- [BAO-CAO-MASTER-DATA-COMPLETE.md](../BAO-CAO-MASTER-DATA-COMPLETE.md)
- [i-ContExchange.Database.md](../Tài%20Liệu/i-ContExchange.Database.md)

## 🐛 Troubleshooting

### Lỗi: Table already exists
```bash
# Drop và tạo lại
psql -U postgres -d i_contexchange -c "DROP TABLE IF EXISTS md_countries CASCADE;"
psql -U postgres -d i_contexchange -f "prisma/migrations/create_master_data_tables.sql"
```

### Lỗi: Permission denied
```bash
# Grant permissions
psql -U postgres -d i_contexchange -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;"
```

### Lỗi: Foreign key constraint
```bash
# Seed theo thứ tự: countries -> provinces -> cities
# Script đã xử lý thứ tự này
```

## ✅ Checklist

- [x] Tạo 47 bảng master data
- [x] Seed ~329 records
- [x] Verify dữ liệu
- [x] Tạo tài liệu
- [ ] Tạo API endpoints (optional)
- [ ] Tạo Admin UI (optional)
- [ ] Setup caching (optional)

## 📞 Support

Nếu gặp vấn đề:
1. Check verification: `npx tsx prisma/verify-master-data.ts`
2. Re-seed: `npx tsx prisma/seed-master-data.ts`
3. Check database logs

---

**Last Updated:** 03/10/2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

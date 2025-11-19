# ĐẶC TẢ CƠ SỞ DỮ LIỆU (PostgreSQL) — i‑ContExchange

Mã tài liệu: DB-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Bao phủ: mô hình ERD, bảng, khóa, chỉ mục, ràng buộc, enum, quan hệ N‑N, audit, i18n, và DDL mẫu (Postgres 14+). Tuân thủ bảo mật và Nghị định 13/2023 về dữ liệu cá nhân.

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md).

---

## 1. Nguyên tắc thiết kế
- Chuẩn hóa đến 3NF, tối ưu đọc ghi theo use case.
- Dùng UUID v4 làm khóa chính cho thực thể người dùng/giao dịch.
- Bật RLS (Row Level Security) cho bảng nhạy cảm (orders, rfqs, quotes…)
- Timezone UTC, cột `created_at`, `updated_at` (timestamptz), `deleted_at` (soft delete khi cần).
- Enum Postgres cho giá trị hữu hạn (container_condition, quality_standard, order_status…).
- Partitioning theo thời gian cho bảng log/audit lớn.

---

## 2. Danh mục bảng chính

### 2.1 Người dùng & Tổ chức
- users(id, email, phone, password_hash, status, kyc_status, display_name, default_locale, …)
- orgs(id, name, tax_code, kyb_status, owner_user_id, …)
- org_users(org_id, user_id, role_in_org)
- roles(id, code, name)
- permissions(id, code, name)
- user_roles(user_id, role_id)
- role_permissions(role_id, permission_id, scope)

### 2.2 Depot & địa điểm
- depots(id, name, code, address, province, geo_point, capacity_teu, contact)
- depot_users(depot_id, user_id, role_in_depot)

### 2.3 Container & Tin đăng
- containers(id, iso_code, size_ft, type, serial_no, owner_org_id, current_depot_id, condition, quality_standard, csc_plate_no, manufactured_year)
- listings(id, container_id NULLABLE, seller_user_id, org_id, deal_type, price_currency, price_amount, rental_unit, location_depot_id, status, title, description)
- listing_media(id, listing_id, media_url, media_type, sort_order)
- listing_facets(id, listing_id, key, value) — mở rộng thuộc tính

### 2.4 Giám định & sửa chữa
- inspections(id, listing_id, depot_id, requested_by, status, scheduled_at, completed_at, summary, standard)
- inspection_items(id, inspection_id, code, severity, note, photo_url)
- repairs(id, inspection_id, depot_id, quote_amount, status)
- repair_items(id, repair_id, item_code, qty, unit_price, note, before_photo, after_photo)

### 2.5 RFQ/Quote & Q&A (thay cho nhắn tin trực tiếp)
- rfqs(id, listing_id, buyer_id, purpose, quantity, need_by, services_json, status, submitted_at, expired_at)
- quotes(id, rfq_id, seller_id, price_subtotal, fees_json, total, currency, valid_until, status)
- quote_items(id, quote_id, item_type, ref_id, description, qty, unit_price)
- qa_questions(id, rfq_id, author_id, question, created_at, moderated)
- qa_answers(id, question_id, responder_id, answer, created_at, moderated)

### 2.6 Đơn hàng, thanh toán, vận chuyển
- orders(id, buyer_id, seller_id, listing_id, org_ids, status, subtotal, tax, fees, total, currency)
- order_items(id, order_id, item_type, ref_id, description, qty, unit_price)
- payments(id, order_id, provider, method, status, escrow_account_ref, paid_at)
- deliveries(id, order_id, pickup_depot_id, dropoff_address, schedule_at, carrier_id, status, gps_tracking_id)
- delivery_events(id, delivery_id, event_type, payload, occurred_at)
- documents(id, order_id, doc_type, number, file_url, issued_at) — EDO, EIR, invoice

### 2.7 Đánh giá & Tranh chấp
- reviews(id, order_id, reviewer_id, reviewee_id, rating, comment)
- disputes(id, order_id, opened_by, status, reason, resolution, closed_at)
- dispute_evidence(id, dispute_id, uploader_id, file_url, note)

### 2.8 Thuê bao & cấu hình
- plans(id, code, name, price, cycle, features)
- subscriptions(id, user_id, org_id, plan_id, status, started_at, renewed_at, canceled_at)
- settings(key, value)
- Lưu ý: bảng `settings` chỉ dùng cho thiết lập tạm/di sản (legacy). Toàn bộ cấu hình nghiệp vụ mới phải dùng `config_namespaces` + `config_entries` (versioning + publish).
- pricing_rules(id, rule_code, region, size_ft, quality_standard, min_price, max_price, effective_from, effective_to, version)
- moderation_events(id, user_id, content_ref, content_type, violation_code, action_taken, created_at, meta)

### 2.9 Nhật ký/Audit & i18n
- audit_logs(id, actor_id, action, target_table, target_id, meta, created_at)
- i18n_translations(id, namespace, key, locale, value)

### 2.10 Cấu hình quản trị (Admin Config — no‑code)
- config_namespaces(id, code UNIQUE, name, description)
- config_entries(id, namespace_id FK→config_namespaces.id, key, version, status, value_json, checksum, created_by, published_by, created_at, published_at)
- feature_flags(id, code UNIQUE, name, description, enabled, rollout_json, effective_from, effective_to, version, status)
- tax_rates(id, region, tax_code, rate, effective_from, effective_to, status)
- fee_schedules(id, fee_code, name, calc_type, currency, amount, percent, tiers_json, scope, effective_from, effective_to, status)
- commission_rules(id, rule_code, name, basis, percent, min_amount, max_amount, conditions_json, effective_from, effective_to, status)
- marketplace_policies(id, policy_code, name, content_md, effective_from, effective_to, version, status)
- redaction_patterns(id, code, pattern, description, channel, enabled, severity)
- notification_templates(id, channel, template_code, locale, subject, body_md, variables_json, version, status)
- form_schemas(id, code, name, scope, json_schema, ui_schema, version, status)
- business_hours(id, org_id NULL, timezone, schedule_json)
- depot_calendars(id, depot_id, closed_dates_json, notes)
- integration_configs(id, vendor_code, name, config_json, secrets_ref, version, status)
- payment_methods(id, code, provider, method_type, enabled, config_json)
- partners(id, type, name, contact_json, status)
- slas(id, code, name, applies_to, targets_json, penalties_json, effective_from, effective_to, status)

### 2.11 Kho tồn Depot (mở rộng)
- depot_stock_movements(id, depot_id, container_id, owner_org_id, movement_type, direction, ref_doc_type, ref_doc_id, reason, occurred_at, created_by)
  - movement_type: 'IN' | 'OUT' | 'TRANSFER'
  - direction: +1 (IN), -1 (OUT)
  - ref_doc_type: 'EIR' | 'EDO' | 'DELIVERY' | 'MANUAL' | 'TRANSFER'
  - Ghi nhận một chiều; với TRANSFER tạo 2 bản ghi (OUT tại A, IN tại B) cùng `ref_doc_id` chung.

---

## 3. Enum gợi ý
- deal_type: 'sale' | 'rental'
- listing_status: 'draft' | 'pending_review' | 'active' | 'paused' | 'sold' | 'rented' | 'archived' | 'rejected'
- container_condition: 'new' | 'used'
- quality_standard: 'WWT' | 'CW' | 'IICL'
- order_status: 'created' | 'awaiting_funds' | 'escrow_funded' | 'preparing' | 'delivering' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
- inspection_status: 'requested' | 'scheduled' | 'in_progress' | 'completed'
- repair_status: 'quoted' | 'approved' | 'in_progress' | 'done' | 'accepted' | 'rework'
- payment_status: 'initiated' | 'escrow_funded' | 'released' | 'refunded' | 'failed'
- delivery_status: 'requested' | 'booked' | 'in_transit' | 'delivered' | 'failed'
- dispute_status: 'open' | 'investigating' | 'resolved_refund' | 'resolved_payout' | 'partial' | 'closed'

- config_status: 'draft' | 'published' | 'archived'
- notify_channel: 'email' | 'sms' | 'push' | 'inapp'
- calc_type: 'flat' | 'percent' | 'tiered'
- method_type: 'bank' | 'card' | 'ewallet'
- partner_type: 'carrier' | 'insurer' | 'psp' | 'dms' | 'kyc' | 'other'
- applies_to: 'listing' | 'rfq' | 'quote' | 'order' | 'inspection' | 'repair' | 'delivery' | 'dispute' | 'user' | 'system'

---

## 4. Khóa & chỉ mục
- PK: id (uuid)
- FK: listings.container_id → containers.id (ON UPDATE CASCADE, SET NULL on delete)
- Chỉ mục: listings(status, location_depot_id), orders(buyer_id, status), rfqs(buyer_id, status), quotes(rfq_id, status), inspections(depot_id, status)
- Text search: listing(title, description) via tsvector + GIN
- Geo: depots.geo_point (PostGIS khi cần)
- Cấu hình: config_entries(namespace_id, key, status, version DESC); feature_flags(code, status); tax_rates(region, tax_code, effective_from)

---

## 5. Ràng buộc & toàn vẹn
- CHECK giá trị tiền tệ >= 0; năm sản xuất hợp lệ.
- UNIQUE serial_no cho containers.
- NOT NULL cho khóa ngoại quan trọng.

---

## 6. DDL mẫu (rút gọn)
```sql
-- Enum ví dụ
CREATE TYPE listing_status AS ENUM (
  'draft','pending_review','active','paused','sold','rented','archived','rejected'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  display_name TEXT,
  default_locale TEXT NOT NULL DEFAULT 'vi',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE depots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address TEXT,
  province TEXT,
  geo_point geography(Point, 4326),
  capacity_teu INT,
  contact JSONB,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code TEXT,
  size_ft INT CHECK (size_ft IN (10,20,40,45)),
  type TEXT,
  serial_no TEXT UNIQUE,
  owner_org_id UUID,
  current_depot_id UUID REFERENCES depots(id),
  condition TEXT,
  quality_standard TEXT,
  csc_plate_no TEXT,
  manufactured_year INT CHECK (manufactured_year BETWEEN 1970 AND EXTRACT(YEAR FROM now())::INT),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES containers(id) ON UPDATE CASCADE ON DELETE SET NULL,
  seller_user_id UUID REFERENCES users(id),
  org_id UUID,
  deal_type TEXT NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'VND',
  price_amount NUMERIC(18,2) NOT NULL CHECK (price_amount >= 0),
  rental_unit TEXT,
  location_depot_id UUID REFERENCES depots(id),
  status listing_status NOT NULL DEFAULT 'draft',
  title TEXT,
  description TEXT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_listings_status_depot ON listings(status, location_depot_id);
CREATE INDEX idx_listings_search ON listings USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

-- Bảng quản trị cấu hình (no‑code)
CREATE TYPE config_status AS ENUM ('draft','published','archived');
CREATE TYPE notify_channel AS ENUM ('email','sms','push','inapp');
CREATE TYPE calc_type AS ENUM ('flat','percent','tiered');
CREATE TYPE method_type AS ENUM ('bank','card','ewallet');

CREATE TABLE config_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE config_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID NOT NULL REFERENCES config_namespaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'draft',
  value_json JSONB NOT NULL,
  checksum TEXT,
  created_by UUID REFERENCES users(id),
  published_by UUID REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
CREATE UNIQUE INDEX uq_config_entries_key_version ON config_entries(namespace_id, key, version);
CREATE INDEX idx_config_entries_lookup ON config_entries(namespace_id, key, status);

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_json JSONB,
  effective_from timestamptz,
  effective_to timestamptz,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  tax_code TEXT NOT NULL,
  rate NUMERIC(6,4) NOT NULL CHECK (rate >= 0),
  effective_from date NOT NULL,
  effective_to date,
  status config_status NOT NULL DEFAULT 'published'
);
CREATE INDEX idx_tax_rates_region_code ON tax_rates(region, tax_code, effective_from);

CREATE TABLE fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_code TEXT NOT NULL,
  name TEXT,
  calc_type calc_type NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  amount NUMERIC(18,2),
  percent NUMERIC(6,4),
  tiers_json JSONB,
  scope TEXT,
  effective_from date NOT NULL,
  effective_to date,
  status config_status NOT NULL DEFAULT 'draft'
);
CREATE INDEX idx_fee_schedules_code ON fee_schedules(fee_code, status, effective_from);

CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL,
  name TEXT,
  basis TEXT NOT NULL DEFAULT 'subtotal',
  percent NUMERIC(6,4),
  min_amount NUMERIC(18,2),
  max_amount NUMERIC(18,2),
  conditions_json JSONB,
  effective_from date NOT NULL,
  effective_to date,
  status config_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE marketplace_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code TEXT UNIQUE NOT NULL,
  name TEXT,
  content_md TEXT,
  effective_from timestamptz,
  effective_to timestamptz,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'published'
);

CREATE TABLE redaction_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  pattern TEXT NOT NULL,
  description TEXT,
  channel notify_channel NOT NULL DEFAULT 'inapp',
  enabled BOOLEAN NOT NULL DEFAULT true,
  severity INT NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel notify_channel NOT NULL,
  template_code TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'vi',
  subject TEXT,
  body_md TEXT,
  variables_json JSONB,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'draft'
);
CREATE UNIQUE INDEX uq_notification_templates ON notification_templates(channel, template_code, locale, version);

CREATE TABLE form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  scope TEXT NOT NULL,
  json_schema JSONB NOT NULL,
  ui_schema JSONB,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id),
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  schedule_json JSONB NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE depot_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE CASCADE,
  closed_dates_json JSONB,
  notes TEXT,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code TEXT NOT NULL,
  name TEXT,
  config_json JSONB NOT NULL,
  secrets_ref TEXT,
  version INT NOT NULL DEFAULT 1,
  status config_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  provider TEXT,
  method_type method_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config_json JSONB,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_json JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE slas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  applies_to TEXT NOT NULL,
  targets_json JSONB NOT NULL,
  penalties_json JSONB,
  effective_from timestamptz,
  effective_to timestamptz,
  status config_status NOT NULL DEFAULT 'published'
);

-- Mở rộng pricing_rules: thêm trạng thái và độ ưu tiên
ALTER TABLE pricing_rules
  ADD COLUMN IF NOT EXISTS status config_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 100;

-- Ledger tồn kho depot
CREATE TABLE IF NOT EXISTS depot_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_id UUID NOT NULL REFERENCES depots(id) ON DELETE RESTRICT,
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE RESTRICT,
  owner_org_id UUID,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('IN','OUT','TRANSFER')),
  direction SMALLINT NOT NULL CHECK (direction IN (1,-1)),
  ref_doc_type TEXT NOT NULL CHECK (ref_doc_type IN ('EIR','EDO','DELIVERY','MANUAL','TRANSFER')),
  ref_doc_id UUID,
  reason TEXT,
  occurred_at timestamptz NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dsm_depot_time ON depot_stock_movements(depot_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_dsm_container ON depot_stock_movements(container_id);
CREATE INDEX IF NOT EXISTS idx_dsm_owner ON depot_stock_movements(owner_org_id);
CREATE INDEX IF NOT EXISTS idx_dsm_type ON depot_stock_movements(movement_type, direction);

-- View on-hand: tổng direction theo container tại depot, lấy bản ghi gần nhất <= thời điểm
-- (Minh họa đơn giản; triển khai thực tế có thể dùng window functions + partitioning)
-- SELECT container_id, depot_id, SUM(direction) AS onhand FROM depot_stock_movements GROUP BY 1,2 HAVING SUM(direction) > 0;

-- RLS gợi ý
ALTER TABLE depot_stock_movements ENABLE ROW LEVEL SECURITY;
-- Chỉ người có vai trò trong depot được xem
CREATE POLICY dsm_read_by_depot ON depot_stock_movements
  FOR SELECT USING (
    position(
      concat('DEPOT:', depot_id::text)
      in coalesce(current_setting('app.scopes', true),'')
    ) > 0
  );
-- Ghi chỉ với quyền thích hợp (đặt bởi ứng dụng qua app.permissions)
CREATE POLICY dsm_write_by_permission ON depot_stock_movements
  FOR INSERT WITH CHECK (
    position('PM-085' in coalesce(current_setting('app.permissions', true),'') ) > 0 OR
    position('PM-086' in coalesce(current_setting('app.permissions', true),'') ) > 0
  );
```

---

## 7. Bảo mật & RLS (ví dụ)
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_participants_policy ON orders
  USING (
    buyer_id = current_setting('app.user_id', true)::uuid OR
    seller_id = current_setting('app.user_id', true)::uuid
  );

-- Cấu hình: chỉ ADMIN/PRICE được đọc/ghi; người dùng thường chỉ đọc các bản 'published'
ALTER TABLE config_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY cfg_read_published ON config_entries
  FOR SELECT
  USING (status = 'published');
-- Ghi/đọc đầy đủ cho admin (ví dụ dựa trên session var app.roles chứa chuỗi vai trò)
CREATE POLICY cfg_admin_rw ON config_entries
  USING (position('ADMIN' in coalesce(current_setting('app.roles', true),'') ) > 0)
  WITH CHECK (position('ADMIN' in coalesce(current_setting('app.roles', true),'') ) > 0);
```

---

## 8. i18n dữ liệu
- Bảng `i18n_translations` cho chuỗi giao diện/metadata động.
- Dữ liệu nghiệp vụ (listing.title/description) lưu theo ngôn ngữ mặc định, có thể mở rộng bảng phụ `listing_translations` nếu cần đa ngôn ngữ nội dung.

## 9. Audit & tuân thủ
- `audit_logs` ghi mọi hành động quan trọng (CRUD, quyền, giải ngân).
- Pseudonymization cho dữ liệu nhạy cảm; retention policy cho logs.

---

## 10. Ràng buộc khóa ngoại & chỉ mục (cấu hình)
- config_entries.namespace_id → config_namespaces.id (ON DELETE CASCADE), created_by/published_by → users.id (SET NULL).
- notification_templates.unique(channel, template_code, locale, version).
- form_schemas.code UNIQUE; feature_flags.code UNIQUE.
- Lưu ý hiệu lực: tax_rates/fee_schedules/commission_rules có (effective_from, effective_to); truy vấn cần bộ lọc thời gian và index tương ứng.

## 11. Cache & tra cứu cấu hình
- Khuyến nghị cache layer (Redis/LRU): key `cfg:{namespace}:{key}` lưu value_json + version + checksum.
- TTL: 60–300s; cho phép warmup và bust cache qua webhooks nội bộ khi publish.
- Chỉ expose status = 'published' cho đọc công khai.

## 12. JSON Schema gợi ý cho value_json
12.1 pricing_rules.value_json (minh họa) — xem thêm [schemas/config/pricing.bands.schema.json](schemas/config/pricing.bands.schema.json)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "region": {"type": "string"},
    "size_ft": {"type": "integer", "enum": [10,20,40,45]},
    "quality_standard": {"type": "string", "enum": ["WWT","CW","IICL"]},
    "min_price": {"type": "number", "minimum": 0},
    "max_price": {"type": "number"}
  },
  "required": ["region","size_ft","quality_standard","min_price","max_price"]
}
```
12.2 fee_schedules.tiers_json (minh họa) — xem thêm [schemas/config/fees.tiers.schema.json](schemas/config/fees.tiers.schema.json)
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "min": {"type": "number"},
      "max": {"type": ["number","null"]},
      "amount": {"type": ["number","null"]},
      "percent": {"type": ["number","null"]}
    },
    "required": ["min"]
  }
}
```
12.3 commission_rules.conditions_json (minh họa) — xem thêm [schemas/config/commissions.rules.schema.json](schemas/config/commissions.rules.schema.json)
```json
{
  "type": "object",
  "properties": {
    "deal_type": {"type": "string", "enum": ["sale","rental"]},
    "region": {"type": "string"},
    "org_plan": {"type": "string"}
  }
}
```
12.4 redaction_patterns.pattern (minh họa) — xem thêm [schemas/config/redaction.pattern.schema.json](schemas/config/redaction.pattern.schema.json)
```json
{
  "regex": "(?:(?:\u002B?84|0)(?:\d){9,10})|[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",
  "flags": "i"
}
```
12.5 notification_templates.variables_json (minh họa) — xem thêm [schemas/config/templates.metadata.schema.json](schemas/config/templates.metadata.schema.json)
```json
{
  "required": ["user_name","order_id"],
  "optional": ["rfq_id","quote_deadline"]
}
```

Xem thêm: Implementation-Plan/06-Data/Master-Data-Catalog.md và seeds trong `Docs/seeds/master-data/` để chuẩn hóa danh mục và seed dữ liệu.
  ---

  ## 13. Pricing — Source of Truth (SoT)

  Mục tiêu: loại bỏ mơ hồ giữa bảng `pricing_rules` và Config Center (config_namespaces/config_entries) khi áp dụng bands/giới hạn giá.

  Quy ước SoT:
  - Source of Truth cho pricing bands và các quy tắc định giá là Config Center (namespace: `pricing`, key: `bands` hoặc phân tách theo vùng/sản phẩm). Mọi thay đổi đi qua vòng đời draft→publish→rollback với versioning và audit.
  - Bảng `pricing_rules` chỉ dùng cho mục đích lịch sử/analytics hoặc caching vật lý tạm thời (nếu cần tối ưu truy vấn). Không ghi trực tiếp từ UI quản trị, không coi là SoT.

  Áp dụng runtime:
  - Dịch vụ Listings/RFQ/Quote đọc cấu hình từ cache (Redis/LRU) theo khóa `cfg:pricing:bands` (hoặc tương đương) với version hiện hành; cache warmup theo TTL.
  - Khi publish cấu hình mới, thực hiện cache bust (WF-025/026) để đảm bảo áp dụng tức thời.

  Đồng bộ & integrity:
  - Nếu triển khai cơ chế materialize `pricing_rules` từ Config Center để tối ưu, phải có job định kỳ/trigger theo publish tạo bản ghi mới kèm `source_version`. Bất kỳ khác biệt nào so với Config Center được coi là lỗi và cảnh báo.
  - Không sử dụng `settings` legacy cho pricing.

  Kiểm thử & quan trắc:
  - Contract tests kiểm tra request vượt band bị từ chối; unit tests map chính xác enum (size_ft, quality_standard...).
  - Dashboard “Price Band Decisions” theo dõi tỷ lệ bị chặn, biên độ và outliers để tinh chỉnh bands.

---

## 14. Danh mục (Master Data) — DDL cụ thể

Mục tiêu: Cung cấp DDL đầy đủ cho toàn bộ bảng md_* để dev có thể chạy trực tiếp khi khởi tạo DB. Các bảng md_* dùng code làm khóa chính (text/char), kèm tên hiển thị và cờ hoạt động khi phù hợp. Ràng buộc FK từ bảng nghiệp vụ đến md_* nên áp dụng theo chiến lược expand-and-contract.

Tham chiếu seed: `Docs/seeds/master-data/*.csv`

```sql
-- 14.1 Địa lý & Tiền tệ
CREATE TABLE IF NOT EXISTS md_countries (
  code CHAR(2) PRIMARY KEY, -- ISO-3166 alpha-2
  alpha3 CHAR(3),           -- ISO-3166 alpha-3 (optional)
  name TEXT NOT NULL,
  region TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_md_countries_alpha3 ON md_countries(alpha3) WHERE alpha3 IS NOT NULL;

CREATE TABLE IF NOT EXISTS md_provinces (
  code TEXT PRIMARY KEY,         -- mã nội bộ hoặc ISO
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  region TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_md_provinces_country ON md_provinces(country_code);

CREATE TABLE IF NOT EXISTS md_currencies (
  code CHAR(3) PRIMARY KEY, -- ISO-4217
  name TEXT,
  symbol TEXT,
  decimals SMALLINT NOT NULL DEFAULT 2 CHECK (decimals BETWEEN 0 AND 6),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS md_timezones (
  tzid TEXT PRIMARY KEY, -- IANA timezone id, ví dụ: Asia/Ho_Chi_Minh
  description TEXT,
  region TEXT
);

-- 14.2 Container & chuẩn kỹ thuật
CREATE TABLE IF NOT EXISTS md_container_sizes (
  size_ft SMALLINT PRIMARY KEY,
  CHECK (size_ft IN (10,20,40,45))
);

CREATE TABLE IF NOT EXISTS md_container_types (
  code TEXT PRIMARY KEY,  -- ví dụ: DRY, HC, RF, OT, FR, TK
  name TEXT NOT NULL,
  iso_group TEXT
);

CREATE TABLE IF NOT EXISTS md_quality_standards (
  code TEXT PRIMARY KEY, -- WWT, CW, IICL
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_iso_container_codes (
  code TEXT PRIMARY KEY, -- ISO 6346 equipment category/type group (4-char)
  name TEXT
);

-- 14.3 Danh mục nghiệp vụ Listings/RFQ/Order/Payment/Delivery/Dispute
CREATE TABLE IF NOT EXISTS md_deal_types (
  code TEXT PRIMARY KEY, -- sale, rental
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_listing_statuses (
  code TEXT PRIMARY KEY, -- draft, pending_review, ...
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_order_statuses (
  code TEXT PRIMARY KEY, -- created, awaiting_funds, ...
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_payment_statuses (
  code TEXT PRIMARY KEY, -- initiated, escrow_funded, ...
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_delivery_statuses (
  code TEXT PRIMARY KEY, -- requested, booked, in_transit, ...
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_dispute_statuses (
  code TEXT PRIMARY KEY, -- open, investigating, resolved_*, closed
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_document_types (
  code TEXT PRIMARY KEY, -- EDO, EIR, INVOICE, ...
  name TEXT
);

CREATE TABLE IF NOT EXISTS md_service_codes (
  code TEXT PRIMARY KEY, -- inspection, repair, storage, delivery_estimate, insurance
  name TEXT NOT NULL,
  billable BOOLEAN NOT NULL DEFAULT true
);

-- 14.4 Depot & tồn kho
CREATE TABLE IF NOT EXISTS md_movement_types (
  code TEXT PRIMARY KEY, -- IN, OUT, TRANSFER
  direction SMALLINT NOT NULL CHECK (direction IN (1,-1,0)) -- 1=IN, -1=OUT, 0=neutral
);

CREATE TABLE IF NOT EXISTS md_ref_doc_types (
  code TEXT PRIMARY KEY -- EIR, EDO, DELIVERY, MANUAL, TRANSFER
);

CREATE TABLE IF NOT EXISTS md_adjust_reasons (
  code TEXT PRIMARY KEY, -- inventory_count, damage, loss, correction
  name TEXT NOT NULL
);

-- 14.5 Quản trị & cấu hình (no‑code)
CREATE TABLE IF NOT EXISTS md_feature_flag_codes (
  code TEXT PRIMARY KEY,   -- ff.<domain>.<feature>
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_tax_codes (
  code TEXT PRIMARY KEY,   -- VAT, GST, ...
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_fee_codes (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_commission_codes (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_notification_channels (
  code TEXT PRIMARY KEY -- email, sms, push, inapp (nếu dùng enum notify_channel, bảng này hỗ trợ UI/report)
);

CREATE TABLE IF NOT EXISTS md_template_codes (
  channel TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT,
  PRIMARY KEY (channel, code)
);

CREATE TABLE IF NOT EXISTS md_i18n_namespaces (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_form_schema_codes (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_sla_codes (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_business_hours_policies (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS md_integration_vendor_codes (
  code TEXT PRIMARY KEY, -- psp, carrier, insurer, dms, kyc, other
  name TEXT
);

CREATE TABLE IF NOT EXISTS md_payment_method_types (
  code TEXT PRIMARY KEY -- bank, card, ewallet
);

CREATE TABLE IF NOT EXISTS md_partner_types (
  code TEXT PRIMARY KEY -- carrier, insurer, psp, dms, kyc, other
);

-- 14.6 Moderation/Redaction & đánh giá
CREATE TABLE IF NOT EXISTS md_violation_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  severity SMALLINT -- 1..5
);

CREATE TABLE IF NOT EXISTS md_redaction_channels (
  code TEXT PRIMARY KEY -- inapp, email, sms, push
);

CREATE TABLE IF NOT EXISTS md_rating_scales (
  value SMALLINT PRIMARY KEY CHECK (value BETWEEN 1 AND 10),
  name TEXT
);

-- 14.7 Pricing regions (bands quản trị qua Config Center)
CREATE TABLE IF NOT EXISTS md_pricing_regions (
  code TEXT PRIMARY KEY, -- ví dụ: VN-North, VN-South
  name TEXT
);

-- 14.8 Logistics & trade
CREATE TABLE IF NOT EXISTS md_units (
  code TEXT PRIMARY KEY,    -- e.g., EA, KG, M3, DAY
  name TEXT NOT NULL,
  symbol TEXT,
  unit_type TEXT            -- length, weight, volume, time, count, currency
);

CREATE TABLE IF NOT EXISTS md_rental_units (
  code TEXT PRIMARY KEY,    -- day, week, month
  name TEXT NOT NULL,
  days SMALLINT NOT NULL    -- normalize to days
);

CREATE TABLE IF NOT EXISTS md_incoterms (
  code TEXT PRIMARY KEY,    -- EXW, FOB, CIF, DAP, DDP
  name TEXT,
  version TEXT              -- e.g., Incoterms 2020
);

CREATE TABLE IF NOT EXISTS md_delivery_event_types (
  code TEXT PRIMARY KEY,    -- pickup_scheduled, picked_up, in_transit, arrived, delivered, failed
  name TEXT,
  category TEXT             -- scheduling, movement, completion, exception
);

-- 14.9 Reasons (dispute/cancel/payment failure)
CREATE TABLE IF NOT EXISTS md_dispute_reasons (
  code TEXT PRIMARY KEY,    -- not_as_described, late_delivery, damage, billing_error
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_cancel_reasons (
  code TEXT PRIMARY KEY,    -- buyer_request, seller_unavailable, payment_timeout, inventory_issue
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_payment_failure_reasons (
  code TEXT PRIMARY KEY,    -- insufficient_funds, card_declined, kyc_failed, risk_block
  name TEXT NOT NULL
);

-- 14.10 Inspection/Repair catalogs
CREATE TABLE IF NOT EXISTS md_inspection_item_codes (
  code TEXT PRIMARY KEY,    -- door, floor, roof, corner_post, side_panel, end_panel
  name TEXT NOT NULL,
  category TEXT             -- structure, surface, hardware
);

CREATE TABLE IF NOT EXISTS md_repair_item_codes (
  code TEXT PRIMARY KEY,    -- patch, weld, paint, replace_panel
  name TEXT NOT NULL,
  category TEXT             -- structure, surface, hardware
);

-- 14.11 Notification event types
CREATE TABLE IF NOT EXISTS md_notification_event_types (
  code TEXT PRIMARY KEY,    -- order_created, order_paid, rfq_replied, delivery_scheduled, delivery_delivered
  name TEXT NOT NULL
);

-- 14.12 Cities & UN/LOCODE (tùy chọn, mở rộng dần)
CREATE TABLE IF NOT EXISTS md_cities (
  code TEXT PRIMARY KEY,            -- internal code, e.g., HCM, HN, DN
  name TEXT NOT NULL,
  province_code TEXT REFERENCES md_provinces(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  country_code CHAR(2) REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS md_unlocodes (
  code TEXT PRIMARY KEY,            -- e.g., VNSGN, VNHAN, VNDAD
  name TEXT NOT NULL,
  country_code CHAR(2) REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  subdivision TEXT,                 -- province/state text
  function_codes TEXT               -- UN/LOCODE function flags (optional string)
);

-- 14.8.x Insurance coverages
CREATE TABLE IF NOT EXISTS md_insurance_coverages (
  code TEXT PRIMARY KEY,   -- cargo_all_risk, fpa, tlo
  name TEXT NOT NULL,
  notes TEXT
);
```

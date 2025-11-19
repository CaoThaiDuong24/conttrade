# ĐẶC TẢ API BACKEND (REST v1) — i‑ContExchange

Mã tài liệu: API-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Chuẩn: RESTful JSON, HTTPS, UTF‑8, thời gian UTC. Auth: Bearer JWT + RBAC. Phân trang: `page`, `limit` (mặc định 20). Sắp xếp: `sort=field:asc|desc`. Lọc: tham số query. Id: UUID. Version: `/api/v1`.

Mã endpoint: API-xxx. Với mỗi endpoint: Mục đích, Quyền, Request/Response, Mã lỗi.

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md).

---

## 0. Headers & Lỗi chuẩn
- Headers chung: `Authorization: Bearer <token>`, `Accept-Language: vi|en`, `X-Request-Id`.
- Lỗi chuẩn:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {"field": "reason"}
  }
}
```

### 0.1 Xác thực & JWT
- JWT chứa: sub (user_id), roles [RL-*], perms [PM-*], org_ids, depot_ids?, locale, iat, exp.
- Quy tắc: RBAC kiểm tra theo Permission Code (PM-xxx) đã quy định ở tài liệu Roles-Permissions.
- Mỗi endpoint ghi rõ Quyền yêu cầu. Nếu không nêu, áp dụng quyền ngầm theo nhóm (ví dụ: Nhóm D cần PM-020/PM-021/PM-022 tuỳ hành động).

### 0.2 Idempotency
- Cho các endpoint POST nhạy cảm (payments, orders, rfqs, quotes): hỗ trợ `Idempotency-Key` (UUID v4). Server lưu kết quả trong 24h.

### 0.3 Hạn mức (Rate limit)
- Mặc định: 120 req/phút/người dùng; các endpoint auth 30 req/phút. Ghi log vi phạm.

### 0.4 Phân trang & Sắp xếp
- `page` >= 1; `limit` 1..100. `sort` dưới whitelist từng tài nguyên (ví dụ: listings: created_at, price_amount; orders: created_at, status).

### 0.5 Danh mục lỗi (Error codes)
- AUTH-UNAUTHORIZED (401): thiếu/invalid token.
- AUTH-FORBIDDEN (403): thiếu quyền PM-xxx.
- REQ-VALIDATION (422): body/query không hợp lệ.
- RES-NOT-FOUND (404): tài nguyên không tồn tại/không thuộc scope.
- CONFLICT-STATE (409): trạng thái không cho phép.
- IDEMPOTENT-REPLAY (409): trùng Idempotency-Key.
- RATE-LIMITED (429): vượt hạn mức.
- SERVER-ERROR (500): lỗi hệ thống.

---

## Nhóm A — Auth & Tài khoản

- API-A01 POST /api/v1/auth/register
  - Quyền: Public (không yêu cầu JWT)
  - Body: { type: "personal"|"business", email?, phone?, password, acceptTos: true }
  - 201: user { id, status, kyc_status }

- API-A02 POST /api/v1/auth/login
  - Quyền: Public
  - Body: { emailOrPhone, password }
  - 200: { accessToken, refreshToken, user }

- API-A03 POST /api/v1/auth/refresh
  - Quyền: Public (có refresh token hợp lệ)
  - Body: { refreshToken }
  - 200: { accessToken }

- API-A04 POST /api/v1/auth/forgot
  - Body: { emailOrPhone }

- API-A05 POST /api/v1/auth/reset
  - Body: { tokenOrOtp, newPassword }

- API-A06 GET /api/v1/me
  - Quyền: đăng nhập
  - 200: user profile + roles + permissions

- API-A07 PUT /api/v1/me
  - Quyền: đăng nhập; Update hồ sơ cá nhân

- API-A08 POST /api/v1/kyc/submit (eKYC)
  - Quyền: đăng nhập
  - Body: ảnh mặt trước/sau, selfie/liveness token
  - 202: { caseId, status: submitted }

- API-A09 POST /api/v1/kyb/submit (eKYB)
  - Quyền: RL-ORG-OWNER hoặc RL-ADMIN
  - Body: giấy ĐKDN, MST, đại diện pháp luật

---

## Nhóm B — Tin đăng & Container

- API-B01 POST /api/v1/listings
  - Quyền: PM-010 (CREATE_LISTING) trong scope own/org; kiểm soát giá/redaction
  - Body: { deal_type, container_id?, specs{size, type, standard, condition}, depot_id, price_amount, media[] }
  - 201: listing

- API-B02 GET /api/v1/listings
  - Quyền: Public
  - Query: q, deal_type, size, standard, condition, depot_id, min_price, max_price, status=active, page, limit, sort
  - 200: { items[], page, total }

- API-B03 GET /api/v1/listings/{id}
  - Quyền: Public

- API-B04 PUT /api/v1/listings/{id}
  - Quyền: PM-011 (EDIT_LISTING) scope own/org

- API-B05 POST /api/v1/listings/{id}/submit
  - Quyền: PM-012 (PUBLISH_LISTING); Chuyển sang pending_review

- API-B06 DELETE /api/v1/listings/{id}
  - Quyền: PM-014 (DELETE_LISTING) scope own/org

- API-B07 POST /api/v1/listings/{id}/feature
  - Quyền: PM-010 + thanh toán phí (nếu áp dụng)
  - Nâng cấp tin nổi bật (trả phí)

- API-B08 GET /api/v1/containers/{id}
  - Quyền: Public/Participant liên quan

- API-B09 POST /api/v1/containers
  - Quyền: Seller/Org; PM-011 theo scope

---

## Nhóm C — Tìm kiếm

- API-C01 GET /api/v1/search
  - Quyền: Public
  - Query text + facets, trả kết quả tổng hợp; phục vụ auto-complete.

---

## Nhóm D — RFQ & Quote (không giao tiếp trực tiếp)

- API-D01 POST /api/v1/rfqs
  - Quyền: PM-020 (CREATE_RFQ) bởi Buyer
  - Body: { listing_id, purpose, quantity, need_by, services: { inspection?, repair?, storage_days?, delivery_estimate?: true, insurance? } }
  - 201: rfq { id, status }

- API-D02 GET /api/v1/rfqs
  - Quyền: đăng nhập; Buyer xem RFQ của mình, Seller xem RFQ liên quan listing của mình

- API-D03 POST /api/v1/rfqs/{id}/quotes
  - Quyền: PM-021 (ISSUE_QUOTE) bởi Seller liên quan listing
  - Body: { items[], fees[], total, currency, valid_until }
  - 201: quote { id, status: issued }

- API-D04 GET /api/v1/rfqs/{id}/quotes
  - Quyền: PM-022 (VIEW_QUOTES) Buyer/Seller liên quan

- API-D05 POST /api/v1/quotes/{id}/accept
  - Quyền: Buyer; yêu cầu PM-040 (CREATE_ORDER); tạo order từ quote
  - 200: { order_id }

- API-D06 POST /api/v1/quotes/{id}/decline
  - Quyền: Buyer; yêu cầu PM-022; ghi lý do từ chối (optional)

---

## Nhóm E — Giám định & Depot

- API-E01 POST /api/v1/inspections { listing_id, depot_id, schedule_at }
  - Quyền: PM-030 (REQUEST_INSPECTION) bởi Buyer
- API-E02 GET /api/v1/inspections/{id}
  - Quyền: Participants (Buyer/Seller/Depot) theo đơn vị liên quan
- API-E03 POST /api/v1/inspections/{id}/report { items[], conclusion, standard }
  - Quyền: PM-081 (DEPOT_UPDATE_JOB) bởi Depot Staff/Manager
- API-E04 POST /api/v1/repairs { inspection_id, items[{code,qty,unit_price,note}] }
  - Quyền: PM-080 (DEPOT_CREATE_JOB) bởi Depot; hoặc Seller nếu chính Seller cung cấp dịch vụ
- API-E05 PUT /api/v1/repairs/{id} (update status)
  - Quyền: PM-081 bởi Depot; Buyer xác nhận nghiệm thu (participants)

---

### E*. Kho tồn Depot (mở rộng)

- API-E06 GET /api/v1/depots/{id}/stock
  - Mục đích: Truy vấn tồn ONHAND theo bộ lọc.
  - Quyền: PM-083 (DEPOT_VIEW_STOCK) trong scope depot.
  - Query (tham chiếu schema: schemas/api/depot.stock.query.schema.json):
    - owner_org_id?, size_ft?, type?, quality_standard?, condition?, manufactured_year_from?, manufactured_year_to?, page?, limit?, sort?
  - 200: { items: [{ container_id, owner_org_id, size_ft, type, quality_standard, condition, manufactured_year }], page, total }
  - Lỗi: AUTH-UNAUTHORIZED, AUTH-FORBIDDEN, REQ-VALIDATION

- API-E07 GET /api/v1/depots/{id}/stock-movements
  - Mục đích: Xem nhật ký nhập–xuất–chuyển theo kỳ.
  - Quyền: PM-084 (DEPOT_VIEW_MOVEMENTS).
  - Query (schema: schemas/api/depot.stockMovements.query.schema.json):
    - from (date-time), to (date-time), movement_type? ('IN'|'OUT'|'TRANSFER'), container_id?, owner_org_id?, page?, limit?, sort? (occurred_at:desc)
  - 200: { items: [{ id, container_id, depot_id, movement_type, direction, ref_doc_type, ref_doc_id, reason, occurred_at }], page, total }

- API-E08 POST /api/v1/depots/{id}/stock-adjustments
  - Mục đích: Điều chỉnh tồn thủ công (ghi movement MANUAL IN/OUT).
  - Quyền: PM-085 (DEPOT_ADJUST_STOCK) — Depot Manager/Admin.
  - Idempotency: hỗ trợ header `Idempotency-Key`.
  - Body (schema: schemas/api/depot.stockAdjustment.create.schema.json): { container_id, direction: 'IN'|'OUT', reason?, occurred_at }
  - 201: { id }
  - Lỗi: AUTH-*, REQ-VALIDATION, CONFLICT-STATE

- API-E09 GET /api/v1/depots/{id}/stock-report
  - Mục đích: Báo cáo kỳ (opening/in/out/closing) & Aging; có thể export CSV.
  - Quyền: PM-083 hoặc PM-084.
  - Query (schema: schemas/api/depot.stockReport.query.schema.json): { from, to, group_by?, export? }
  - 200: { from, to, grouping: 'owner'|'size'|'standard'|'none', rows: [{ key, opening, in_qty, out_qty, closing, aging: { bucket_0_7, bucket_8_14, bucket_15_30, bucket_31_60, bucket_60_plus } }], generated_at }

- API-E10 POST /api/v1/depots/transfers
  - Mục đích: Chuyển nội bộ giữa các Depot (ghi OUT tại A, IN tại B theo cặp movement).
  - Quyền: PM-086 (DEPOT_TRANSFER_STOCK).
  - Idempotency: hỗ trợ header `Idempotency-Key`.
  - Body (schema: schemas/api/depot.transfer.create.schema.json): { container_id, from_depot_id, to_depot_id, reason?, occurred_at }
  - 201: { movements: [{ out_id }, { in_id }] }
  - Lỗi: AUTH-*, REQ-VALIDATION, CONFLICT-STATE

---

## Nhóm F — Đơn hàng & Thanh toán (Escrow)

- API-F01 POST /api/v1/orders { quote_id }
  - Quyền: PM-040 (CREATE_ORDER) bởi Buyer
- API-F02 GET /api/v1/orders
  - Quyền: Participants (buyer/seller)
- API-F03 GET /api/v1/orders/{id}
  - Quyền: Participants
- API-F04 POST /api/v1/orders/{id}/pay (Escrow) { method }
  - Quyền: PM-041 (PAY_ESCROW) bởi Buyer
- API-F05 POST /api/v1/orders/{id}/confirm-receipt
  - Quyền: PM-043 (CONFIRM_RECEIPT) bởi Buyer
- API-F06 POST /api/v1/orders/{id}/cancel
  - Quyền: Participants; tuân thủ policy (marketplace_policies)
- API-F07 GET /api/v1/orders/{id}/documents (EDO/EIR/Invoice)
  - Quyền: Participants; FIN/ADMIN có quyền đọc theo scope

---

## Nhóm G — Vận chuyển

- API-G01 POST /api/v1/deliveries { order_id, address, schedule_at, requirements }
  - Quyền: PM-042 (REQUEST_DELIVERY)
- API-G02 GET /api/v1/deliveries/{id}
  - Quyền: Participants
- API-G03 GET /api/v1/deliveries/{id}/track
  - Quyền: Participants

---

## Nhóm H — Bảo hiểm

- API-H01 POST /api/v1/insurance/quotes { order_id, package }
  - Quyền: Participants; Buyer khởi tạo
- API-H02 POST /api/v1/insurance/purchase { quote_id }
  - Quyền: Buyer; thanh toán theo policy

---

## Nhóm I — Đánh giá & Tranh chấp

- API-I01 POST /api/v1/reviews { order_id, rating, comment }
  - Quyền: PM-050 (RATE_AND_REVIEW) Participants
- API-I02 GET /api/v1/reviews?user_id=...
  - Quyền: Public (ẩn thông tin nhạy cảm), hoặc đăng nhập
- API-I03 POST /api/v1/disputes { order_id, reason, evidence[] }
  - Quyền: PM-060 (FILE_DISPUTE)
- API-I04 GET /api/v1/disputes/{id}
  - Quyền: Participants + MOD/ADMIN
- API-I05 POST /api/v1/disputes/{id}/resolve { decision, payout_percent? }
  - Quyền: PM-061 (RESOLVE_DISPUTE) bởi Admin/Moderator

---

## Nhóm J — Thuê bao & Thanh toán định kỳ

- API-J01 GET /api/v1/plans
  - Quyền: Public
- API-J02 POST /api/v1/subscriptions { plan_id, org_id? }
  - Quyền: đăng nhập
- API-J03 GET /api/v1/subscriptions/me
  - Quyền: đăng nhập
- API-J04 POST /api/v1/subscriptions/{id}/cancel
  - Quyền: đăng nhập; chủ subscription

---

## Nhóm K — Quản trị

- API-K01 GET /api/v1/admin/dashboard
- API-K02 GET /api/v1/admin/users
- API-K03 PUT /api/v1/admin/users/{id}/roles
- API-K04 GET /api/v1/admin/listings?status=pending_review
- API-K05 POST /api/v1/admin/listings/{id}/approve
- API-K06 POST /api/v1/admin/listings/{id}/reject { reason }
- API-K07 GET /api/v1/admin/disputes
 - API-K08 GET /api/v1/admin/pricing-rules
 - API-K09 POST /api/v1/admin/pricing-rules
 - API-K10 PUT /api/v1/admin/pricing-rules/{id}
 - API-K11 GET /api/v1/admin/moderation-events

### K*. Cấu hình quản trị (no‑code)

- API-K12 GET /api/v1/admin/config/namespaces
  - Mục đích: Liệt kê các namespace cấu hình
  - Quyền: PM-110 (read implied), RL-ADMIN
  - 200: [{ id, code, name, description }]

- API-K13 POST /api/v1/admin/config/namespaces
  - Body: { code, name, description }
  - Quyền: PM-110 hoặc RL-ADMIN
  - 201: namespace

- API-K14 GET /api/v1/admin/config/entries
  - Query: namespace=code, key?, status?, page, limit
  - Quyền: PM-111 (draft view) / công khai chỉ xem published
  - 200: { items: [{ id, namespace, key, version, status, updated_at }], total }

- API-K15 POST /api/v1/admin/config/entries
  - Body: { namespace, key, value_json }
  - Quyền: PM-111
  - 201: { id, version: 1, status: 'draft' }

- API-K16 PUT /api/v1/admin/config/entries/{id}
  - Sửa bản nháp; tạo version mới nếu chọn "save as new version"
  - Body: { value_json, save_as_new_version?: true }
  - Quyền: PM-111

- API-K17 POST /api/v1/admin/config/entries/{id}/publish
  - Chuyển trạng thái: draft → published; published → published (tạo phiên bản mới nếu cung cấp value)
  - Body: { value_json? }
  - Quyền: PM-112

- API-K18 POST /api/v1/admin/config/entries/{id}/rollback
  - Quay về version trước (tạo bản published mới từ snapshot)
  - Body: { to_version }
  - Quyền: PM-112

- API-K19 GET /api/v1/admin/config/entries/{id}/versions
  - Quyền: PM-111 hoặc RL-ADMIN
  - 200: [{ version, status, created_at, published_at, checksum }]

- API-K20 GET /api/v1/admin/feature-flags
- Quyền: PM-113 (RW), public: chỉ xem flags public
- API-K21 POST /api/v1/admin/feature-flags { code, name, description, enabled, rollout_json, effective_from?, effective_to? }
- Quyền: PM-113
- API-K22 PUT /api/v1/admin/feature-flags/{id}
- Quyền: PM-113
- API-K23 POST /api/v1/admin/feature-flags/{id}/publish
- Quyền: PM-112, PM-113

- API-K24 GET /api/v1/admin/tax-rates?region=VN&tax_code=VAT
- Quyền: PM-114
- API-K25 POST /api/v1/admin/tax-rates { region, tax_code, rate, effective_from, effective_to? }
- Quyền: PM-114

- API-K26 GET /api/v1/admin/fees
- Quyền: PM-115
- API-K27 POST /api/v1/admin/fees { fee_code, name, calc_type, currency, amount?, percent?, tiers_json?, scope, effective_from, effective_to? }
- Quyền: PM-115

- API-K28 GET /api/v1/admin/commissions
- Quyền: PM-116
- API-K29 POST /api/v1/admin/commissions { rule_code, name, basis, percent?, min_amount?, max_amount?, conditions_json?, effective_from, effective_to? }
- Quyền: PM-116

- API-K30 GET /api/v1/admin/templates?channel=email|sms|push|inapp&locale=vi
- Quyền: PM-117
- API-K31 POST /api/v1/admin/templates
  - Quyền: PM-117
  - Body schema: [schemas/api/admin.templates.create.schema.json](schemas/api/admin.templates.create.schema.json)
- API-K32 PUT /api/v1/admin/templates/{id}
- Quyền: PM-117
- API-K33 POST /api/v1/admin/templates/{id}/publish
- Quyền: PM-112, PM-117

- API-K34 GET /api/v1/admin/i18n?namespace=ui
- Quyền: PM-118
- API-K35 POST /api/v1/admin/i18n { namespace, key, locale, value }
- Quyền: PM-118

- API-K36 GET /api/v1/admin/form-schemas
- Quyền: PM-119
- API-K37 POST /api/v1/admin/form-schemas { code, name, scope, json_schema, ui_schema }
- Quyền: PM-119
- API-K38 PUT /api/v1/admin/form-schemas/{id}
- Quyền: PM-119
- API-K39 POST /api/v1/admin/form-schemas/{id}/publish
- Quyền: PM-112, PM-119

- API-K40 GET /api/v1/admin/slas
- Quyền: PM-120
- API-K41 POST /api/v1/admin/slas { code, name, applies_to, targets_json, penalties_json, effective_from?, effective_to? }
- Quyền: PM-120

- API-K42 GET /api/v1/admin/business-hours?org_id=...
- Quyền: PM-121
- API-K43 PUT /api/v1/admin/business-hours { org_id?, timezone, schedule_json }
- Quyền: PM-121

- API-K44 GET /api/v1/admin/depot-calendars?depot_id=...
- Quyền: PM-122
- API-K45 PUT /api/v1/admin/depot-calendars { depot_id, closed_dates_json, notes }
- Quyền: PM-122

- API-K46 GET /api/v1/admin/integrations
- Quyền: PM-123
- API-K47 POST /api/v1/admin/integrations { vendor_code, name, config_json, secrets_ref? }
- Quyền: PM-123
- API-K48 PUT /api/v1/admin/integrations/{id}
- Quyền: PM-123
- API-K49 POST /api/v1/admin/integrations/{id}/publish
- Quyền: PM-112, PM-123

- API-K50 GET /api/v1/admin/payment-methods
- Quyền: PM-124
- API-K51 POST /api/v1/admin/payment-methods { code, provider, method_type, enabled, config_json }
- Quyền: PM-124
- API-K52 PUT /api/v1/admin/payment-methods/{id}
- Quyền: PM-124

- API-K53 GET /api/v1/admin/partners
- Quyền: PM-125
- API-K54 POST /api/v1/admin/partners { type, name, contact_json, status }
- Quyền: PM-125
- API-K55 PUT /api/v1/admin/partners/{id}
- Quyền: PM-125

---

## Nhóm L — Thông báo

- API-L01 GET /api/v1/notifications
  - Quyền: đăng nhập
- API-L02 POST /api/v1/notifications/mark-read
  - Quyền: đăng nhập
  - Body schema: [schemas/api/notifications.markRead.schema.json](schemas/api/notifications.markRead.schema.json)

---

## Nhóm M — Q&A có kiểm duyệt

- API-M01 POST /api/v1/rfqs/{id}/questions { question }
  - Quyền: Buyer (participant RFQ); nội dung qua redaction/moderation
- API-M02 POST /api/v1/questions/{id}/answers { answer }
  - Quyền: Seller (participant RFQ); nội dung qua redaction/moderation
- API-M03 GET /api/v1/rfqs/{id}/qa
  - Quyền: Participants; Admin/Mod xem log

---

## Phụ lục S — JSON Schemas (rút gọn)

S1. RFQ tạo mới (API-D01) — xem file đầy đủ: [schemas/api/rfq.create.schema.json](schemas/api/rfq.create.schema.json)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "listing_id": {"type": "string", "format": "uuid"},
    "purpose": {"type": "string", "enum": ["sale","rental"]},
    "quantity": {"type": "integer", "minimum": 1},
    "need_by": {"type": "string", "format": "date"},
    "services": {
      "type": "object",
      "properties": {
        "inspection": {"type": "boolean"},
        "repair": {"type": "boolean"},
        "storage_days": {"type": ["integer","null"], "minimum": 0},
        "delivery_estimate": {"type": "boolean"},
        "insurance": {"type": "boolean"}
      }
    }
  },
  "required": ["listing_id","purpose","quantity"]
}
```

S2. Quote phát hành (API-D03) — xem file đầy đủ: [schemas/api/quote.issue.schema.json](schemas/api/quote.issue.schema.json)
```json
{
  "type": "object",
  "properties": {
    "items": {"type": "array", "items": {"type": "object", "properties": {
      "item_type": {"type": "string", "enum": ["container","service"]},
      "ref_id": {"type": ["string","null"]},
      "description": {"type": "string"},
      "qty": {"type": "number", "minimum": 0},
      "unit_price": {"type": "number", "minimum": 0}
    }, "required": ["item_type","description","qty","unit_price"]}},
    "fees": {"type": "array", "items": {"type": "object", "properties": {
      "code": {"type": "string"},
      "amount": {"type": "number", "minimum": 0}
    }, "required": ["code","amount"]}},
    "total": {"type": "number", "minimum": 0},
    "currency": {"type": "string"},
    "valid_until": {"type": "string", "format": "date-time"}
  },
  "required": ["items","total","currency","valid_until"]
}
```

S3. Tạo Order từ Quote (API-F01) — xem file đầy đủ: [schemas/api/order.createFromQuote.schema.json](schemas/api/order.createFromQuote.schema.json)
```json
{
  "type": "object",
  "properties": {
    "quote_id": {"type": "string", "format": "uuid"}
  },
  "required": ["quote_id"]
}
```

S4. Thanh toán Escrow (API-F04) — xem file đầy đủ: [schemas/api/payment.payEscrow.schema.json](schemas/api/payment.payEscrow.schema.json)
```json
{
  "type": "object",
  "properties": {
    "method": {"type": "string", "enum": ["bank","card","ewallet"]}
  },
  "required": ["method"]
}
```

S5. Publish Config Entry (API-K17)
```json
{
  "type": "object",
  "properties": {
    "value_json": {"type": ["object","null"]}
  }
}
```

S6. Depot Stock Query (API-E06) — xem file: [schemas/api/depot.stock.query.schema.json](schemas/api/depot.stock.query.schema.json)
```json
{
  "type": "object",
  "properties": {
    "owner_org_id": {"type": "string", "format": "uuid"},
    "size_ft": {"type": "integer", "enum": [10,20,40,45]},
    "type": {"type": "string"},
    "quality_standard": {"type": "string", "enum": ["WWT","CW","IICL"]},
    "condition": {"type": "string", "enum": ["new","used"]},
    "manufactured_year_from": {"type": "integer"},
    "manufactured_year_to": {"type": "integer"},
    "page": {"type": "integer"},
    "limit": {"type": "integer"},
    "sort": {"type": "string"}
  }
}
```

S7. Depot Movements Query (API-E07) — xem file: [schemas/api/depot.stockMovements.query.schema.json](schemas/api/depot.stockMovements.query.schema.json)
```json
{
  "type": "object",
  "properties": {
    "from": {"type": "string"},
    "to": {"type": "string"},
    "movement_type": {"type": "string"},
    "container_id": {"type": "string"},
    "owner_org_id": {"type": "string"},
    "page": {"type": "integer"},
    "limit": {"type": "integer"},
    "sort": {"type": "string"}
  }
}
```

S8. Depot Stock Adjustment Create (API-E08) — xem file: [schemas/api/depot.stockAdjustment.create.schema.json](schemas/api/depot.stockAdjustment.create.schema.json)
```json
{
  "type": "object",
  "properties": {
    "container_id": {"type": "string"},
    "direction": {"type": "string"},
    "reason": {"type": "string"},
    "occurred_at": {"type": "string"}
  }
}
```

S9. Depot Stock Report Query (API-E09) — xem file: [schemas/api/depot.stockReport.query.schema.json](schemas/api/depot.stockReport.query.schema.json)
```json
{
  "type": "object",
  "properties": {
    "from": {"type": "string"},
    "to": {"type": "string"},
    "group_by": {"type": "string"},
    "export": {"type": "string"}
  }
}
```

S10. Depot Transfer Create (API-E10) — xem file: [schemas/api/depot.transfer.create.schema.json](schemas/api/depot.transfer.create.schema.json)
```json
{
  "type": "object",
  "properties": {
    "container_id": {"type": "string"},
    "from_depot_id": {"type": "string"},
    "to_depot_id": {"type": "string"},
    "reason": {"type": "string"},
    "occurred_at": {"type": "string"}
  }
}
```

---

## Webhooks (đầu vào từ bên thứ ba)

- WH-PAY-01 POST /api/v1/webhooks/payments
  - Sự kiện: escrow_funded, released, failed, refund
  - Body schema: [schemas/api/webhook.payments.event.schema.json](schemas/api/webhook.payments.event.schema.json)

- WH-INS-01 POST /api/v1/webhooks/insurance
  - Sự kiện: quote_ready, policy_issued
  - Body schema: [schemas/api/webhook.insurance.event.schema.json](schemas/api/webhook.insurance.event.schema.json)

- WH-DEL-01 POST /api/v1/webhooks/delivery
  - Sự kiện: booked, eta_update, delivered
  - Body schema: [schemas/api/webhook.delivery.event.schema.json](schemas/api/webhook.delivery.event.schema.json)

---

## Quy tắc bảo mật
- JWT ký bằng khóa mạnh, refresh rotation; rate limiting; audit log cho endpoint nhạy cảm.
- RBAC middleware kiểm tra permission + scope.
- Validation vào/ra, lọc XSS/SQLi, hạn mức upload.

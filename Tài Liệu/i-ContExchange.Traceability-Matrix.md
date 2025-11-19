# Ma trận truy vết (Traceability Matrix) — i‑ContExchange

Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Mục tiêu: Bản đồ hóa yêu cầu ↔ hiện thực hóa trong tài liệu để dev triển khai đồng bộ, không bỏ sót. Mã hóa: WF-* (Workflow), FE-* (Feature), RP-* (Role/Perm), SCR-* (Screen), DB-* (Bảng/mục), API-* (Endpoint), UI-* (Component).

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md). Repo schema: xem thư mục [schemas/](schemas/).

---

## 1. Mua bán/cho thuê container qua RFQ/Quote (không chat trực tiếp)
- WF: WF-005, WF-006, WF-007, WF-010
- FE: FE-B01..B05, FE-C01..C04, FE-D01..D04
- RP: PM-020, PM-021, PM-022, PM-024
- SCR: SCR-201..203, SCR-301..303
- DB: listings, rfqs, quotes, quote_items, qa_questions, qa_answers, moderation_events, pricing_rules
- API: B01..B07, C01, D01..D06, M01..M03, F01..F07
- UI: UI-004..008, UI-010a, UI-012a

## 2. Giám định, sửa chữa, giao nhận, Escrow
- WF: WF-008..WF-014
- FE: FE-E01..E05, FE-F01..F04, FE-G01..G03, FE-H01..H02
- RP: PM-030, PM-031, PM-040..PM-043, PM-050..PM-061
- SCR: SCR-401..403, SCR-501..503, SCR-601..602
- DB: inspections, inspection_items, repairs, repair_items, orders, order_items, payments, deliveries, delivery_events, documents
- API: E01..E05, F01..F07, G01..G03, H01..H02
- UI: UI-009, UI-010, UI-011, UI-014

## 3. Quản trị, kiểm duyệt, chống liên lạc trực tiếp
- WF: WF-016, WF-024
- FE: FE-J01..J06, FE-J08, FE-D03..D04
- RP: PM-070..PM-074
- SCR: SCR-901..905
- DB: moderation_events, redaction_patterns
- API: K01..K07, K11, M01..M03
- UI: UI-012, UI-012a

## 4. Trung tâm cấu hình (no‑code)
- WF: WF-025, WF-026
- FE: FE-N01..N10
- RP: RL-CONFIG; PM-110..PM-125
- SCR: SCR-905 (tabs), SCR-906
- DB: config_namespaces, config_entries, feature_flags, tax_rates, fee_schedules, commission_rules, marketplace_policies, notification_templates, form_schemas, business_hours, depot_calendars, integration_configs, payment_methods, partners, slas
- API: K12..K55
- UI: UI-021..UI-030
 - Schemas: config/*.schema.json (pricing, fees, commissions, templates, i18n, forms, slas, redaction)

## 5. Thuê bao & thanh toán định kỳ
- WF: WF-021
- FE: FE-J05
- RP: PM-090..PM-091
- SCR: SCR-801..803
- DB: plans, subscriptions, payments
- API: J01..J04
- UI: UI-015, UI-020
 - Schemas (liên quan payments/escrow): api/payment.payEscrow.schema.json

---

## 6. Ghi chú NFR (phi chức năng) rút gọn
- Bảo mật: JWT + RBAC; RLS Postgres; audit cho hành vi nhạy cảm; PII tuân thủ Nghị định 13.
- Hiệu năng: cache cấu hình với TTL 60–300s; index theo truy vấn nêu trong DB spec.
- Khả dụng: publish cấu hình không downtime; idempotent cho POST quan trọng; rate limit chuẩn.
- Observability: mỗi endpoint ghi X-Request-Id; log structured; dashboard lỗi.
- i18n: VN mặc định; fallback EN; template đa ngôn ngữ.

---

Gợi ý triển khai: khi dev tạo tính năng mới, gắn mã FE-xxx và cập nhật liên kết đến WF/API/DB/SCR/UI trong ma trận này để giữ đồng bộ.

---

## 7. Kho tồn Depot (Depot Inventory)
- WF: WF-027..WF-032
- RP: PM-083, PM-084, PM-085, PM-086
- SCR: SCR-410..SCR-413
- DB: depot_stock_movements, containers.current_depot_id
- API: E06..E10
- Schemas: api/depot.stock.query.schema.json, api/depot.stockMovements.query.schema.json, api/depot.stockAdjustment.create.schema.json, api/depot.stockReport.query.schema.json, api/depot.transfer.create.schema.json

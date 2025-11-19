# Quy ước chung & Thuật ngữ — i‑ContExchange

Mã tài liệu: CG-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Mục tiêu: Chuẩn hóa cách ghi chép và triển khai để các đội dev đồng bộ, giảm hỏi đáp. Tài liệu này được tất cả tài liệu khác tham chiếu.

---

## 1. Quy ước dữ liệu & API
- Chuẩn JSON: UTF‑8, field_names kiểu snake_case cho DB, camelCase cho JSON API.
- ID: UUID v4, chuỗi 36 ký tự có dấu gạch; format: `uuid` trong JSON Schema.
- Thời gian: UTC, chuẩn ISO 8601 `YYYY-MM-DDTHH:mm:ss.sssZ`; ngày-only dùng `YYYY-MM-DD`.
- Tiền tệ: `currency` theo ISO 4217 (mặc định `VND`), số tiền dạng number với 2 chữ số thập phân (NUMERIC(18,2)).
- Đơn vị & kích thước: size_ft ∈ {10,20,40,45}; tiêu chuẩn: {WWT,CW,IICL}; tình trạng: {new,used}.
- Phân trang: `page` (>=1), `limit` (1..100), `total` trả về cùng danh sách.
- Sắp xếp: `sort=field:asc|desc`; chỉ cho phép trên whitelist mỗi tài nguyên.
- Lọc: tham số query rõ ràng; không chấp nhận filter mơ hồ.
- Lỗi (error envelope):
```
{
  "error": { "code": "STRING", "message": "STRING", "details": {"field": "reason"} }
}
```
- Bảo mật: Bearer JWT; idempotency bằng header `Idempotency-Key` cho POST quan trọng; rate limit chuẩn theo API spec.

## 2. Quy ước i18n & trình bày
- Ngôn ngữ mặc định: `vi`; hỗ trợ `en` (fallback).
- Namespace khóa: `scr.*` cho màn hình, `ui.*` cho thành phần, `api.*` cho thông điệp lỗi chuẩn.
- Định dạng ngày/tiền tệ hiển thị theo locale người dùng; back-end lưu UTC.

## 3. Tên gọi & viết tắt
- RFQ: Request for Quote — Yêu cầu báo giá
- Quote: Báo giá
- Escrow: Tài khoản ký quỹ
- EDO: Electronic Delivery Order — Lệnh giao hàng điện tử
- EIR: Equipment Interchange Receipt — Phiếu giao nhận thiết bị
- DMS: Depot Management System — Hệ thống quản lý Depot
- SLA: Service Level Agreement — Cam kết mức dịch vụ
- RLS: Row Level Security — Bảo mật mức dòng (Postgres)

## 4. Sự kiện & Webhooks (đặt tên)
- Sự kiện dùng dạng `domain.action`:
  - listing.submitted, listing.approved, listing.rejected
  - rfq.created, rfq.validated, quote.issued, quote.accepted, quote.declined, quote.expired
  - inspection.requested, inspection.scheduled, inspection.completed
  - order.created, payment.intent_created, escrow.funded, escrow.released
  - delivery.booked, delivery.in_transit, delivery.delivered, eir.issued
  - dispute.opened, dispute.closed
  - config.draft_saved, config.published, config.rolled_back
- Webhooks bên thứ ba: WH-PAY-01, WH-INS-01, WH-DEL-01 như trong API spec.

## 5. Mapping mã & liên kết
- Workflow: WF-xxx ↔ API-xxx ↔ DB bảng/cột ↔ SCR-xxx ↔ UI-xxx ↔ RP (PM-xxx).
- Mọi bổ sung phải cập nhật Ma trận truy vết để giữ đồng bộ.

## 6. Quy ước kiểm thử & hợp đồng
- JSON Schema draft‑07 là tiêu chuẩn hợp đồng. BE/FE validate request trước khi gửi/nhận.
- Hợp đồng API: Status code theo REST; không trả 200 cho lỗi nghiệp vụ.
- Test tối thiểu: happy path + 2 edge cases (null/format sai, permission thiếu).

## 7. Hiệu năng & cache cấu hình
- Cache config theo khóa `cfg:{namespace}:{key}`; TTL 60–300s; chỉ đọc `published`.
- Bust cache qua webhook nội bộ khi publish.

## 8. Bảo mật & tuân thủ
- Deny-by-default; check permission + scope trước khi truy cập.
- PII tuân thủ Nghị định 13/2023; log truy cập; không lưu secrets trong config_entries (dùng secrets_ref).

---

## Phụ lục A — Bảng thuật ngữ
- Buyer: Bên mua/thuê
- Seller: Bên bán/cho thuê
- Participant: Bên tham gia giao dịch (buyer/seller và các dịch vụ liên quan)
- Price Band: Dải giá hợp lệ theo quy tắc
- Feature Flag: Cờ bật/tắt tính năng theo nhóm người dùng hoặc điều kiện
- On-hand: Số lượng container đang hiện hữu trong ranh giới Depot tại thời điểm truy vấn.
- Movement: Bản ghi giao dịch nhập/xuất/chuyển ảnh hưởng đến on-hand.
- Transfer: Thao tác chuyển container giữa 2 Depot, sinh 2 movement đối ứng OUT/IN.
- Owner (owner_org_id): Tổ chức sở hữu container (chủ vỏ/hãng tàu) để lọc tồn.
- Aging: Tuổi tồn kho phân theo khoảng ngày (0–7, 8–14, 15–30, 31–60, >60).

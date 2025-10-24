# Yêu cầu phi chức năng (NFR) — i‑ContExchange

Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

## Bảo mật & Tuân thủ
- Dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP: phân loại, mục đích, lưu trữ, thời hạn, quyền chủ thể.
- Xác thực: JWT RS256, refresh rotation; 2FA (tùy chọn) cho vai trò nhạy cảm.
- Phân quyền: RBAC + scope; RLS Postgres trên dữ liệu nhạy cảm.
- Mã hóa: TLS 1.2+; at-rest trên backup/snapshots.
- Audit: mọi hành động admin/config/payout; bảo toàn log ≥ 365 ngày.

## Hiệu năng & Tính sẵn sàng
- P99 API < 500ms cho truy vấn thường; < 1.5s cho tìm kiếm toàn văn.
- Khả dụng 99.9% theo tháng.
- Thông lượng: 200 RPS baseline, scale ngang.
- Cache: Redis/LRU cho cấu hình (TTL 60–300s), danh mục nóng.
 - Depot Inventory:
	 - E06 (stock on-hand) P95 ≤ 300ms, P99 ≤ 700ms cho bộ lọc phổ biến (owner/size/standard/condition).
	 - E07 (movements) P95 ≤ 400ms, P99 ≤ 900ms cho khoảng 30 ngày; hỗ trợ phân trang/index occurred_at desc.
	 - E09 (stock report) P95 ≤ 500ms, P99 ≤ 1s cho kỳ 30 ngày, có thể cần materialized view/partitioning.
	 - E08/E10 (adjust/transfer) ghi ≤ 150ms; idempotent; không cho âm tồn.

## Khả năng mở rộng & Bảo trì
- Kiến trúc module theo nhóm chức năng (B/D/F/G/K…); version API v1.
- No‑code config publish không downtime; hỗ trợ rollback.
- Migrate DB bằng script có kiểm tra tương thích ngược.

## Observability
- Logging cấu trúc (correlation-id, user_id, org_id, endpoint, latency, status).
- Metrics: RPS, lỗi, latency; business KPIs (GMV, take rate, conversion RFQ→Quote→Order).
- Alerting theo ngưỡng SLA; dashboard.

## Chất lượng & QA
- Test: unit, contract tests cho API; schema validation; e2e hành trình chính.
- Security testing: SAST/DAST; kiểm thử regex redaction tránh ReDoS.
- Data quality: ràng buộc PK/FK/UNIQUE/NOT NULL; CHECK; retention.

## Quốc tế hóa (i18n)
- VN mặc định; EN fallback; hỗ trợ template đa ngôn ngữ; định dạng số/tiền/tz theo locale.

## Khả dụng & Accessibility
- WCAG AA; keyboard navigation; contrast AA; focus states.

Ghi chú: NFR là ràng buộc chung; khi tính năng mới, bổ sung NFR cụ thể (SLA, rate limit, quyền) vào tài liệu tương ứng.

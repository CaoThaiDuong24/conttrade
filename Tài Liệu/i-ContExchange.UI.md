# ĐẶC TẢ GIAO DIỆN & THIẾT KẾ (Next.js) — i‑ContExchange

Mã tài liệu: UI-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Mục tiêu: Giao diện hiện đại, thân thiện, tốc độ cao, trải nghiệm tốt, hỗ trợ đa ngôn ngữ (mặc định Tiếng Việt), dark/light theme, responsive đầy đủ, accessible (WCAG AA), tùy biến nhỏ theo sở thích người dùng.

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md).

---

## 1. Nền tảng & kiến trúc UI
- Framework: Next.js 14+ (App Router), React Server Components.
- CSS: Tailwind CSS + biến CSS (CSS Variables) cho theme.
- Design System: Atomic design (Atoms/Molecules/Organisms/Templates/Pages).
- State: React Query/TanStack Query cho dữ liệu từ API; Zustand/Redux nhẹ cho UI state.
- i18n: next-intl hoặc next-i18next, locale mặc định `vi`, hỗ trợ `en`.
- Icon: Lucide/Feather; Font: Inter/Roboto.

---

## 2. Thiết kế chủ đề (Theme)
- Chế độ: Light/Dark; chuyển nhanh qua nút toggle; lưu vào localStorage và ưu tiên theo `prefers-color-scheme`.
- Màu chủ đạo: Xanh tin cậy (#0F766E), phụ trợ xám trung tính.
- Biến CSS: `--bg`, `--fg`, `--primary`, `--muted`, `--border`, `--ring`.
- Độ tương phản đạt AA; focus ring rõ ràng; trạng thái hover/active/disabled nhất quán.

---

## 3. Grid & responsive
- Mobile-first, breakpoint: sm(640), md(768), lg(1024), xl(1280).
- Card listing 1 cột (mobile) → 2-4 cột (desktop).
- Sidebar filter collapsible trên mobile.

---

## 4. Component cốt lõi (mã UI-xxx)

- UI-001 AppHeader: logo, search, lang switcher, auth menu, theme toggle
- UI-002 AppFooter: links, bản quyền, ngôn ngữ
- UI-003 SearchBar: từ khóa + bộ lọc nhanh
- UI-004 ListingCard: ảnh, tiêu đề, tiêu chuẩn, giá, vị trí, badge nổi bật
- UI-005 ListingFilter: loại, kích thước, tiêu chuẩn, Depot, khoảng giá
- UI-006 MediaUploader: ảnh/video, drag & drop, preview, reorder
- UI-007 FormStepWizard: điều hướng bước đăng tin/checkout
- UI-008 RFQForm: biểu mẫu yêu cầu báo giá với trường chuẩn
- UI-009 InspectionReportViewer: ảnh/video, checklist, kết luận
- UI-010 OrderTimeline: trạng thái giao dịch/escrow/giao hàng
- UI-010a QuotePanel: danh sách/chi tiết báo giá, hành động accept/decline
- UI-011 PriceEstimator: ước tính chi phí vận chuyển
- UI-012 NotificationCenter: danh sách thông báo, đánh dấu đã đọc
- UI-012a QnAWidget (moderated): hỏi đáp có kiểm duyệt, auto-redact thông tin liên hệ
- UI-013 ReviewStars: component xếp hạng, phân phối điểm
- UI-014 MapMini: hiển thị vị trí Depot (Leaflet/Mapbox)
- UI-015 DataTable: bảng quản trị, sort, filter, paginate
- UI-016 Modal/Drawer: khuôn mẫu
- UI-017 Toast/Snackbar: phản hồi nhanh
- UI-018 FormControls: Input, Select, Switch, Checkbox, Radio, Slider, TextArea
- UI-019 Skeleton: khung tải
- UI-020 EmptyState: trạng thái trống hành động gợi ý

-- Nhóm UI cho Trung tâm cấu hình (Admin)
- UI-021 FeatureFlagToggle: bật/tắt tính năng, hỗ trợ rollout theo tỉ lệ/vai trò/vùng
- UI-022 RuleBuilder: dựng quy tắc (Pricing/Fee/Commission) dạng điều kiện→hành động, có validate
- UI-023 TemplateEditor: soạn thảo mẫu Email/SMS/Push/In‑app (Markdown + variables), preview
- UI-024 I18nKeyEditor: bảng key/value đa ngôn ngữ, tìm kiếm, import/export
- UI-025 FormSchemaEditor: JSON Schema + UI Schema với live preview, lint schema
- UI-026 RedactionPatternEditor: nhập regex/pattern với playground kiểm thử, mức độ (severity)
- UI-027 SLAEditor: form mục tiêu SLA, đơn vị, ngưỡng cảnh báo, lịch hiệu lực
- UI-028 IntegrationConfigForm: form cấu hình vendor (PSP/insurer/carrier/DMS/KYC), secret placeholders
- UI-029 ConfigEntryEditor: JSON editor có schema‑aware, gợi ý key, kiểm tra checksum
- UI-030 DiffViewer: so sánh hai phiên bản cấu hình, highlight thay đổi

---

## 5. Quy tắc UX
- CTA chính rõ ràng, màu nhất quán.
- Luồng nhiều bước có breadcrumb/stepper, lưu nháp tự động.
- Lỗi hiển thị gần trường; hướng dẫn inline; ví dụ placeholder.
- Shortcuts: / để focus search; Cmd/Ctrl+K mở Command Palette (tùy chọn). Không có phím tắt mở chat.
- Tải lười (lazy) media; prefetch cho route phổ biến.

---

## 6. i18n & nội dung
- Chuỗi giao diện dùng khóa: `screen.listings.title`.
- Ngày/tiền tệ theo locale; đơn vị VNĐ mặc định.
- Nội dung động (listing) hiển thị theo ngôn ngữ gốc; có thể dịch phụ nếu có.
 - Namespace gợi ý:
	 - `scr.home.*`, `scr.listings.*`, `scr.listingDetail.*`, `scr.rfq.*`, `scr.orders.*`, `scr.delivery.*`, `scr.admin.*`.
	 - `ui.common.*`, `ui.forms.*`, `ui.validation.*`, `ui.config.*`.

---

## 7. Truy cập (Accessibility)
- Semantic HTML, role ARIA phù hợp.
- Tab order hợp lý; hỗ trợ bàn phím; Skip to content.
- Kích cỡ font tối thiểu 14px; line-height 1.5.
- Alt cho ảnh; transcripts cho video khi cần.

---

## 8. Màn hình mẫu và thành phần tái sử dụng
- Tham chiếu tài liệu Screens (SCR-xxx) để lắp ghép các UI-xxx.
- Mọi trang có skeleton và empty state.
 - Mẫu Acceptance Criteria (áp dụng cho tất cả trang chính):
	 - Loading: skeleton phù hợp layout.
	 - Empty: thông điệp + CTA hợp lý.
	 - Error: hiển thị message, mã lỗi (nếu có), retry.
 - Admin Settings (SCR-905) sử dụng các UI-021..UI-030 cho từng tab cấu hình. Trình soạn cấu hình (SCR-906) sử dụng UI-029 + UI-030 và nút Publish/Rollback.

---

## 9. Đa nền tảng
- PWA: manifest, offline cơ bản cho trang tĩnh, icon đa kích thước.
- Mobile: touch target >= 44px; cử chỉ kéo, cuộn mượt.

---

## 10. Tùy biến người dùng
- Theme: dark/light; cỡ chữ S/M/L; mật độ bảng (compact/comfortable).
- Lưu tùy chọn theo người dùng đăng nhập (server + local).

---

## 11. Chống chia sẻ liên hệ trực tiếp (UI hints)
- Tự động cảnh báo khi người dùng nhập chuỗi giống số điện thoại/email/Zalo; hiển thị tooltip về chính sách nền tảng.
- Che/redact ngay trên UI trước khi gửi lên server; hiển thị bản xem trước nội dung đã được làm sạch.

---

## 12. Mẫu UX cho cấu hình (draft/publish/rollback)
- Trạng thái hiển thị rõ: Draft (nháp), Published (đang áp dụng), Archived (lưu trữ).
- Thanh phiên bản (Version bar): dropdown chọn version, nút xem diff (UI-030).
- Hành động:
	- Lưu nháp (Save draft)
	- Publish (phát hành) với xác nhận phạm vi ảnh hưởng; có thể lên lịch hiệu lực.
	- Rollback: chọn version trước → xác nhận → publish lại bản snapshot.
- Bảo vệ: require permission phù hợp; cảnh báo khi schema invalid; test send cho template; playground cho pattern redaction.

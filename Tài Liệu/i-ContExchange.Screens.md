# DANH SÁCH MÀN HÌNH (WEB/MOBILE) — i‑ContExchange

Mã tài liệu: SCR-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Quy ước: Mỗi màn hình có mã SCR-xxx, route (Next.js), mục tiêu, thành phần chính, trạng thái/empty/error/loading, hành động, và quyền truy cập.

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md).

---

## Nhóm 0 — Khung ứng dụng

- SCR-001 Layout tổng (App Shell)
  - Route: N/A (layout)
  - Thành phần: Header (logo, search, lang switcher, login), Sidebar (desktop), Footer, Theme switch (dark/light), Toaster/Notifications.
  - Trạng thái: responsive, sticky header, skeleton.

- SCR-002 Trang chủ (Home)
  - Route: /
  - Mục tiêu: Tổng quan, CTA tìm kiếm/đăng tin, danh mục nổi bật.
  - Thành phần: Hero, Search bar, Grid listing mới/nổi bật, Băng đối tác, Lợi ích Trust Hub.

- SCR-003 Trang đổi ngôn ngữ
  - Route: /locale
  - Cho phép chọn ngôn ngữ, ưu tiên Tiếng Việt.

## Nhóm 1 — Tài khoản & Xác thực

- SCR-101 Đăng ký
  - Route: /auth/register
  - Form chọn Cá nhân/Doanh nghiệp, OTP.

- SCR-102 Đăng nhập
  - Route: /auth/login
  - Hỗ trợ email/điện thoại, social (tùy chọn).

- SCR-103 Quên mật khẩu
  - Route: /auth/forgot
  - Gửi OTP/link đặt lại.

- SCR-104 Hồ sơ cá nhân
  - Route: /account/profile
  - Thông tin cá nhân, địa chỉ, tài liệu eKYC, vai trò.

- SCR-105 eKYC/eKYB
  - Route: /account/verify
  - Upload CCCD/Hộ chiếu; doanh nghiệp: GCN ĐKDN, MST.

## Nhóm 2 — Tin đăng & Container

- SCR-201 Danh sách tin (Search Results)
  - Route: /listings
  - Bộ lọc nâng cao, sắp xếp, phân trang, facet sidebar.

- SCR-202 Chi tiết tin đăng
  - Route: /listings/[id]
  - Gallery ảnh/video, thông số, tiêu chuẩn, Depot, người bán, CTA Yêu cầu báo giá (RFQ) / Yêu cầu giám định. Không hiển thị thông tin liên hệ trực tiếp.
  - Acceptance: 
    - Loading: skeleton cho gallery và thông số.
    - Empty: nếu không tìm thấy tin → hiển thị 404 thân thiện.
    - Error: thông báo rõ ràng; retry.
    - i18n: namespace `scr.listingDetail.*`.

- SCR-203 Đăng tin mới
  - Route: /sell/new
  - Form nhiều bước: thông số → media → giá → depot → xem lại → gửi duyệt.

- SCR-204 Quản lý tin của tôi
  - Route: /sell/my-listings
  - Bảng tin: trạng thái, lượt xem, chỉnh sửa, ẩn/xóa.

## Nhóm 3 — Trung tâm Yêu cầu & Báo giá (RFQ/Quote)

- SCR-301 Trung tâm RFQ của tôi
  - Route: /rfq
  - Danh sách RFQ đã gửi/nhận; trạng thái: submitted/quoted/expired.
  - Acceptance:
    - Loading: bảng skeleton.
    - Empty: “Chưa có RFQ”.
    - Error: toast + retry.
    - i18n: `scr.rfq.list.*`.

- SCR-302 Chi tiết RFQ & Báo giá
  - Route: /rfq/[rfqId]
  - Thông tin RFQ, các Quote hợp lệ; hành động: chấp nhận/từ chối; lịch sử sửa đổi.
  - Acceptance:
    - Loading: skeleton phần tóm tắt và danh sách báo giá.
    - Error: hiển thị quyền truy cập (403) nếu không phải participant.
    - i18n: `scr.rfq.detail.*`.

- SCR-303 Q&A có kiểm duyệt
  - Route: /rfq/[rfqId]/qa
  - Biểu mẫu hỏi đáp, auto-redact thông tin liên hệ; hàng đợi kiểm duyệt khi bị gắn cờ.

## Nhóm 4 — Giám định & Dịch vụ Depot

- SCR-401 Tạo yêu cầu giám định
  - Route: /inspection/new?listingId=xxx
  - Chọn lịch, Depot; hiển thị SLA/chi phí.

- SCR-402 Báo cáo giám định
  - Route: /inspection/[id]
  - Kết luận, ảnh/video, đề xuất sửa chữa.

- SCR-403 Yêu cầu sửa chữa
  - Route: /repairs/[id]
  - Danh mục hạng mục, báo giá, chấp nhận/đề nghị sửa lại.

### Nhóm 4.1 — Kho tồn Depot

- SCR-410 Tồn kho Depot (On-hand)
  - Route: /depot/[depotId]/stock
  - Thành phần: Filter bar (owner, size, type, standard, condition, year), DataGrid phân trang, chip tổng số on-hand.
  - Quyền: PM-083 (Depot scope)
  - Acceptance:
    - Loading: skeleton bảng.
    - Empty: “Chưa có container on-hand”.
    - Error: 403 nếu thiếu quyền; 400 nếu bộ lọc không hợp lệ.

- SCR-411 Nhật ký nhập–xuất–chuyển
  - Route: /depot/[depotId]/movements
  - Thành phần: Date range picker, type filter (IN/OUT/TRANSFER), bảng sự kiện, link đến chứng từ (EIR/EDO/Delivery).
  - Quyền: PM-084
  - Acceptance: tương tự SCR-410.

- SCR-412 Điều chỉnh tồn kho
  - Route: /depot/[depotId]/adjustments
  - Thành phần: Form container_id, direction (IN/OUT), reason, occurred_at; guard xác nhận 2 bước.
  - Quyền: PM-085
  - Acceptance: Hiển thị kết quả movement id; rollback không hỗ trợ, chỉ cho phép “điều chỉnh bù”.

- SCR-413 Chuyển giữa các Depot
  - Route: /depot/transfers
  - Thành phần: Form container_id, from_depot_id, to_depot_id, reason, occurred_at; hiển thị cặp movement sinh ra.
  - Quyền: PM-086
  - Acceptance: Validate container đang on-hand tại from_depot.

## Nhóm 5 — Giao dịch & Thanh toán

- SCR-501 Tạo đơn hàng (Checkout)
  - Route: /checkout
  - Tóm tắt: container, dịch vụ; chọn bảo hiểm; phí vận chuyển ước tính; Escrow.

- SCR-502 Đơn hàng của tôi
  - Route: /orders
  - Danh sách đơn, trạng thái tiến trình.

- SCR-503 Chi tiết đơn hàng
  - Route: /orders/[orderId]
  - Timeline: quote accepted → escrow funded → EDO → giao → EIR → complete; khiếu nại.

## Nhóm 6 — Vận chuyển

- SCR-601 Yêu cầu vận chuyển
  - Route: /delivery/request?orderId=xxx
  - Nhập địa chỉ, thời gian, yêu cầu cẩu; xem báo giá.

- SCR-602 Theo dõi giao hàng
  - Route: /delivery/track/[bookingId]
  - Bản đồ GPS, ETA, liên hệ tài xế.

## Nhóm 7 — Đánh giá & Tranh chấp

- SCR-701 Đánh giá sau giao dịch
  - Route: /reviews/new?orderId=xxx
  - Form tiêu chí, xếp hạng sao, bình luận.

- SCR-702 Khiếu nại/Tranh chấp
  - Route: /disputes/new?orderId=xxx
  - Biểu mẫu bằng chứng; theo dõi xử lý.

## Nhóm 8 — Gói thuê bao & Báo cáo

- SCR-801 Chọn gói thuê bao
  - Route: /billing/plans
  - Bảng so sánh quyền lợi, CTA đăng ký.

- SCR-802 Lịch sử thanh toán/hóa đơn
  - Route: /billing/history

- SCR-803 Dashboard doanh nghiệp (thuê bao)
  - Route: /insights
  - KPI thị trường, giá, nguồn cung/cầu theo vùng.

## Nhóm 9 — Quản trị

- SCR-901 Bảng điều khiển Admin
  - Route: /admin
  - KPIs, cảnh báo rủi ro.

- SCR-902 Quản lý người dùng & vai trò
  - Route: /admin/users

- SCR-903 Duyệt tin đăng
  - Route: /admin/listings

- SCR-904 Quản lý tranh chấp
  - Route: /admin/disputes

- SCR-905 Cấu hình phí, gói, nội dung
  - Route: /admin/settings
  - Tabs:
    - Pricing Rules: cấu hình dải giá/price bands theo loại/kích cỡ/tiêu chuẩn/khu vực.
    - Feature Flags: bật/tắt tính năng, rollout.
    - Taxes/Fees/Commissions: thuế khu vực, biểu phí, quy tắc hoa hồng.
    - Policies: soạn thảo điều khoản/chính sách (Markdown) có lịch hiệu lực.
    - Templates: Email/SMS/Push/In‑app template, preview và test send.
    - i18n: quản lý từ điển, tìm key thiếu, import/export.
    - Forms: Form Builder (JSON Schema) cho RFQ/Quote/Inspection/Dispute.
    - SLA & Calendars: SLA mục tiêu, Business Hours tổ chức, Depot Calendars.
    - Integrations: cấu hình vendor (PSP/Insurer/Carrier/DMS/KYC) & secrets_ref.
    - Payment Methods: cấu hình phương thức thanh toán khả dụng.
    - Partners: sổ tay đối tác (carrier/insurer/PSP/DMS) và trạng thái.
    - Advanced: Namespaces & Entries (no‑code) với versioning.
  - Acceptance:
    - Loading: skeleton cho bảng và editor.
    - Error: permission denied (PM‑110..125) → hiển thị guard.
    - i18n: `scr.admin.settings.*`.

- SCR-906 Trình soạn cấu hình (Entry Editor)
  - Route: /admin/settings/config/:namespace/:key
  - Thành phần: JSON editor (schema‑aware), phiên bản (version list), diff viewer, nút Publish/Rollback, trường ghi chú.
  - Trạng thái: draft/published/archived; cảnh báo khi thay đổi ảnh hưởng rộng.

## Nhóm 10 — Trang thông tin & Hỗ trợ

- SCR-1001 Trung tâm trợ giúp
  - Route: /help

- SCR-1002 Chính sách & Điều khoản
  - Route: /legal

---

## Trạng thái & Skeleton
- Mỗi màn hình cần trạng thái: loading, empty, error, success; skeleton để tăng trải nghiệm.

## Quyền truy cập (mẫu)
- Public: SCR-002, SCR-201, SCR-202, SCR-1001, SCR-1002
- Đăng nhập: SCR-104+, SCR-203+, SCR-301+, SCR-401+, SCR-501+, SCR-601+, SCR-701+, SCR-702+
- Admin: SCR-901..905

## Điều hướng (Navigation)
- Breadcrumbs trên trang chi tiết.
- Back-to-list cho danh sách.
- CTA rõ ràng (mua/thuê, giám định, thanh toán, vận chuyển).
 - CTA rõ ràng (Yêu cầu báo giá, giám định, thanh toán, vận chuyển). Không CTA liên hệ trực tiếp.

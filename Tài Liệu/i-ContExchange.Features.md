# TÀI LIỆU TÍNH NĂNG/CHỨC NĂNG — i‑ContExchange

Mã tài liệu: FE-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Tài liệu liệt kê toàn diện các module, tính năng và chức năng hệ thống. Mỗi mục có mã FE-xxx, mô tả, vai trò liên quan, trạng thái triển khai theo giai đoạn (MVP/Phase 2/Phase 3) và phụ thuộc.

---

## Nhóm A — Nền tảng người dùng và xác thực

- FE-A01 Đăng ký tài khoản OTP (Cá nhân/Doanh nghiệp) — MVP
  - Mô tả: Đăng ký qua email/điện thoại, OTP kích hoạt, đồng ý điều khoản.
  - Vai trò: Guest
  - Phụ thuộc: FE-A02 Auth Service

- FE-A02 Đăng nhập/Đăng xuất/Quên mật khẩu — MVP
  - JWT/OAuth2, lưu phiên, đặt lại mật khẩu bằng OTP/link.

- FE-A03 eKYC cá nhân — Phase 2
  - OCR, liveness, so khớp khuôn mặt, duyệt thủ công + tự động.

- FE-A04 eKYB doanh nghiệp — Phase 2
  - Xác minh pháp nhân, eKYC người đại diện.

- FE-A05 Quản lý hồ sơ tài khoản — MVP
  - Cập nhật thông tin, địa chỉ, tài liệu, lịch sử giao dịch, vai trò.

## Nhóm B — Quản lý tin đăng/container

- FE-B01 Tạo tin đăng (Bán/Cho thuê) — MVP
  - Trường tiêu chuẩn: loại, kích cỡ (10/20/40/40HC/45), tình trạng, tiêu chuẩn CW/WWT/IICL, vị trí Depot, giá, media.

- FE-B02 Quy trình kiểm duyệt tin — MVP
  - Hàng đợi duyệt, lý do từ chối, nhật ký.

- FE-B03 Quản lý danh mục container — MVP
  - CRUD container master, ràng buộc sở hữu.

- FE-B04 Gắn container vào Depot — MVP
  - Liên kết vị trí, tồn kho theo Depot.

- FE-B05 Gói tin nổi bật/đẩy top — Phase 2
  - Trả phí để tăng hiển thị, thuật toán sắp xếp ưu tiên.

## Nhóm C — Khám phá, tìm kiếm, đề xuất

- FE-C01 Tìm kiếm toàn văn + Bộ lọc nâng cao — MVP
  - Theo loại giao dịch, kích cỡ, vị trí, giá, tiêu chuẩn, Depot, ngày đăng.

- FE-C02 Sắp xếp (giá/ngày/độ liên quan) — MVP

- FE-C03 Lưu tìm kiếm, cảnh báo giá — Phase 2

- FE-C04 Gợi ý cá nhân hóa — Phase 3

## Nhóm D — Yêu cầu báo giá (RFQ) & Báo giá (Quote) có kiểm soát

- FE-D01 RFQ: Người mua gửi yêu cầu báo giá có cấu trúc — MVP
  - Trường: mục đích (mua/thuê), số lượng, thời gian dự kiến, dịch vụ kèm (giám định, sửa chữa, lưu kho, vận chuyển, bảo hiểm).
  - Logic: chống spam, rate limit, kiểm duyệt nội dung.

- FE-D02 Quote: Người bán trả báo giá trong price band — MVP
  - Hệ thống kiểm tra bởi Pricing Rules Engine; yêu cầu giải trình nếu vượt ngưỡng.
  - Hiệu lực báo giá, điều kiện chuẩn hóa.

- FE-D03 Q&A có kiểm duyệt (không tiết lộ liên hệ) — Phase 2
  - Biểu mẫu câu hỏi/đáp, auto-redact số điện thoại/email/Zalo.
  - Nội dung qua hàng đợi kiểm duyệt khi bị gắn cờ.

- FE-D04 Redaction & OCR/NLP chống lách luật — Phase 2
  - Quét text/ảnh để che thông tin liên hệ, nhật ký vi phạm.

## Nhóm E — Giám định, sửa chữa, dịch vụ Depot

- FE-E01 Đặt lịch giám định tại Depot — MVP (thí điểm)

- FE-E02 Báo cáo giám định số hóa (ảnh/video, kết luận) — Phase 2

- FE-E03 Yêu cầu sửa chữa, báo giá, nghiệm thu — Phase 2

- FE-E04 Quản lý lưu kho (tính phí theo ngày) — Phase 2

- FE-E05 Tích hợp DMS (Depot Management System) — Phase 3

## Nhóm F — Giao dịch, thanh toán, Escrow

- FE-F01 Tạo đơn giao dịch (Order) — MVP

- FE-F02 Thanh toán ký quỹ Escrow (Bank/PSP) — Phase 2

- FE-F03 Đối soát, xuất hóa đơn điện tử — Phase 2

- FE-F04 Chính sách hủy/hoàn — Phase 2

## Nhóm G — Vận chuyển

- FE-G01 Ước tính phí vận chuyển — Phase 2

- FE-G02 Đặt xe vận chuyển tích hợp — Phase 2

- FE-G03 Theo dõi GPS giao hàng — Phase 3

## Nhóm H — Bảo hiểm

- FE-H01 Báo giá và mua bảo hiểm tích hợp — Phase 2

- FE-H02 Lưu chứng thư, khiếu nại bảo hiểm — Phase 3

## Nhóm I — Đánh giá và uy tín

- FE-I01 Đánh giá 2 chiều sau giao dịch — MVP

- FE-I02 Điểm uy tín có trọng số thời gian — Phase 2

- FE-I03 Phát hiện gian lận/đánh giá bất thường — Phase 3

## Nhóm J — Quản trị

- FE-J01 Bảng điều khiển admin (KPIs) — MVP

- FE-J02 Quản lý người dùng, vai trò, quyền — MVP

- FE-J03 Duyệt nội dung tin đăng — MVP

- FE-J04 Quản lý tranh chấp — Phase 2

- FE-J05 Quản lý gói thuê bao, giá — Phase 2

- FE-J06 Nhật ký hệ thống/audit trail — Phase 2
- FE-J07 Pricing Rules Engine & Quản lý dải giá — Phase 2
  - Cấu hình price band theo loại/kích cỡ/tiêu chuẩn/khu vực/thời gian; phiên bản hóa.
- FE-J08 Chính sách chống liên lạc trực tiếp — Phase 2
  - Quy tắc che thông tin, ngưỡng xử phạt, khóa tính năng/tài khoản.

## Nhóm N — Trung tâm cấu hình (no‑code)

- FE-N01 Quản lý namespace và entry cấu hình — Phase 2
  - Namespace (ví dụ: marketplace, escrow, logistics, ui, rfq, quote, order): key/value JSON có version, trạng thái (draft/published/archived), checksum.
  - Hỗ trợ draft → publish → rollback; lịch sử phiên bản.

- FE-N02 Feature Flags & Rollout — Phase 2
  - Bật/tắt tính năng, rollout theo % người dùng, theo vai trò, theo vùng; theo thời gian hiệu lực.

- FE-N03 Thuế/Phí/Hoa hồng — Phase 2
  - Thuế theo vùng/mã (VAT, env fee); biểu phí (flat/percent/tiered); quy tắc hoa hồng và trần/sàn.

- FE-N04 Chính sách & Quy định thị trường — Phase 2
  - Biên tập Terms/Policy (Markdown) với version; lập lịch hiệu lực.

- FE-N05 Mẫu thông báo (Email/SMS/Push/In‑app) — Phase 2
  - Trình soạn thảo template, biến động (variables), test send, đa ngôn ngữ.

- FE-N06 Quản lý từ điển i18n — Phase 2
  - Import/Export, kiểm tra key thiếu, ưu tiên Tiếng Việt mặc định, fallback en.

- FE-N07 Trình tạo biểu mẫu (Form Builder) — Phase 2
  - JSON Schema + UI Schema cho RFQ, Quote, Inspection, Dispute; xem trước (preview) và phát hành.

- FE-N08 SLA & Lịch làm việc — Phase 2
  - SLA cho RFQ/Quote/Inspection/Support; lịch làm việc tổ chức và lịch đóng Depot.

- FE-N09 Tích hợp bên thứ ba — Phase 2
  - Cấu hình vendor (PSP, insurer, carrier, DMS, eKYC) với thông số và secrets_ref; publish version.

- FE-N10 Chủ đề giao diện & Branding — Phase 2
  - Màu sắc, logo, email theme; áp dụng qua feature flag; live preview an toàn.

Phụ thuộc: FE-J07 (Pricing Rules), FE-K01..K03 (Thông báo), FE-M01..M02 (i18n/Theme).

## Nhóm K — Thông báo và truyền thông

- FE-K01 Thông báo in-app, email, SMS — MVP

- FE-K02 Push notification (mobile/web) — Phase 2

- FE-K03 Trung tâm thông báo (Notification Center) — Phase 2

## Nhóm L — Phân tích dữ liệu & báo cáo

- FE-L01 Thống kê cơ bản (tin, người dùng) — MVP

- FE-L02 Dashboard giao dịch/doanh thu — Phase 2

- FE-L03 Báo cáo thị trường cho thuê bao nâng cao — Phase 3

## Nhóm M — Đa ngôn ngữ, UI/UX

- FE-M01 i18n đa ngôn ngữ (VN mặc định) — MVP

- FE-M02 Dark/Light theme, tuỳ biến — MVP

- FE-M03 Responsive mobile-first — MVP

- FE-M04 Accessibility (WCAG AA) — Phase 2

---

## Phụ lục — Ma trận phụ thuộc chính (tóm tắt)
- eKYC/eKYB (Nhóm A) là điều kiện để Đăng tin, Giao dịch.
- Escrow (F02) phụ thuộc Order (F01) và tích hợp PSP/Ngân hàng.
- Vận chuyển (G02) phụ thuộc EDO/D/O (liên quan WF-011) và Depot.
- Bảo hiểm (H01) tích hợp khi checkout (F01/F02).
- DMS (E05) là tích hợp giai đoạn 3 để tối ưu vận hành Depot.

# TÀI LIỆU QUY TRÌNH NGHIỆP VỤ (WORKFLOW) — i‑ContExchange

Mã tài liệu: WF-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Tài liệu mô tả đầy đủ, chi tiết, có đánh mã tất cả các quy trình vận hành “phygital” của i‑ContExchange, liên kết với hệ thống Depot, Escrow, eKYC/eKYB, vận chuyển, bảo hiểm, tranh chấp, thông báo, và quản trị. Lưu ý: toàn bộ giao tiếp và thương lượng giữa các bên được kiểm soát bởi nền tảng; không cho phép trao đổi trực tiếp thông tin liên hệ hoặc đàm phán ngoài hệ thống.

Tham chiếu quy ước chung & thuật ngữ: xem [i-ContExchange.Conventions-Glossary.md](i-ContExchange.Conventions-Glossary.md).

---

## 0. Quy ước đặt mã và thuật ngữ
- WF-xxx: Mã quy trình chuẩn (Workflow)
- ACT: Tác nhân (Actor) — Người dùng/nhân viên/hệ thống
- PRE: Điều kiện tiên quyết
- TRG: Sự kiện kích hoạt
- OUT: Kết quả/điểm kết thúc
- DATA: Dữ liệu vào/ra chính
- STAT: Trạng thái đối tượng chính trong quy trình
- SLA: Cam kết thời gian xử lý

Thuật ngữ chính: 
- Depot: Cảng cạn/kho bãi container
- EDO: Electronic Delivery Order — Lệnh giao hàng điện tử
- EIR: Equipment Interchange Receipt — Phiếu giao nhận thiết bị/container
- Escrow: Tài khoản ký quỹ trung gian
- eKYC/eKYB: Định danh cá nhân/doanh nghiệp điện tử

---

## WF-001: Đăng ký tài khoản và kích hoạt OTP
- ACT: Khách vãng lai, Hệ thống OTP, Email/SMS Gateway
- PRE: Có số điện thoại/email hợp lệ
- TRG: Người dùng gửi biểu mẫu đăng ký (Cá nhân/Doanh nghiệp)
- Bước:
  1. Nhập thông tin tối thiểu (cá nhân/doanh nghiệp), chấp thuận Điều khoản.
  2. Hệ thống tạo tài khoản trạng thái `pending_activation` và phát OTP.
  3. Người dùng nhập OTP hợp lệ trong thời hạn (SLA: 10 phút).
  4. Hệ thống đặt trạng thái tài khoản `activated`, nhưng `unverified` (chưa eKYC/eKYB).
- STAT: user: pending_activation → activated/unverified
- OUT: Người dùng đăng nhập được, chưa có quyền đăng/giao dịch.
- DATA: user, otp, audit_log

## WF-002: eKYC cá nhân
- ACT: Người dùng, Dịch vụ eKYC (OCR + Liveness), Quản trị viên
- PRE: Tài khoản activated, hồ sơ cá nhân tối thiểu
- TRG: Người dùng khởi tạo quy trình eKYC
- Bước:
  1. Tải ảnh CCCD/Hộ chiếu 2 mặt; OCR trích xuất dữ liệu.
  2. Thực hiện liveness (selfie/video), so khớp khuôn mặt.
  3. Hệ thống tạo hồ sơ `kyc_case` trạng thái `submitted`.
  4. Quản trị viên kiểm tra, duyệt/ từ chối (yêu cầu bổ sung nếu cần).
  5. Ghi nhật ký, cập nhật `user.kyc_status` thành `verified`/`rejected`.
- STAT: kyc_case: draft → submitted → approved/rejected
- OUT: Huy hiệu “Đã xác thực” nếu approved.
- DATA: kyc_documents, face_match_score, audit_log

## WF-003: eKYB doanh nghiệp
- ACT: Đại diện doanh nghiệp, Dịch vụ eKYB, Quản trị viên
- PRE: Tài khoản doanh nghiệp activated
- TRG: Khởi tạo eKYB
- Bước:
  1. Tải Giấy chứng nhận ĐKDN, MST; kiểm tra định dạng.
  2. Xác minh pháp nhân; eKYC người đại diện pháp luật.
  3. Tạo `kyb_case` → submitted → review.
  4. Quản trị viên duyệt/ từ chối, có thể yêu cầu bổ sung.
  5. Cập nhật `org.kyb_status` và cấp quyền tổ chức.
- STAT: kyb_case: draft → submitted → approved/rejected
- OUT: Tổ chức “Đã xác thực” — đủ điều kiện đăng/giao dịch số lượng lớn.
- DATA: business_docs, rep_ekyc, audit_log

## WF-004: Đăng nhập/Đăng xuất/Quên mật khẩu
- ACT: Người dùng, Hệ thống Auth
- PRE: Tài khoản activated
- TRG: Gửi form đăng nhập/đặt lại mật khẩu
- Bước: Xác thực (email/phone + mật khẩu), cấp JWT; quên mật khẩu gửi OTP/link đặt lại.
- OUT: Phiên đăng nhập hợp lệ; nhật ký bảo mật.

## WF-005: Đăng tin bán/cho thuê container (kiểm soát nội dung và giá)
- ACT: Seller/Lessor, Hệ thống duyệt Tin, Admin
- PRE: user.kyc_status = verified (hoặc org.kyb_status = verified)
- TRG: Gửi form Đăng tin mới
- Bước:
  1. Nhập thuộc tính chuẩn hóa: loại, kích thước (10/20/40/40HC/45), tình trạng, tiêu chuẩn (CW/WWT/IICL), vị trí depot, giá, ảnh/video.
  1.1. Hệ thống áp dụng bộ quy tắc giá (Pricing Rules Engine) để kiểm tra miền giá hợp lệ (price band) theo loại/kích cỡ/tiêu chuẩn/khu vực.
  1.2. Hệ thống quét và tự động che (redact) thông tin liên hệ (số điện thoại, email, Zalo…) trong tiêu đề/mô tả/media; cảnh báo và yêu cầu sửa nếu cố ý chèn thông tin liên lạc.
  2. Gửi duyệt: listing `pending_review`.
  3. Admin kiểm duyệt tính trung thực/tối thiểu nội dung.
  4. Phê duyệt: `active`; Từ chối: `rejected` (ghi lý do).
- STAT: listing: draft → pending_review → active/rejected
- OUT: Tin hiển thị công khai/riêng tư theo cấu hình.
- DATA: listing, media, audit_log
 - Events: listing.submitted, listing.approved, listing.rejected
 - Notifications: to Seller on approved/rejected

## WF-006: Tìm kiếm và lọc thông minh
- ACT: Guest/Buyer, Search Service
- PRE: Có dữ liệu listings đã duyệt
- TRG: Truy vấn tìm kiếm
- Bước: Nhập bộ lọc (loại giao dịch, loại container, kích thước, tình trạng, vị trí, khoảng giá, tiêu chuẩn, Depot, thời gian); trả kết quả phân trang, sắp xếp theo giá/ngày đăng/liên quan.
- OUT: Kết quả + facet counts; có thể lưu tìm kiếm.

## WF-007: Yêu cầu báo giá (RFQ) và phản hồi báo giá (Quote) — không giao tiếp trực tiếp
- ACT: Buyer, Seller (qua nền tảng), Pricing Rules Engine, Moderation
- PRE: Buyer/Seller activated & verified; listing active
- TRG: Buyer nhấn “Yêu cầu báo giá” trên trang chi tiết tin
- Bước:
  1. Buyer nộp RFQ với thông tin chuẩn (mục đích: mua/thuê, số lượng, thời gian dự kiến, dịch vụ kèm: giám định, sửa chữa, lưu kho, vận chuyển, bảo hiểm).
  2. Nền tảng kiểm tra RFQ: tính đầy đủ, chống spam, che/redact mọi thông tin liên hệ nếu có.
  3. Nền tảng xác định miền giá hợp lệ (price band) dựa trên Pricing Rules; gửi yêu cầu phát hành Quote đến Seller trong phạm vi cho phép.
  4. Seller điền Quote theo mẫu tiêu chuẩn: giá dòng hàng (container), phí dịch vụ (nếu Seller cung cấp), thời hạn hiệu lực, điều kiện.
  5. Nền tảng kiểm tra Quote: phù hợp price band/quy định phí; nếu vượt ngưỡng yêu cầu giải trình hoặc từ chối.
  6. Quote hợp lệ được phát hành cho Buyer; Buyer có thể chấp nhận (accept), từ chối (decline), hoặc yêu cầu điều chỉnh (gửi lại RFQ revision). Không có kênh chat trực tiếp.
  7. Q&A (hỏi đáp) chỉ qua biểu mẫu có kiểm duyệt và tự động che thông tin liên hệ; nội dung được ghi log để phục vụ tranh chấp.
- STAT: rfq: submitted → validated → sent_to_seller → quoted/expired; quote: draft → validated → issued → accepted/declined/expired
- OUT: Quote hợp lệ sẵn sàng tạo đơn đặt hàng.
 - Events: rfq.created, rfq.validated, quote.issued, quote.accepted, quote.declined, quote.expired
 - Notifications: to Seller on rfq.created; to Buyer on quote.issued/expired

## WF-008: Yêu cầu giám định tại Depot
- ACT: Buyer, Depot Staff, Inspection Service
- PRE: Có listing; Depot hợp lệ
- TRG: Buyer bấm “Yêu cầu giám định”
- Bước:
  1. Tạo “inspection_request” trạng thái `requested` và lịch hẹn tại Depot.
  2. Depot nhận yêu cầu, điều phối nhân sự, kéo container vào khu kiểm tra.
  3. Giám định theo IICL-6: cấu trúc, vỏ, sàn, nóc, cửa, seal, CSC plate…
  4. Tạo “inspection_report” có ảnh/video, kết luận WWT/CW/IICL; đề xuất sửa chữa.
  5. Đồng bộ báo cáo lên nền tảng, gắn với listing/container_id.
- STAT: inspection_request: requested → scheduled → in_progress → completed
- OUT: Báo cáo số hóa; kích hoạt luồng quyết định tiếp theo.
 - Events: inspection.requested, inspection.scheduled, inspection.completed
 - Notifications: to Depot on requested; to Buyer on completed

## WF-009: Quyết định sau giám định và yêu cầu sửa chữa (trên nền tảng)
- ACT: Buyer, Depot Staff, Seller
- PRE: inspection_report.completed
- TRG: Buyer xem báo cáo
- Bước:
  1. Buyer chọn: a) Tiếp tục; b) Yêu cầu sửa chữa; c) Hủy (qua nền tảng).
  2. Nếu sửa: tạo “repair_order” với danh mục hạng mục, báo giá, SLA; mọi báo giá bổ sung được tạo thành “quote amendment” và kiểm tra bởi Pricing Rules.
  3. Depot thực hiện, cập nhật tiến độ, ảnh trước/sau.
  4. Buyer nghiệm thu; sửa chữa `approved`/`rework`.
- STAT: repair_order: quoted → approved → in_progress → done → accepted
- OUT: Bản ghi chi phí sửa chữa; sẵn sàng chốt giao dịch.

## WF-010: Tạo đơn giao dịch và thanh toán ký quỹ (Escrow) từ Quote đã chấp nhận
- ACT: Buyer, Escrow Service/Ngân hàng, Seller
- PRE: Buyer đã chấp nhận Quote hợp lệ; mọi điều khoản được chuẩn hóa trên hệ thống
- TRG: Buyer nhấn “Tiến hành thanh toán”
- Bước:
  1. Từ Quote đã chấp nhận, tạo `order` khóa giá & chi phí (line items khớp 1-1 với quote_items; các chi phí ước tính được gắn cờ).
  2. Hệ thống tạo `payment_intent` và tài khoản Escrow; gửi hướng dẫn/QR/thẻ/ví.
  3. Khi tiền vào Escrow: `order.payment_status = escrow_funded`.
  4. Thông báo Seller chuẩn bị giao/cho nhận tại Depot.
- STAT: order: created → awaiting_funds → escrow_funded
- OUT: An toàn tài chính hai bên; sẵn sàng giao nhận.
 - Events: order.created, payment.intent_created, escrow.funded
 - Notifications: to Buyer payment instructions; to Seller on escrow.funded

## WF-011: Phát hành EDO/D/O và thủ tục lấy hàng
- ACT: Platform (thay mặt Buyer), Hãng tàu/Chủ vỏ, Depot
- PRE: escrow_funded, container ở Depot/ICD
- TRG: Xử lý chứng từ
- Bước: Xin/phát hành D/O hoặc EDO; cấp mã nhận cho tài xế; đính kèm hồ sơ điện tử.
- OUT: EDO sẵn sàng; lưu vào hồ sơ giao dịch.

## WF-012: Đặt xe vận chuyển tích hợp
- ACT: Buyer, Vận tải đối tác, Dispatch Service
- PRE: order sẵn sàng giao
- TRG: Buyer chọn “Sắp xếp vận chuyển”
- Bước: Buyer nhập địa chỉ, thời gian, yêu cầu cẩu/bốc xếp; hệ thống báo giá; Buyer thanh toán phí vận chuyển (online); Booking gửi đối tác; tài xế nhận lệnh.
- OUT: Lịch giao hàng xác nhận; theo dõi GPS (nếu bật).

## WF-013: Giao/nhận container và lập EIR
- ACT: Tài xế, Depot Staff, Buyer
- PRE: Có EDO/Booking hợp lệ
- TRG: Tài xế đến Depot
- Bước: Xác thực lệnh; xuất container; lập EIR ghi nhận tình trạng; bàn giao; vận chuyển đến điểm nhận; Buyer kiểm tra và xác nhận “Đã nhận”.
- OUT: EIR và biên bản số hóa; cập nhật trạng thái giao dịch `delivered`.
 - Events: delivery.booked, delivery.in_transit, delivery.delivered, eir.issued
 - Notifications: milestone updates theo SLA

## WF-014: Giải ngân từ Escrow và xuất hóa đơn
- ACT: Escrow Service/Ngân hàng, Seller, Platform
- PRE: Buyer xác nhận nhận hàng hoặc hết thời hạn khiếu nại
- TRG: Sự kiện “release_conditions_met”
- Bước: Tự động giải ngân cho Seller (trừ phí sàn); phát hành hóa đơn cho Buyer; đối soát nội bộ.
- OUT: Giao dịch `completed`; Seller nhận tiền.
 - Events: escrow.release_ready, escrow.released, invoice.issued
 - Notifications: payout notice to Seller

## WF-015: Khiếu nại/Tranh chấp
- ACT: Buyer/Seller, Admin
- PRE: Trong thời hạn tranh chấp
- TRG: Người dùng bấm “Khiếu nại”
- Bước: Đóng băng Escrow; nộp bằng chứng (ảnh/video/bản ghi Q&A/inspection/quote & amendment); Admin thẩm tra; phán quyết: Hoàn tiền/giải ngân/một phần + biện pháp khắc phục (sửa chữa/giảm giá).
- OUT: Quyết định có hiệu lực; ghi audit đầy đủ; học máy phục vụ cảnh báo gian lận.
 - Events: dispute.opened, dispute.resolution_proposed, dispute.closed
 - Notifications: SLA reminders to Admin/CS

## WF-016: Quản trị nội dung và kiểm duyệt
- ACT: Admin, Mod Tools
- TRG: Tin đăng mới/sửa; báo cáo vi phạm; phát ngôn người dùng
- Bước: Duyệt/từ chối/bật tắt hiển thị; gắn nhãn rủi ro; tạm khóa tài khoản.
- OUT: Nền tảng an toàn, minh bạch.

## WF-017: Quản lý dịch vụ giá trị gia tăng tại Depot
- ACT: Depot Staff, Buyer/Seller
- TRG: Yêu cầu giám định/sửa chữa/lưu kho
- Bước: Tạo lệnh công việc; phân công; ghi thời gian máy/công; vật tư; tính phí; đồng bộ về nền tảng.
- OUT: Dữ liệu chi tiết chi phí dịch vụ; tối ưu vận hành Depot.

## WF-018: Tích hợp bảo hiểm
- ACT: Buyer, Đối tác bảo hiểm, Platform
- TRG: Buyer chọn mua bảo hiểm trong quá trình checkout
- Bước: Gọi API báo giá; Buyer chọn gói; thanh toán; phát hành hợp đồng điện tử; lưu chứng thư.
- OUT: Lớp bảo vệ bổ sung cho giao dịch.

## WF-019: Thông báo (In‑app/Email/SMS/Push)
- ACT: Notification Service
- TRG: Sự kiện hệ thống: duyệt tin, lịch giám định, EDO phát hành, xe đến nơi, tranh chấp…
- Bước: Xây dựng mẫu; gửi theo sở thích người dùng; ghi trạng thái đọc.
- OUT: Liên lạc kịp thời; giảm bỏ lỡ bước quan trọng.

## WF-020: Đánh giá/Điểm uy tín
- ACT: Buyer/Seller
- TRG: Giao dịch complete
- Bước: Hai bên đánh giá theo tiêu chí; tính điểm trung bình có trọng số; hiển thị công khai; chống lạm dụng.
- OUT: Hệ sinh thái uy tín minh bạch.

## WF-021: Quản lý gói thuê bao và ưu đãi
- ACT: Người dùng chuyên nghiệp, Billing
- TRG: Mua/đổi gói
- Bước: Gói theo tháng/năm; đặc quyền: giảm phí, tin nổi bật, báo cáo thị trường; chu kỳ gia hạn, nhắc nhở, hủy/gia hạn tự động.

## WF-022: Báo cáo/BI & Kho dữ liệu
- ACT: Admin/BI
- TRG: Xem dashboard
- Bước: ETL dữ liệu giao dịch, Depot, giá; xây mô hình dữ liệu; cung cấp KPI (GMV, take‑rate, lead time, chất lượng…)

## WF-023: Bảo mật và tuân thủ dữ liệu cá nhân
- ACT: Security, DPO
- Bước: Mã hóa, kiểm soát truy cập theo vai; nhật ký truy cập; đáp ứng yêu cầu Nghị định 13/2023/NĐ-CP.

## WF-024: Kiểm soát giá/chi phí & Chống liên lạc trực tiếp
- ACT: Pricing Manager, Moderation/Compliance, NLP Redaction Engine
- TRG: Khi tạo/sửa tin; gửi RFQ/Quote; gửi Q&A; đính kèm tài liệu
- Bước:
  1. Pricing Rules Engine xác định bands giá/chi phí tối đa theo loại/kích thước/tiêu chuẩn/khu vực/thời điểm thị trường; áp trần/sàn.
  2. Tự động quét/redact thông tin liên hệ trong mọi nội dung người dùng (tiêu đề, mô tả, Q&A, file). Nội dung vi phạm bị che; tái phạm bị cảnh báo → khoá tính năng → khoá tài khoản.
  3. Kiểm soát phí và phụ phí: minh bạch cấu phần (container, giám định, sửa chữa, lưu kho, vận chuyển, bảo hiểm, phí nền tảng). Quote/Order phải khớp cấu phần được phê duyệt.
  4. Ghi audit mọi lần điều chỉnh giá/chi phí (price audit); cảnh báo bất thường.
- OUT: Giao dịch minh bạch, không đàm phán/trao đổi ngoài hệ thống.

---

## WF-025: Vòng đời cấu hình quản trị (draft → publish → rollback)
- ACT: Admin/Config Manager, Hệ thống
- PRE: Có namespace cấu hình hợp lệ
- TRG: Admin tạo/sửa cấu hình (thuế/phí/hoa hồng/template/i18n/form/SLA/feature flag…)
- Bước:
  1. Admin tạo bản nháp (config_entry.status = draft), nhập JSON theo schema; hệ thống tính checksum.
  2. Validation: kiểm tra schema, tham chiếu (ví dụ: mã thuế hợp lệ, locale tồn tại), xung đột thời gian hiệu lực.
  3. Admin Publish: tạo phiên bản mới status = published; ghi audit; vô hiệu bản published trước cùng key (nếu có) theo chiến lược.
  4. Rollback: chọn phiên bản trước và phát hành lại (tạo bản published mới từ snapshot).
- STAT: config_entry: draft ↔ published ↔ archived
- OUT: Cấu hình có hiệu lực ngay hoặc theo lịch; có thể trace theo version.
- DATA: config_entries, feature_flags, tax_rates, fee_schedules, commission_rules, notification_templates, form_schemas, slas…
- SLA: Publish ≤ 5 phút; Rollback ≤ 5 phút.
 - Events: config.draft_saved, config.published, config.rolled_back
 - Webhooks nội bộ: cache.bust(namespace,key,version)

## WF-026: Áp dụng cấu hình vào vận hành runtime
- ACT: Các dịch vụ nghiệp vụ (Listings, RFQ/Quote, Orders, Notifications, Depot)
- PRE: Có bản published cấu hình tương ứng
- TRG: Khi thực thi logic nghiệp vụ (tạo listing, validate RFQ/Quote, tính phí, gửi thông báo…)
- Bước:
  1. Dịch vụ đọc cấu hình từ cache (LRU/Redis) với khóa {namespace, key} và version hiện hành; cache warmup từ DB theo TTL.
  2. Nếu cache miss/hết hạn: nạp từ DB chỉ lấy status = published (hoặc theo thời gian hiệu lực); cập nhật cache.
  3. Áp dụng feature flags để bật/tắt code path an toàn; ghi lại biến thể (variant) nếu cần để A/B.
  4. Ghi audit khi cấu hình tác động đến quyết định (ví dụ: từ chối Quote vượt band; tính phí theo fee_schedules).
- OUT: Hệ thống phản ứng tức thời với thay đổi cấu hình, không cần deploy code.
- DATA: cache_keys, config_snapshots, audit_logs
 - SLA: lookup config từ cache ≤ 50ms; cache TTL 60–300s


## Phụ lục A — Trạng thái đối tượng chính
- Listing: draft → pending_review → active → paused → sold/rented → archived → rejected
- Order: created → awaiting_funds → escrow_funded → preparing → delivering → delivered → completed/cancelled/disputed
- Inspection: requested → scheduled → in_progress → completed → archived
- Repair: quoted → approved → in_progress → done → accepted/rework
- Dispute: open → investigating → resolved_refund/resolved_payout/partial → closed

## Phụ lục B — Sơ đồ trình tự (mô tả ngắn)
- Mỗi WF đi kèm sơ đồ tuần tự gồm các lane: Buyer, Seller, Platform, Depot, Bank/Escrow, Insurance, Carrier.

## Phụ lục C — SLA khuyến nghị
- Duyệt tin: ≤ 24h; Giám định Depot: ≤ 48h từ lúc đặt lịch; Sửa chữa nhỏ: ≤ 72h; Phát hành EDO: ≤ 24h; Giao nội tỉnh: ≤ 48h; Giải ngân sau xác nhận: ≤ 24h.

---

## WF-027: Ghi nhận nhập kho tự động (EIR-IN)
- ACT: Depot Staff, Hệ thống Depot
- PRE: EIR phát hành khi container vào Depot
- TRG: eir.issued với loại 'IN'
- Bước:
  1. Hệ thống tạo bản ghi `depot_stock_movements` với movement_type=IN, direction=+1, ref_doc_type='EIR', ref_doc_id.
  2. Cập nhật `containers.current_depot_id = depot_id`.
  3. Ghi audit.
- OUT: On-hand tăng; truy vấn E06 phản ánh.
- DATA: depot_stock_movements, containers
- SLA: Ghi ≤ 1s sau sự kiện EIR

## WF-028: Ghi nhận xuất kho tự động (EIR-OUT/EDO)
- ACT: Depot Staff, Hệ thống Depot
- PRE: Có EDO/booking hợp lệ; container on-hand tại Depot
- TRG: eir.issued với loại 'OUT' hoặc sự kiện giao hàng rời Depot
- Bước: Ghi `depot_stock_movements` movement_type=OUT, direction=-1, ref_doc_type='EIR'|'EDO'.
- OUT: On-hand giảm; ràng buộc không cho âm tồn.
- DATA: depot_stock_movements
- SLA: ≤ 1s

## WF-029: Chuyển nội bộ giữa Depot (TRANSFER)
- ACT: Depot Manager
- PRE: Container đang on-hand tại Depot A
- TRG: Người dùng tạo “transfer” A→B (API-E10)
- Bước:
  1. Tạo movement OUT tại A (direction=-1, ref_doc_type='TRANSFER').
  2. Tạo movement IN tại B (direction=+1, ref_doc_type='TRANSFER', ref_doc_id giống nhau).
  3. Cập nhật containers.current_depot_id = B.
- OUT: Tồn A giảm, B tăng.
- DATA: depot_stock_movements, containers
- SLA: ≤ 2s

## WF-030: Điều chỉnh tồn kho thủ công (ADJUST)
- ACT: Depot Manager
- PRE: Có biên bản kiểm kê hoặc sai lệch hợp lệ
- TRG: API-E08 với direction IN/OUT
- Bước: Ghi movement MANUAL với lý do.
- OUT: Cân bằng tồn; yêu cầu audit tăng cường.
- DATA: depot_stock_movements, audit_logs
- SLA: tức thời

## WF-031: Báo cáo tồn theo kỳ & Aging
- ACT: Depot Manager/Admin
- PRE: Dữ liệu movements đầy đủ trong kỳ
- TRG: API-E09 truy vấn báo cáo
- Bước: Tính opening (trước from), in/out (trong kỳ), closing; tính tuổi tồn theo bucket.
- OUT: Bảng tổng hợp; có export CSV.
- DATA: depot_stock_movements
- SLA: P95 ≤ 500ms; P99 ≤ 1s (partitioning + index)

## WF-032: Quyền truy cập & kiểm soát
- ACT: RBAC Service
- PRE: User có vai trò Depot
- TRG: Mọi request E06..E10
- Bước: Kiểm tra PM-083..PM-086 theo depot scope; ghi audit.
- OUT: Bảo mật, đúng phạm vi.

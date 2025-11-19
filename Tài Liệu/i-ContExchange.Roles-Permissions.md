# TÀI LIỆU NGƯỜI DÙNG, VAI TRÒ & PHÂN QUYỀN — i‑ContExchange

Mã tài liệu: RP-SPEC-v1.0
Ngày: 2025-09-22
Ngôn ngữ: Tiếng Việt

Tài liệu mô tả tất cả loại người dùng, nhóm quyền, và ma trận phân quyền chi tiết. Một tài khoản có thể mang nhiều vai trò (multi‑role). Hệ thống sử dụng mô hình Role-Based Access Control (RBAC) mở rộng với cấp quyền tinh (permissions) theo hành động và theo phạm vi (scope: own/org/global/depot). Lưu ý: nền tảng kiểm soát toàn bộ trao đổi; không có kênh nhắn tin trực tiếp giữa hai bên.

---

## 1. Loại người dùng (User Types)
- UT-01 Khách vãng lai (Guest)
- UT-02 Người mua/thuê (Buyer/Lessee)
- UT-03 Người bán/cho thuê (Seller/Lessor)
- UT-04 Quản trị viên Nền tảng (Platform Admin)
- UT-05 Kiểm duyệt viên (Moderator)
- UT-06 Nhân viên Depot (Depot Staff)
- UT-07 Chủ Depot/Quản lý Depot (Depot Manager)
- UT-08 Doanh nghiệp (Tổ chức) — đại diện pháp luật (Org Owner)
- UT-09 Kế toán/Đối soát (Finance/Accounting)
- UT-10 Hỗ trợ khách hàng (Customer Support)

Ghi chú: Một tài khoản (user) có thể đồng thời là Buyer và Seller; hoặc là Org Owner và bổ sung thêm vai trò Depot Manager nếu quản lý Depot.

---

## 2. Nhóm quyền (Roles)
- RL-ANON: Khách (ẩn danh)
- RL-BUYER: Người mua/thuê
- RL-SELLER: Người bán/cho thuê
- RL-ORG-OWNER: Chủ tổ chức
- RL-DEPOT-STAFF: Nhân viên Depot
- RL-DEPOT-MANAGER: Quản lý Depot
- RL-MOD: Kiểm duyệt viên
- RL-ADMIN: Quản trị hệ thống
- RL-FIN: Kế toán/Đối soát
- RL-CS: Hỗ trợ khách hàng
- RL-PRICE: Quản lý giá (Price Manager)
- RL-CONFIG: Quản lý cấu hình (Config Manager)

---

## 3. Danh sách quyền chi tiết (Permissions)
Mỗi quyền có mã `PM-xxx`, mô tả và phạm vi áp dụng.

- PM-001 VIEW_PUBLIC_LISTINGS — Xem tin công khai (scope: global)
- PM-002 SEARCH_LISTINGS — Tìm kiếm, lọc (global)
- PM-003 VIEW_SELLER_PROFILE — Xem hồ sơ người bán (global)
- PM-010 CREATE_LISTING — Tạo tin (own/org)
- PM-011 EDIT_LISTING — Sửa tin (own/org)
- PM-012 PUBLISH_LISTING — Gửi duyệt/Xuất bản (own/org)
- PM-013 ARCHIVE_LISTING — Ẩn/Lưu trữ (own/org)
- PM-014 DELETE_LISTING — Xóa tin (own/org)
- PM-020 CREATE_RFQ — Tạo RFQ (yêu cầu báo giá)
- PM-021 ISSUE_QUOTE — Phát hành báo giá
- PM-022 VIEW_QUOTES — Xem/so sánh báo giá
- PM-023 MANAGE_QA — Quản lý Q&A có kiểm duyệt
- PM-024 REDACTION_ENFORCE — Thực thi che thông tin liên hệ
- PM-030 REQUEST_INSPECTION — Yêu cầu giám định (own/order)
- PM-031 VIEW_INSPECTION_REPORT — Xem báo cáo giám định (order participants)
- PM-040 CREATE_ORDER — Tạo đơn hàng (own)
- PM-041 PAY_ESCROW — Thanh toán ký quỹ (own)
- PM-042 REQUEST_DELIVERY — Yêu cầu vận chuyển (order participants)
- PM-043 CONFIRM_RECEIPT — Xác nhận nhận hàng (order participants)
- PM-050 RATE_AND_REVIEW — Đánh giá sau giao dịch (order participants)
- PM-060 FILE_DISPUTE — Khiếu nại (order participants)
- PM-061 RESOLVE_DISPUTE — Xử lý tranh chấp (admin/mod)
- PM-070 ADMIN_REVIEW_LISTING — Duyệt tin (mod/admin)
- PM-071 ADMIN_MANAGE_USERS — Quản lý người dùng/vai trò (admin)
- PM-072 ADMIN_VIEW_DASHBOARD — Xem KPI (admin)
- PM-073 ADMIN_CONFIG_PRICING — Cấu hình phí, gói (admin)
- PM-074 MANAGE_PRICE_RULES — Quản lý Pricing Rules/price band
- PM-110 CONFIG_NAMESPACE_RW — Tạo/sửa namespace cấu hình
- PM-111 CONFIG_ENTRY_RW — Tạo/sửa bản nháp entry cấu hình
- PM-112 CONFIG_PUBLISH — Phát hành cấu hình, rollback phiên bản
- PM-113 FEATURE_FLAG_RW — Quản lý feature flags/rollout
- PM-114 TAX_RATE_RW — Quản lý thuế
- PM-115 FEE_SCHEDULE_RW — Quản lý biểu phí
- PM-116 COMMISSION_RULE_RW — Quản lý hoa hồng
- PM-117 TEMPLATE_RW — Quản lý template thông báo
- PM-118 I18N_RW — Quản lý từ điển i18n
- PM-119 FORM_SCHEMA_RW — Quản lý biểu mẫu (JSON Schema)
- PM-120 SLA_RW — Quản lý SLA
- PM-121 BUSINESS_HOURS_RW — Quản lý lịch làm việc
- PM-122 DEPOT_CALENDAR_RW — Quản lý lịch đóng Depot
- PM-123 INTEGRATION_CONFIG_RW — Quản lý cấu hình tích hợp (vendor)
- PM-124 PAYMENT_METHOD_RW — Quản lý phương thức thanh toán
- PM-125 PARTNER_RW — Quản lý đối tác (carrier/insurer/PSP/DMS)
- PM-080 DEPOT_CREATE_JOB — Tạo lệnh việc (depot)
- PM-081 DEPOT_UPDATE_JOB — Cập nhật công việc (depot)
- PM-082 DEPOT_ISSUE_EIR — Lập EIR (depot)
- PM-083 DEPOT_VIEW_STOCK — Xem tồn kho depot (depot)
- PM-084 DEPOT_VIEW_MOVEMENTS — Xem nhật ký nhập–xuất–chuyển (depot)
- PM-085 DEPOT_ADJUST_STOCK — Điều chỉnh tồn (manual IN/OUT) (depot)
- PM-086 DEPOT_TRANSFER_STOCK — Chuyển giữa các Depot (depot)
- PM-090 FINANCE_RECONCILE — Đối soát/giải ngân (fin)
- PM-091 FINANCE_INVOICE — Xuất hóa đơn (fin)
- PM-100 CS_MANAGE_TICKETS — Xử lý yêu cầu hỗ trợ (cs)

Scope chi tiết:
- own: tài nguyên do chính user tạo/sở hữu
- org: tài nguyên thuộc tổ chức mà user có vai trò quản trị
- depot: tài nguyên thuộc depot mà user được phân công
- global: toàn hệ thống
- order participants: các bên tham gia đơn hàng

---

## 4. Gán quyền theo vai trò (Role → Permissions)
- RL-ANON: PM-001, PM-002
- RL-BUYER: PM-001, PM-002, PM-003, PM-020, PM-022, PM-030, PM-031, PM-040, PM-041, PM-042, PM-043, PM-050, PM-060
- RL-SELLER: PM-001, PM-002, PM-003, PM-010, PM-011, PM-012, PM-013, PM-014, PM-021, PM-031
- RL-ORG-OWNER: tất cả quyền của SELLER + quản lý user/org (một phần PM-071 trong scope org)
- RL-DEPOT-STAFF: PM-080, PM-081, PM-082, PM-083, PM-084
- RL-DEPOT-MANAGER: DEPOT-STAFF + PM-085, PM-086; phê duyệt nội bộ depot, cấu hình lịch (mở rộng PM-081)
- RL-MOD: PM-070, PM-061 (giới hạn), PM-072 (read-only)
- RL-ADMIN: toàn quyền PM-070..PM-073, PM-071, PM-061, PM-072, cấu hình hệ thống
- RL-PRICE: PM-074, PM-072 (read-only)
- RL-CONFIG: PM-110..PM-125 (giới hạn trong cấu hình), PM-072 (read-only)
- RL-FIN: PM-090, PM-091, PM-072 (read-only)
- RL-CS: PM-100, PM-072 (read-only)

Ghi chú: Hệ thống cho phép một user có nhiều vai trò; tập quyền là hợp nhất (union) các permissions theo scope tương ứng.

---

## 5. Ma trận phân quyền theo chức năng chính (rút gọn)
Chú thích: ✓ = cho phép; (✓) = có điều kiện/scope; — = không

- Xem tin công khai: ANON ✓, BUYER ✓, SELLER ✓, DEPOT ✓, ADMIN ✓
- Đăng tin: SELLER (✓ own), ORG-OWNER (✓ org)
- Duyệt tin: MOD/ADMIN ✓
- Gửi RFQ/Phát hành báo giá: BUYER/SELLER ✓ (qua nền tảng)
- Yêu cầu giám định: BUYER ✓
- Xem báo cáo giám định: BUYER/SELLER (participants) (✓)
- Tạo đơn và Escrow: BUYER ✓
- Phát hành EIR: DEPOT ✓
- Đối soát/giải ngân: FIN/ADMIN ✓
- Tranh chấp: BUYER/SELLER nộp; MOD/ADMIN xử lý ✓

---

## 6. Mô hình dữ liệu RBAC (tóm tắt)
- users(id,…)
- roles(id, code)
- permissions(id, code)
- user_roles(user_id, role_id)
- role_permissions(role_id, permission_id, scope)
- orgs(id,…), org_users(org_id, user_id, role_in_org)
- depots(id,…), depot_users(depot_id, user_id, role_in_depot)

Scope runtime áp dụng bằng chính sách (policy) khi truy cập tài nguyên.

---

## 7. Quy tắc kiểm soát truy cập
- Mặc định từ chối (deny‑by‑default).
- Cho phép theo permission + scope phù hợp.
- Nhật ký truy cập và thay đổi vai trò.
- Nguyên tắc tối thiểu (least privilege), tách nhiệm (SoD) giữa ADMIN và FIN.

---

## 8. Phụ lục — Ánh xạ Quyền ↔ Endpoint ↔ Màn hình

- PM-010/011/012/014 → API-B01/B04/B05/B06 → SCR-203/204 (Đăng tin, Quản lý tin)
- PM-020/021/022 → API-D01/D03/D04 → SCR-301/302 (RFQ/Quote)
- PM-024 → Áp dụng trên M* (Q&A); B01/B05 (redaction khi đăng tin)
- PM-030/031 → API-E01/E02/E03 → SCR-401/402 (Giám định)
- PM-040/041/042/043 → API-F01/F04/G01/F05 → SCR-501/503/601 (Checkout/Đơn/Vận chuyển)
- PM-050 → API-I01 → SCR-701 (Đánh giá)
- PM-060/061 → API-I03/I05 → SCR-702/904 (Tranh chấp)
- PM-070/071/072 → API-K01..K07 → SCR-901/902/903
- PM-074 (Pricing Rules) → API-K08..K10 → SCR-905 (tab Pricing Rules)
- PM-110..PM-125 (Config Center) → API-K12..K55 → SCR-905/906 (tất cả tab cấu hình)

- PM-083/084/085/086 (Depot Inventory) → API-E06/E07/E08/E09/E10 → SCR-410/411/412/413

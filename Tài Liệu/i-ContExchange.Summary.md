# TỔNG KẾT TÀI LIỆU HỆ THỐNG i-ContExchange

Mã tài liệu: SUMMARY-v1.0  
Ngày: 2025-09-22  
Ngôn ngữ: Tiếng Việt

## 1. TỔNG QUAN HỆ THỐNG

i-ContExchange là nền tảng giao dịch container tích hợp "Phygital" (Physical + Digital), kết hợp sàn giao dịch trực tuyến với mạng lưới Depot vật lý. Hệ thống được thiết kế theo kiến trúc Microservices với 3 giai đoạn phát triển: MVP → Mở rộng → Dẫn đầu.

## 2. THỐNG KÊ TỔNG QUAN

### 2.1. Quy trình (Workflows)
- **Tổng số**: 32 quy trình (WF-001 đến WF-032)
- **Phân loại**:
  - Xác thực & Tài khoản: 4 quy trình (WF-001 đến WF-004)
  - Tin đăng & Container: 2 quy trình (WF-005, WF-006)
  - RFQ/Quote: 1 quy trình (WF-007)
  - Giám định & Depot: 4 quy trình (WF-008, WF-009, WF-027 đến WF-029)
  - Giao dịch & Thanh toán: 4 quy trình (WF-010, WF-011, WF-014, WF-015)
  - Vận chuyển: 1 quy trình (WF-012, WF-013)
  - Quản trị & Cấu hình: 8 quy trình (WF-016, WF-017, WF-020 đến WF-026, WF-030 đến WF-032)
  - Dịch vụ khác: 8 quy trình (WF-018, WF-019, WF-021 đến WF-023)

### 2.2. API Endpoints
- **Tổng số**: 55+ endpoints
- **Phân nhóm**:
  - Auth & Tài khoản (A): 9 endpoints (API-A01 đến API-A09)
  - Tin đăng & Container (B): 9 endpoints (API-B01 đến API-B09)
  - Tìm kiếm (C): 1 endpoint (API-C01)
  - RFQ & Quote (D): 6 endpoints (API-D01 đến API-D06)
  - Giám định & Depot (E): 10 endpoints (API-E01 đến API-E10)
  - Đơn hàng & Thanh toán (F): 7 endpoints (API-F01 đến API-F07)
  - Vận chuyển (G): 3 endpoints (API-G01 đến API-G03)
  - Bảo hiểm (H): 2 endpoints (API-H01, API-H02)
  - Đánh giá & Tranh chấp (I): 5 endpoints (API-I01 đến API-I05)
  - Thuê bao (J): 4 endpoints (API-J01 đến API-J04)
  - Quản trị (K): 55 endpoints (API-K01 đến API-K55)
  - Thông báo (L): 2 endpoints (API-L01, API-L02)
  - Q&A (M): 3 endpoints (API-M01 đến API-M03)

### 2.3. Bảng Database
- **Tổng số**: 50+ bảng chính
- **Phân loại**:
  - Người dùng & Tổ chức: 6 bảng (users, orgs, roles, permissions, user_roles, role_permissions)
  - Depot & Địa điểm: 2 bảng (depots, depot_users)
  - Container & Tin đăng: 4 bảng (containers, listings, listing_media, listing_facets)
  - Giám định & Sửa chữa: 4 bảng (inspections, inspection_items, repairs, repair_items)
  - RFQ/Quote & Q&A: 5 bảng (rfqs, quotes, quote_items, qa_questions, qa_answers)
  - Đơn hàng & Thanh toán: 6 bảng (orders, order_items, payments, deliveries, delivery_events, documents)
  - Đánh giá & Tranh chấp: 3 bảng (reviews, disputes, dispute_evidence)
  - Thuê bao & Cấu hình: 7 bảng (plans, subscriptions, settings, pricing_rules, moderation_events, audit_logs, i18n_translations)
  - Cấu hình quản trị: 20+ bảng (config_namespaces, config_entries, feature_flags, tax_rates, fee_schedules, commission_rules, marketplace_policies, redaction_patterns, notification_templates, form_schemas, business_hours, depot_calendars, integration_configs, payment_methods, partners, slas)
  - Kho tồn Depot: 1 bảng (depot_stock_movements)
  - Master Data: 30+ bảng (md_countries, md_provinces, md_currencies, md_container_sizes, md_container_types, md_quality_standards, md_deal_types, md_listing_statuses, md_order_statuses, md_payment_statuses, md_delivery_statuses, md_dispute_statuses, md_document_types, md_service_codes, md_movement_types, md_ref_doc_types, md_adjust_reasons, md_feature_flag_codes, md_tax_codes, md_fee_codes, md_commission_codes, md_notification_channels, md_template_codes, md_i18n_namespaces, md_form_schema_codes, md_sla_codes, md_business_hours_policies, md_integration_vendor_codes, md_payment_method_types, md_partner_types, md_violation_codes, md_redaction_channels, md_rating_scales, md_pricing_regions, md_units, md_rental_units, md_incoterms, md_delivery_event_types, md_dispute_reasons, md_cancel_reasons, md_payment_failure_reasons, md_inspection_item_codes, md_repair_item_codes, md_notification_event_types, md_cities, md_unlocodes, md_insurance_coverages)

### 2.4. Màn hình (Screens)
- **Tổng số**: 25+ màn hình
- **Phân nhóm**:
  - Khung ứng dụng: 3 màn hình (SCR-001 đến SCR-003)
  - Tài khoản & Xác thực: 5 màn hình (SCR-101 đến SCR-105)
  - Tin đăng & Container: 4 màn hình (SCR-201 đến SCR-204)
  - RFQ/Quote: 3 màn hình (SCR-301 đến SCR-303)
  - Giám định & Depot: 7 màn hình (SCR-401 đến SCR-403, SCR-410 đến SCR-413)
  - Giao dịch & Thanh toán: 3 màn hình (SCR-501 đến SCR-503)
  - Vận chuyển: 2 màn hình (SCR-601, SCR-602)
  - Đánh giá & Tranh chấp: 2 màn hình (SCR-701, SCR-702)
  - Thuê bao & Báo cáo: 3 màn hình (SCR-801 đến SCR-803)
  - Quản trị: 6 màn hình (SCR-901 đến SCR-906)
  - Thông tin & Hỗ trợ: 2 màn hình (SCR-1001, SCR-1002)

### 2.5. Tính năng (Features)
- **Tổng số**: 50+ tính năng
- **Phân nhóm**:
  - Nền tảng người dùng: 5 tính năng (FE-A01 đến FE-A05)
  - Quản lý tin đăng: 5 tính năng (FE-B01 đến FE-B05)
  - Khám phá & Tìm kiếm: 4 tính năng (FE-C01 đến FE-C04)
  - RFQ & Quote: 4 tính năng (FE-D01 đến FE-D04)
  - Giám định & Depot: 5 tính năng (FE-E01 đến FE-E05)
  - Giao dịch & Thanh toán: 4 tính năng (FE-F01 đến FE-F04)
  - Vận chuyển: 3 tính năng (FE-G01 đến FE-G03)
  - Bảo hiểm: 2 tính năng (FE-H01, FE-H02)
  - Đánh giá & Uy tín: 3 tính năng (FE-I01 đến FE-I03)
  - Quản trị: 8 tính năng (FE-J01 đến FE-J08)
  - Trung tâm cấu hình: 10 tính năng (FE-N01 đến FE-N10)
  - Thông báo: 3 tính năng (FE-K01 đến FE-K03)
  - Phân tích & Báo cáo: 3 tính năng (FE-L01 đến FE-L03)
  - Đa ngôn ngữ & UI/UX: 4 tính năng (FE-M01 đến FE-M04)

### 2.6. Vai trò & Quyền
- **Loại người dùng**: 10 loại (UT-01 đến UT-10)
- **Nhóm quyền**: 10 nhóm (RL-ANON đến RL-CONFIG)
- **Quyền chi tiết**: 50+ quyền (PM-001 đến PM-125)

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1. Mô hình "Phygital"
- **Digital**: Sàn giao dịch trực tuyến với đầy đủ tính năng
- **Physical**: Mạng lưới Depot vật lý làm "Trung tâm Đảm bảo Niềm tin"
- **Tích hợp**: Kết nối chặt chẽ giữa nền tảng số và hoạt động vật lý

### 3.2. "Kiềng ba chân" Tin cậy
1. **Xác thực người dùng** (eKYC/eKYB)
2. **Đảm bảo chất lượng** (Giám định theo tiêu chuẩn IICL)
3. **An toàn giao dịch** (Thanh toán ký quỹ Escrow)

### 3.3. Kiến trúc Kỹ thuật
- **Backend**: Microservices với Node.js/Express
- **Frontend**: Next.js với React
- **Database**: PostgreSQL với RLS
- **Cache**: Redis cho cấu hình và session
- **Storage**: S3-compatible cho media
- **Auth**: JWT với RBAC

## 4. LỘ TRÌNH TRIỂN KHAI

### 4.1. Giai đoạn 1: MVP (6-9 tháng)
- **Mục tiêu**: Xác thực mô hình kinh doanh
- **Tính năng chính**:
  - Đăng ký/Đăng nhập cơ bản
  - Đăng tin mua/bán/thuê
  - Tìm kiếm và lọc cơ bản
  - Hệ thống nhắn tin trực tiếp
  - Quy trình giám định tại 1-2 Depot thí điểm
  - Thanh toán truyền thống (chuyển khoản, tiền mặt)

### 4.2. Giai đoạn 2: Mở rộng (9-12 tháng)
- **Mục tiêu**: Xây dựng hệ sinh thái tin cậy
- **Tính năng chính**:
  - Tích hợp eKYC/eKYB
  - Thanh toán Escrow
  - Tích hợp bảo hiểm
  - Số hóa quy trình giám định
  - Hệ thống đánh giá uy tín
  - Mở rộng dịch vụ ra toàn bộ Depot

### 4.3. Giai đoạn 3: Dẫn đầu (Liên tục)
- **Mục tiêu**: Trở thành trung tâm dữ liệu ngành
- **Tính năng chính**:
  - Phân tích dữ liệu thị trường
  - Mở API cho đối tác
  - AI/ML cho gợi ý thông minh
  - Tích hợp DMS sâu

## 5. TUÂN THỦ PHÁP LÝ

### 5.1. Thương mại điện tử
- **Nghị định 52/2013/NĐ-CP** và **Nghị định 85/2021/NĐ-CP**
- Đăng ký sàn giao dịch TMĐT với Bộ Công Thương
- Quy chế hoạt động và chính sách minh bạch

### 5.2. Bảo vệ dữ liệu cá nhân
- **Nghị định 13/2023/NĐ-CP**
- Nguyên tắc đồng ý rõ ràng
- Quyền của chủ thể dữ liệu
- Bảo mật và thông báo vi phạm

## 6. MÔ HÌNH DOANH THU

### 6.1. Nguồn thu chính
1. **Phí giao dịch**: Tỷ lệ % trên giá trị giao dịch
2. **Dịch vụ Depot**: Giám định, sửa chữa, lưu trữ, vận chuyển
3. **Thuê bao**: Gói cao cấp cho doanh nghiệp
4. **Quảng cáo**: Tin nổi bật, không gian quảng cáo

### 6.2. Lợi thế cạnh tranh
- **Mô hình "Phygital"** độc đáo
- **"Trung tâm Đảm bảo Niềm tin"** tại Depot
- **Kiểm soát chất lượng** theo tiêu chuẩn quốc tế
- **An toàn giao dịch** với Escrow

## 7. CHỈ SỐ HIỆU QUẢ (KPIs)

### 7.1. Giai đoạn MVP
- Số lượng người dùng đăng ký và xác thực
- Số lượng tin đăng hợp lệ
- Số lượng giao dịch thành công
- Tỷ lệ sử dụng dịch vụ giám định

### 7.2. Giai đoạn Mở rộng
- **GMV**: Tổng giá trị giao dịch
- Doanh thu từ phí và dịch vụ
- Tỷ lệ sử dụng Escrow và bảo hiểm
- **CSAT**: Điểm hài lòng khách hàng

### 7.3. Giai đoạn Dẫn đầu
- **Retention Rate**: Tỷ lệ giữ chân khách hàng
- **LTV**: Giá trị vòng đời khách hàng
- Thị phần giao dịch container trực tuyến

## 8. TÍNH NĂNG ĐỘC ĐÁO

### 8.1. Kiểm soát giao tiếp
- **Không cho phép** trao đổi trực tiếp giữa người mua và người bán
- **Q&A có kiểm duyệt** với auto-redact thông tin liên hệ
- **Pricing Rules Engine** kiểm soát giá và chi phí

### 8.2. Quản lý cấu hình No-code
- **Config Center** với versioning và publish/rollback
- **Feature Flags** cho rollout từ từ
- **Form Builder** cho biểu mẫu động
- **Template Engine** cho thông báo đa kênh

### 8.3. Quản lý tồn kho Depot
- **Stock Movements** ghi nhận nhập-xuất-chuyển
- **Báo cáo kỳ** với aging analysis
- **Tích hợp chứng từ** EIR/EDO/Delivery

## 9. KẾT LUẬN

i-ContExchange là một hệ thống phức tạp và toàn diện, được thiết kế để trở thành nền tảng giao dịch container hàng đầu tại Việt Nam. Với mô hình "Phygital" độc đáo, hệ thống kết hợp sức mạnh công nghệ với cơ sở hạ tầng vật lý, tạo ra lợi thế cạnh tranh bền vững và khó sao chép.

Hệ thống được xây dựng với 32 quy trình, 55+ API endpoints, 50+ bảng database, 25+ màn hình, và 50+ tính năng, đảm bảo khả năng mở rộng và phát triển trong tương lai.

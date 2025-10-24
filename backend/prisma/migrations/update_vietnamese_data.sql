-- =============================================
-- Update Master Data with Vietnamese Text
-- =============================================

-- 1. Countries
UPDATE md_countries SET name_vi = 'Việt Nam' WHERE code = 'VN';
UPDATE md_countries SET name_vi = 'Hoa Kỳ' WHERE code = 'US';
UPDATE md_countries SET name_vi = 'Trung Quốc' WHERE code = 'CN';
UPDATE md_countries SET name_vi = 'Nhật Bản' WHERE code = 'JP';
UPDATE md_countries SET name_vi = 'Hàn Quốc' WHERE code = 'KR';
UPDATE md_countries SET name_vi = 'Singapore' WHERE code = 'SG';
UPDATE md_countries SET name_vi = 'Thái Lan' WHERE code = 'TH';
UPDATE md_countries SET name_vi = 'Malaysia' WHERE code = 'MY';
UPDATE md_countries SET name_vi = 'Indonesia' WHERE code = 'ID';
UPDATE md_countries SET name_vi = 'Philippines' WHERE code = 'PH';
UPDATE md_countries SET name_vi = 'Vương Quốc Anh' WHERE code = 'GB';
UPDATE md_countries SET name_vi = 'Đức' WHERE code = 'DE';
UPDATE md_countries SET name_vi = 'Pháp' WHERE code = 'FR';
UPDATE md_countries SET name_vi = 'Úc' WHERE code = 'AU';
UPDATE md_countries SET name_vi = 'New Zealand' WHERE code = 'NZ';

-- 2. Currencies
UPDATE md_currencies SET name_vi = 'Đồng Việt Nam' WHERE code = 'VND';
UPDATE md_currencies SET name_vi = 'Đô la Mỹ' WHERE code = 'USD';
UPDATE md_currencies SET name_vi = 'Euro' WHERE code = 'EUR';
UPDATE md_currencies SET name_vi = 'Yên Nhật' WHERE code = 'JPY';
UPDATE md_currencies SET name_vi = 'Nhân dân tệ' WHERE code = 'CNY';
UPDATE md_currencies SET name_vi = 'Đô la Singapore' WHERE code = 'SGD';
UPDATE md_currencies SET name_vi = 'Baht Thái' WHERE code = 'THB';
UPDATE md_currencies SET name_vi = 'Ringgit Malaysia' WHERE code = 'MYR';
UPDATE md_currencies SET name_vi = 'Bảng Anh' WHERE code = 'GBP';
UPDATE md_currencies SET name_vi = 'Đô la Úc' WHERE code = 'AUD';

-- 3. Container Types
UPDATE md_container_types SET name_vi = 'Container hàng khô' WHERE code = 'DRY';
UPDATE md_container_types SET name_vi = 'Container cao' WHERE code = 'HC';
UPDATE md_container_types SET name_vi = 'Container lạnh' WHERE code = 'RF';
UPDATE md_container_types SET name_vi = 'Container nóc mở' WHERE code = 'OT';
UPDATE md_container_types SET name_vi = 'Container sàn phẳng' WHERE code = 'FR';
UPDATE md_container_types SET name_vi = 'Container bồn' WHERE code = 'TK';
UPDATE md_container_types SET name_vi = 'Container sàn' WHERE code = 'PF';
UPDATE md_container_types SET name_vi = 'Container thông gió' WHERE code = 'VH';

-- 4. Quality Standards
UPDATE md_quality_standards SET name_vi = 'Kín gió và nước' WHERE code = 'WWT';
UPDATE md_quality_standards SET name_vi = 'Đạt chuẩn vận chuyển hàng' WHERE code = 'CW';
UPDATE md_quality_standards SET name_vi = 'Tiêu chuẩn IICL' WHERE code = 'IICL';
UPDATE md_quality_standards SET name_vi = 'Nguyên trạng' WHERE code = 'ASIS';

-- 5. Deal Types
UPDATE md_deal_types SET name_vi = 'Bán' WHERE code = 'sale';
UPDATE md_deal_types SET name_vi = 'Cho thuê' WHERE code = 'rental';

-- 6. Listing Statuses
UPDATE md_listing_statuses SET name_vi = 'Bản nháp' WHERE code = 'draft';
UPDATE md_listing_statuses SET name_vi = 'Chờ duyệt' WHERE code = 'pending_review';
UPDATE md_listing_statuses SET name_vi = 'Đang hoạt động' WHERE code = 'active';
UPDATE md_listing_statuses SET name_vi = 'Tạm dừng' WHERE code = 'paused';
UPDATE md_listing_statuses SET name_vi = 'Đã bán' WHERE code = 'sold';
UPDATE md_listing_statuses SET name_vi = 'Đã cho thuê' WHERE code = 'rented';
UPDATE md_listing_statuses SET name_vi = 'Đã lưu trữ' WHERE code = 'archived';
UPDATE md_listing_statuses SET name_vi = 'Bị từ chối' WHERE code = 'rejected';

-- 7. Order Statuses
UPDATE md_order_statuses SET name_vi = 'Đã tạo' WHERE code = 'created';
UPDATE md_order_statuses SET name_vi = 'Chờ thanh toán' WHERE code = 'awaiting_funds';
UPDATE md_order_statuses SET name_vi = 'Đã thanh toán vào ký quỹ' WHERE code = 'escrow_funded';
UPDATE md_order_statuses SET name_vi = 'Đang chuẩn bị' WHERE code = 'preparing';
UPDATE md_order_statuses SET name_vi = 'Đang vận chuyển' WHERE code = 'delivering';
UPDATE md_order_statuses SET name_vi = 'Đã giao hàng' WHERE code = 'delivered';
UPDATE md_order_statuses SET name_vi = 'Hoàn thành' WHERE code = 'completed';
UPDATE md_order_statuses SET name_vi = 'Đã hủy' WHERE code = 'cancelled';
UPDATE md_order_statuses SET name_vi = 'Tranh chấp' WHERE code = 'disputed';

-- 8. Payment Statuses
UPDATE md_payment_statuses SET name_vi = 'Đã khởi tạo' WHERE code = 'initiated';
UPDATE md_payment_statuses SET name_vi = 'Đã nạp vào ký quỹ' WHERE code = 'escrow_funded';
UPDATE md_payment_statuses SET name_vi = 'Đã giải ngân' WHERE code = 'released';
UPDATE md_payment_statuses SET name_vi = 'Đã hoàn tiền' WHERE code = 'refunded';
UPDATE md_payment_statuses SET name_vi = 'Thất bại' WHERE code = 'failed';

-- 9. Delivery Statuses
UPDATE md_delivery_statuses SET name_vi = 'Đã yêu cầu' WHERE code = 'requested';
UPDATE md_delivery_statuses SET name_vi = 'Đã đặt lịch' WHERE code = 'booked';
UPDATE md_delivery_statuses SET name_vi = 'Đang vận chuyển' WHERE code = 'in_transit';
UPDATE md_delivery_statuses SET name_vi = 'Đã giao' WHERE code = 'delivered';
UPDATE md_delivery_statuses SET name_vi = 'Thất bại' WHERE code = 'failed';

-- 10. Dispute Statuses
UPDATE md_dispute_statuses SET name_vi = 'Đang mở' WHERE code = 'open';
UPDATE md_dispute_statuses SET name_vi = 'Đang điều tra' WHERE code = 'investigating';
UPDATE md_dispute_statuses SET name_vi = 'Đã giải quyết - Hoàn tiền' WHERE code = 'resolved_refund';
UPDATE md_dispute_statuses SET name_vi = 'Đã giải quyết - Thanh toán' WHERE code = 'resolved_payout';
UPDATE md_dispute_statuses SET name_vi = 'Một phần' WHERE code = 'partial';
UPDATE md_dispute_statuses SET name_vi = 'Đã đóng' WHERE code = 'closed';

-- 11. Document Types
UPDATE md_document_types SET name_vi = 'Lệnh giao container' WHERE code = 'EDO';
UPDATE md_document_types SET name_vi = 'Biên nhận giao/nhận container' WHERE code = 'EIR';
UPDATE md_document_types SET name_vi = 'Hóa đơn' WHERE code = 'INVOICE';
UPDATE md_document_types SET name_vi = 'Biên lai thanh toán' WHERE code = 'RECEIPT';
UPDATE md_document_types SET name_vi = 'Vận đơn' WHERE code = 'BOL';
UPDATE md_document_types SET name_vi = 'Danh sách đóng gói' WHERE code = 'PACKING_LIST';
UPDATE md_document_types SET name_vi = 'Giấy chứng nhận xuất xứ' WHERE code = 'COO';
UPDATE md_document_types SET name_vi = 'Giấy chứng nhận bảo hiểm' WHERE code = 'INSURANCE';
UPDATE md_document_types SET name_vi = 'Tờ khai hải quan' WHERE code = 'CUSTOMS';

-- 12. Service Codes
UPDATE md_service_codes SET name_vi = 'Dịch vụ kiểm định' WHERE code = 'inspection';
UPDATE md_service_codes SET name_vi = 'Dịch vụ sửa chữa' WHERE code = 'repair';
UPDATE md_service_codes SET name_vi = 'Dịch vụ lưu kho' WHERE code = 'storage';
UPDATE md_service_codes SET name_vi = 'Báo giá vận chuyển' WHERE code = 'delivery_estimate';
UPDATE md_service_codes SET name_vi = 'Bảo hiểm' WHERE code = 'insurance';
UPDATE md_service_codes SET name_vi = 'Dịch vụ vệ sinh' WHERE code = 'cleaning';
UPDATE md_service_codes SET name_vi = 'Dịch vụ hun trùng' WHERE code = 'fumigation';
UPDATE md_service_codes SET name_vi = 'Khảo sát container' WHERE code = 'survey';

-- 13. Movement Types
UPDATE md_movement_types SET name_vi = 'Nhập kho' WHERE code = 'IN';
UPDATE md_movement_types SET name_vi = 'Xuất kho' WHERE code = 'OUT';
UPDATE md_movement_types SET name_vi = 'Chuyển kho' WHERE code = 'TRANSFER';

-- 14. Rental Units
UPDATE md_rental_units SET name_vi = 'Theo ngày' WHERE code = 'day';
UPDATE md_rental_units SET name_vi = 'Theo tuần' WHERE code = 'week';
UPDATE md_rental_units SET name_vi = 'Theo tháng' WHERE code = 'month';
UPDATE md_rental_units SET name_vi = 'Theo quý' WHERE code = 'quarter';
UPDATE md_rental_units SET name_vi = 'Theo năm' WHERE code = 'year';

-- 15. Units
UPDATE md_units SET name_vi = 'Cái' WHERE code = 'EA';
UPDATE md_units SET name_vi = 'Kilogram' WHERE code = 'KG';
UPDATE md_units SET name_vi = 'Pound' WHERE code = 'LB';
UPDATE md_units SET name_vi = 'Mét khối' WHERE code = 'M3';
UPDATE md_units SET name_vi = 'Foot khối' WHERE code = 'FT3';
UPDATE md_units SET name_vi = 'Ngày' WHERE code = 'DAY';
UPDATE md_units SET name_vi = 'Giờ' WHERE code = 'HOUR';
UPDATE md_units SET name_vi = 'Mét' WHERE code = 'M';
UPDATE md_units SET name_vi = 'Foot' WHERE code = 'FT';

-- 16. Incoterms
UPDATE md_incoterms SET name_vi = 'Giao tại xưởng', description_vi = 'Người bán giao hàng tại địa điểm của mình' WHERE code = 'EXW';
UPDATE md_incoterms SET name_vi = 'Giao hàng cho người vận chuyển' WHERE code = 'FCA';
UPDATE md_incoterms SET name_vi = 'Giao dọc mạn tàu' WHERE code = 'FAS';
UPDATE md_incoterms SET name_vi = 'Giao hàng lên tàu', description_vi = 'Người bán giao hàng lên tàu tại cảng' WHERE code = 'FOB';
UPDATE md_incoterms SET name_vi = 'Giá cước hàng' WHERE code = 'CFR';
UPDATE md_incoterms SET name_vi = 'Giá bảo hiểm cước hàng', description_vi = 'Người bán chịu cước phí và bảo hiểm đến cảng đích' WHERE code = 'CIF';
UPDATE md_incoterms SET name_vi = 'Cước phí trả tới' WHERE code = 'CPT';
UPDATE md_incoterms SET name_vi = 'Cước phí, bảo hiểm trả tới' WHERE code = 'CIP';
UPDATE md_incoterms SET name_vi = 'Giao tại địa điểm' WHERE code = 'DAP';
UPDATE md_incoterms SET name_vi = 'Giao và dỡ hàng tại địa điểm' WHERE code = 'DPU';
UPDATE md_incoterms SET name_vi = 'Giao hàng đã nộp thuế', description_vi = 'Người bán chịu toàn bộ chi phí đến địa điểm giao hàng' WHERE code = 'DDP';

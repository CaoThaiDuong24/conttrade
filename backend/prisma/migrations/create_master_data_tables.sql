-- =============================================
-- i-ContExchange Master Data Tables
-- Total: 47 Tables
-- =============================================

-- 1. Địa lý & Tiền tệ (Geography & Currency)
-- =============================================

CREATE TABLE IF NOT EXISTS md_countries (
  code CHAR(2) PRIMARY KEY,
  alpha3 CHAR(3),
  name TEXT NOT NULL,
  name_vi TEXT,
  region TEXT,
  region_vi TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_md_countries_alpha3 ON md_countries(alpha3) WHERE alpha3 IS NOT NULL;

CREATE TABLE IF NOT EXISTS md_provinces (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  region TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_md_provinces_country ON md_provinces(country_code);

CREATE TABLE IF NOT EXISTS md_currencies (
  code CHAR(3) PRIMARY KEY,
  name TEXT,
  name_vi TEXT,
  symbol TEXT,
  decimals SMALLINT NOT NULL DEFAULT 2 CHECK (decimals BETWEEN 0 AND 6),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS md_timezones (
  tzid TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT,
  region TEXT,
  region_vi TEXT
);

-- 2. Container & Chuẩn kỹ thuật (Container Standards)
-- =============================================

CREATE TABLE IF NOT EXISTS md_container_sizes (
  size_ft SMALLINT PRIMARY KEY,
  CHECK (size_ft IN (10,20,40,45))
);

CREATE TABLE IF NOT EXISTS md_container_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  iso_group TEXT
);

CREATE TABLE IF NOT EXISTS md_quality_standards (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_iso_container_codes (
  code TEXT PRIMARY KEY,
  name TEXT,
  name_vi TEXT
);

-- 3. Danh mục nghiệp vụ (Business Categories)
-- =============================================

CREATE TABLE IF NOT EXISTS md_deal_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_listing_statuses (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_order_statuses (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_payment_statuses (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_delivery_statuses (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_dispute_statuses (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  sort_order SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS md_document_types (
  code TEXT PRIMARY KEY,
  name TEXT,
  name_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_service_codes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  billable BOOLEAN NOT NULL DEFAULT true
);

-- 4. Depot & Tồn kho (Depot & Inventory)
-- =============================================

CREATE TABLE IF NOT EXISTS md_movement_types (
  code TEXT PRIMARY KEY,
  name_vi TEXT,
  direction SMALLINT NOT NULL CHECK (direction IN (1,-1,0))
);

CREATE TABLE IF NOT EXISTS md_ref_doc_types (
  code TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS md_adjust_reasons (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

-- 5. Quản trị & Cấu hình (Admin & Configuration)
-- =============================================

CREATE TABLE IF NOT EXISTS md_feature_flag_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_tax_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_fee_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_commission_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_notification_channels (
  code TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS md_template_codes (
  channel TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT,
  name_vi TEXT,
  PRIMARY KEY (channel, code)
);

CREATE TABLE IF NOT EXISTS md_i18n_namespaces (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_form_schema_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_sla_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_business_hours_policies (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_integration_vendor_codes (
  code TEXT PRIMARY KEY,
  name TEXT,
  name_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_payment_method_types (
  code TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS md_partner_types (
  code TEXT PRIMARY KEY
);

-- 6. Moderation & Redaction
-- =============================================

CREATE TABLE IF NOT EXISTS md_violation_codes (
  code TEXT PRIMARY KEY,
  description TEXT,
  description_vi TEXT,
  severity SMALLINT
);

CREATE TABLE IF NOT EXISTS md_redaction_channels (
  code TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS md_rating_scales (
  value SMALLINT PRIMARY KEY CHECK (value BETWEEN 1 AND 10),
  name TEXT
);

-- 7. Pricing
-- =============================================

CREATE TABLE IF NOT EXISTS md_pricing_regions (
  code TEXT PRIMARY KEY,
  name TEXT
);

-- 8. Logistics & Trade
-- =============================================

CREATE TABLE IF NOT EXISTS md_units (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  symbol TEXT,
  unit_type TEXT
);

CREATE TABLE IF NOT EXISTS md_rental_units (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  days SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS md_incoterms (
  code TEXT PRIMARY KEY,
  name TEXT,
  name_vi TEXT,
  description_vi TEXT,
  version TEXT
);

CREATE TABLE IF NOT EXISTS md_delivery_event_types (
  code TEXT PRIMARY KEY,
  name TEXT,
  name_vi TEXT,
  category TEXT
);

-- 9. Reasons (Dispute/Cancel/Payment)
-- =============================================

CREATE TABLE IF NOT EXISTS md_dispute_reasons (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_cancel_reasons (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

CREATE TABLE IF NOT EXISTS md_payment_failure_reasons (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

-- 10. Inspection/Repair Catalogs
-- =============================================

CREATE TABLE IF NOT EXISTS md_inspection_item_codes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS md_repair_item_codes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  category TEXT
);

-- 11. Notification
-- =============================================

CREATE TABLE IF NOT EXISTS md_notification_event_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT
);

-- 12. Cities & UN/LOCODE
-- =============================================

CREATE TABLE IF NOT EXISTS md_cities (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province_code TEXT REFERENCES md_provinces(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  country_code CHAR(2) REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS md_unlocodes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code CHAR(2) REFERENCES md_countries(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  subdivision TEXT,
  function_codes TEXT
);

-- 13. Insurance
-- =============================================

CREATE TABLE IF NOT EXISTS md_insurance_coverages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_vi TEXT,
  notes TEXT,
  notes_vi TEXT
);

-- =============================================
-- Summary
-- =============================================
-- Total Master Data Tables: 47
-- 1. md_countries
-- 2. md_provinces
-- 3. md_currencies
-- 4. md_timezones
-- 5. md_container_sizes
-- 6. md_container_types
-- 7. md_quality_standards
-- 8. md_iso_container_codes
-- 9. md_deal_types
-- 10. md_listing_statuses
-- 11. md_order_statuses
-- 12. md_payment_statuses
-- 13. md_delivery_statuses
-- 14. md_dispute_statuses
-- 15. md_document_types
-- 16. md_service_codes
-- 17. md_movement_types
-- 18. md_ref_doc_types
-- 19. md_adjust_reasons
-- 20. md_feature_flag_codes
-- 21. md_tax_codes
-- 22. md_fee_codes
-- 23. md_commission_codes
-- 24. md_notification_channels
-- 25. md_template_codes
-- 26. md_i18n_namespaces
-- 27. md_form_schema_codes
-- 28. md_sla_codes
-- 29. md_business_hours_policies
-- 30. md_integration_vendor_codes
-- 31. md_payment_method_types
-- 32. md_partner_types
-- 33. md_violation_codes
-- 34. md_redaction_channels
-- 35. md_rating_scales
-- 36. md_pricing_regions
-- 37. md_units
-- 38. md_rental_units
-- 39. md_incoterms
-- 40. md_delivery_event_types
-- 41. md_dispute_reasons
-- 42. md_cancel_reasons
-- 43. md_payment_failure_reasons
-- 44. md_inspection_item_codes
-- 45. md_repair_item_codes
-- 46. md_notification_event_types
-- 47. md_cities
-- 48. md_unlocodes
-- 49. md_insurance_coverages
-- =============================================

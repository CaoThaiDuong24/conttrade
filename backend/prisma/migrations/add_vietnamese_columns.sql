-- =============================================
-- Add Vietnamese Language Columns to Master Data Tables
-- =============================================

-- 1. Countries
ALTER TABLE md_countries ADD COLUMN IF NOT EXISTS name_vi TEXT;
ALTER TABLE md_countries ADD COLUMN IF NOT EXISTS region_vi TEXT;

-- 2. Currencies
ALTER TABLE md_currencies ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 3. Timezones
ALTER TABLE md_timezones ADD COLUMN IF NOT EXISTS description_vi TEXT;
ALTER TABLE md_timezones ADD COLUMN IF NOT EXISTS region_vi TEXT;

-- 4. Container Types
ALTER TABLE md_container_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 5. Quality Standards
ALTER TABLE md_quality_standards ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 6. ISO Container Codes
ALTER TABLE md_iso_container_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 7. Deal Types
ALTER TABLE md_deal_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 8. Listing Statuses
ALTER TABLE md_listing_statuses ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 9. Order Statuses
ALTER TABLE md_order_statuses ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 10. Payment Statuses
ALTER TABLE md_payment_statuses ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 11. Delivery Statuses
ALTER TABLE md_delivery_statuses ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 12. Dispute Statuses
ALTER TABLE md_dispute_statuses ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 13. Document Types
ALTER TABLE md_document_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 14. Service Codes
ALTER TABLE md_service_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 15. Movement Types
ALTER TABLE md_movement_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 16. Adjust Reasons
ALTER TABLE md_adjust_reasons ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 17. Feature Flag Codes
ALTER TABLE md_feature_flag_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 18. Tax Codes
ALTER TABLE md_tax_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 19. Fee Codes
ALTER TABLE md_fee_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 20. Commission Codes
ALTER TABLE md_commission_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 21. Template Codes
ALTER TABLE md_template_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 22. i18n Namespaces
ALTER TABLE md_i18n_namespaces ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 23. Form Schema Codes
ALTER TABLE md_form_schema_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 24. SLA Codes
ALTER TABLE md_sla_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 25. Business Hours Policies
ALTER TABLE md_business_hours_policies ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 26. Integration Vendor Codes
ALTER TABLE md_integration_vendor_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 27. Violation Codes
ALTER TABLE md_violation_codes ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 28. Units
ALTER TABLE md_units ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 29. Rental Units
ALTER TABLE md_rental_units ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 30. Incoterms
ALTER TABLE md_incoterms ADD COLUMN IF NOT EXISTS name_vi TEXT;
ALTER TABLE md_incoterms ADD COLUMN IF NOT EXISTS description_vi TEXT;

-- 31. Delivery Event Types
ALTER TABLE md_delivery_event_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 32. Dispute Reasons
ALTER TABLE md_dispute_reasons ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 33. Cancel Reasons
ALTER TABLE md_cancel_reasons ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 34. Payment Failure Reasons
ALTER TABLE md_payment_failure_reasons ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 35. Inspection Item Codes
ALTER TABLE md_inspection_item_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 36. Repair Item Codes
ALTER TABLE md_repair_item_codes ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 37. Notification Event Types
ALTER TABLE md_notification_event_types ADD COLUMN IF NOT EXISTS name_vi TEXT;

-- 38. Insurance Coverages
ALTER TABLE md_insurance_coverages ADD COLUMN IF NOT EXISTS name_vi TEXT;
ALTER TABLE md_insurance_coverages ADD COLUMN IF NOT EXISTS notes_vi TEXT;

-- =============================================
-- Summary: Added Vietnamese columns to 38 tables
-- =============================================

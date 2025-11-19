-- CreateTable: listing_containers
-- Bảng mới để lưu danh sách container IDs cho mỗi listing
-- KHÔNG sửa bảng listings hiện tại

CREATE TABLE IF NOT EXISTS "listing_containers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    
    -- Container identification (ISO 6346 standard)
    "container_iso_code" TEXT NOT NULL,
    "shipping_line" TEXT,
    
    -- Status tracking
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "reserved_by" TEXT,
    "reserved_until" TIMESTAMP(3),
    
    -- Transaction tracking
    "sold_to_order_id" TEXT,
    "sold_at" TIMESTAMP(3),
    "rented_to_order_id" TEXT,
    "rented_at" TIMESTAMP(3),
    "rental_return_date" TIMESTAMP(3),
    
    -- Metadata
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_containers_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_listing_id_fkey" 
    FOREIGN KEY ("listing_id") REFERENCES "listings"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_reserved_by_fkey" 
    FOREIGN KEY ("reserved_by") REFERENCES "users"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_sold_to_order_id_fkey" 
    FOREIGN KEY ("sold_to_order_id") REFERENCES "orders"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listing_containers" 
    ADD CONSTRAINT "listing_containers_rented_to_order_id_fkey" 
    FOREIGN KEY ("rented_to_order_id") REFERENCES "orders"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for performance
CREATE INDEX "idx_listing_containers_listing_id" ON "listing_containers"("listing_id");
CREATE INDEX "idx_listing_containers_status" ON "listing_containers"("status");
CREATE INDEX "idx_listing_containers_reserved_by" ON "listing_containers"("reserved_by");
CREATE INDEX "idx_listing_containers_sold_to_order_id" ON "listing_containers"("sold_to_order_id");

-- Unique constraint: một container ISO code chỉ được tồn tại 1 lần trong hệ thống
-- (trừ khi đã bán/xóa - soft delete)
CREATE UNIQUE INDEX "idx_listing_containers_iso_code_unique" 
    ON "listing_containers"("container_iso_code") 
    WHERE "status" != 'SOLD' AND "status" != 'DELETED';

-- Comment cho bảng
COMMENT ON TABLE "listing_containers" IS 'Stores individual container IDs associated with listings. Each listing can have multiple containers.';
COMMENT ON COLUMN "listing_containers"."container_iso_code" IS 'ISO 6346 compliant container number (e.g., ABCU1234560)';
COMMENT ON COLUMN "listing_containers"."shipping_line" IS 'Container owner/shipping line name (e.g., Maersk, CMA CGM)';
COMMENT ON COLUMN "listing_containers"."status" IS 'Container status: AVAILABLE, RESERVED, SOLD, RENTED, IN_MAINTENANCE, DELETED';

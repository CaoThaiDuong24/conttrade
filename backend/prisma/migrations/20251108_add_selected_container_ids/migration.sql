-- Add selected_container_ids column to cart_items table
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "selected_container_ids" TEXT[] DEFAULT '{}';

-- Add comment explaining the field
COMMENT ON COLUMN "cart_items"."selected_container_ids" IS 'Array of container ISO codes selected by buyer for this cart item';

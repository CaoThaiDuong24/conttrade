-- Migration: Add version tracking to roles table
-- Purpose: Track permission changes for real-time enforcement
-- Date: 2025-01-24

-- Step 1: Add role_version column to roles table
ALTER TABLE "roles" 
ADD COLUMN IF NOT EXISTS "role_version" INTEGER NOT NULL DEFAULT 1;

-- Step 2: Create index for faster version lookups
CREATE INDEX IF NOT EXISTS "idx_roles_version" ON "roles"("role_version");

-- Step 3: Create trigger function to auto-increment version when permissions change
CREATE OR REPLACE FUNCTION increment_role_version()
RETURNS TRIGGER AS $$
BEGIN
    -- When role_permissions are inserted, updated, or deleted
    -- Automatically increment the role's version
    UPDATE roles 
    SET role_version = role_version + 1,
        updated_at = NOW()
    WHERE role_id = NEW.role_id OR role_id = OLD.role_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create triggers on role_permissions table
DROP TRIGGER IF EXISTS trigger_increment_version_on_insert ON "role_permissions";
CREATE TRIGGER trigger_increment_version_on_insert
AFTER INSERT ON "role_permissions"
FOR EACH ROW
EXECUTE FUNCTION increment_role_version();

DROP TRIGGER IF EXISTS trigger_increment_version_on_update ON "role_permissions";
CREATE TRIGGER trigger_increment_version_on_update
AFTER UPDATE ON "role_permissions"
FOR EACH ROW
EXECUTE FUNCTION increment_role_version();

DROP TRIGGER IF EXISTS trigger_increment_version_on_delete ON "role_permissions";
CREATE TRIGGER trigger_increment_version_on_delete
AFTER DELETE ON "role_permissions"
FOR EACH ROW
EXECUTE FUNCTION increment_role_version();

-- Step 5: Add comment for documentation
COMMENT ON COLUMN "roles"."role_version" IS 'Auto-incremented version number. Increases whenever role permissions are modified. Used for real-time permission enforcement.';

-- Rollback script (if needed):
-- DROP TRIGGER IF EXISTS trigger_increment_version_on_insert ON "role_permissions";
-- DROP TRIGGER IF EXISTS trigger_increment_version_on_update ON "role_permissions";
-- DROP TRIGGER IF EXISTS trigger_increment_version_on_delete ON "role_permissions";
-- DROP FUNCTION IF EXISTS increment_role_version();
-- DROP INDEX IF EXISTS "idx_roles_version";
-- ALTER TABLE "roles" DROP COLUMN IF EXISTS "role_version";

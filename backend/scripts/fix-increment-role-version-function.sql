-- Fix the increment_role_version function
-- The bug: function uses WHERE role_id = ... but the roles table column is 'id', not 'role_id'

CREATE OR REPLACE FUNCTION public.increment_role_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- When role_permissions are inserted, updated, or deleted
    -- Automatically increment the role's version
    -- FIX: Use 'id' instead of 'role_id' for the roles table
    UPDATE roles
    SET updated_at = NOW()
    WHERE id = COALESCE(NEW.role_id, OLD.role_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;

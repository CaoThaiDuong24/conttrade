import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndFixTrigger() {
  try {
    console.log('=== CHECKING TRIGGER FUNCTION ===\n')
    
    // Get function definition
    const funcDef = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'increment_role_version'
    `
    
    console.log('Current function definition:')
    console.log(funcDef[0]?.definition || 'Function not found')
    console.log('\n' + '='.repeat(80) + '\n')
    
    // Drop and recreate the function with correct column reference
    console.log('Fixing the trigger function...\n')
    
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION increment_role_version()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update version in roles table when role_permissions changes
        -- Use OLD.role_id for DELETE, NEW.role_id for INSERT/UPDATE
        IF TG_OP = 'DELETE' THEN
          UPDATE roles 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = OLD.role_id;
          RETURN OLD;
        ELSE
          UPDATE roles 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.role_id;
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `
    
    console.log('✅ Function fixed successfully!\n')
    
    // Verify
    const newDef = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'increment_role_version'
    `
    
    console.log('New function definition:')
    console.log(newDef[0]?.definition)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixTrigger()

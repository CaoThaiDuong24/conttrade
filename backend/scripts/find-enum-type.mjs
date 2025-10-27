import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findEnumType() {
  try {
    // Find all enum types
    const enums = await prisma.$queryRaw`
      SELECT typname, enumlabel 
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE typname LIKE '%PermissionScope%' OR typname LIKE '%permission%'
      ORDER BY typname, enumlabel
    `
    
    console.log('=== ENUM TYPES RELATED TO PERMISSION ===')
    console.table(enums)
    
    // Get the exact type name for role_permissions.scope
    const scopeType = await prisma.$queryRaw`
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_name = 'role_permissions'
      AND column_name = 'scope'
    `
    
    console.log('\n=== TYPE OF scope COLUMN ===')
    console.log('Type name:', scopeType[0]?.udt_name)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findEnumType()

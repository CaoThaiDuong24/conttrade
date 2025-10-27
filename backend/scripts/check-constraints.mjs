import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkConstraints() {
  try {
    const constraints = await prisma.$queryRaw`
      SELECT conname, contype, pg_get_constraintdef(oid) as def 
      FROM pg_constraint 
      WHERE conrelid = 'role_permissions'::regclass
    `
    
    console.log('=== CONSTRAINTS ON role_permissions ===')
    console.table(constraints)
    
    // Check foreign keys specifically
    const fks = await prisma.$queryRaw`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='role_permissions'
    `
    
    console.log('\n=== FOREIGN KEYS ===')
    console.table(fks)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkConstraints()

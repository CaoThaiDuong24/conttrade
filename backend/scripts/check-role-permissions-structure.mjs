import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStructure() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions' 
      ORDER BY ordinal_position
    `
    
    console.log('=== ROLE_PERMISSIONS TABLE STRUCTURE ===')
    console.table(result)
    
    // Check current data
    const count = await prisma.role_permissions.count()
    console.log('\nTotal records:', count)
    
    if (count > 0) {
      const sample = await prisma.role_permissions.findFirst()
      console.log('\nSample record:')
      console.log(JSON.stringify(sample, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStructure()

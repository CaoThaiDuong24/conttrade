import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkActualColumns() {
  try {
    // Query raw để xem tên cột thực tế
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    
    console.log('=== ACTUAL COLUMNS IN role_permissions TABLE ===')
    console.table(columns)
    
    // Thử select trực tiếp
    console.log('\n=== TRYING RAW SELECT ===')
    const rawData = await prisma.$queryRaw`
      SELECT * FROM role_permissions LIMIT 1
    `
    console.log('Sample row:', rawData[0])
    
    // Kiểm tra Prisma schema vs actual database
    console.log('\n=== CHECKING SCHEMA FILE ===')
    const fs = await import('fs')
    const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf-8')
    const rolePermissionsModel = schemaContent.match(/model role_permissions \{[\s\S]*?\n\}/)?.[0]
    console.log(rolePermissionsModel)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkActualColumns()

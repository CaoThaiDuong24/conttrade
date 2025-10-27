#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkColumns() {
  console.log('=== CHECKING ROLE_PERMISSIONS TABLE COLUMNS ===\n')
  
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'role_permissions' 
    ORDER BY ordinal_position
  `
  
  console.log('Columns in database:')
  columns.forEach(col => {
    console.log(`  - ${col.column_name} (${col.data_type})`)
  })
  
  console.log('\n=== CHECKING PRISMA CLIENT MODEL ===\n')
  
  // Try to use Prisma Client to see what fields it expects
  try {
    const count = await prisma.role_permissions.count()
    console.log(`✅ Can count role_permissions: ${count} records`)
  } catch (e) {
    console.log('❌ Error counting:', e.message)
  }
  
  await prisma.$disconnect()
}

checkColumns().catch(console.error)

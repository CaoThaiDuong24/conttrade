import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function debugConnection() {
  try {
    console.log('=== DEBUGGING PRISMA CONNECTION ===\n')
    
    // Get connection info
    const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_schema(), current_user`
    console.log('Database info:', dbInfo)
    
    // List all tables in current schema
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    console.log('\nTables in public schema:')
    tables.forEach((t, i) => console.log(`${i + 1}. ${t.tablename}`))
    
    // Check role_permissions table specifically
    console.log('\n=== ROLE_PERMISSIONS TABLE CHECK ===')
    const rolePermTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_permissions'
      ) as exists
    `
    console.log('Table exists:', rolePermTable[0].exists)
    
    // Get columns
    if (rolePermTable[0].exists) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'role_permissions'
        ORDER BY ordinal_position
      `
      console.log('\nColumns:')
      console.table(columns)
    }
    
    // Try a simple select
    console.log('\n=== TRYING SIMPLE SELECT ===')
    try {
      const sample = await prisma.$queryRaw`SELECT * FROM public.role_permissions LIMIT 1`
      console.log('Sample:', sample[0])
    } catch (err) {
      console.error('Raw SELECT error:', err.message)
    }
    
    // Try via Prisma ORM
    console.log('\n=== TRYING PRISMA ORM ===')
    try {
      const count = await prisma.role_permissions.count()
      console.log('Count via Prisma:', count)
    } catch (err) {
      console.error('Prisma ORM error:', err.message)
      console.error('Full error:', err)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugConnection()

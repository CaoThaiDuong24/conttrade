import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deepDatabaseCheck() {
  try {
    console.log('=== DEEP DATABASE CHECK ===\n')
    
    // 1. Check connection
    const conn = await prisma.$queryRaw`SELECT current_database(), current_schema()`
    console.log('1. Connection info:', conn[0])
    
    // 2. Check table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE tablename = 'role_permissions'
    `
    console.log('\n2. Table check:', tableCheck)
    
    // 3. Check columns in ALL schemas
    const columnsAll = await prisma.$queryRaw`
      SELECT table_schema, table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'role_permissions'
      ORDER BY table_schema, ordinal_position
    `
    console.log('\n3. Columns in ALL schemas:')
    console.table(columnsAll)
    
    // 4. Try direct SELECT
    console.log('\n4. Testing direct SELECT...')
    try {
      const directSelect = await prisma.$queryRawUnsafe(
        'SELECT * FROM role_permissions LIMIT 1'
      )
      console.log('✅ Direct SELECT works:', directSelect[0])
    } catch (err) {
      console.error('❌ Direct SELECT failed:', err.message)
    }
    
    // 5. Try SELECT with WHERE
    console.log('\n5. Testing SELECT with WHERE role_id...')
    try {
      const selectWhere = await prisma.$queryRawUnsafe(
        'SELECT * FROM role_permissions WHERE role_id = $1 LIMIT 1',
        'role-admin'
      )
      console.log('✅ SELECT WHERE works:', selectWhere[0])
    } catch (err) {
      console.error('❌ SELECT WHERE failed:', err.message)
    }
    
    // 6. Check search_path
    const searchPath = await prisma.$queryRaw`SHOW search_path`
    console.log('\n6. Search path:', searchPath[0])
    
    // 7. Try with explicit schema
    console.log('\n7. Testing with explicit public schema...')
    try {
      const explicitSchema = await prisma.$queryRawUnsafe(
        'SELECT * FROM public.role_permissions WHERE public.role_permissions.role_id = $1 LIMIT 1',
        'role-admin'
      )
      console.log('✅ Explicit schema works:', explicitSchema[0])
    } catch (err) {
      console.error('❌ Explicit schema failed:', err.message)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deepDatabaseCheck()

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error']
})

async function testDeleteOperations() {
  try {
    console.log('=== TESTING DELETE OPERATIONS ===\n')
    
    // 1. Test DELETE without WHERE
    console.log('1. Testing DELETE without WHERE (delete all):')
    try {
      // Don't actually delete all, just test the syntax
      console.log('   Skipped (too dangerous)\n')
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n')
    }
    
    // 2. Test DELETE with WHERE using a non-existent role
    console.log('2. Testing DELETE with WHERE (non-existent role):')
    try {
      const result = await prisma.$queryRawUnsafe(
        'DELETE FROM role_permissions WHERE role_id = $1',
        'nonexistent-role-id'
      )
      console.log('   ✅ Success! Deleted:', result, 'rows\n')
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n')
    }
    
    // 3. Test DELETE using RETURNING
    console.log('3. Testing DELETE with RETURNING:')
    try {
      const result = await prisma.$queryRawUnsafe(
        'DELETE FROM role_permissions WHERE role_id = $1 RETURNING *',
        'nonexistent-role-id'
      )
      console.log('   ✅ Success! Result:', result, '\n')
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n')
    }
    
    // 4. Check if there's a trigger or rule on the table
    console.log('4. Checking triggers on role_permissions:')
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'role_permissions'
    `
    if (triggers.length > 0) {
      console.table(triggers)
    } else {
      console.log('   No triggers found\n')
    }
    
    // 5. Check rules
    console.log('5. Checking rules on role_permissions:')
    const rules = await prisma.$queryRaw`
      SELECT rulename, definition
      FROM pg_rules
      WHERE tablename = 'role_permissions'
    `
    if (rules.length > 0) {
      console.table(rules)
    } else {
      console.log('   No rules found\n')
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteOperations()

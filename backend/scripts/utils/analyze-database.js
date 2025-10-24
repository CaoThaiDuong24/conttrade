import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function analyzeDatabase() {
  try {
    console.log('🔍 ANALYZING DATABASE STRUCTURE...\n');
    
    // 1. Get all tables
    const tables = await prisma.$queryRaw`
      SELECT tablename, schemaname 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    console.log(`📊 TOTAL TABLES: ${tables.length}\n`);
    
    // 2. Count Master Data tables
    const masterDataTables = tables.filter(t => t.tablename.startsWith('md_'));
    console.log(`📋 MASTER DATA TABLES: ${masterDataTables.length}`);
    masterDataTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    
    // 3. Count Business tables
    const businessTables = tables.filter(t => 
      !t.tablename.startsWith('md_') && 
      !t.tablename.startsWith('_') &&
      !['audit_logs', 'settings', 'permissions', 'roles', 'user_roles', 'role_permissions'].includes(t.tablename)
    );
    console.log(`\n💼 BUSINESS TABLES: ${businessTables.length}`);
    businessTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    
    // 4. Count RBAC tables
    const rbacTables = tables.filter(t => 
      ['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'orgs', 'org_users'].includes(t.tablename)
    );
    console.log(`\n🔐 RBAC TABLES: ${rbacTables.length}`);
    rbacTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    
    // 5. Get sample data counts
    console.log('\n📈 SAMPLE DATA COUNTS:');
    
    try {
      const userCount = await prisma.users.count();
      console.log(`   Users: ${userCount}`);
    } catch (e) {
      console.log(`   Users: Error - ${e.message.split('\n')[0]}`);
    }
    
    try {
      const listingCount = await prisma.listings.count();
      console.log(`   Listings: ${listingCount}`);
    } catch (e) {
      console.log(`   Listings: Error - ${e.message.split('\n')[0]}`);
    }
    
    try {
      const orderCount = await prisma.orders.count();
      console.log(`   Orders: ${orderCount}`);
    } catch (e) {
      console.log(`   Orders: Error - ${e.message.split('\n')[0]}`);
    }
    
    try {
      const roleCount = await prisma.roles.count();
      console.log(`   Roles: ${roleCount}`);
    } catch (e) {
      console.log(`   Roles: Error - ${e.message.split('\n')[0]}`);
    }
    
    try {
      const permissionCount = await prisma.permissions.count();
      console.log(`   Permissions: ${permissionCount}`);
    } catch (e) {
      console.log(`   Permissions: Error - ${e.message.split('\n')[0]}`);
    }
    
    // 6. Check Master Data sample
    console.log('\n🗃️ MASTER DATA SAMPLE COUNTS:');
    
    const masterDataChecks = [
      'md_countries',
      'md_provinces', 
      'md_currencies',
      'md_container_types',
      'md_container_sizes',
      'md_deal_types',
      'md_listing_statuses',
      'md_order_statuses'
    ];
    
    for (const tableName of masterDataChecks) {
      try {
        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${tableName}`;
        console.log(`   ${tableName}: ${count[0].count} records`);
      } catch (e) {
        console.log(`   ${tableName}: Error - Table may not exist`);
      }
    }
    
    // 7. Check for missing critical tables
    console.log('\n⚠️ MISSING CRITICAL TABLES CHECK:');
    
    const criticalTables = [
      'notifications',
      'refresh_tokens', 
      'user_sessions',
      'favorites',
      'messages',
      'conversations'
    ];
    
    for (const tableName of criticalTables) {
      const exists = tables.some(t => t.tablename === tableName);
      if (!exists) {
        console.log(`   ❌ ${tableName} - Missing`);
      } else {
        console.log(`   ✅ ${tableName} - Exists`);
      }
    }
    
    console.log('\n✅ Database analysis complete!');
    
  } catch (error) {
    console.error('❌ Error analyzing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabase();
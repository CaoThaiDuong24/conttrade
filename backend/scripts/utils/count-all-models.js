import fs from 'fs';
import path from 'path';

async function countAllModelsInSchema() {
  try {
    console.log('📊 ĐẾM TẤT CẢ CÁC BẢNG DỮ LIỆU TRONG PRISMA SCHEMA\n');
    
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract all model definitions
    const modelMatches = schemaContent.match(/^model\s+(\w+)\s*{/gm);
    
    if (!modelMatches) {
      console.log('❌ Không tìm thấy model nào trong schema');
      return;
    }
    
    console.log(`🎯 TỔNG SỐ BẢNG TRONG SCHEMA: ${modelMatches.length} bảng\n`);
    
    // Extract model names
    const modelNames = modelMatches.map(match => {
      const nameMatch = match.match(/^model\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(name => name);
    
    // Categorize models
    const categories = {
      masterData: [],
      business: [],
      rbac: [],
      system: []
    };
    
    modelNames.forEach((name, index) => {
      if (name.startsWith('md_')) {
        categories.masterData.push(`${index + 1}. ${name}`);
      } else if (['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'orgs', 'org_users'].includes(name)) {
        categories.rbac.push(`${index + 1}. ${name}`);
      } else if (['audit_logs', 'settings', 'config_entries', 'config_namespaces', 'feature_flags', 'form_schemas', 'i18n_translations', 'integration_configs', 'marketplace_policies', 'notification_templates', 'partners', 'payment_methods', 'redaction_patterns', 'tax_rates', 'business_hours', 'commission_rules', 'depot_calendars', 'fee_schedules'].includes(name)) {
        categories.system.push(`${index + 1}. ${name}`);
      } else {
        categories.business.push(`${index + 1}. ${name}`);
      }
    });
    
    console.log('📋 PHÂN LOẠI CÁC BẢNG:\n');
    
    console.log(`📊 MASTER DATA TABLES: ${categories.masterData.length} bảng`);
    categories.masterData.forEach(item => console.log(`   ${item}`));
    
    console.log(`\n💼 BUSINESS TABLES: ${categories.business.length} bảng`);
    categories.business.forEach(item => console.log(`   ${item}`));
    
    console.log(`\n🔐 RBAC TABLES: ${categories.rbac.length} bảng`);
    categories.rbac.forEach(item => console.log(`   ${item}`));
    
    console.log(`\n🏗️ SYSTEM TABLES: ${categories.system.length} bảng`);
    categories.system.forEach(item => console.log(`   ${item}`));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TỔNG KẾT:');
    console.log(`   Master Data: ${categories.masterData.length} bảng`);
    console.log(`   Business:    ${categories.business.length} bảng`);
    console.log(`   RBAC:        ${categories.rbac.length} bảng`);
    console.log(`   System:      ${categories.system.length} bảng`);
    console.log(`   TỔNG CỘNG:   ${modelNames.length} bảng`);
    console.log('='.repeat(60));
    
    // Print all model names for reference
    console.log('\n📝 DANH SÁCH ĐẦY ĐỦ TẤT CẢ CÁC BẢNG:');
    modelNames.forEach((name, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi đọc schema:', error.message);
  }
}

countAllModelsInSchema();
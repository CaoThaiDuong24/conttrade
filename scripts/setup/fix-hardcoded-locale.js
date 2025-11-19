const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/[locale]/quotes/compare/page.tsx',
  'app/[locale]/inspection/reports/page.tsx',
  'app/[locale]/admin/disputes/[id]/page.tsx',
  'app/[locale]/payments/history/page.tsx',
  'app/[locale]/orders/tracking/page.tsx',
  'app/[locale]/quotes/management/page.tsx',
  'app/[locale]/quotes/create/page.tsx',
  'app/[locale]/rfq/received/page.tsx',
  'app/[locale]/rfq/sent/page.tsx',
  'app/[locale]/auth/login/page.tsx',
  'app/[locale]/legal/privacy/page.tsx',
  'app/[locale]/legal/terms/page.tsx',
  'app/[locale]/orders/page.tsx',
  'app/[locale]/dashboard/test/page.tsx',
  'app/[locale]/auth/login/enhanced/page.tsx',
  'app/[locale]/auth/login/enhanced-page.tsx',
  'app/[locale]/auth/register/page.tsx',
  'app/[locale]/auth/forgot/page.tsx'
];

const rootDir = path.join(__dirname, '..');

filesToFix.forEach(filePath => {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix import statement
  if (content.includes('import Link from "next/link"') || content.includes("import Link from 'next/link'")) {
    content = content.replace(/import Link from ["']next\/link["']/g, 'import { Link } from "@/i18n/routing"');
    modified = true;
  }
  
  // Fix hardcoded locale in href
  if (content.includes('/vi/') || content.includes('/${locale}/')) {
    // Replace href="/vi/... with href="/...
    content = content.replace(/href=["']\/vi\//g, 'href="/');
    
    // Replace href={`/${locale}/... with href={`/...
    content = content.replace(/href=\{\`\/\$\{locale\}\//g, 'href={`/');
    
    // Replace href={`/vi/... with href={`/...
    content = content.replace(/href=\{\`\/vi\//g, 'href={`/');
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
});

console.log('\n🎉 Done! All files have been processed.');


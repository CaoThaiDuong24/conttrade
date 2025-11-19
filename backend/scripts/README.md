# Backend Scripts - i-ContExchange

Thư mục chứa các scripts utility cho backend server.

## 📂 Cấu Trúc

```
backend/scripts/
├── seed/            # Database seeding scripts
├── test/            # Test scripts
├── migrations/      # Database migration scripts
└── utils/           # Utility scripts
```

## 🌱 Seed Scripts (`/seed`)

Scripts để khởi tạo và populate database với data mẫu.

### Master Data Seeds
- `seed-master-*.js` - Seed master data (container types, sizes, conditions)
- `seed-final-master-data.js` - Complete master data seeding
- `seed-master-data-complete.js` - Full master data setup
- `seed-master-data-core.js` - Core master data only

### RBAC Seeds
- `seed-complete-rbac.mjs` - Complete RBAC setup (roles, permissions)
- `seed-final-rbac.mjs` - Final RBAC configuration
- `seed.mjs` - Main seeding script

### Business Data Seeds
- `seed-business-data.js` - Sample business data
- `create-admin-correct.js` - Create admin user
- `create-seller.js` - Create seller account
- `create-test-*.js` - Create test data

**Sử dụng:**
```bash
cd backend
node scripts/seed/seed-complete-rbac.mjs
node scripts/seed/seed-final-master-data.js
```

## 🧪 Test Scripts (`/test`)

Scripts để test các API endpoints và functionality.

### API Testing
- `test-auto-complete-full.js` - Test auto-complete functionality
- `test-disputes-full.js` - Test disputes system
- `simple-test.js` - Simple API tests

### Data Testing
- `create-test-*.js` - Create test data for specific features
- `cleanup-test-*.js` - Clean up test data

**Sử dụng:**
```bash
cd backend
node scripts/test/test-auto-complete-full.js
node scripts/test/test-disputes-full.js
```

## 🔄 Migration Scripts (`/migrations`)

Scripts để thực hiện database schema changes.

### Column Additions
- `add-notifications-table.sql` - Add notifications table
- `add-order-status-enum.js` - Add order status enum
- `add-payment-verification-fields.js` - Add payment fields
- `add-ready-date-column.js` - Add ready date column
- `add-rfq-columns.sql` - Add RFQ columns

### Schema Updates
- `create-depot.sql` - Create depot tables
- `create-notifications-*.js` - Create notification structure

### Migration Runners
- `run-delivery-migration.ps1` - Run delivery-related migrations

**Sử dụng:**
```bash
# SQL migrations
cd backend
psql -U postgres -d icontexchange -f scripts/migrations/add-notifications-table.sql

# JS migrations
node scripts/migrations/add-order-status-enum.js

# PowerShell runners
.\scripts\migrations\run-delivery-migration.ps1
```

## 🛠️ Utility Scripts (`/utils`)

Various utility scripts for maintenance and data management.

### Database Utilities
- `analyze-database.js` - Analyze database structure
- `analyze-rfq-data.js` - Analyze RFQ data
- `count-all-models.js` - Count records in all tables
- `sync-listing-statuses.js` - Sync listing statuses
- `validate-listing-statuses.js` - Validate listing data

### Data Management
- `reset-order-*.js` - Reset order data
- `set-order-*.js` - Set order status
- `update-master-data-vietnamese.js` - Update Vietnamese master data
- `cleanup-test-notifications.js` - Clean up test notifications

### Server Management
- `restart-backend.ps1` - Restart backend server

**Sử dụng:**
```bash
cd backend
node scripts/utils/analyze-database.js
node scripts/utils/count-all-models.js
node scripts/utils/sync-listing-statuses.js
```

## 📋 Quy Trình Thực Hiện

### 1. Fresh Database Setup
```bash
# 1. Run Prisma migrations
npx prisma migrate dev

# 2. Seed RBAC
node scripts/seed/seed-complete-rbac.mjs

# 3. Seed Master Data
node scripts/seed/seed-final-master-data.js

# 4. Seed Business Data (optional)
node scripts/seed/seed-business-data.js
```

### 2. Database Migration
```bash
# 1. Backup current database
pg_dump icontexchange > backup.sql

# 2. Run migration script
node scripts/migrations/add-[feature].js
# OR
psql -U postgres -d icontexchange -f scripts/migrations/[migration].sql

# 3. Verify migration
node scripts/utils/analyze-database.js
```

### 3. Testing Flow
```bash
# 1. Create test data
node scripts/seed/create-test-[feature].js

# 2. Run tests
node scripts/test/test-[feature].js

# 3. Clean up
node scripts/utils/cleanup-test-[feature].js
```

## ⚠️ Important Notes

### Environment
- All scripts assume you're in the `backend/` directory
- Ensure `.env` file is configured correctly
- Database connection must be available

### Database Safety
- **Always backup** before running migration scripts
- Test migrations on development database first
- Review SQL scripts before executing

### Dependencies
- Most scripts require Prisma Client: `npx prisma generate`
- Some scripts use `tsx` for TypeScript: `npm install -g tsx`

## 🔧 Configuration

Scripts read from `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/icontexchange"
```

## 📝 Creating New Scripts

### Seed Script Template
```javascript
// scripts/seed/seed-new-feature.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new feature...');
  
  // Your seeding logic here
  
  console.log('✓ Seeding completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Migration Script Template
```javascript
// scripts/migrations/add-new-column.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Running migration...');
  
  // Your migration logic here
  
  console.log('✓ Migration completed');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**"Connection refused"**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**"Permission denied"**
```bash
# Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Related Documentation

- [Prisma Schema](../prisma/schema.prisma)
- [API Routes](../src/routes/)
- [Main Documentation](../../docs/)

---

**Last Updated**: 24/10/2025

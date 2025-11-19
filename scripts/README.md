# Scripts - i-ContExchange

Thư mục chứa các scripts utility cho dự án.

## 📂 Cấu Trúc

```
scripts/
├── setup/           # Setup & initialization scripts
├── test/            # Test scripts & demos
└── database/        # Database scripts & SQL files
```

## 🔧 Setup Scripts (`/setup`)

Scripts để khởi tạo và cấu hình hệ thống.

### Database Setup
- `setup-rfq-test-data.js` - Setup RFQ test data
- `create-*.js` - Create various entities (users, orders, etc.)
- `find-admin-users.js` - Find admin users

### PowerShell Scripts
- `*.ps1` - Setup scripts for Windows environment
- `integration-test-simple.ps1` - Integration test runner

**Sử dụng:**
```bash
node scripts/setup/setup-rfq-test-data.js
```

## 🧪 Test Scripts (`/test`)

Scripts để test functionality và data.

### API Testing
- `check-database-*.js` - Check database connectivity and data
- `quick-test*.js` - Quick API tests
- `test-*.js` - Feature-specific tests
- `final-test.js` - Final integration test

### Data Verification
- `get-*.js` - Get and display various data
- `check-*.js` - Verify data integrity

### HTML Demos
- `demo-notification-navigation.html` - Demo notification UI

**Sử dụng:**
```bash
node scripts/test/check-database-full.js
node scripts/test/quick-test.js
```

## 💾 Database Scripts (`/database`)

SQL files và database-related scripts.

### Schema & Migration
- `database_setup.sql` - Initial database setup
- `*.sql` - Various SQL migration files
- `check-db.sql` - Database verification queries
- `check-notif.sql` - Notification queries

**Sử dụng:**
```bash
psql -U postgres -d icontexchange -f scripts/database/database_setup.sql
```

## 📋 Common Tasks

### 1. Initial Setup
```bash
# Setup database
psql -U postgres -d icontexchange -f scripts/database/database_setup.sql

# Setup test data
node scripts/setup/setup-rfq-test-data.js
```

### 2. Testing
```bash
# Quick test
node scripts/test/quick-test.js

# Check database
node scripts/test/check-database-full.js

# Test specific feature
node scripts/test/test-[feature].js
```

### 3. Data Verification
```bash
# Check RFQ data
node scripts/test/check-database-rfq.js

# Get dashboard stats
node scripts/test/get-dashboard-stats.js

# Get buyer token
node scripts/test/get-buyer-token.js
```

## 🔍 Script Categories

### Setup Scripts
Tên file: `setup-*.js`, `create-*.js`
- Khởi tạo dữ liệu
- Cấu hình hệ thống
- Tạo users và entities

### Test Scripts
Tên file: `test-*.js`, `quick-*.js`, `check-*.js`
- Test API endpoints
- Verify functionality
- Check data integrity

### Database Scripts
Tên file: `*.sql`
- Schema migrations
- Data migrations
- Query examples

## ⚙️ Configuration

Các scripts đọc configuration từ:
- Frontend: `.env.local`
- Backend: `backend/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://...
```

## 📝 Creating New Scripts

### Test Script Template
```javascript
// scripts/test/test-new-feature.js
const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function testFeature() {
  console.log('Testing new feature...');
  
  try {
    const response = await axios.get(`${API_URL}/api/v1/feature`);
    console.log('✓ Test passed:', response.data);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

testFeature();
```

### Setup Script Template
```javascript
// scripts/setup/setup-new-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setup() {
  console.log('Setting up new data...');
  
  // Your setup logic here
  
  console.log('✓ Setup completed');
}

setup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 🛠️ Dependencies

Các scripts yêu cầu:
- Node.js 18+
- npm packages: axios, @prisma/client
- PostgreSQL 15+

Install dependencies:
```bash
npm install axios @prisma/client
```

## ⚠️ Important Notes

- **Môi trường**: Luôn chạy từ root folder của project
- **Database**: Đảm bảo database đang chạy trước khi test
- **API Server**: Backend server phải running cho API tests
- **Backup**: Backup database trước khi chạy migration scripts

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
cd backend && npm install
```

### "Connection refused"
- Check backend server: `cd backend && npm run dev`
- Check PostgreSQL: `psql -U postgres`

### "ECONNREFUSED"
- Verify API_URL in environment variables
- Ensure backend is running on correct port (3001)

## 📚 Related Documentation

- [Backend Scripts](../backend/scripts/README.md)
- [Project Structure](../PROJECT-STRUCTURE.md)
- [Documentation](../docs/README.md)

---

**Last Updated**: 24/10/2025

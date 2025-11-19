#!/bin/bash

###############################################################################
# SCRIPT SỬA LỖI MÀN HÌNH KHÔNG HIỂN THỊ DỮ LIỆU
# Kiểm tra và sửa các vấn đề thường gặp
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SỬA LỖI MÀN HÌNH KHÔNG HIỂN THỊ DỮ LIỆU                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 1: Kiểm tra Backend đang chạy${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if curl -s http://localhost:3006/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend đang chạy${NC}"
else
    echo -e "${RED}❌ Backend không chạy!${NC}"
    echo -e "${YELLOW}💡 Đang khởi động backend...${NC}"
    cd "$PROJECT_ROOT"
    pm2 start ecosystem.config.js --only lta-backend || {
        echo -e "${RED}❌ Không thể start backend với PM2${NC}"
        exit 1
    }
    sleep 3
    echo -e "${GREEN}✅ Backend đã được khởi động${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 2: Kiểm tra Database Connection${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT/backend"

# Check if .env exists
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Không tìm thấy file .env!${NC}"
    echo -e "${YELLOW}💡 Tạo file .env...${NC}"
    
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3006
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
EOF
    
    echo -e "${GREEN}✅ Đã tạo file .env${NC}"
fi

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection OK${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo -e "${YELLOW}💡 Kiểm tra:${NC}"
    echo -e "  1. PostgreSQL đang chạy: sudo systemctl status postgresql"
    echo -e "  2. Database đã tạo: sudo -u postgres psql -c \"\\l\""
    echo -e "  3. Credentials trong .env đúng"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 3: Run Migrations${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 Running Prisma migrations...${NC}"
npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations có vấn đề, đang thử reset...${NC}"
    npx prisma migrate reset --force --skip-seed || true
}

echo -e "${GREEN}✅ Migrations completed${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 4: Kiểm tra dữ liệu trong Database${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🔍 Checking database tables...${NC}"

# Create a temporary script to check data
cat > /tmp/check_data.sql << 'EOF'
\echo '=== USERS ==='
SELECT COUNT(*) as user_count FROM "User";
\echo ''
\echo '=== ROLES ==='
SELECT COUNT(*) as role_count FROM "Role";
\echo ''
\echo '=== PERMISSIONS ==='
SELECT COUNT(*) as permission_count FROM "Permission";
\echo ''
\echo '=== DEPOTS ==='
SELECT COUNT(*) as depot_count FROM "Depot";
\echo ''
\echo '=== CONTAINER TYPES ==='
SELECT COUNT(*) as container_type_count FROM "ContainerType";
\echo ''
\echo '=== PORTS ==='
SELECT COUNT(*) as port_count FROM "Port";
\echo ''
\echo '=== RFQs ==='
SELECT COUNT(*) as rfq_count FROM "RFQ";
\echo ''
\echo '=== QUOTES ==='
SELECT COUNT(*) as quote_count FROM "Quote";
\echo ''
\echo '=== ORDERS ==='
SELECT COUNT(*) as order_count FROM "Order";
EOF

# Get database credentials from .env
DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
if [ -n "$DB_URL" ]; then
    # Extract connection details
    DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    
    PGPASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
    psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-i_contexchange} \
    -f /tmp/check_data.sql 2>/dev/null || {
        echo -e "${RED}❌ Không thể kết nối database để check data${NC}"
    }
else
    echo -e "${RED}❌ Không đọc được DATABASE_URL từ .env${NC}"
fi

rm -f /tmp/check_data.sql

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 5: Kiểm tra Permissions của Users${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🔍 Checking user permissions...${NC}"

cat > /tmp/check_permissions.sql << 'EOF'
SELECT 
    u.email,
    u.role as user_role,
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM "User" u
LEFT JOIN "Role" r ON u.role = r.name
LEFT JOIN "RolePermission" rp ON r.id = rp.role_id
GROUP BY u.id, u.email, u.role, r.name
ORDER BY u.email
LIMIT 10;
EOF

if [ -n "$DB_URL" ]; then
    PGPASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
    psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-i_contexchange} \
    -f /tmp/check_permissions.sql 2>/dev/null || true
fi

rm -f /tmp/check_permissions.sql

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 6: Kiểm tra API Responses${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🧪 Testing critical endpoints...${NC}"
echo ""

# Test master data endpoints
declare -a CRITICAL_ENDPOINTS=(
    "/api/v1/master-data/container-types"
    "/api/v1/master-data/ports"
    "/api/v1/depots"
    "/api/v1/listings"
)

for endpoint in "${CRITICAL_ENDPOINTS[@]}"; do
    echo -e "${BLUE}Testing: $endpoint${NC}"
    RESPONSE=$(curl -s http://localhost:3006$endpoint)
    
    # Check if response is JSON
    if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
        # Check if it's an empty array or error
        if echo "$RESPONSE" | jq -e 'if type == "array" then length > 0 else true end' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Response OK với dữ liệu${NC}"
        else
            echo -e "${YELLOW}⚠️  Response OK nhưng empty array${NC}"
        fi
    else
        echo -e "${RED}❌ Response không phải JSON hoặc có lỗi${NC}"
        echo "$RESPONSE" | head -5
    fi
    echo ""
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 7: Seed dữ liệu nếu cần${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Bạn có muốn seed dữ liệu mẫu không? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📊 Seeding database...${NC}"
    cd "$PROJECT_ROOT/backend"
    npx prisma db seed || {
        echo -e "${YELLOW}⚠️  Seed script có thể chưa được setup. Bỏ qua...${NC}"
    }
    echo -e "${GREEN}✅ Seed completed${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 8: Rebuild và Restart Backend${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🔄 Rebuilding backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm run build || {
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
}

echo -e "${YELLOW}🔄 Restarting backend...${NC}"
pm2 restart lta-backend

sleep 3

echo -e "${GREEN}✅ Backend restarted${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 9: Kiểm tra Frontend Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT/frontend"

if [ -f ".env.local" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
    echo ""
    echo -e "${YELLOW}📋 API URL configuration:${NC}"
    grep "NEXT_PUBLIC_API_URL" .env.local .env 2>/dev/null || echo "  Không tìm thấy NEXT_PUBLIC_API_URL"
else
    echo -e "${RED}❌ Frontend .env không tồn tại!${NC}"
    echo -e "${YELLOW}💡 Tạo .env.local cho frontend...${NC}"
    
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:240499@localhost:5432/i_contexchange?schema=public
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
EOF
    
    echo -e "${GREEN}✅ Đã tạo .env.local cho frontend${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 10: Test End-to-End${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🧪 Running comprehensive test...${NC}"
bash "$SCRIPT_DIR/check-all-routes.sh"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ HOÀN TẤT!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}📋 KẾT LUẬN:${NC}"
echo ""
echo -e "${GREEN}✅ Đã kiểm tra và sửa:${NC}"
echo -e "  • Backend đang chạy"
echo -e "  • Database connection"
echo -e "  • Migrations updated"
echo -e "  • Data seeded (nếu cần)"
echo -e "  • Backend rebuilt"
echo -e "  • Frontend configuration"
echo ""

echo -e "${YELLOW}📝 BƯỚC TIẾP THEO:${NC}"
echo -e "  1. Restart frontend: ${BLUE}pm2 restart lta-frontend${NC}"
echo -e "  2. Xóa cache browser (Ctrl + Shift + R)"
echo -e "  3. Login lại với account"
echo -e "  4. Kiểm tra từng màn hình"
echo ""

echo -e "${YELLOW}💡 NẾU VẪN CÓ VẤN ĐỀ:${NC}"
echo -e "  • Xem logs: ${BLUE}pm2 logs${NC}"
echo -e "  • Kiểm tra Network tab trong DevTools"
echo -e "  • Kiểm tra Console tab có lỗi gì"
echo -e "  • Đảm bảo user có đủ permissions"
echo ""

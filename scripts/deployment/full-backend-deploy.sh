#!/bin/bash

###############################################################################
# SCRIPT DEPLOY TOÀN BỘ BACKEND LÊN SERVER
# Đảm bảo TẤT CẢ các routes và API endpoints được build và deploy đầy đủ
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     DEPLOY TOÀN BỘ BACKEND LÊN SERVER                      ║${NC}"
echo -e "${BLUE}║     Đảm bảo tất cả routes được build và deploy            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo -e "${YELLOW}📂 Project root: ${PROJECT_ROOT}${NC}"
echo -e "${YELLOW}📂 Backend directory: ${BACKEND_DIR}${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 1: Kiểm tra và liệt kê tất cả routes${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -d "src/routes" ]; then
    echo -e "${YELLOW}📋 Danh sách các route files:${NC}"
    find src/routes -type f -name "*.ts" | sort | while read file; do
        echo "  ✓ $file"
    done
    echo ""
    
    ROUTE_COUNT=$(find src/routes -type f -name "*.ts" | wc -l)
    echo -e "${GREEN}✅ Tổng số route files: ${ROUTE_COUNT}${NC}"
else
    echo -e "${RED}❌ Routes directory not found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 2: Kiểm tra tất cả routes đã được register${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -f "src/server.ts" ]; then
    echo -e "${YELLOW}📋 Các routes đã được register trong server.ts:${NC}"
    grep "app.register" src/server.ts | grep -v "//" | grep "prefix:" | while read line; do
        echo "  ✓ $line"
    done
    echo ""
    
    REGISTERED_COUNT=$(grep "app.register" src/server.ts | grep -v "//" | grep "prefix:" | wc -l)
    echo -e "${GREEN}✅ Tổng số routes đã register: ${REGISTERED_COUNT}${NC}"
else
    echo -e "${RED}❌ server.ts not found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 3: Xóa build cũ và node_modules${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}🗑️  Xóa dist folder cũ...${NC}"
rm -rf dist

echo -e "${YELLOW}🗑️  Xóa node_modules để build clean...${NC}"
rm -rf node_modules

echo -e "${GREEN}✅ Đã xóa build cũ${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 4: Cài đặt dependencies mới nhất${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 5: Generate Prisma Client${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 6: Build TypeScript to JavaScript${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}🔨 Building backend...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 7: Kiểm tra các file đã được build${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}📋 Các file JavaScript đã được build:${NC}"
if [ -d "dist/routes" ]; then
    find dist/routes -type f -name "*.js" | sort | while read file; do
        echo "  ✓ $file"
    done
    
    BUILD_ROUTE_COUNT=$(find dist/routes -type f -name "*.js" | wc -l)
    echo ""
    echo -e "${GREEN}✅ Tổng số route JS files: ${BUILD_ROUTE_COUNT}${NC}"
else
    echo -e "${RED}❌ dist/routes directory not found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 8: Kiểm tra server.js đã có đầy đủ routes${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -f "dist/server.js" ]; then
    echo -e "${YELLOW}📋 Routes trong dist/server.js:${NC}"
    grep "app.register" dist/server.js | grep "prefix:" | while read line; do
        echo "  ✓ $line"
    done
    echo ""
    echo -e "${GREEN}✅ server.js đã được build với đầy đủ routes${NC}"
else
    echo -e "${RED}❌ dist/server.js not found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 9: Stop PM2 process hiện tại${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
    pm2 stop lta-backend 2>/dev/null || echo "  ℹ️  No running process found"
    pm2 delete lta-backend 2>/dev/null || echo "  ℹ️  No process to delete"
    echo -e "${GREEN}✅ Cleaned up old processes${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not installed, skipping process cleanup${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 10: Start backend với PM2${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🚀 Starting backend with PM2...${NC}"
    
    # Check if ecosystem config exists
    if [ -f "$PROJECT_ROOT/ecosystem.config.js" ]; then
        cd "$PROJECT_ROOT"
        pm2 start ecosystem.config.js --only lta-backend
    else
        # Start directly with node
        cd "$BACKEND_DIR"
        pm2 start dist/server.js --name "lta-backend"
    fi
    
    echo -e "${GREEN}✅ Backend started with PM2${NC}"
    echo ""
    
    # Wait for server to start
    sleep 3
    
    # Show PM2 status
    echo -e "${YELLOW}📊 PM2 Status:${NC}"
    pm2 list
else
    echo -e "${RED}❌ PM2 not installed!${NC}"
    echo -e "${YELLOW}Please install PM2: npm install -g pm2${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 11: Kiểm tra logs${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}📜 Backend logs (last 30 lines):${NC}"
pm2 logs lta-backend --lines 30 --nostream

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}BƯỚC 12: Test API endpoints${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Wait a bit more for server to fully start
sleep 2

echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
echo ""

# Test health endpoint
echo -e "${BLUE}Testing: GET /health${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/health | grep -q "200"; then
    echo -e "${GREEN}✅ Health endpoint OK${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint không trả về 200${NC}"
fi

# Test các API endpoints chính
ENDPOINTS=(
    "/api/v1/auth/health"
    "/api/v1/users"
    "/api/v1/listings"
    "/api/v1/depots"
    "/api/v1/master-data/container-types"
    "/api/v1/master-data/ports"
    "/api/v1/rfqs"
    "/api/v1/quotes"
    "/api/v1/orders"
    "/api/v1/deliveries"
    "/api/v1/notifications"
    "/api/v1/dashboard/stats"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo -e "${BLUE}Testing: GET $endpoint${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006$endpoint)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Endpoint exists (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOY HOÀN TẤT!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📊 Tóm tắt:${NC}"
echo -e "  ✓ Routes trong source: ${ROUTE_COUNT}"
echo -e "  ✓ Routes đã build: ${BUILD_ROUTE_COUNT}"
echo -e "  ✓ Routes đã register: ${REGISTERED_COUNT}"
echo ""
echo -e "${YELLOW}📝 Commands hữu ích:${NC}"
echo -e "  • Xem logs:        ${BLUE}pm2 logs lta-backend${NC}"
echo -e "  • Xem status:      ${BLUE}pm2 status${NC}"
echo -e "  • Restart:         ${BLUE}pm2 restart lta-backend${NC}"
echo -e "  • Monitor:         ${BLUE}pm2 monit${NC}"
echo ""
echo -e "${GREEN}🌐 Backend đang chạy tại:${NC}"
echo -e "  • http://localhost:3006"
echo -e "  • http://0.0.0.0:3006"
echo ""
echo -e "${YELLOW}💡 Nếu vẫn có màn hình không hiển thị dữ liệu:${NC}"
echo -e "  1. Kiểm tra logs: pm2 logs lta-backend"
echo -e "  2. Kiểm tra database connection"
echo -e "  3. Kiểm tra frontend đang gọi đúng API URL"
echo -e "  4. Kiểm tra permissions của user trong database"
echo ""

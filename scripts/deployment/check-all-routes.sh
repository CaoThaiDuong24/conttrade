#!/bin/bash

###############################################################################
# SCRIPT KIỂM TRA TẤT CẢ CÁC ROUTES ĐÃ ĐƯỢC BUILD VÀ HOẠT ĐỘNG
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     KIỂM TRA TẤT CẢ CÁC ROUTES                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
BACKEND_DIR="$PROJECT_ROOT/backend"

cd "$BACKEND_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}1. KIỂM TRA ROUTES TRONG SOURCE CODE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📂 Routes trong src/routes/:${NC}"
find src/routes -type f -name "*.ts" -not -path "*/node_modules/*" | sort | nl -w2 -s'. '

SOURCE_COUNT=$(find src/routes -type f -name "*.ts" -not -path "*/node_modules/*" | wc -l)
echo ""
echo -e "${GREEN}📊 Tổng số: ${SOURCE_COUNT} route files${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}2. KIỂM TRA ROUTES ĐÃ BUILD${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -d "dist/routes" ]; then
    echo -e "${YELLOW}📂 Routes trong dist/routes/:${NC}"
    find dist/routes -type f -name "*.js" | sort | nl -w2 -s'. '
    
    BUILD_COUNT=$(find dist/routes -type f -name "*.js" | wc -l)
    echo ""
    echo -e "${GREEN}📊 Tổng số: ${BUILD_COUNT} route files đã build${NC}"
    
    if [ "$SOURCE_COUNT" -eq "$BUILD_COUNT" ]; then
        echo -e "${GREEN}✅ Tất cả routes đã được build!${NC}"
    else
        echo -e "${RED}⚠️  Thiếu $(($SOURCE_COUNT - $BUILD_COUNT)) routes chưa được build!${NC}"
    fi
else
    echo -e "${RED}❌ dist/routes không tồn tại! Backend chưa được build.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}3. KIỂM TRA ROUTES ĐÃ REGISTER TRONG SERVER.TS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📋 Routes đã register (src/server.ts):${NC}"
grep "app.register" src/server.ts | grep -v "^[[:space:]]*\/\/" | grep "prefix:" | nl -w2 -s'. '

REGISTERED_COUNT=$(grep "app.register" src/server.ts | grep -v "^[[:space:]]*\/\/" | grep "prefix:" | wc -l)
echo ""
echo -e "${GREEN}📊 Tổng số: ${REGISTERED_COUNT} routes đã register${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}4. KIỂM TRA API ENDPOINTS ĐANG CHẠY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if server is running
if ! curl -s http://localhost:3006/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend không chạy! Vui lòng start backend trước.${NC}"
    echo -e "${YELLOW}💡 Chạy: pm2 start ecosystem.config.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend đang chạy${NC}"
echo ""

# Test all main endpoints
declare -a ENDPOINTS=(
    "GET|/health|Health check"
    "GET|/api/v1/auth/health|Auth health"
    "GET|/api/v1/users|Users list"
    "GET|/api/v1/listings|Listings list"
    "GET|/api/v1/admin/users|Admin users"
    "GET|/api/v1/depots|Depots list"
    "GET|/api/v1/master-data/container-types|Container types"
    "GET|/api/v1/master-data/ports|Ports list"
    "GET|/api/v1/master-data/currencies|Currencies"
    "GET|/api/v1/master-data/incoterms|Incoterms"
    "GET|/api/v1/master-data/payment-terms|Payment terms"
    "GET|/api/v1/rfqs|RFQs list"
    "GET|/api/v1/quotes|Quotes list"
    "GET|/api/v1/orders|Orders list"
    "GET|/api/v1/deliveries|Deliveries list"
    "GET|/api/v1/disputes|Disputes list"
    "GET|/api/v1/notifications|Notifications"
    "GET|/api/v1/messages|Messages"
    "GET|/api/v1/favorites|Favorites"
    "GET|/api/v1/reviews|Reviews"
    "GET|/api/v1/payments|Payments"
    "GET|/api/v1/dashboard/stats|Dashboard stats"
)

echo -e "${YELLOW}🧪 Testing API Endpoints:${NC}"
echo ""

OK_COUNT=0
AUTH_COUNT=0
ERROR_COUNT=0

for endpoint_info in "${ENDPOINTS[@]}"; do
    IFS='|' read -r METHOD ENDPOINT DESC <<< "$endpoint_info"
    
    printf "%-8s %-45s " "$METHOD" "$ENDPOINT"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $METHOD http://localhost:3006$ENDPOINT)
    
    case $HTTP_CODE in
        200)
            echo -e "${GREEN}✅ OK (200)${NC}"
            ((OK_COUNT++))
            ;;
        401)
            echo -e "${YELLOW}🔐 Auth Required (401)${NC}"
            ((AUTH_COUNT++))
            ;;
        404)
            echo -e "${RED}❌ Not Found (404)${NC}"
            ((ERROR_COUNT++))
            ;;
        500)
            echo -e "${RED}❌ Server Error (500)${NC}"
            ((ERROR_COUNT++))
            ;;
        *)
            echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
            ;;
    esac
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}5. TÓM TẮT KẾT QUẢ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_ENDPOINTS=${#ENDPOINTS[@]}

echo -e "${CYAN}📊 THỐNG KÊ ROUTES:${NC}"
echo -e "  • Routes trong source:     ${SOURCE_COUNT}"
echo -e "  • Routes đã build:         ${BUILD_COUNT}"
echo -e "  • Routes đã register:      ${REGISTERED_COUNT}"
echo ""

echo -e "${CYAN}📊 THỐNG KÊ ENDPOINTS:${NC}"
echo -e "  • Tổng số endpoints test:  ${TOTAL_ENDPOINTS}"
echo -e "  • ${GREEN}✅ Hoạt động OK:           ${OK_COUNT}${NC}"
echo -e "  • ${YELLOW}🔐 Cần authentication:     ${AUTH_COUNT}${NC}"
echo -e "  • ${RED}❌ Có lỗi:                 ${ERROR_COUNT}${NC}"
echo ""

# Calculate health percentage
WORKING=$((OK_COUNT + AUTH_COUNT))
PERCENTAGE=$((WORKING * 100 / TOTAL_ENDPOINTS))

echo -e "${CYAN}🎯 TÌNH TRẠNG TỔNG QUAN:${NC}"
if [ $PERCENTAGE -ge 90 ]; then
    echo -e "  ${GREEN}✅ EXCELLENT: ${PERCENTAGE}% endpoints hoạt động tốt${NC}"
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "  ${YELLOW}⚠️  GOOD: ${PERCENTAGE}% endpoints hoạt động${NC}"
else
    echo -e "  ${RED}❌ POOR: Chỉ ${PERCENTAGE}% endpoints hoạt động${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}6. KHUYẾN NGHỊ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERROR_COUNT -gt 0 ]; then
    echo -e "${YELLOW}💡 Phát hiện có lỗi:${NC}"
    echo -e "  1. Kiểm tra logs: ${BLUE}pm2 logs lta-backend${NC}"
    echo -e "  2. Kiểm tra database connection"
    echo -e "  3. Kiểm tra Prisma schema và migrations"
    echo -e "  4. Rebuild backend: ${BLUE}bash scripts/deployment/full-backend-deploy.sh${NC}"
elif [ $AUTH_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Tất cả endpoints hoạt động bình thường!${NC}"
    echo -e "${YELLOW}🔐 Một số endpoints yêu cầu authentication (401) là bình thường.${NC}"
else
    echo -e "${GREEN}🎉 PERFECT! Tất cả endpoints hoạt động tốt!${NC}"
fi

echo ""
echo -e "${CYAN}📝 Lệnh hữu ích:${NC}"
echo -e "  • Xem logs realtime:    ${BLUE}pm2 logs lta-backend --lines 100${NC}"
echo -e "  • Test endpoint cụ thể: ${BLUE}curl -v http://localhost:3006/api/v1/[endpoint]${NC}"
echo -e "  • Restart backend:      ${BLUE}pm2 restart lta-backend${NC}"
echo ""

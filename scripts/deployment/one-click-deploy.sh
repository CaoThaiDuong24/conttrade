#!/bin/bash

###############################################################################
# ONE-CLICK DEPLOY - DEPLOY TOÀN BỘ LÊN SERVER
# Script tổng hợp để deploy backend + frontend đầy đủ
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

echo -e "${MAGENTA}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     ██████╗ ███╗   ██╗███████╗     ██████╗██╗     ██╗ ██████╗██╗  ║
║    ██╔═══██╗████╗  ██║██╔════╝    ██╔════╝██║     ██║██╔════╝██║  ║
║    ██║   ██║██╔██╗ ██║█████╗█████╗██║     ██║     ██║██║     ██║  ║
║    ██║   ██║██║╚██╗██║██╔══╝╚════╝██║     ██║     ██║██║     ██║  ║
║    ╚██████╔╝██║ ╚████║███████╗    ╚██████╗███████╗██║╚██████╗██║  ║
║     ╚═════╝ ╚═╝  ╚═══╝╚══════╝     ╚═════╝╚══════╝╚═╝ ╚═════╝╚═╝  ║
║                                                                    ║
║                DEPLOY TOÀN BỘ LÊN SERVER                           ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo ""
echo -e "${CYAN}📂 Project: ${PROJECT_ROOT}${NC}"
echo -e "${CYAN}🕐 Started at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Menu
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Chọn loại deploy:                                        ║${NC}"
echo -e "${YELLOW}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  ${GREEN}1${YELLOW}) 🔥 Full Deploy     - Deploy toàn bộ backend + frontend  ║${NC}"
echo -e "${YELLOW}║  ${GREEN}2${YELLOW}) 🔧 Backend Only    - Deploy và fix backend             ║${NC}"
echo -e "${YELLOW}║  ${GREEN}3${YELLOW}) 🎨 Frontend Only   - Deploy frontend                   ║${NC}"
echo -e "${YELLOW}║  ${GREEN}4${YELLOW}) 🩹 Fix Issues      - Sửa lỗi màn hình không hiển thị   ║${NC}"
echo -e "${YELLOW}║  ${GREEN}5${YELLOW}) 🔍 Check Routes    - Kiểm tra tất cả routes            ║${NC}"
echo -e "${YELLOW}║  ${GREEN}6${YELLOW}) 📊 Full Diagnosis  - Chẩn đoán toàn diện              ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "$(echo -e ${CYAN}Nhập lựa chọn của bạn [1-6]: ${NC})" choice
echo ""

case $choice in
    1)
        echo -e "${GREEN}🔥 Starting FULL DEPLOY...${NC}"
        echo ""
        
        # Step 1: Deploy Backend
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}PHASE 1/3: DEPLOY BACKEND${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        bash "$SCRIPT_DIR/full-backend-deploy.sh"
        
        echo ""
        read -p "$(echo -e ${YELLOW}Backend deployed. Press ENTER to continue to frontend...${NC})"
        echo ""
        
        # Step 2: Deploy Frontend
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}PHASE 2/3: DEPLOY FRONTEND${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        
        cd "$PROJECT_ROOT/frontend"
        
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}🔨 Building frontend...${NC}"
        npm run build
        
        echo -e "${YELLOW}🔄 Restarting frontend with PM2...${NC}"
        pm2 restart lta-frontend || pm2 start npm --name "lta-frontend" -- start
        
        echo -e "${GREEN}✅ Frontend deployed${NC}"
        
        echo ""
        read -p "$(echo -e ${YELLOW}Frontend deployed. Press ENTER to run verification...${NC})"
        echo ""
        
        # Step 3: Verify
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}PHASE 3/3: VERIFICATION${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        
        bash "$SCRIPT_DIR/check-all-routes.sh"
        
        echo ""
        echo -e "${GREEN}🎉 FULL DEPLOY COMPLETED!${NC}"
        ;;
        
    2)
        echo -e "${GREEN}🔧 Starting BACKEND DEPLOY...${NC}"
        echo ""
        bash "$SCRIPT_DIR/full-backend-deploy.sh"
        ;;
        
    3)
        echo -e "${GREEN}🎨 Starting FRONTEND DEPLOY...${NC}"
        echo ""
        
        cd "$PROJECT_ROOT/frontend"
        
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}🔨 Building...${NC}"
        npm run build
        
        echo -e "${YELLOW}🔄 Restarting with PM2...${NC}"
        pm2 restart lta-frontend || pm2 start npm --name "lta-frontend" -- start
        
        echo -e "${GREEN}✅ Frontend deployed${NC}"
        pm2 list
        ;;
        
    4)
        echo -e "${GREEN}🩹 Starting FIX ISSUES...${NC}"
        echo ""
        bash "$SCRIPT_DIR/fix-display-issues.sh"
        ;;
        
    5)
        echo -e "${GREEN}🔍 Checking all routes...${NC}"
        echo ""
        bash "$SCRIPT_DIR/check-all-routes.sh"
        ;;
        
    6)
        echo -e "${GREEN}📊 Running FULL DIAGNOSIS...${NC}"
        echo ""
        
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}1. System Information${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${YELLOW}OS:${NC}"
        uname -a
        echo ""
        echo -e "${YELLOW}Node.js:${NC}"
        node --version
        npm --version
        echo ""
        echo -e "${YELLOW}PM2:${NC}"
        pm2 --version
        pm2 list
        echo ""
        
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}2. Database Status${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        sudo systemctl status postgresql --no-pager -l || true
        echo ""
        
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}3. Check All Routes${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        bash "$SCRIPT_DIR/check-all-routes.sh"
        echo ""
        
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}4. Recent Logs${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${YELLOW}Backend logs:${NC}"
        pm2 logs lta-backend --lines 50 --nostream || true
        echo ""
        echo -e "${YELLOW}Frontend logs:${NC}"
        pm2 logs lta-frontend --lines 50 --nostream || true
        echo ""
        
        echo -e "${GREEN}📊 Full diagnosis completed${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    DEPLOY SUMMARY                          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Operation completed successfully!${NC}"
echo -e "${CYAN}🕐 Finished at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  • View status:    ${BLUE}pm2 status${NC}"
echo -e "  • View logs:      ${BLUE}pm2 logs${NC}"
echo -e "  • Monitor:        ${BLUE}pm2 monit${NC}"
echo ""
echo -e "${GREEN}🌐 Access your application:${NC}"
echo -e "  • Frontend:       ${BLUE}http://localhost:3000${NC}"
echo -e "  • Backend API:    ${BLUE}http://localhost:3006${NC}"
echo -e "  • API Health:     ${BLUE}http://localhost:3006/health${NC}"
echo ""

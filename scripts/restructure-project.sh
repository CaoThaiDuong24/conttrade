#!/bin/bash

# Script để tái cấu trúc project từ cấu trúc cũ sang mới
# Chuyển từ: Web/{app,components,lib,...,backend}
# Sang: {frontend,backend}

set -e

echo "🔄 Starting project restructure..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Backup confirmation
echo -e "${YELLOW}⚠️  WARNING: This will restructure your project!${NC}"
echo -e "${YELLOW}Make sure you have committed your changes to git.${NC}"
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restructure cancelled."
    exit 1
fi

# Create frontend directory
echo -e "${BLUE}Creating frontend directory...${NC}"
mkdir -p frontend

# Move frontend files to frontend/
echo -e "${BLUE}Moving frontend files...${NC}"

# Core Next.js files
mv app/ frontend/ 2>/dev/null || echo "app/ already moved"
mv components/ frontend/ 2>/dev/null || echo "components/ already moved"
mv hooks/ frontend/ 2>/dev/null || echo "hooks/ already moved"
mv lib/ frontend/ 2>/dev/null || echo "lib/ already moved"
mv types/ frontend/ 2>/dev/null || echo "types/ already moved"
mv messages/ frontend/ 2>/dev/null || echo "messages/ already moved"
mv public/ frontend/ 2>/dev/null || echo "public/ already moved"
mv styles/ frontend/ 2>/dev/null || echo "styles/ already moved"
mv i18n/ frontend/ 2>/dev/null || echo "i18n/ already moved"

# Config files
cp package.json frontend/ 2>/dev/null || echo "package.json already in frontend"
cp package-lock.json frontend/ 2>/dev/null || true
cp pnpm-lock.yaml frontend/ 2>/dev/null || true
cp next.config.mjs frontend/
cp tsconfig.json frontend/
cp postcss.config.mjs frontend/ 2>/dev/null || true
cp components.json frontend/ 2>/dev/null || true
cp middleware.ts frontend/ 2>/dev/null || true
cp next-env.d.ts frontend/ 2>/dev/null || true

# Environment files
cp .env.example frontend/ 2>/dev/null || true
cp .env.production.example frontend/ 2>/dev/null || true
cp .env frontend/ 2>/dev/null || true
cp .env.local frontend/ 2>/dev/null || true

# Backend is already in backend/ - just ensure structure
echo -e "${BLUE}Backend already in backend/ directory${NC}"

# Update frontend package.json name
cd frontend
if [ -f package.json ]; then
    # Update package name
    sed -i 's/"name": ".*"/"name": "lta-frontend"/' package.json 2>/dev/null || true
fi
cd ..

# Update backend package.json name (if needed)
cd backend
if [ -f package.json ]; then
    sed -i 's/"name": ".*"/"name": "lta-backend"/' package.json 2>/dev/null || true
fi
cd ..

# Create root-level scripts if not exist
mkdir -p scripts/deployment

echo -e "${GREEN}✅ Restructure completed!${NC}"
echo ""
echo "New structure:"
echo "  frontend/  - Next.js app"
echo "  backend/   - Fastify API"
echo "  scripts/   - Deployment scripts"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. cd frontend && npm install"
echo "2. cd backend && npm install"
echo "3. Update import paths if needed"
echo "4. Test both apps:"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Backend: cd backend && npm run dev"

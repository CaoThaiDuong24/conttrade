#!/bin/bash

# Health check script for monitoring

set -e

echo "🏥 Checking application health..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Backend
echo "Checking Backend API..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/api/v1/health || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Backend is down or unhealthy (HTTP $BACKEND_STATUS)${NC}"
fi

# Check Frontend
echo "Checking Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is healthy (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Frontend is down or unhealthy (HTTP $FRONTEND_STATUS)${NC}"
fi

# Check Database
echo "Checking Database..."
if pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database is down${NC}"
fi

# Check Disk Space
echo "Checking Disk Space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Disk usage: ${DISK_USAGE}% (Warning)${NC}"
else
    echo -e "${RED}❌ Disk usage: ${DISK_USAGE}% (Critical!)${NC}"
fi

# Check Memory
echo "Checking Memory..."
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ Memory usage: ${MEMORY_USAGE}%${NC}"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Memory usage: ${MEMORY_USAGE}% (Warning)${NC}"
else
    echo -e "${RED}❌ Memory usage: ${MEMORY_USAGE}% (Critical!)${NC}"
fi

echo ""
echo "Health check completed!"

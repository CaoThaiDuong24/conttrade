#!/bin/bash

# Deploy script for Ubuntu
# This script deploys the application using PM2

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed!${NC}"
    echo "Install it with: npm install -g pm2"
    exit 1
fi

# Build the application
echo -e "${BLUE}Building application...${NC}"
bash scripts/deployment/build.sh

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
cd backend
npx prisma migrate deploy
cd ..

# Stop existing PM2 processes
echo -e "${YELLOW}Stopping existing processes...${NC}"
pm2 stop ecosystem.config.js || true

# Delete old processes
pm2 delete ecosystem.config.js || true

# Start with PM2
echo -e "${BLUE}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
echo -e "${BLUE}Setting up PM2 startup...${NC}"
pm2 startup

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Application status:"
pm2 status

echo ""
echo "Useful commands:"
echo "  pm2 logs        - View logs"
echo "  pm2 status      - View status"
echo "  pm2 restart all - Restart all processes"
echo "  pm2 monit       - Monitor processes"

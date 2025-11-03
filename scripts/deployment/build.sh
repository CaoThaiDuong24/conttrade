#!/bin/bash

# Build script for Ubuntu deployment
# This script builds both frontend and backend

set -e

echo "🚀 Starting build process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f frontend/.env ]; then
    echo -e "${RED}❌ Frontend .env file not found!${NC}"
    echo "Please copy frontend/.env.example to frontend/.env and configure it"
    exit 1
fi

if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Backend .env file not found!${NC}"
    echo "Please copy backend/.env.example to backend/.env and configure it"
    exit 1
fi

# Build Backend
echo -e "${BLUE}📦 Building Backend...${NC}"
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm ci --production=false

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo -e "${GREEN}✅ Backend built successfully!${NC}"

cd ..

# Build Frontend
echo -e "${BLUE}📦 Building Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm ci --production=false

# Build Next.js
echo "Building Next.js..."
npm run build

echo -e "${GREEN}✅ Frontend built successfully!${NC}"

cd ..

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run database migrations: cd backend && npx prisma migrate deploy"
echo "2. Start the application: npm run start (or use PM2)"

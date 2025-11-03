#!/bin/bash

# Docker deployment script for Ubuntu

set -e

echo "🐳 Starting Docker deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
fi

if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found. Creating from backend/.env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please edit backend/.env file with your configuration${NC}"
fi

# Stop existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose build --no-cache

# Start containers
echo -e "${BLUE}Starting containers...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${BLUE}Waiting for database...${NC}"
sleep 10

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose exec backend npx prisma migrate deploy

echo -e "${GREEN}✅ Docker deployment completed!${NC}"
echo ""
echo "Container status:"
docker-compose ps

echo ""
echo "Useful commands:"
echo "  docker-compose logs -f           - View logs"
echo "  docker-compose ps                - View status"
echo "  docker-compose restart           - Restart all containers"
echo "  docker-compose exec backend sh   - Access backend container"
echo "  docker-compose exec frontend sh  - Access frontend container"

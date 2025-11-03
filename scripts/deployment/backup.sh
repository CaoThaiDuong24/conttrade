#!/bin/bash

# Backup script for database and uploads

set -e

echo "💾 Starting backup..."

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="i_contexchange"
DB_USER="postgres"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo -e "${BLUE}Backing up database...${NC}"
pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/db_backup_$DATE.sql"
echo -e "${GREEN}✅ Database backed up: db_backup_$DATE.sql${NC}"

# Backup uploads
echo -e "${BLUE}Backing up uploads...${NC}"
if [ -d "./backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C ./backend uploads
    echo -e "${GREEN}✅ Uploads backed up: uploads_backup_$DATE.tar.gz${NC}"
fi

# Compress old backups (older than 7 days)
echo -e "${BLUE}Cleaning old backups...${NC}"
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

# List backups
echo ""
echo "📁 Available backups:"
ls -lh "$BACKUP_DIR"

echo ""
echo -e "${GREEN}✅ Backup completed!${NC}"

#!/bin/bash

# Restore script for database and uploads

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 20250127_143000"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="./backups"
DB_NAME="i_contexchange"
DB_USER="postgres"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  WARNING: This will restore database and uploads from backup!${NC}"
echo -e "${YELLOW}Current data will be REPLACED!${NC}"
read -p "Are you sure? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Restore database
DB_BACKUP="$BACKUP_DIR/db_backup_$BACKUP_DATE.sql"
if [ -f "$DB_BACKUP" ]; then
    echo -e "${BLUE}Restoring database...${NC}"
    psql -U "$DB_USER" -d "$DB_NAME" < "$DB_BACKUP"
    echo -e "${GREEN}✅ Database restored from: $DB_BACKUP${NC}"
else
    echo -e "${RED}❌ Database backup not found: $DB_BACKUP${NC}"
fi

# Restore uploads
UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz"
if [ -f "$UPLOADS_BACKUP" ]; then
    echo -e "${BLUE}Restoring uploads...${NC}"
    rm -rf ./backend/uploads
    tar -xzf "$UPLOADS_BACKUP" -C ./backend
    echo -e "${GREEN}✅ Uploads restored from: $UPLOADS_BACKUP${NC}"
else
    echo -e "${RED}❌ Uploads backup not found: $UPLOADS_BACKUP${NC}"
fi

echo ""
echo -e "${GREEN}✅ Restore completed!${NC}"

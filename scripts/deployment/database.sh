#!/bin/bash

#####################################################################
# Database Management Script for LTA Project
# Backup, restore, and manage PostgreSQL database
#####################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOY_DIR="${DEPLOY_DIR:-/var/www/lta}"
BACKUP_DIR="${DEPLOY_DIR}/backups"
DB_NAME="i_contexchange"
DB_USER="postgres"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Create backup
create_backup() {
    log_info "Creating database backup..."
    
    mkdir -p ${BACKUP_DIR}
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    sudo -u postgres pg_dump ${DB_NAME} > ${BACKUP_FILE}
    
    # Compress backup
    gzip ${BACKUP_FILE}
    
    log_info "Backup created: ${BACKUP_FILE}.gz"
    log_info "Size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
    
    # Keep only last 30 backups
    cd ${BACKUP_DIR}
    ls -t db_backup_*.sql.gz | tail -n +31 | xargs -r rm
    
    log_info "Old backups cleaned up (keeping last 30)"
}

# List backups
list_backups() {
    log_info "Available backups:"
    
    if [ -d "${BACKUP_DIR}" ]; then
        ls -lh ${BACKUP_DIR}/db_backup_*.sql.gz 2>/dev/null || log_warn "No backups found"
    else
        log_warn "Backup directory does not exist"
    fi
}

# Restore backup
restore_backup() {
    list_backups
    
    echo ""
    read -p "Enter backup filename (e.g., db_backup_20250127_120000.sql.gz): " backup_file
    
    if [ -z "$backup_file" ]; then
        log_error "No backup file specified"
        return 1
    fi
    
    BACKUP_PATH="${BACKUP_DIR}/${backup_file}"
    
    if [ ! -f "${BACKUP_PATH}" ]; then
        log_error "Backup file not found: ${BACKUP_PATH}"
        return 1
    fi
    
    log_warn "This will OVERWRITE the current database!"
    log_warn "Current database: ${DB_NAME}"
    read -p "Are you absolutely sure? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        return 0
    fi
    
    # Create a safety backup first
    log_info "Creating safety backup before restore..."
    SAFETY_BACKUP="${BACKUP_DIR}/db_before_restore_$(date +%Y%m%d_%H%M%S).sql"
    sudo -u postgres pg_dump ${DB_NAME} > ${SAFETY_BACKUP}
    gzip ${SAFETY_BACKUP}
    log_info "Safety backup created: ${SAFETY_BACKUP}.gz"
    
    # Restore
    log_info "Restoring backup..."
    
    # Decompress if needed
    if [[ ${BACKUP_PATH} == *.gz ]]; then
        gunzip -c ${BACKUP_PATH} | sudo -u postgres psql ${DB_NAME}
    else
        sudo -u postgres psql ${DB_NAME} < ${BACKUP_PATH}
    fi
    
    log_info "Backup restored successfully!"
    log_warn "Don't forget to restart the application: sudo ./update-app.sh"
}

# Export database
export_database() {
    log_info "Exporting database..."
    
    read -p "Enter export filename (default: db_export_$(date +%Y%m%d).sql): " filename
    
    if [ -z "$filename" ]; then
        filename="db_export_$(date +%Y%m%d).sql"
    fi
    
    EXPORT_PATH="${BACKUP_DIR}/${filename}"
    
    sudo -u postgres pg_dump ${DB_NAME} > ${EXPORT_PATH}
    
    log_info "Database exported to: ${EXPORT_PATH}"
    log_info "Size: $(du -h ${EXPORT_PATH} | cut -f1)"
    
    read -p "Compress export? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gzip ${EXPORT_PATH}
        log_info "Compressed to: ${EXPORT_PATH}.gz"
    fi
}

# Run migrations
run_migrations() {
    log_info "Running Prisma migrations..."
    
    cd ${DEPLOY_DIR}/backend
    
    # Show pending migrations
    npx prisma migrate status
    
    echo ""
    read -p "Run migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate deploy
        log_info "Migrations completed"
    fi
}

# Reset database (DANGER!)
reset_database() {
    log_error "WARNING: This will DELETE ALL DATA!"
    read -p "Type 'DELETE ALL DATA' to confirm: " confirm
    
    if [ "$confirm" != "DELETE ALL DATA" ]; then
        log_info "Reset cancelled"
        return 0
    fi
    
    # Final confirmation
    read -p "Last chance! Type 'yes' to proceed: " final_confirm
    if [ "$final_confirm" != "yes" ]; then
        log_info "Reset cancelled"
        return 0
    fi
    
    log_info "Creating backup before reset..."
    create_backup
    
    log_info "Resetting database..."
    
    cd ${DEPLOY_DIR}/backend
    
    # Reset using Prisma
    npx prisma migrate reset --force
    
    log_info "Database reset completed"
}

# Database statistics
show_statistics() {
    log_info "Database Statistics:"
    
    sudo -u postgres psql -d ${DB_NAME} << EOF
-- Database size
SELECT pg_size_pretty(pg_database_size('${DB_NAME}')) as database_size;

-- Table counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 15;

-- Active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = '${DB_NAME}';

-- Recent queries
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 100) as query
FROM pg_stat_activity
WHERE datname = '${DB_NAME}'
ORDER BY query_start DESC
LIMIT 5;
EOF
}

# Clean old data
clean_old_data() {
    log_warn "This will remove old data based on retention policies"
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 0
    fi
    
    log_info "Cleaning old logs and temporary data..."
    
    sudo -u postgres psql -d ${DB_NAME} << EOF
-- Example: Delete logs older than 90 days
-- DELETE FROM logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum database
VACUUM ANALYZE;
EOF
    
    log_info "Cleanup completed"
}

# Interactive menu
show_menu() {
    echo ""
    echo "======================================"
    echo "DATABASE MANAGEMENT"
    echo "======================================"
    echo "1) Create Backup"
    echo "2) List Backups"
    echo "3) Restore Backup"
    echo "4) Export Database"
    echo "5) Run Migrations"
    echo "6) Show Statistics"
    echo "7) Clean Old Data"
    echo "8) Reset Database (DANGER!)"
    echo "0) Exit"
    echo "======================================"
}

# Main
main() {
    # Check if running as root or with sudo
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run with sudo"
        exit 1
    fi
    
    # Handle command line arguments
    case "$1" in
        backup)
            create_backup
            exit 0
            ;;
        list)
            list_backups
            exit 0
            ;;
        restore)
            restore_backup
            exit 0
            ;;
        export)
            export_database
            exit 0
            ;;
        migrate)
            run_migrations
            exit 0
            ;;
        stats)
            show_statistics
            exit 0
            ;;
    esac
    
    # Interactive mode
    while true; do
        show_menu
        read -p "Select option: " option
        
        case $option in
            1)
                create_backup
                ;;
            2)
                list_backups
                ;;
            3)
                restore_backup
                ;;
            4)
                export_database
                ;;
            5)
                run_migrations
                ;;
            6)
                show_statistics
                ;;
            7)
                clean_old_data
                ;;
            8)
                reset_database
                ;;
            0)
                echo "Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

main "$@"

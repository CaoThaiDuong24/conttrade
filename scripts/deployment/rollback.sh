#!/bin/bash

#####################################################################
# Rollback Script for LTA Project
# This script allows rolling back to a previous version
#####################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOY_DIR="${DEPLOY_DIR:-/var/www/lta}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
NODE_VERSION="${NODE_VERSION:-20}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# List recent commits
list_commits() {
    log_info "Recent commits:"
    cd ${DEPLOY_DIR}
    git log --oneline -10
}

# Rollback to specific commit
rollback() {
    local commit_hash=$1
    
    if [ -z "$commit_hash" ]; then
        log_error "Please provide a commit hash"
        exit 1
    fi
    
    log_warn "Rolling back to commit: ${commit_hash}"
    
    cd ${DEPLOY_DIR}
    sudo -u ${DEPLOY_USER} git checkout ${commit_hash}
    
    # Rebuild backend
    log_info "Rebuilding backend..."
    cd ${DEPLOY_DIR}/backend
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

pnpm install
npx prisma generate
pnpm run build
EOF
    
    # Rebuild frontend
    log_info "Rebuilding frontend..."
    cd ${DEPLOY_DIR}/frontend
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

pnpm install
pnpm run build
EOF
    
    # Restart PM2
    log_info "Restarting services..."
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

cd ${DEPLOY_DIR}
pm2 reload ecosystem.config.js
pm2 save
EOF
    
    log_info "Rollback completed!"
}

# Restore database backup
restore_database() {
    log_info "Available database backups:"
    ls -lh ${DEPLOY_DIR}/backups/db_backup_*.sql 2>/dev/null || echo "No backups found"
    
    read -p "Enter backup filename to restore (or press Enter to skip): " backup_file
    
    if [ ! -z "$backup_file" ]; then
        local backup_path="${DEPLOY_DIR}/backups/${backup_file}"
        
        if [ -f "$backup_path" ]; then
            log_warn "This will overwrite the current database!"
            read -p "Are you sure? (yes/no): " confirm
            
            if [ "$confirm" = "yes" ]; then
                sudo -u postgres psql i_contexchange < ${backup_path}
                log_info "Database restored from ${backup_file}"
            fi
        else
            log_error "Backup file not found: ${backup_path}"
        fi
    fi
}

# Main
main() {
    log_warn "=== LTA Project Rollback Tool ==="
    
    list_commits
    
    echo ""
    read -p "Enter commit hash to rollback to: " commit
    
    if [ ! -z "$commit" ]; then
        rollback $commit
        
        echo ""
        read -p "Do you want to restore a database backup? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            restore_database
        fi
    else
        log_error "No commit hash provided"
        exit 1
    fi
}

main "$@"

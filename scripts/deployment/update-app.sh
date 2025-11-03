#!/bin/bash

#####################################################################
# Update/Redeploy Script for LTA Project
# This script updates the application with zero-downtime deployment
#####################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/lta}"
BRANCH="${BRANCH:-master}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
NODE_VERSION="${NODE_VERSION:-20}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Backup database
backup_database() {
    log_info "Backing up database..."
    
    BACKUP_DIR="${DEPLOY_DIR}/backups"
    mkdir -p ${BACKUP_DIR}
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    sudo -u postgres pg_dump i_contexchange > ${BACKUP_FILE}
    
    # Keep only last 7 backups
    cd ${BACKUP_DIR}
    ls -t db_backup_*.sql | tail -n +8 | xargs -r rm
    
    log_info "Database backed up to ${BACKUP_FILE}"
}

# Pull latest code
update_code() {
    log_info "Pulling latest code from ${BRANCH}..."
    
    cd ${DEPLOY_DIR}
    sudo -u ${DEPLOY_USER} git fetch origin
    sudo -u ${DEPLOY_USER} git checkout ${BRANCH}
    sudo -u ${DEPLOY_USER} git pull origin ${BRANCH}
    
    log_info "Code updated"
}

# Update backend
update_backend() {
    log_info "Updating backend..."
    
    cd ${DEPLOY_DIR}/backend
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

# Install dependencies
pnpm install --production=false

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
pnpm run build
EOF
    
    log_info "Backend updated"
}

# Update frontend
update_frontend() {
    log_info "Updating frontend..."
    
    cd ${DEPLOY_DIR}/frontend
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

# Install dependencies
pnpm install --production=false

# Build Next.js
pnpm run build
EOF
    
    log_info "Frontend updated"
}

# Reload PM2
reload_pm2() {
    log_info "Reloading PM2 processes..."
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

cd ${DEPLOY_DIR}

# Reload with zero-downtime
pm2 reload ecosystem.config.js

# Save configuration
pm2 save
EOF
    
    log_info "PM2 processes reloaded"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    sleep 5
    
    # Check backend
    if curl -f http://localhost:3006/api/v1/health > /dev/null 2>&1; then
        log_info "✓ Backend is healthy"
    else
        log_warn "✗ Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "✓ Frontend is healthy"
    else
        log_warn "✗ Frontend health check failed"
    fi
}

# Show logs
show_logs() {
    log_info "Recent PM2 logs:"
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

pm2 logs --lines 20 --nostream
EOF
}

# Main update process
main() {
    log_info "Starting application update..."
    
    backup_database
    update_code
    update_backend
    update_frontend
    reload_pm2
    health_check
    
    log_info "Update completed successfully!"
    
    read -p "Show recent logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

main "$@"

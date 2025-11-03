#!/bin/bash

###############################################################################
# LTA Project - Server Deployment Script
# This script runs on the Ubuntu server to deploy/update the application
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/lta}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-i_contexchange}"
BACKEND_PORT="${BACKEND_PORT:-3006}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

###############################################################################
# Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

backup_database() {
    log_info "Creating database backup..."
    BACKUP_DIR="$DEPLOY_PATH/backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
        log_success "Database backed up to $BACKUP_FILE"
        # Keep only last 7 backups
        ls -t "$BACKUP_DIR"/db_backup_*.sql | tail -n +8 | xargs -r rm
    else
        log_warning "Database backup failed or database doesn't exist yet"
    fi
}

pull_latest_code() {
    log_info "Pulling latest code from GitHub..."
    cd "$DEPLOY_PATH"
    
    # Stash any local changes
    git stash save "Auto-stash before deployment $(date +%Y%m%d_%H%M%S)" || true
    
    # Pull latest code
    git fetch origin
    git reset --hard origin/master
    
    log_success "Code updated successfully"
}

install_dependencies() {
    log_info "Installing/updating dependencies..."
    
    # Backend dependencies
    cd "$DEPLOY_PATH/backend"
    log_info "Installing backend dependencies..."
    npm install --production
    
    # Frontend dependencies
    cd "$DEPLOY_PATH/frontend"
    log_info "Installing frontend dependencies..."
    npm install --production
    
    log_success "Dependencies installed"
}

run_migrations() {
    log_info "Running database migrations..."
    cd "$DEPLOY_PATH/backend"
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    log_success "Database migrations completed"
}

build_backend() {
    log_info "Building backend..."
    cd "$DEPLOY_PATH/backend"
    
    # Clean previous build
    rm -rf dist
    
    # Build
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Backend build failed - dist directory not created"
        exit 1
    fi
    
    log_success "Backend built successfully"
}

build_frontend() {
    log_info "Building frontend..."
    cd "$DEPLOY_PATH/frontend"
    
    # Clean previous build
    rm -rf .next
    
    # Build
    npm run build
    
    if [ ! -d ".next" ]; then
        log_error "Frontend build failed - .next directory not created"
        exit 1
    fi
    
    log_success "Frontend built successfully"
}

restart_services() {
    log_info "Restarting services with PM2..."
    cd "$DEPLOY_PATH"
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Please install it: npm install -g pm2"
        exit 1
    fi
    
    # Check if ecosystem.config.js exists
    if [ ! -f "ecosystem.config.js" ]; then
        log_error "ecosystem.config.js not found"
        exit 1
    fi
    
    # Reload or start services
    if pm2 list | grep -q "lta-backend"; then
        log_info "Reloading existing PM2 processes..."
        pm2 reload ecosystem.config.js --update-env
    else
        log_info "Starting PM2 processes for the first time..."
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    log_success "Services restarted"
}

check_services() {
    log_info "Checking service status..."
    
    sleep 5  # Wait for services to start
    
    # Check PM2 status
    pm2 list
    
    # Check if backend is responding
    if curl -f -s "http://localhost:$BACKEND_PORT/health" > /dev/null; then
        log_success "Backend is responding on port $BACKEND_PORT"
    else
        log_warning "Backend may not be responding on port $BACKEND_PORT"
    fi
    
    # Check if frontend is responding
    if curl -f -s "http://localhost:$FRONTEND_PORT" > /dev/null; then
        log_success "Frontend is responding on port $FRONTEND_PORT"
    else
        log_warning "Frontend may not be responding on port $FRONTEND_PORT"
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    
    # Clean old logs (keep last 30 days)
    find "$DEPLOY_PATH/backend/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

###############################################################################
# Main Deployment Process
###############################################################################

main() {
    echo ""
    log_info "=========================================="
    log_info "  LTA Project Deployment Script"
    log_info "=========================================="
    echo ""
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    check_command "node"
    check_command "npm"
    check_command "git"
    check_command "pm2"
    
    # Check if deploy path exists
    if [ ! -d "$DEPLOY_PATH" ]; then
        log_error "Deploy path does not exist: $DEPLOY_PATH"
        log_error "Please clone the repository first:"
        log_error "  sudo git clone https://github.com/CaoThaiDuong24/conttrade.git $DEPLOY_PATH"
        exit 1
    fi
    
    # Start deployment
    log_info "Starting deployment to: $DEPLOY_PATH"
    echo ""
    
    # Backup database
    backup_database
    echo ""
    
    # Pull latest code
    pull_latest_code
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Run migrations
    run_migrations
    echo ""
    
    # Build backend
    build_backend
    echo ""
    
    # Build frontend
    build_frontend
    echo ""
    
    # Restart services
    restart_services
    echo ""
    
    # Check services
    check_services
    echo ""
    
    # Cleanup
    cleanup
    echo ""
    
    log_success "=========================================="
    log_success "  Deployment Completed Successfully! 🎉"
    log_success "=========================================="
    echo ""
    log_info "Application is running at:"
    log_info "  Frontend: http://your-server-ip:$FRONTEND_PORT"
    log_info "  Backend:  http://your-server-ip:$BACKEND_PORT"
    echo ""
    log_info "Useful commands:"
    log_info "  View logs:    pm2 logs"
    log_info "  Monitor:      pm2 monit"
    log_info "  Restart:      pm2 restart all"
    log_info "  Status:       pm2 status"
    echo ""
}

# Run main function
main "$@"

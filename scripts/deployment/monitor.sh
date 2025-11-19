#!/bin/bash

#####################################################################
# Monitoring Script for LTA Project
# This script checks health and provides monitoring information
#####################################################################

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

# Check service status
check_services() {
    echo "======================================"
    echo "SERVICE STATUS"
    echo "======================================"
    
    # PostgreSQL
    if systemctl is-active --quiet postgresql; then
        log_info "✓ PostgreSQL: Running"
    else
        log_error "✗ PostgreSQL: Stopped"
    fi
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        log_info "✓ Nginx: Running"
    else
        log_error "✗ Nginx: Stopped"
    fi
    
    # PM2 processes
    echo ""
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION} 2>/dev/null

pm2 list
EOF
}

# Check application health
check_health() {
    echo ""
    echo "======================================"
    echo "APPLICATION HEALTH"
    echo "======================================"
    
    # Backend API
    if curl -f -s http://localhost:3006/api/v1/health > /dev/null 2>&1; then
        log_info "✓ Backend API (port 3006): Healthy"
    else
        log_error "✗ Backend API (port 3006): Unhealthy"
    fi
    
    # Frontend
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "✓ Frontend (port 3000): Healthy"
    else
        log_error "✗ Frontend (port 3000): Unhealthy"
    fi
    
    # Database connection
    if sudo -u postgres psql -d i_contexchange -c "SELECT 1;" > /dev/null 2>&1; then
        log_info "✓ Database: Connected"
    else
        log_error "✗ Database: Connection failed"
    fi
}

# Show disk usage
check_disk() {
    echo ""
    echo "======================================"
    echo "DISK USAGE"
    echo "======================================"
    
    df -h / | tail -1
    
    echo ""
    echo "Project directory size:"
    du -sh ${DEPLOY_DIR}
    
    echo ""
    echo "Database size:"
    sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('i_contexchange'));"
    
    echo ""
    echo "Uploads directory:"
    du -sh ${DEPLOY_DIR}/backend/uploads
    
    echo ""
    echo "Logs directory:"
    du -sh ${DEPLOY_DIR}/backend/logs
}

# Show memory usage
check_memory() {
    echo ""
    echo "======================================"
    echo "MEMORY USAGE"
    echo "======================================"
    
    free -h
    
    echo ""
    echo "Top memory consuming processes:"
    ps aux --sort=-%mem | head -6
}

# Show recent logs
show_logs() {
    echo ""
    echo "======================================"
    echo "RECENT LOGS (last 20 lines)"
    echo "======================================"
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION} 2>/dev/null

pm2 logs --lines 20 --nostream
EOF
}

# Check SSL certificate
check_ssl() {
    echo ""
    echo "======================================"
    echo "SSL CERTIFICATE"
    echo "======================================"
    
    if [ -d "/etc/letsencrypt/live" ]; then
        for cert_dir in /etc/letsencrypt/live/*/; do
            if [ -d "$cert_dir" ]; then
                domain=$(basename "$cert_dir")
                if [ -f "${cert_dir}cert.pem" ]; then
                    expiry=$(openssl x509 -enddate -noout -in "${cert_dir}cert.pem" | cut -d= -f2)
                    log_info "Domain: $domain"
                    echo "  Expiry: $expiry"
                fi
            fi
        done
    else
        log_warn "No SSL certificates found"
    fi
}

# Check nginx access
check_nginx_stats() {
    echo ""
    echo "======================================"
    echo "NGINX ACCESS STATS (last 100 requests)"
    echo "======================================"
    
    if [ -f "/var/log/nginx/access.log" ]; then
        echo "Status codes:"
        tail -100 /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -rn
        
        echo ""
        echo "Top 5 IPs:"
        tail -100 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -5
    else
        log_warn "Nginx access log not found"
    fi
}

# Database stats
check_database_stats() {
    echo ""
    echo "======================================"
    echo "DATABASE STATISTICS"
    echo "======================================"
    
    sudo -u postgres psql -d i_contexchange << EOF
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Connection count
SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname = 'i_contexchange';
EOF
}

# Interactive menu
show_menu() {
    echo ""
    echo "======================================"
    echo "LTA PROJECT MONITORING"
    echo "======================================"
    echo "1) Full Status Report"
    echo "2) Check Services Only"
    echo "3) Check Application Health"
    echo "4) Check Disk Usage"
    echo "5) Check Memory Usage"
    echo "6) Show Recent Logs"
    echo "7) Check SSL Certificate"
    echo "8) Nginx Statistics"
    echo "9) Database Statistics"
    echo "0) Exit"
    echo "======================================"
}

# Main
main() {
    if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
        check_services
        check_health
        check_disk
        check_memory
        check_ssl
        exit 0
    fi
    
    while true; do
        show_menu
        read -p "Select option: " option
        
        case $option in
            1)
                check_services
                check_health
                check_disk
                check_memory
                check_ssl
                ;;
            2)
                check_services
                ;;
            3)
                check_health
                ;;
            4)
                check_disk
                ;;
            5)
                check_memory
                ;;
            6)
                show_logs
                ;;
            7)
                check_ssl
                ;;
            8)
                check_nginx_stats
                ;;
            9)
                check_database_stats
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

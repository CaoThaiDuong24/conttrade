#!/bin/bash

#####################################################################
# SSL Certificate Setup Script
# Install and configure Let's Encrypt SSL certificates
#####################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

echo "=========================================="
echo "SSL Certificate Setup"
echo "=========================================="
echo ""

# Get domain information
read -p "Enter your domain name (e.g., example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    log_error "Domain name is required"
    exit 1
fi

read -p "Include www subdomain? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DOMAINS="-d $DOMAIN -d www.$DOMAIN"
else
    DOMAINS="-d $DOMAIN"
fi

read -p "Enter your email address: " EMAIL

if [ -z "$EMAIL" ]; then
    log_error "Email is required"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log_info "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Backup current nginx config
log_info "Backing up Nginx configuration..."
cp /etc/nginx/sites-available/lta /etc/nginx/sites-available/lta.backup

# Update nginx config with domain
log_info "Updating Nginx configuration..."
sed -i "s/server_name _;/server_name $DOMAIN www.$DOMAIN;/g" /etc/nginx/sites-available/lta

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# Obtain certificate
log_info "Obtaining SSL certificate from Let's Encrypt..."

certbot --nginx $DOMAINS \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect \
    --hsts \
    --staple-ocsp

if [ $? -eq 0 ]; then
    log_info "✓ SSL certificate successfully installed!"
    
    # Setup auto-renewal
    log_info "Setting up automatic renewal..."
    
    # Test renewal
    certbot renew --dry-run
    
    # Add renewal cron job if not exists
    CRON_CMD="0 0,12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'"
    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -
    
    log_info "✓ Auto-renewal configured"
    
    echo ""
    echo "=========================================="
    echo "SSL Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Your site is now secured with HTTPS:"
    echo "  https://$DOMAIN"
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  https://www.$DOMAIN"
    fi
    echo ""
    echo "Certificate will auto-renew every 60 days"
    echo ""
    echo "Certificate details:"
    certbot certificates
    echo ""
    
else
    log_error "Failed to obtain SSL certificate"
    
    # Restore backup
    log_info "Restoring nginx configuration..."
    mv /etc/nginx/sites-available/lta.backup /etc/nginx/sites-available/lta
    systemctl reload nginx
    
    echo ""
    log_warn "Common issues:"
    echo "1. Make sure your domain DNS points to this server's IP"
    echo "2. Ensure ports 80 and 443 are open in firewall"
    echo "3. Check if nginx is running: systemctl status nginx"
    echo ""
    exit 1
fi

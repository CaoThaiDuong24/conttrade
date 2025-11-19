#!/bin/bash

#####################################################################
# Ubuntu Deployment Script for LTA Project
# This script automates the deployment process on Ubuntu server
#####################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="lta-project"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/lta}"
REPO_URL="${REPO_URL:-https://github.com/CaoThaiDuong24/conttrade.git}"
BRANCH="${BRANCH:-master}"
NODE_VERSION="${NODE_VERSION:-20}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

install_dependencies() {
    log_info "Installing system dependencies..."
    
    apt-get update
    apt-get install -y \
        curl \
        git \
        build-essential \
        nginx \
        postgresql \
        postgresql-contrib \
        certbot \
        python3-certbot-nginx \
        ufw
    
    log_info "System dependencies installed"
}

install_nodejs() {
    log_info "Installing Node.js ${NODE_VERSION}..."
    
    # Install NVM
    if [ ! -d "/root/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="/root/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install and use Node.js
    nvm install ${NODE_VERSION}
    nvm use ${NODE_VERSION}
    nvm alias default ${NODE_VERSION}
    
    # Install pnpm and PM2 globally
    npm install -g pnpm pm2
    
    log_info "Node.js ${NODE_VERSION} installed"
}

setup_postgresql() {
    log_info "Setting up PostgreSQL..."
    
    # Start PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql << EOF
-- Create database if not exists
SELECT 'CREATE DATABASE i_contexchange'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'i_contexchange')\gexec

-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'lta_user') THEN
        CREATE USER lta_user WITH PASSWORD '${DB_PASSWORD:-changeme123}';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO lta_user;
\c i_contexchange
GRANT ALL ON SCHEMA public TO lta_user;
EOF
    
    log_info "PostgreSQL setup completed"
}

create_deploy_user() {
    log_info "Creating deployment user..."
    
    if ! id "${DEPLOY_USER}" &>/dev/null; then
        useradd -m -s /bin/bash ${DEPLOY_USER}
        usermod -aG sudo ${DEPLOY_USER}
        log_info "User ${DEPLOY_USER} created"
    else
        log_warn "User ${DEPLOY_USER} already exists"
    fi
}

setup_directory() {
    log_info "Setting up project directory..."
    
    mkdir -p ${DEPLOY_DIR}
    mkdir -p ${DEPLOY_DIR}/backend/uploads
    mkdir -p ${DEPLOY_DIR}/backend/logs
    mkdir -p ${DEPLOY_DIR}/frontend/logs
    
    chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}
    
    log_info "Project directory created at ${DEPLOY_DIR}"
}

clone_repository() {
    log_info "Cloning repository..."
    
    if [ -d "${DEPLOY_DIR}/.git" ]; then
        log_warn "Repository already exists, pulling latest changes..."
        cd ${DEPLOY_DIR}
        sudo -u ${DEPLOY_USER} git pull origin ${BRANCH}
    else
        sudo -u ${DEPLOY_USER} git clone -b ${BRANCH} ${REPO_URL} ${DEPLOY_DIR}
    fi
    
    log_info "Repository cloned/updated"
}

setup_environment() {
    log_info "Setting up environment variables..."
    
    # Backend .env
    cat > ${DEPLOY_DIR}/backend/.env << EOF
NODE_ENV=production
PORT=3006
HOST=0.0.0.0
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD:-changeme123}@localhost:5432/i_contexchange?schema=public
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
EOF
    
    # Frontend .env
    cat > ${DEPLOY_DIR}/frontend/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD:-changeme123}@localhost:5432/i_contexchange?schema=public
EOF
    
    chown ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}/backend/.env
    chown ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}/frontend/.env.production
    
    log_info "Environment variables configured"
}

build_backend() {
    log_info "Building backend..."
    
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

# Build TypeScript
pnpm run build
EOF
    
    log_info "Backend built successfully"
}

build_frontend() {
    log_info "Building frontend..."
    
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
    
    log_info "Frontend built successfully"
}

setup_pm2() {
    log_info "Setting up PM2..."
    
    cd ${DEPLOY_DIR}
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

# Stop existing processes
pm2 delete all || true

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u ${DEPLOY_USER} --hp /home/${DEPLOY_USER}
EOF
    
    # Run the startup command as root
    env PATH=$PATH:/root/.nvm/versions/node/v${NODE_VERSION}.*/bin pm2 startup systemd -u ${DEPLOY_USER} --hp /home/${DEPLOY_USER}
    
    log_info "PM2 configured"
}

setup_nginx() {
    log_info "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/lta << 'EOF'
# Upstream definitions
upstream backend {
    server localhost:3006;
    keepalive 64;
}

upstream frontend {
    server localhost:3000;
    keepalive 64;
}

# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (uncomment after obtaining certificates)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;
    # ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Client upload size limit
    client_max_body_size 50M;

    # API Backend proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files from backend (uploads)
    location /uploads/ {
        alias /var/www/lta/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js images
    location /_next/image {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/lta /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload nginx
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
    
    log_info "Nginx configured"
}

setup_firewall() {
    log_info "Configuring firewall..."
    
    ufw --force enable
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    log_info "Firewall configured"
}

setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter your email for Let's Encrypt: " EMAIL
    
    if [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
        
        # Update nginx config with actual domain
        sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/lta
        
        # Uncomment SSL lines
        sed -i 's/# ssl_certificate/ssl_certificate/g' /etc/nginx/sites-available/lta
        
        systemctl reload nginx
        
        log_info "SSL certificate obtained and configured"
    else
        log_warn "Skipping SSL setup. You can run 'certbot --nginx' manually later"
    fi
}

show_status() {
    log_info "Deployment Status:"
    echo "=================================="
    
    sudo -u ${DEPLOY_USER} bash << EOF
export NVM_DIR="/home/${DEPLOY_USER}/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm use ${NODE_VERSION}

pm2 list
EOF
    
    echo ""
    echo "PostgreSQL Status:"
    systemctl status postgresql --no-pager | grep "Active:"
    
    echo ""
    echo "Nginx Status:"
    systemctl status nginx --no-pager | grep "Active:"
    
    echo "=================================="
}

# Main deployment flow
main() {
    log_info "Starting LTA Project deployment on Ubuntu..."
    
    check_root
    
    # System setup
    install_dependencies
    install_nodejs
    setup_postgresql
    create_deploy_user
    
    # Application setup
    setup_directory
    clone_repository
    setup_environment
    
    # Build
    build_backend
    build_frontend
    
    # Services
    setup_pm2
    setup_nginx
    setup_firewall
    
    # Optional SSL
    read -p "Do you want to setup SSL certificate now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    # Show final status
    show_status
    
    log_info "Deployment completed successfully!"
    log_info "Access your application at: http://your-server-ip"
    log_info "Backend API: http://your-server-ip/api/v1"
    
    echo ""
    log_warn "Important Next Steps:"
    echo "1. Update backend/.env with production DATABASE_URL and JWT_SECRET"
    echo "2. Update frontend/.env.production with production API URLs"
    echo "3. Configure your domain DNS to point to this server"
    echo "4. Run SSL setup if you skipped it: sudo certbot --nginx"
    echo "5. Review and update Nginx config: /etc/nginx/sites-available/lta"
}

# Run main function
main "$@"

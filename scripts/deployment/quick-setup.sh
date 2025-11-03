#!/bin/bash

#####################################################################
# Quick Setup Script for Ubuntu Deployment
# This is a simplified version for quick deployment
#####################################################################

set -e

echo "=========================================="
echo "LTA Project - Quick Ubuntu Setup"
echo "=========================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Get user input
read -p "Enter deployment directory [/var/www/lta]: " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/var/www/lta}

read -p "Enter PostgreSQL password: " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    echo "Password cannot be empty!"
    exit 1
fi

read -p "Enter your domain (or leave empty for IP only): " DOMAIN

read -p "Enter your email for SSL (optional): " EMAIL

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo ""
echo "Configuration:"
echo "  Deploy Dir: $DEPLOY_DIR"
echo "  Database Password: ********"
echo "  Domain: ${DOMAIN:-Not set}"
echo ""
read -p "Continue with installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "Starting installation..."
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install essential packages
echo "📦 Installing dependencies..."
apt-get install -y -qq \
    curl \
    git \
    build-essential \
    nginx \
    postgresql \
    postgresql-contrib \
    certbot \
    python3-certbot-nginx \
    ufw

# Install Node.js
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs

# Install pnpm and PM2
echo "📦 Installing pnpm and PM2..."
npm install -g pnpm pm2 --silent

# Setup PostgreSQL
echo "🗄️  Configuring PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << EOF > /dev/null 2>&1
CREATE DATABASE i_contexchange;
CREATE USER lta_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE i_contexchange TO lta_user;
\c i_contexchange
GRANT ALL ON SCHEMA public TO lta_user;
EOF

# Create directories
echo "📁 Creating project directories..."
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/backend/uploads
mkdir -p $DEPLOY_DIR/backend/logs
mkdir -p $DEPLOY_DIR/frontend/logs
mkdir -p $DEPLOY_DIR/backups

# Clone repository (you'll need to update this)
echo "📥 Cloning repository..."
echo "Please clone your repository manually to $DEPLOY_DIR"
echo "Or run: git clone YOUR_REPO_URL $DEPLOY_DIR"

# Create environment files
echo "⚙️  Creating environment configuration..."

cat > $DEPLOY_DIR/backend/.env << EOF
NODE_ENV=production
PORT=3006
HOST=0.0.0.0
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD}@localhost:5432/i_contexchange?schema=public
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=http://localhost:3000
EOF

cat > $DEPLOY_DIR/frontend/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD}@localhost:5432/i_contexchange?schema=public
EOF

# Setup Nginx
echo "🌐 Configuring Nginx..."

cat > /etc/nginx/sites-available/lta << 'NGINX_EOF'
upstream backend {
    server localhost:3006;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/lta /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# Setup firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

echo ""
echo "=========================================="
echo "✅ Basic setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Clone your repository:"
echo "   cd $DEPLOY_DIR && git clone YOUR_REPO_URL ."
echo ""
echo "2. Install and build backend:"
echo "   cd $DEPLOY_DIR/backend"
echo "   pnpm install"
echo "   npx prisma generate"
echo "   npx prisma migrate deploy"
echo "   pnpm run build"
echo ""
echo "3. Install and build frontend:"
echo "   cd $DEPLOY_DIR/frontend"
echo "   pnpm install"
echo "   pnpm run build"
echo ""
echo "4. Start with PM2:"
echo "   cd $DEPLOY_DIR"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
if [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
echo "5. Setup SSL:"
echo "   certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos"
echo ""
fi
echo "Environment files created:"
echo "  - $DEPLOY_DIR/backend/.env"
echo "  - $DEPLOY_DIR/frontend/.env.production"
echo ""
echo "Database credentials:"
echo "  Database: i_contexchange"
echo "  User: lta_user"
echo "  Password: [saved in .env files]"
echo ""
echo "=========================================="

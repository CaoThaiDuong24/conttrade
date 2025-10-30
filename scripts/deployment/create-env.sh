#!/bin/bash

# Script để tạo file .env nhanh cho production

echo "=================================="
echo "  TẠO FILE .ENV PRODUCTION"
echo "=================================="
echo ""

# Hỏi thông tin server
read -p "Nhập IP hoặc domain của server: " SERVER_URL
read -p "Nhập password cho PostgreSQL: " DB_PASSWORD
read -sp "Nhập JWT Secret (hoặc Enter để tự động tạo): " JWT_SECRET
echo ""

# Tạo JWT secret nếu không nhập
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "✅ Đã tự động tạo JWT_SECRET"
fi

SESSION_SECRET=$(openssl rand -base64 32)
echo "✅ Đã tự động tạo SESSION_SECRET"

# Tạo .env cho backend
echo ""
echo "[1/2] Tạo backend/.env.production..."
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3006
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD}@localhost:5432/i_contexchange?schema=public

# Security
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}

# CORS
CORS_ORIGIN=http://${SERVER_URL}

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
EOF

echo "✅ Đã tạo backend/.env.production"

# Tạo .env cho frontend
echo ""
echo "[2/2] Tạo frontend/.env.production..."
cat > frontend/.env.production << EOF
NODE_ENV=production

# API URL
NEXT_PUBLIC_API_URL=http://${SERVER_URL}:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://${SERVER_URL}:3000

# Database
DATABASE_URL=postgresql://lta_user:${DB_PASSWORD}@localhost:5432/i_contexchange?schema=public

# Upload
NEXT_PUBLIC_UPLOAD_URL=http://${SERVER_URL}:3006/uploads

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=vi
EOF

echo "✅ Đã tạo frontend/.env.production"

# Tạo .env cho Docker
echo ""
echo "[3/3] Tạo .env cho Docker..."
cat > .env << EOF
# PostgreSQL
POSTGRES_USER=lta_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=i_contexchange

# JWT
JWT_SECRET=${JWT_SECRET}

# URLs
FRONTEND_URL=http://${SERVER_URL}:3000
NEXT_PUBLIC_API_URL=http://${SERVER_URL}:3006/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://${SERVER_URL}:3000
EOF

echo "✅ Đã tạo .env cho Docker"

echo ""
echo "=================================="
echo "✅ HOÀN THÀNH!"
echo "=================================="
echo ""
echo "Các file đã tạo:"
echo "  - backend/.env.production"
echo "  - frontend/.env.production"
echo "  - .env (cho Docker)"
echo ""
echo "⚠️  LƯU Ý: Các file .env chứa thông tin nhạy cảm!"
echo "    Không commit lên Git!"
echo ""

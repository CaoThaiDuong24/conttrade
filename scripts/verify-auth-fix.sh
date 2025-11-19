#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FINAL VERIFICATION - Authentication Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check containers
echo "1️⃣  Checking containers..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "lta-|NAMES"
echo ""

# 2. Test login
echo "2️⃣  Testing login..."
LOGIN=$(curl -s -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@i-contexchange.vn","password":"admin123"}')

if echo "$LOGIN" | grep -q '"success":true'; then
  echo "   ✅ Login successful"
  TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')
  echo "   Token: ${TOKEN:0:40}..."
else
  echo "   ❌ Login failed"
  echo "   Response: $LOGIN"
  exit 1
fi

echo ""

# 3. Test /auth/me
echo "3️⃣  Testing /auth/me..."
ME=$(curl -s http://localhost:3006/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME" | grep -q '"success":true'; then
  echo "   ✅ /auth/me successful"
  EMAIL=$(echo $ME | grep -o '"email":"[^"]*"' | head -1 | sed 's/"email":"//;s/"//')
  echo "   User: $EMAIL"
else
  echo "   ❌ /auth/me failed"
  echo "   Response: $ME"
  exit 1
fi

echo ""

# 4. Test frontend (if accessible)
echo "4️⃣  Testing frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
  echo "   ✅ Frontend responding (HTTP $FRONTEND)"
else
  echo "   ⚠️  Frontend status: HTTP $FRONTEND"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All authentication tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Next: Test on production domain"
echo "   https://iconttrade.ltacv.com"
echo ""

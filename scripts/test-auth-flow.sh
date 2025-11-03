#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 TESTING AUTHENTICATION FLOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test credentials
EMAIL="pm020@example.com"
PASSWORD="password123"

echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"

# Extract token using grep and sed
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//;s/"//')

if [ -z "$TOKEN" ]; then
  # Try alternative token field
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo ""
echo "✅ Login successful! Token received: ${TOKEN:0:30}..."
echo ""

echo "2️⃣  Testing /auth/me with token..."
ME_RESPONSE=$(curl -s http://localhost:3006/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:" 
echo "$ME_RESPONSE"

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ /auth/me successful!"
  USER_EMAIL=$(echo $ME_RESPONSE | grep -o '"email":"[^"]*"' | head -1 | sed 's/"email":"//;s/"//')
  echo "   Email: $USER_EMAIL"
else
  echo ""
  echo "❌ /auth/me failed!"
  MESSAGE=$(echo $ME_RESPONSE | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"//')
  echo "   Message: $MESSAGE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

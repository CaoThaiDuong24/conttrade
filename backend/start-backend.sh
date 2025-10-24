#!/bin/bash
# Script to start backend server on port 3006
echo "🚀 Starting i-ContExchange Backend Server..."

# Navigate to backend directory
cd "$(dirname "$0")"
pwd

# Set environment variables
export PORT=3006
export NODE_ENV=development

echo "📍 Directory: $(pwd)"
echo "🔌 Port: $PORT"
echo "🌍 Environment: $NODE_ENV"

# Function to start server with auto-restart
start_server() {
    while true; do
        echo "⏰ [$(date)] Starting backend server on port $PORT..."
        
        if node --import tsx src/server.ts; then
            echo "✅ Server stopped normally"
            break
        else
            echo "❌ Server crashed with exit code $?"
            echo "🔄 Restarting in 5 seconds..."
            sleep 5
        fi
    done
}

# Start the server
start_server
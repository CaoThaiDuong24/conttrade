#!/bin/sh

echo "Waiting for database to be ready..."

# Simple wait using nc (netcat) to check if database port is open
MAX_ATTEMPTS=30
ATTEMPT=0
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"

# Wait for database port to be open
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))

  if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
    echo "Database port is open!"
    sleep 2  # Give database a moment to fully initialize
    break
  fi

  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "Warning: Database port not open after $MAX_ATTEMPTS attempts"
    echo "Continuing anyway - server will retry connection"
    break
  fi

  echo "Waiting for database port... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

# Run Prisma migrations (non-blocking - will retry if fails)
echo "Running database migrations..."
yarn prisma migrate deploy 2>&1 || echo "Note: Migrations will be retried by the server if needed"

echo "Starting application..."

# Execute the main command
exec "$@"


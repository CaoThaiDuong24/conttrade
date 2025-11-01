# Docker Setup Guide

This project includes Docker and Docker Compose configurations for easy deployment.

## Files

- `Dockerfile` - Multi-stage Docker build for Next.js frontend
- `docker-compose.yml` - Full stack setup (Frontend + Backend + PostgreSQL)
- `docker-compose.frontend.yml` - Frontend only setup
- `.dockerignore` - Files to exclude from Docker builds

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Full Stack (Recommended)

This starts frontend, backend, and PostgreSQL together:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Frontend Only

If you have a backend running separately:

```bash
# Using standalone frontend compose
docker-compose -f docker-compose.frontend.yml up -d

# View logs
docker-compose -f docker-compose.frontend.yml logs -f
```

## Environment Variables

Create a `.env` file in the frontend directory (or set them in docker-compose.yml):

```env
# Required
JWT_SECRET=your-jwt-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://backend:3006/api/v1  # Use 'backend' service name in Docker, 'localhost' for local dev

# Optional
NODE_ENV=production
```

**Important Notes:**
- `NEXT_PUBLIC_API_URL` is embedded at build time for client-side code
- For server-side middleware, you can override with runtime environment variables
- When running in Docker, use service names (e.g., `backend`) instead of `localhost`
- For local development outside Docker, use `http://localhost:3006/api/v1`

## Building

### Build the image manually:

```bash
docker build -t conttrade-frontend .
```

### Build with specific tag:

```bash
docker build -t conttrade-frontend:latest .
```

## Running

### Run with Docker Compose (Recommended):

```bash
# Build and start
docker-compose up -d --build

# Rebuild without cache
docker-compose build --no-cache

# View specific service logs
docker-compose logs -f frontend
```

### Run standalone container:

```bash
docker run -d \
  --name conttrade-frontend \
  -p 3000:3000 \
  -e JWT_SECRET=your-jwt-secret-key-change-in-production \
  -e NEXT_PUBLIC_API_URL=http://localhost:3006/api/v1 \
  conttrade-frontend
```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:3006/api/v1
- PostgreSQL: localhost:5432

## Troubleshooting

### Check service status:

```bash
docker-compose ps
```

### View logs:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Follow logs
docker-compose logs -f frontend
```

### Rebuild after code changes:

```bash
docker-compose up -d --build frontend
```

### Remove everything and start fresh:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Check container health:

```bash
docker inspect conttrade-frontend | grep -A 10 Health
```

### Execute commands inside container:

```bash
docker exec -it conttrade-frontend sh
```

## Development vs Production

### Development

For development, it's often easier to run locally:

```bash
npm install
npm run dev
```

### Production

Use Docker for production deployments:

```bash
docker-compose up -d
```

## Network Configuration

All services are connected via the `conttrade-network` bridge network:
- Frontend can reach backend at `http://backend:3006`
- Backend can reach PostgreSQL at `postgres:5432`

## Volume Mounts

The docker-compose.yml includes:
- Backend uploads directory: `../backend/uploads:/app/uploads`
- Backend environment file: `../backend/environment.env:/app/environment.env:ro`

Adjust paths as needed for your setup.

## Security Notes

1. **JWT_SECRET**: Always use a strong, unique secret in production
2. **Database Password**: Change default PostgreSQL credentials
3. **CORS_ORIGIN**: Configure allowed origins for production
4. **Environment Files**: Never commit `.env` files with secrets


# Docker Setup Guide

This project includes Docker and Docker Compose configuration for easy development and deployment.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of RAM allocated to Docker

## Quick Start

1. **Create environment file** (optional - uses defaults if not provided):
   ```bash
   cp .env.example .env
   # Edit .env and set your JWT_SECRET and SESSION_SECRET
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Services

### Backend API
- **Port**: 3006
- **Health Check**: http://localhost:3006/api/v1/health
- **Main Endpoint**: http://localhost:3006

### PostgreSQL Database
- **Port**: 5432
- **Database**: conttrade-db
- **User**: postgres
- **Password**: postgres123 (change in production!)

## Development Commands

### Build and start
```bash
docker-compose up -d --build
```

### View backend logs
```bash
docker-compose logs -f backend
```

### View database logs
```bash
docker-compose logs -f postgres
```

### Execute commands in backend container
```bash
docker-compose exec backend sh
```

### Run Prisma migrations manually
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Access database directly
```bash
docker-compose exec postgres psql -U postgres -d conttrade-db
```

### Reset database (⚠️ WARNING: Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

## Production Considerations

1. **Change default passwords** - Update `postgres123` in `docker-compose.yml`
2. **Use secrets management** - Don't hardcode secrets in docker-compose.yml
3. **Use environment variables** - Set JWT_SECRET and SESSION_SECRET via `.env` file or environment
4. **Enable SSL** - Configure PostgreSQL with SSL certificates
5. **Use Docker secrets** - For sensitive data in production
6. **Set resource limits** - Add memory/CPU limits to services
7. **Use reverse proxy** - Nginx or Traefik in front of backend
8. **Backup volumes** - Regular backups of `postgres_data` volume

## Volume Persistence

- `postgres_data`: PostgreSQL data persistence
- `./uploads`: Application uploads directory (mapped to host)

## Troubleshooting

### Backend won't start
- Check database is healthy: `docker-compose ps`
- Check logs: `docker-compose logs backend`
- Verify DATABASE_URL environment variable

### Database connection issues
- Ensure postgres service is healthy before backend starts
- Check network connectivity: `docker-compose exec backend ping postgres`
- Verify credentials in docker-compose.yml

### Migrations fail
- Check Prisma schema is up to date
- Verify DATABASE_URL is correct
- Check database user has proper permissions

### Port conflicts
- If port 3006 or 5432 is already in use, modify ports in docker-compose.yml
- Example: Change `"3006:3006"` to `"3007:3006"` to use port 3007 on host

## Building for Production

```bash
# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build backend
```

## Health Checks

Both services include health checks:
- **PostgreSQL**: Checks if database is accepting connections
- **Backend**: Checks `/api/v1/health` endpoint

Monitor health:
```bash
docker-compose ps
```


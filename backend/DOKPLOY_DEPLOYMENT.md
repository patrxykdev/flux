# Dokploy Deployment Guide for Flux Trading Backend

## Overview

This guide covers deploying your Django backend to Dokploy using Docker containers.

## Prerequisites

- Dokploy account and project setup
- PostgreSQL database (can be provided by Dokploy or external)
- Environment variables configured

## Docker Images

### Development Image (`Dockerfile`)

- Single-stage build
- Includes development dependencies
- Good for local development and testing

### Production Image (`Dockerfile.prod`)

- Multi-stage build for smaller image size
- Optimized for production deployment
- Better security with non-root user
- Recommended for Dokploy deployment

## Environment Variables

Set these in your Dokploy project:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-secure-secret-key
DJANGO_SETTINGS_MODULE=backend.settings

# Database
DATABASE_URL=postgres://username:password@host:port/database

# Security
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Optional: Redis for caching
REDIS_URL=redis://host:port/0
```

## Deployment Steps

### 1. Build and Push Image

```bash
# Build production image
docker build -f Dockerfile.prod -t your-registry/flux-backend:latest .

# Push to registry
docker push your-registry/flux-backend:latest
```

### 2. Dokploy Configuration

Create a `dokploy.yaml` file in your project root:

```yaml
version: "1.0"
services:
  backend:
    image: your-registry/flux-backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

### 3. Database Migrations

Dokploy will automatically run migrations if you have a `release` command in your Procfile, or you can run them manually:

```bash
# Connect to your Dokploy container
dokploy exec backend python manage.py migrate

# Collect static files
dokploy exec backend python manage.py collectstatic --noinput
```

## Health Checks

The Dockerfile includes health checks that will:

- Verify the API endpoint is responding
- Check every 30 seconds
- Retry up to 3 times before marking unhealthy

## Performance Optimization

### Gunicorn Settings

- **Workers**: 2 (adjust based on CPU cores)
- **Timeout**: 120 seconds
- **Max Requests**: 1000 (restart workers periodically)
- **Jitter**: 100 (prevent all workers restarting simultaneously)

### Database Connection

- Connection pooling enabled
- SSL disabled for Dokploy compatibility
- Connection max age: 600 seconds

## Monitoring

### Logs

```bash
# View application logs
dokploy logs backend

# Follow logs in real-time
dokploy logs -f backend
```

### Metrics

- Health check endpoint: `/api/`
- Gunicorn stats (if enabled)
- Database connection status

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Verify `DATABASE_URL` format
   - Check database accessibility from Dokploy
   - Ensure SSL settings are correct

2. **Static Files Not Loading**

   - Run `python manage.py collectstatic`
   - Check `STATIC_ROOT` setting
   - Verify file permissions

3. **Migration Errors**
   - Check database schema compatibility
   - Verify Django version compatibility
   - Review migration files

### Debug Mode

For troubleshooting, temporarily enable debug mode:

```bash
DEBUG=True
```

## Security Considerations

- Non-root user in container
- Environment variables for sensitive data
- Health checks for monitoring
- Regular security updates
- Database connection encryption (if required)

## Scaling

### Horizontal Scaling

- Deploy multiple instances
- Use load balancer
- Configure shared database

### Vertical Scaling

- Adjust Gunicorn workers
- Increase memory limits
- Optimize database queries

## Backup and Recovery

### Database Backups

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Application Backups

- Version control for code
- Docker image versioning
- Environment variable backups

## Support

For Dokploy-specific issues:

- Check Dokploy documentation
- Review container logs
- Verify environment configuration
- Contact Dokploy support if needed

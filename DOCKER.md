# Docker Setup Guide for Freshora

This guide explains how to run the entire Freshora application stack (frontend, backend, and database) using Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- At least 4GB of RAM available for Docker

## Quick Start

### 1. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your preferred editor
```

**Required Configuration:**
- Set strong passwords for `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD`
- Generate a secure JWT secret (at least 32 characters) for `FRESHORA_JWT_SECRET`
- Configure email settings if you want to use email features

### 2. Start All Services

```bash
# Build and start all services (frontend, backend, database)
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health/readiness

### 4. Stop All Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database data)
docker compose down -v
```

## Architecture

The Docker setup consists of three services:

### 1. MySQL Database (`mysql`)
- **Image**: MySQL 8.4
- **Port**: 3306
- **Volume**: `freshora_mysql_data` (persists database data)
- **Health Check**: Pings MySQL every 10 seconds

### 2. Spring Boot Backend (`backend`)
- **Build**: Multi-stage build using Maven and Java 21
- **Port**: 8080
- **Dependencies**: Waits for MySQL to be healthy
- **Volume**: `freshora_uploads` (persists uploaded files)
- **Health Check**: Checks actuator endpoint every 30 seconds

### 3. React Frontend (`frontend`)
- **Build**: Multi-stage build with Node.js and nginx
- **Port**: 3000 (mapped to nginx port 80)
- **Dependencies**: Waits for backend to be healthy
- **Server**: nginx for production-optimized serving

## Docker Commands

### Build and Start

```bash
# Build and start all services
docker compose up -d

# Rebuild services (after code changes)
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build backend
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100
```

### Stop and Remove

```bash
# Stop all services (keeps volumes)
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v

# Stop specific service
docker compose stop backend
```

### Service Management

```bash
# Restart a service
docker compose restart backend

# View running containers
docker compose ps

# Execute command in running container
docker compose exec backend sh
docker compose exec mysql mysql -u root -p
```

### Debugging

```bash
# Check service health
docker compose ps

# View resource usage
docker stats

# Inspect service logs for errors
docker compose logs backend | grep -i error

# Access backend shell
docker compose exec backend sh

# Access MySQL shell
docker compose exec mysql mysql -u freshora_app -p freshora
```

## Environment Variables

Key environment variables used by the Docker setup:

### Database
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Application database user
- `MYSQL_PASSWORD`: Application user password
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `MYSQL_PORT`: External port mapping (default: 3306)

### Backend
- `FRESHORA_JWT_SECRET`: Secret key for JWT token generation
- `FRESHORA_JWT_ACCESS_EXPIRATION`: Access token expiration (milliseconds)
- `FRESHORA_JWT_REFRESH_EXPIRATION`: Refresh token expiration (milliseconds)
- `FRESHORA_FRONTEND_URL`: Frontend URL for CORS
- `FILE_STORAGE_LOCATION`: Path for uploaded files
- `MAX_FILE_SIZE`: Maximum file size
- `MAX_REQUEST_SIZE`: Maximum request size

### Email (Optional)
- `MAIL_HOST`: SMTP server host
- `MAIL_PORT`: SMTP server port
- `MAIL_USERNAME`: SMTP username
- `MAIL_PASSWORD`: SMTP password
- `MAIL_FROM`: From email address
- `MAIL_FROM_NAME`: From name

## Volumes

The setup uses named volumes for data persistence:

- **freshora_mysql_data**: Database files
- **freshora_uploads**: User-uploaded files

To backup volumes:

```bash
# Backup database
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} freshora > backup.sql

# Restore database
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} freshora < backup.sql
```

## Network

All services communicate via the `freshora-network` bridge network:
- Services can reach each other using service names (e.g., `mysql`, `backend`)
- External access only through exposed ports

## Health Checks

All services have health checks configured:

### MySQL
- Interval: 10 seconds
- Timeout: 5 seconds
- Retries: 5
- Start period: 30 seconds

### Backend
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3
- Start period: 60 seconds
- Endpoint: `/actuator/health/readiness`

### Frontend
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3
- Start period: 10 seconds
- Endpoint: `/health`

## Troubleshooting

### Backend fails to start
```bash
# Check if MySQL is healthy
docker compose ps mysql

# View backend logs
docker compose logs backend

# Common issues:
# 1. MySQL not ready - wait for health check to pass
# 2. Wrong database credentials - check .env file
# 3. Port already in use - change MYSQL_PORT in .env
```

### Frontend can't reach backend
```bash
# Verify backend is running
docker compose ps backend

# Check network connectivity
docker compose exec frontend ping backend

# Verify environment variables
docker compose config
```

### Database connection issues
```bash
# Test MySQL connection
docker compose exec mysql mysql -u freshora_app -p -e "SHOW DATABASES;"

# Check MySQL logs
docker compose logs mysql

# Verify credentials in .env match
```

### Port conflicts
If ports 3000, 8080, or 3306 are already in use:

```bash
# Edit .env file to use different ports
MYSQL_PORT=3307

# Or edit docker-compose.yml directly
# Change port mappings like "3001:80" instead of "3000:80"
```

## Development vs Production

### Development
```bash
# Use docker compose for local development
docker compose up -d

# Backend supports hot reload with devtools
# Frontend requires rebuild after code changes
```
For local HTTP development, set `FRESHORA_COOKIE_SECURE=false` in `.env`.
Keep it `true` when deploying behind HTTPS.

### Database schema changes
Flyway creates a new database from `V1__freshora_baseline.sql`. Once applied,
do not edit or remove that baseline; make future schema changes in a new
versioned migration such as `V2__add_product_attribute.sql`. This baseline is
for fresh databases. Existing databases created with the previous migration
set require a separate migration plan and must not be pointed at this baseline.

### Production
For production deployment:
1. Use `.env` file with production values
2. Set `FRESHORA_COOKIE_SECURE=true`
3. Use proper domain names instead of localhost
4. Consider using Docker Swarm or Kubernetes
5. Set up proper backup strategies
6. Use secrets management (not .env files)

## Performance Optimization

### Build Optimization
```bash
# Use BuildKit for faster builds (automatically enabled in Docker Desktop)
DOCKER_BUILDKIT=1 docker compose build

# Build with no cache (fresh build)
docker compose build --no-cache
```

### Resource Limits
Add resource limits in docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Build and test with Docker
  run: |
    cp .env.example .env
    docker compose up -d
    docker compose exec -T backend ./mvnw test
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)

## Support

For issues or questions:
1. Check the logs: `docker compose logs -f`
2. Verify health checks: `docker compose ps`
3. Review this documentation
4. Check your `.env` configuration

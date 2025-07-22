# Indie Clock - Production Deployment Guide

This guide will help you deploy the Indie Clock application to production using Coolify.

## Prerequisites

- Coolify instance running
- Domain name configured
- GitHub repository access

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@postgres:5432/indie_clock?schema=public"
POSTGRES_DB=indie_clock
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# RabbitMQ Configuration
RABBITMQ_URL=amqp://username:password@rabbitmq:5672/vhost
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=your_secure_rabbitmq_password
RABBITMQ_DEFAULT_VHOST=/

# Application Configuration
NODE_ENV=production
```

## Coolify Deployment Steps

### 1. Create a New Application

1. Log into your Coolify dashboard
2. Click "New Application"
3. Select "Docker Compose"
4. Choose your Git repository

### 2. Configure the Application

**Application Name:** `indie-clock`

**Build Command:** (Leave empty - using Dockerfile)

**Start Command:** (Leave empty - using Dockerfile)

**Port:** `3000`

### 3. Environment Variables

Add all the environment variables from the `.env` file above to Coolify's environment variables section.

### 4. Resource Allocation

**CPU:** 1-2 cores
**Memory:** 2-4 GB RAM
**Storage:** 10-20 GB

### 5. Health Check

The application includes a health check endpoint at `/api/health` that returns:
- Status: "healthy" or "unhealthy"
- Timestamp
- Uptime

### 6. Database Setup

The application uses PostgreSQL. Coolify can manage this automatically, or you can use an external database service.

### 7. RabbitMQ Setup

RabbitMQ is required for MQTT messaging. The application expects RabbitMQ to be available at the configured URL.

## Docker Compose Services

The `docker-compose.yml` file includes:

1. **app** - Next.js application
2. **postgres** - PostgreSQL database
3. **rabbitmq** - RabbitMQ with MQTT plugin

## Health Checks

All services include health checks:

- **App:** HTTP GET to `/api/health`
- **PostgreSQL:** `pg_isready` command
- **RabbitMQ:** `rabbitmq-diagnostics ping`

## Monitoring

### RabbitMQ Management UI

Access RabbitMQ management interface at:
- URL: `http://your-domain:15672`
- Username: `admin`
- Password: Your RabbitMQ password

### Database Access

PostgreSQL is accessible on port 5432 with the configured credentials.

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **RabbitMQ Connection Failed**
   - Check RABBITMQ_URL format
   - Ensure RabbitMQ is running
   - Verify credentials

3. **NextAuth Issues**
   - Verify NEXTAUTH_URL matches your domain
   - Check GitHub OAuth credentials
   - Ensure NEXTAUTH_SECRET is set

### Logs

Check application logs in Coolify dashboard or using:
```bash
docker-compose logs -f app
```

### Database Migrations

The application will automatically run Prisma migrations on startup. If you need to run them manually:

```bash
docker-compose exec app npx prisma migrate deploy
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database Passwords**: Use strong, unique passwords
3. **RabbitMQ Credentials**: Secure RabbitMQ access
4. **HTTPS**: Configure SSL/TLS for production
5. **Firewall**: Only expose necessary ports

## Backup Strategy

1. **Database**: Regular PostgreSQL backups
2. **RabbitMQ**: Backup message queues if needed
3. **Application Data**: Backup any user-uploaded content

## Scaling

The application can be scaled horizontally by:
1. Running multiple app instances
2. Using a load balancer
3. Ensuring database and RabbitMQ can handle increased load

## Updates

To update the application:
1. Push changes to your Git repository
2. Coolify will automatically rebuild and deploy
3. Monitor the deployment for any issues
4. Check application health after deployment 
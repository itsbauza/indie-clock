# Indie Clock

A GitHub contribution tracker for Awtrix clocks with RabbitMQ messaging and PostgreSQL database.

## Features

- **GitHub Integration**: Fetch and cache user contribution data
- **RabbitMQ Messaging**: Secure message publishing for Awtrix clocks
- **PostgreSQL Database**: Persistent storage with Prisma ORM
- **User Management**: Secure authentication with Auth.js v5 (Google & GitHub)
- **Real-time Updates**: Live data synchronization with Awtrix displays

## Architecture

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Message Broker**: RabbitMQ with MQTT plugin
- **Authentication**: Auth.js v5 with Google and GitHub OAuth

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Google OAuth App
- GitHub OAuth App

### 2. Setup

```bash
# Clone the repository
git clone <your-repo>
cd indie-clock

# Make setup script executable
chmod +x setup-database.sh

# Run setup
./setup-database.sh

# Start services
docker-compose up -d

# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Environment Configuration

Create `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/indie_clock"

# Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# RabbitMQ Configuration
RABBITMQ_URL=amqp://backend:backend_password@localhost:5672
RABBITMQ_ADMIN_URL=http://admin:admin_password@localhost:15672

# Cron Job Configuration (for hourly GitHub sync)
CRON_SECRET_TOKEN="your-secure-cron-token-here"
```

### 4. OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 5. Start Development

```bash
npm run dev
```

## Access Points

- **Application**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **RabbitMQ Management**: http://localhost:15672 (admin/admin_password)
- **pgAdmin**: http://localhost:5050 (admin@indieclock.com/admin_password)
- **Prisma Studio**: `npm run db:studio`

## API Endpoints

### GitHub Contributions

```
GET /api/github/contributions?username=<username>
```

Parameters:
- `username`: GitHub username (optional, defaults to authenticated user)

Response:
```json
{
  "success": true,
  "data": {
    "totalContributions": 1234,
    "contributions": [...]
  },
  "hasPrivateAccess": true
}
```

**Note**: This endpoint always fetches fresh data from the GitHub API. No caching is performed.

### Cron Job - Hourly GitHub Sync

```
POST /api/cron/github-sync
```

Headers:
- `Authorization: Bearer <CRON_SECRET_TOKEN>`
- `Content-Type: application/json`

This endpoint is designed to be called by a cron job every hour to:
- Fetch GitHub contributions for all users with GitHub accounts
- Send updated data to all user devices via MQTT
- Log results and errors for monitoring

**Note**: This endpoint requires the `CRON_SECRET_TOKEN` environment variable for security.

## Authentication

The app uses Auth.js v5 with the following providers:

- **Google**: For general user authentication
- **GitHub**: For GitHub-specific features and contribution tracking

### Session Management

- Sessions are stored in the database
- Users can sign in with either Google or GitHub
- GitHub users get additional access to contribution tracking features

## RabbitMQ Topics

Each user gets their own secure topics:

- `users.{username}.github-contributions` - GitHub contribution data
- `users.{username}.status` - Status updates

## Awtrix Configuration

Configure your Awtrix clock to connect to RabbitMQ:

- **Broker**: Your server IP
- **Port**: 1883 (MQTT)
- **Username**: Your RabbitMQ username
- **Password**: Your RabbitMQ password
- **Topic**: `users.{your-username}.github-contributions`

## Database Schema

### Users
- Auth.js user data (name, email, image)
- GitHub integration data (for GitHub users)
- RabbitMQ credentials
- Session management

### Accounts (Auth.js)
- OAuth provider accounts
- Access tokens and refresh tokens

### Sessions (Auth.js)
- User session management
- Session expiration

### RabbitMQ Messages
- Message history
- Topic tracking
- Timestamp logging

### Devices
- User device configurations
- MQTT topic prefixes
- Device-specific credentials

## Development

### Available Scripts

```bash
# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database

# RabbitMQ
npm run rabbitmq:setup # Setup RabbitMQ users

# Cron Job Management
node scripts/setup-cron.js      # Setup hourly GitHub sync cron job
node scripts/monitor-cron.js    # Monitor cron job status and health
node scripts/manual-github-sync.js  # Manually trigger GitHub sync
```

### Adding New Users

1. **Create OAuth Apps** (Google and/or GitHub) and get credentials
2. **Users sign in** through the web interface
3. **Create RabbitMQ user** with proper permissions
4. **Configure Awtrix clock** with user credentials

### Setting Up Hourly GitHub Sync

The application includes an automated hourly sync that fetches GitHub contributions for all users and sends updates to their devices:

1. **Generate Cron Token**:
   ```bash
   node scripts/setup-cron.js
   ```

2. **Add Token to Environment**:
   Add the generated `CRON_SECRET_TOKEN` to your `.env.local` file

3. **Set Up Cron Job**:
   Add the provided cron entry to your system's crontab:
   ```bash
   crontab -e
   ```

4. **Monitor the Job**:
   ```bash
   node scripts/monitor-cron.js
   ```

5. **Manual Testing**:
   ```bash
   node scripts/manual-github-sync.js
   ```

The cron job will:
- Run every hour at the top of the hour
- Fetch GitHub contributions for all users with GitHub accounts
- Send updated data to all user devices via MQTT
- Log results and errors for monitoring

## Security

- **Authentication**: Auth.js v5 with OAuth providers
- **Authorization**: User-specific topic access
- **Data Encryption**: Sensitive data encrypted in database
- **Network Security**: Docker network isolation
- **Session Security**: Database-stored sessions with expiration

## Monitoring

- **RabbitMQ Management UI**: Monitor queues, exchanges, and connections
- **pgAdmin**: Database monitoring and management
- **Application Logs**: Next.js development logs
- **Prisma Studio**: Database visualization and editing

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL container is running
2. **RabbitMQ Connection**: Check RabbitMQ container and credentials
3. **OAuth Configuration**: Verify Google and GitHub OAuth app settings
4. **GitHub API Limits**: Monitor API rate limits
5. **MQTT Connection**: Verify Awtrix clock configuration

### Logs

```bash
# View container logs
docker-compose logs postgres
docker-compose logs rabbitmq

# View application logs
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

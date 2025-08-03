# Indie Clock

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12.0-green)](https://www.prisma.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-orange)](https://www.rabbitmq.com/)

A GitHub contribution tracker for Awtrix clocks with RabbitMQ messaging and PostgreSQL database. Display your GitHub activity on your Awtrix clock in real-time!

## ✨ Features

- **GitHub Integration**: Fetch and cache user contribution data
- **RabbitMQ Messaging**: Secure message publishing for Awtrix clocks
- **PostgreSQL Database**: Persistent storage with Prisma ORM
- **User Management**: Secure authentication with Auth.js v4 (
GitHub)
- **Real-time Updates**: Live data synchronization with Awtrix displays
- **Automated Sync**: Hourly GitHub contribution updates via cron jobs
- **Multi-device Support**: Manage multiple Awtrix clocks per user

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Auth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Message Broker**: RabbitMQ with MQTT plugin
- **Authentication**: NextAuth.js v4 with Google and GitHub OAuth
- **Deployment**: Docker Compose for easy setup

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Google OAuth App
- GitHub OAuth App

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/indie-clock.git
cd indie-clock

# Make setup script executable
chmod +x setup-database.sh

# Run setup
./setup-database.sh

# Start services
docker-compose up -d

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Environment Configuration

Create `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://postgres:your_secure_postgres_password@localhost:5432/indie_clock"

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
RABBITMQ_URL=amqp://backend:your_secure_backend_password@localhost:5672
RABBITMQ_ADMIN_URL=http://admin:your_secure_admin_password@localhost:15672

# Cron Job Configuration (for hourly GitHub sync)
CRON_SECRET_TOKEN="your-secure-cron-token-here"
```

### 4. OAuth Setup

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 5. Start Development

```bash
npm run dev
```

## 🌐 Access Points

- **Application**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Prisma Studio**: `npm run db:studio`

## 📡 API Endpoints

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

## 🔐 Authentication

The app uses NextAuth.js v4 with the following providers:

- **GitHub**: For GitHub-specific features and contribution tracking

### Session Management

- Sessions are stored in a jwt
- Users can sign in with GitHub
- GitHub users get additional access to contribution tracking features

## 📨 RabbitMQ Topics

Each user gets their own secure topics:

- `users.{username}.github-contributions` - GitHub contribution data

## ⚙️ Awtrix Configuration

Configure your Awtrix clock to connect to RabbitMQ:

- **Broker**: Your server IP
- **Port**: 1883 (MQTT)
- **Username**: Your RabbitMQ username
- **Password**: Your RabbitMQ password
- **Topic**: `{your-id}`

## 🗄️ Database Schema

### Users
- NextAuth.js user data (name, email, image)
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

## 🛠️ Development

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

# Docker
npm run docker:up      # Start Docker services
npm run docker:down    # Stop Docker services
npm run docker:logs    # View Docker logs
npm run docker:health  # Check Docker health

### Adding New Users

1. **Create OAuth App** (GitHub) and get credentials
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

The cron job will:
- Run every hour at the top of the hour
- Fetch GitHub contributions for all users with GitHub accounts
- Send updated data to all user devices via MQTT
- Log results and errors for monitoring

## 🔒 Security

- **Authentication**: Auth.js v5 with OAuth providers
- **Authorization**: User-specific topic access
- **Data Encryption**: Sensitive data encrypted in database
- **Network Security**: Docker network isolation
- **Session Security**: Database-stored sessions with expiration
- **Environment Variables**: All secrets stored in environment variables

## 📊 Monitoring

- **RabbitMQ Management UI**: Monitor queues, exchanges, and connections
- **Application Logs**: Next.js development logs
- **Prisma Studio**: Database visualization and editing

## 🐛 Troubleshooting

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

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly
- Ensure all tests pass

### Code of Conduct

This project is open source and available under the [MIT License](LICENSE). We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our approachable and respectable to everyone.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Auth.js](https://authjs.dev/) - Authentication for Next.js
- [Prisma](https://www.prisma.io/) - Database toolkit
- [RabbitMQ](https://www.rabbitmq.com/) - Message broker
- [Awtrix](https://awtrix.blueforcer.de/) - Smart clock platform

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/indie-clock/issues) page
2. Create a new issue if your problem isn't already addressed
3. Join our [Discussions](https://github.com/yourusername/indie-clock/discussions) for general questions

---

**Made with ❤️ for the open source community**

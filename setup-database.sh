#!/bin/bash

echo "Setting up database and RabbitMQ..."

# Create necessary directories
mkdir -p rabbitmq
mkdir -p postgres/init

echo "Configuration files created!"
echo "Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Run: npm install"
echo "3. Run: npm run db:generate"
echo "4. Run: npm run db:push"
echo "5. Run: npm run db:seed"
echo ""
echo "Access points:"
echo "- RabbitMQ Management UI: http://localhost:15672 (admin/admin_password)"
echo "- pgAdmin: http://localhost:5050 (admin@indieclock.com/admin_password)"
echo "- Prisma Studio: npm run db:studio" 
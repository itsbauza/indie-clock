#!/bin/bash

set -e

echo "🐰 RabbitMQ Entrypoint Starting..."

# Check if configuration files exist
if [ ! -f /etc/rabbitmq/definitions.json ] || [ ! -f /etc/rabbitmq/rabbitmq.conf ]; then
    echo "📝 Generating RabbitMQ configuration..."
    
    # Check if required environment variables are set
    if [ -z "$RABBITMQ_ADMIN_USER" ] || [ -z "$RABBITMQ_ADMIN_PASSWORD" ] || [ -z "$RABBITMQ_BACKEND_USER" ] || [ -z "$RABBITMQ_BACKEND_PASSWORD" ]; then
        echo "❌ Error: Missing required RabbitMQ environment variables"
        echo "Please ensure the following variables are set:"
        echo "  - RABBITMQ_ADMIN_USER"
        echo "  - RABBITMQ_ADMIN_PASSWORD"
        echo "  - RABBITMQ_BACKEND_USER"
        echo "  - RABBITMQ_BACKEND_PASSWORD"
        exit 1
    fi
    
    # Generate definitions.json from template
    echo "📝 Generating definitions.json..."
    sed -e "s/\${RABBITMQ_ADMIN_USER}/$RABBITMQ_ADMIN_USER/g" \
        -e "s|\${RABBITMQ_ADMIN_PASSWORD}|$RABBITMQ_ADMIN_PASSWORD|g" \
        -e "s/\${RABBITMQ_BACKEND_USER}/$RABBITMQ_BACKEND_USER/g" \
        -e "s|\${RABBITMQ_BACKEND_PASSWORD}|$RABBITMQ_BACKEND_PASSWORD|g" \
        /etc/rabbitmq/definitions.template.json > /etc/rabbitmq/definitions.json
    
    # Generate rabbitmq.conf from template
    echo "📝 Generating rabbitmq.conf..."
    sed -e "s/\${RABBITMQ_BACKEND_USER}/$RABBITMQ_BACKEND_USER/g" \
        -e "s|\${RABBITMQ_BACKEND_PASSWORD}|$RABBITMQ_BACKEND_PASSWORD|g" \
        /etc/rabbitmq/rabbitmq.template.conf > /etc/rabbitmq/rabbitmq.conf
    
    echo "✅ RabbitMQ configuration generated successfully!"
else
    echo "✅ Configuration files already exist, starting RabbitMQ..."
fi

# Start RabbitMQ with the original entrypoint
exec docker-entrypoint.sh rabbitmq-server 
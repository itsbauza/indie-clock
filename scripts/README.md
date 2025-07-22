# Scripts Documentation

This directory contains utility scripts for managing RabbitMQ and MQTT messaging in the Indie Clock project.

## RabbitMQ Setup Script

### `setup-rabbitmq.ts`

Comprehensive setup script that configures RabbitMQ for the Indie Clock project.

**Features:**
- ✅ Enables MQTT plugin
- ✅ Creates backend user with proper permissions
- ✅ Sets up topic exchanges
- ✅ Validates configuration
- ✅ Shows status overview

**Usage:**
```bash
npm run rabbitmq:setup
```

**Environment Variables:**
- `RABBITMQ_API` - RabbitMQ Management API URL (default: `http://localhost:15672/api`)
- `RABBITMQ_ADMIN_USER` - Admin username (default: `admin`)
- `RABBITMQ_ADMIN_PASS` - Admin password (default: `admin_password`)
- `RABBITMQ_BACKEND_PASSWORD` - Backend user password (default: `backend_password`)

**Prerequisites:**
- RabbitMQ server running
- Management plugin enabled
- Admin credentials available

## MQTT Scripts

### `monitor-mqtt.js`

Real-time MQTT message monitoring script.

**Usage:**
```bash
npm run mqtt:monitor
```

**Monitors topics:**
- `users/+/+` - All user-specific messages
- `awtrix/+/+` - All AWTRIX device messages
- `awtrix_+/+` - Device-specific messages

### `test-mqtt.js`

Send test messages to MQTT topics.

**Usage:**
```bash
npm run mqtt:test
```

**Test topics:**
- User topics: `users/testuser/github-contributions`, `users/testuser/status`
- Device topics: `awtrix_{deviceId}/github-contributions`, `awtrix_{deviceId}/status`

## Legacy RabbitMQ Scripts (AMQP)

### `monitor-queue.js`

Legacy AMQP message monitoring (kept for compatibility).

**Usage:**
```bash
npm run rabbitmq:monitor
```

### `test-message.js`

Legacy AMQP test message sender (kept for compatibility).

**Usage:**
```bash
npm run rabbitmq:test
```

## Quick Start

1. **Start services:**
   ```bash
   npm run docker:up
   ```

2. **Setup RabbitMQ:**
   ```bash
   npm run rabbitmq:setup
   ```

3. **Test MQTT:**
   ```bash
   npm run mqtt:test
   ```

4. **Monitor messages:**
   ```bash
   npm run mqtt:monitor
   ```

## Troubleshooting

### RabbitMQ Setup Issues

1. **Connection Failed:**
   - Ensure RabbitMQ is running: `docker ps | grep rabbitmq`
   - Check management UI: http://localhost:15672
   - Verify admin credentials

2. **Plugin Enable Failed:**
   - Check RabbitMQ logs: `docker logs indie-clock-rabbitmq`
   - Restart container: `docker restart indie-clock-rabbitmq`

3. **Permission Issues:**
   - Verify user exists in management UI
   - Check topic patterns match your device IDs

### MQTT Connection Issues

1. **Connection Refused:**
   - Ensure MQTT plugin is enabled
   - Check port 1883 is accessible
   - Verify credentials: `backend` / `backend_password`

2. **No Messages:**
   - Check topic patterns in monitor script
   - Verify messages are being published
   - Use RabbitMQ management UI to debug

## Environment Setup

Create `.env.local` file with:

```env
# RabbitMQ Configuration
RABBITMQ_API=http://localhost:15672/api
RABBITMQ_ADMIN_USER=admin
RABBITMQ_ADMIN_PASS=admin_password
RABBITMQ_BACKEND_PASSWORD=backend_password

# MQTT Configuration
MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME=backend
MQTT_PASSWORD=backend_password
MQTT_BROKER_URL=mqtt://localhost:1883
``` 
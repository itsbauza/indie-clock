# MQTT Device Setup Guide

This guide explains how to set up your Awtrix3 or other MQTT-compatible device to connect to the Indie Clock MQTT broker with proper authentication and topic-based access control.

## Overview

The Indie Clock system uses RabbitMQ with the MQTT plugin to provide secure, topic-based messaging. Each device gets its own unique credentials and can only access topics specific to that device.

## Device Registration

### 1. Register Your Device

1. Sign in to your Indie Clock account at `http://localhost:3000`
2. Go to the Dashboard
3. Click "Register New Device"
4. Enter a name for your device (e.g., "Living Room Clock")
5. Click "Create Device"

### 2. Get Your Credentials

After registration, you'll receive:
- **Broker URL**: `mqtt://localhost:1883` (or your server IP)
- **Username**: `awtrix_[userid]_[deviceid]`
- **Password**: A randomly generated password
- **Topic Prefix**: `awtrix_[userid]_[deviceid]`

**Example:**
```
Broker: mqtt://localhost:1883
Username: awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667
Password: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Topic Prefix: awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667
```

## Awtrix3 Configuration

### 1. MQTT Settings

In your Awtrix3 web interface:

1. Go to **Settings** → **MQTT**
2. Configure the following:
   ```
   Broker: mqtt://localhost:1883 (or your server IP)
   Port: 1883
   Username: [Your device username]
   Password: [Your device password]
   Client ID: awtrix3_[unique-id]
   ```

### 2. Topic Configuration

Your device can subscribe to these topics:

#### GitHub Contributions
- **Topic**: `awtrix_[userid]_[deviceid]/github-contributions`
- **Message Format**: JSON with contribution data
- **Example**:
  ```json
  {
    "totalContributions": 1234,
    "contributions": [...],
    "lastSync": "2024-01-01T00:00:00Z"
  }
  ```

#### Status Updates
- **Topic**: `awtrix_[userid]_[deviceid]/status`
- **Message Format**: JSON with status information
- **Example**:
  ```json
  {
    "status": "data_updated",
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```

#### Notifications
- **Topic**: `awtrix_[userid]_[deviceid]/notify`
- **Message Format**: Awtrix3 notification format
- **Example**:
  ```json
  {
    "text": "Hello World!",
    "color": "#00ff00",
    "duration": 5,
    "effect": "scroll"
  }
  ```

## Security Features

### Topic-Based Access Control

Your device credentials only allow access to topics that start with your device's topic prefix:

✅ **Allowed Topics:**
- `awtrix_[userid]_[deviceid]/github-contributions`
- `awtrix_[userid]_[deviceid]/status`
- `awtrix_[userid]_[deviceid]/notify`
- `awtrix_[userid]_[deviceid]/custom/*`

❌ **Denied Topics:**
- `awtrix_otheruser_device/github-contributions`
- `users/otheruser/status`
- `backend/system`

### Authentication

- Each device has unique username/password
- Credentials are generated securely
- Passwords are hashed and stored safely
- Users can only access their own devices

## Testing Your Setup

### 1. Test Connection

Use the provided test script:

```bash
npm run mqtt:auth
```

This will test:
- Connection with your credentials
- Subscription to your topics
- Publishing to your topics
- Access restrictions to other topics

### 2. Monitor Messages

Watch for incoming messages:

```bash
npm run mqtt:monitor
```

### 3. Send Test Messages

Send a test notification:

```bash
node scripts/send-custom-message.js awtrix_[userid]_[deviceid]/notify "Hello from Indie Clock!" "#00ff00" 5 "scroll"
```

## Troubleshooting

### Connection Issues

1. **Connection Refused**
   - Check if RabbitMQ is running: `docker ps | grep rabbitmq`
   - Verify port 1883 is accessible
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password are correct
   - Check for typos in credentials
   - Ensure device is properly registered

3. **No Messages Received**
   - Verify topic subscription is correct
   - Check if messages are being published
   - Use monitoring tools to debug

### Common Errors

**"Not authorized"**
- Your device doesn't have permission for that topic
- Check topic prefix matches your device

**"Connection timeout"**
- Network connectivity issues
- Broker not running
- Wrong broker URL

**"Invalid credentials"**
- Username/password mismatch
- Device not properly registered
- Credentials expired

## Advanced Configuration

### Custom Topics

You can create custom topics under your device prefix:

```
awtrix_[userid]_[deviceid]/custom/myapp/data
awtrix_[userid]_[deviceid]/sensors/temperature
awtrix_[userid]_[deviceid]/alerts/urgent
```

### Multiple Devices

Each device gets its own credentials and topics. You can have multiple devices for the same user:

- Device 1: `awtrix_user123_device1`
- Device 2: `awtrix_user123_device2`
- Device 3: `awtrix_user123_device3`

### Device Management

- View your devices in the Dashboard
- Delete devices to revoke access
- Rename devices for better organization

## API Integration

### Send Notifications

```javascript
// Send notification to all user's devices
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello from API!",
    color: "#ff0000",
    duration: 5
  })
});
```

### Sync GitHub Data

```javascript
// Trigger GitHub sync and send to devices
const response = await fetch('/api/awtrix3/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "your-github-username"
  })
});
```

## Security Best Practices

1. **Keep Credentials Secure**
   - Don't share device credentials
   - Store passwords securely
   - Rotate credentials if compromised

2. **Monitor Access**
   - Check device logs regularly
   - Monitor for unusual activity
   - Delete unused devices

3. **Network Security**
   - Use VPN if connecting remotely
   - Enable SSL/TLS for production
   - Restrict network access

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `npm run docker:logs`
3. Test connectivity: `npm run docker:health`
4. Contact support with error details 
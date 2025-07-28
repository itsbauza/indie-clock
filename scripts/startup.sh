#!/bin/bash

# Start the Next.js application in the background
echo "🚀 Starting Next.js application..."
node server.js &

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 15

# Restore MQTT users from database
echo "🔄 Restoring MQTT users from database..."
node scripts/startup-restore-users.js

# Keep the container running
wait 
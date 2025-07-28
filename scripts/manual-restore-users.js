#!/usr/bin/env node

/**
 * Manual script to restore MQTT users from database
 * Run this script to manually restore all MQTT users after RabbitMQ restarts
 */

// Load environment variables from .env.local if it exists
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // dotenv not available, continue without it
  console.log('dotenv not available, using system environment variables');
}

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const prisma = new PrismaClient();

// Simple HTTP client function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (options.body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function restoreUsers() {
  try {
    console.log('🔄 Starting manual MQTT user restoration...');
    
    // Get all devices from database
    const devices = await prisma.device.findMany({
      select: {
        rabbitmqUsername: true,
        rabbitmqPassword: true,
        topicPrefix: true,
      }
    });

    console.log(`Found ${devices.length} devices to restore`);

    const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
    const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
    const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

    for (const device of devices) {
      try {
        console.log(`Processing device: ${device.rabbitmqUsername}`);
        
        // Check if user already exists
        const userResponse = await makeRequest(`${rabbitmqApiUrl}/users/${device.rabbitmqUsername}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
          }
        });

        if (userResponse.ok) {
          console.log(`✅ User ${device.rabbitmqUsername} already exists`);
          continue;
        }

        // Create user
        const createUserResponse = await makeRequest(`${rabbitmqApiUrl}/users/${device.rabbitmqUsername}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
          },
          body: JSON.stringify({
            password: device.rabbitmqPassword,
            tags: 'management'
          })
        });

        if (!createUserResponse.ok) {
          console.error(`❌ Failed to create user ${device.rabbitmqUsername}:`, await createUserResponse.text());
          continue;
        }

        // Set permissions
        const mqttTopicPrefix = device.topicPrefix.replace(/\./g, '/');
        const permissions = {
          configure: `${mqttTopicPrefix}.*|mqtt-subscription-.*`,
          write: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`,
          read: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`
        };

        const setPermissionsResponse = await makeRequest(`${rabbitmqApiUrl}/permissions/%2F/${device.rabbitmqUsername}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
          },
          body: JSON.stringify(permissions)
        });

        if (!setPermissionsResponse.ok) {
          console.error(`❌ Failed to set permissions for ${device.rabbitmqUsername}:`, await setPermissionsResponse.text());
          continue;
        }

        console.log(`✅ Successfully restored user ${device.rabbitmqUsername}`);

      } catch (error) {
        console.error(`❌ Error processing device ${device.rabbitmqUsername}:`, error.message);
      }
    }

    console.log('✅ Manual MQTT user restoration completed');
  } catch (error) {
    console.error('❌ Error during manual restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreUsers(); 
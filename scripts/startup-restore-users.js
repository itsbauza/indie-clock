#!/usr/bin/env node

/**
 * Startup script to restore MQTT users from database
 * This ensures all registered devices have their users recreated after RabbitMQ restarts
 */

// Load environment variables from .env.local if it exists
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // dotenv not available, continue without it
  console.log('dotenv not available, using system environment variables');
}

// Use node-fetch if available, otherwise use global fetch (Node 18+)
let fetch;
try {
  fetch = require('node-fetch');
} catch (error) {
  // In Node 18+, fetch is available globally
  if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
  } else {
    console.error('fetch is not available. Please install node-fetch or use Node.js 18+');
    process.exit(1);
  }
}

async function restoreUsers() {
  try {
    console.log('🔄 Starting MQTT user restoration...');
    
    // Wait a bit for the application to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/startup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ MQTT user restoration completed:', result.message);
    } else {
      console.error('❌ Failed to restore MQTT users:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error during MQTT user restoration:', error.message);
  }
}

// Run the restoration
restoreUsers(); 
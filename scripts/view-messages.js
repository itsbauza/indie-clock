#!/usr/bin/env node

const mqtt = require('mqtt');

console.log('📱 MQTT Message Viewer');
console.log('======================\n');

// Connect to MQTT broker
const client = mqtt.connect('mqtt://localhost:1883', {
  username: 'backend',
  password: 'backend_password',
  clientId: `viewer-${Date.now()}`,
  clean: true
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker\n');
  
  // Subscribe to all relevant topics
  const topics = [
    'users/+/+',
    'awtrix_+/+'
  ];
  
  topics.forEach(topic => {
    client.subscribe(topic, { qos: 0 });
  });
  
  console.log('📡 Listening for messages...');
  console.log('💡 Send messages using: npm run mqtt:test');
  console.log('💡 Or visit: http://localhost:3000/simulator');
  console.log('💡 Press Ctrl+C to stop\n');
  console.log('─'.repeat(60));
});

client.on('message', (topic, message) => {
  const timestamp = new Date().toLocaleTimeString();
  
  try {
    const data = JSON.parse(message.toString());
    
    // Format based on message type
    if (data.text) {
      // AWTRIX display message
      console.log(`\n🕐 ${timestamp}`);
      console.log(`📤 ${topic}`);
      console.log(`📱 Display: "${data.text}"`);
      if (data.color) console.log(`🎨 Color: ${data.color}`);
      if (data.duration) console.log(`⏱️  Duration: ${data.duration}s`);
      if (data.effect) console.log(`✨ Effect: ${data.effect}`);
      if (data.topText) console.log(`📝 Top: ${data.topText}`);
      if (data.bottomText) console.log(`📝 Bottom: ${data.bottomText}`);
      if (data.progress !== undefined) console.log(`📊 Progress: ${data.progress}%`);
    } else if (data.status) {
      // Status message
      console.log(`\n🕐 ${timestamp}`);
      console.log(`📤 ${topic}`);
      console.log(`📊 Status: ${data.status}`);
      if (data.timestamp) console.log(`⏰ Time: ${new Date(data.timestamp).toLocaleString()}`);
    } else {
      // Generic message
      console.log(`\n🕐 ${timestamp}`);
      console.log(`📤 ${topic}`);
      console.log(`📦 Data:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    // Raw message
    console.log(`\n🕐 ${timestamp}`);
    console.log(`📤 ${topic}`);
    console.log(`📦 Raw: ${message.toString()}`);
  }
  
  console.log('─'.repeat(60));
});

client.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

client.on('close', () => {
  console.log('\n🔌 Connection closed');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping message viewer...');
  client.end();
  process.exit(0);
}); 
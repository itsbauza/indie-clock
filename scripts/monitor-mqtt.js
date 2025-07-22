const mqtt = require('mqtt');

async function monitorMQTT() {
  try {
    // Connect to MQTT broker
    const client = mqtt.connect('mqtt://localhost:1883', {
      username: 'backend',
      password: 'backend_password',
      clientId: `monitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 5000
    });
    
    client.on('connect', () => {
      console.log('🔍 Connected to MQTT broker. Monitoring all relevant topics...\n');
      
      // Subscribe to valid MQTT topic patterns
      const topics = [
        'users/+/+',                     // All user topics (users/username/topic)
      ];
      
      topics.forEach(topic => {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
          } else {
            console.log(`📡 Monitoring topic: ${topic}`);
          }
        });
      });
      
      console.log('\n✅ Monitoring active. Press Ctrl+C to stop.\n');
      console.log('💡 To trigger messages, try:');
      console.log('   - Visit /dashboard and sync GitHub data');
      console.log('   - Use the simulator test button');
      console.log('   - Check /api/github/contributions endpoint');
      console.log('   - Run: npm run mqtt:test');
      console.log('');
    });
    
    client.on('message', (topic, message) => {
      try {
        const content = JSON.parse(message.toString());
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`\n🕐 ${timestamp}`);
        console.log(`📤 Topic: ${topic}`);
        console.log(`📦 Message:`, JSON.stringify(content, null, 2));
        console.log('─'.repeat(50));
      } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`\n🕐 ${timestamp}`);
        console.log(`📤 Topic: ${topic}`);
        console.log(`📦 Raw Message: ${message.toString()}`);
        console.log('─'.repeat(50));
      }
    });
    
    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error.message);
    });
    
    client.on('close', () => {
      console.log('🔌 MQTT connection closed');
    });
    
    client.on('offline', () => {
      console.log('🔌 MQTT client offline');
    });
    
    client.on('reconnect', () => {
      console.log('🔄 MQTT client reconnecting...');
    });
    
    // Keep the connection alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping monitor...');
      client.end();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error monitoring MQTT:', error);
    process.exit(1);
  }
}

monitorMQTT(); 
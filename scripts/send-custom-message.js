const mqtt = require('mqtt');

async function sendCustomMessage() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node send-custom-message.js <topic> <message> [color] [duration] [effect]');
    console.log('Example: node send-custom-message.js awtrix_user123_device1/test "Hello World!" "#00ff00" 5 "scroll"');
    console.log('Example: node send-custom-message.js users/username/status "System online" "#00ff00" 3 "fade"');
    process.exit(1);
  }

  const [topic, message, color = '#ffffff', duration = 3, effect = 'scroll'] = args;

  try {
    // Connect to MQTT broker
    const client = mqtt.connect('mqtt://localhost:1883', {
      username: 'backend',
      password: 'backend_password',
      clientId: `custom-sender-${Date.now()}`,
      clean: true
    });

    client.on('connect', () => {
      console.log('✅ Connected to MQTT broker\n');
      
      // Create message payload
      const payload = {
        text: message,
        color: color,
        duration: parseInt(duration),
        effect: effect,
        timestamp: new Date().toISOString(),
        from: 'custom-sender'
      };
      
      // Send message
      client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ Error sending message:', err);
        } else {
          console.log(`📤 Message sent to: ${topic}`);
          console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
        }
        
        // Close connection
        client.end();
        process.exit(0);
      });
    });

    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('💥 Error sending custom message:', error);
    process.exit(1);
  }
}

sendCustomMessage(); 
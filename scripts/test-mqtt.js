const mqtt = require('mqtt');

async function testMQTTMessage() {
  try {
    // Connect to MQTT broker
    const client = mqtt.connect('mqtt://localhost:1883', {
      username: 'backend',
      password: 'backend_password',
      clientId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clean: true
    });
    
    client.on('connect', () => {
      console.log('🔍 Connected to MQTT broker. Sending test message...\n');
      
      // Test message
      const testMessage = {
        text: "Test message from MQTT script!",
        color: "#ff0000",
        duration: 5,
        effect: "scroll"
      };
      
      // Send to multiple topics to test (using MQTT-style topic separators)
      const topics = [
        'users/testuser/github-contributions',
        'users/testuser/status',
        'awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667/github-contributions',
        'awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667/status'
      ];
      
      let messagesPublished = 0;
      const totalMessages = topics.length;
      
      topics.forEach(topic => {
        client.publish(topic, JSON.stringify(testMessage), { qos: 1, retain: false }, (err) => {
          if (err) {
            console.error(`❌ Failed to publish to ${topic}:`, err);
          } else {
            console.log(`📤 Sent test message to: ${topic}`);
          }
          
          messagesPublished++;
          if (messagesPublished === totalMessages) {
            console.log('\n✅ All test messages sent! Check your monitor for incoming messages.\n');
            
            // Close connection after a short delay
            setTimeout(() => {
              client.end();
              process.exit(0);
            }, 1000);
          }
        });
      });
    });
    
    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    process.exit(1);
  }
}

testMQTTMessage(); 
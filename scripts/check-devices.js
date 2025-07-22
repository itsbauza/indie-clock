const mqtt = require('mqtt');

async function checkDevices() {
  const devices = process.argv.slice(2);
  
  if (devices.length === 0) {
    console.log('Usage: node check-devices.js <device-topic-prefix> [device-topic-prefix2] ...');
    console.log('Example: node check-devices.js awtrix_user123_device1 awtrix_user456_device2');
    process.exit(1);
  }

  console.log('🔍 Checking device connectivity...\n');

  try {
    // Connect to MQTT broker
    const client = mqtt.connect('mqtt://localhost:1883', {
      username: 'backend',
      password: 'backend_password',
      clientId: `device-check-${Date.now()}`,
      clean: true
    });

    client.on('connect', () => {
      console.log('✅ Connected to MQTT broker\n');
      
      devices.forEach((devicePrefix, index) => {
        console.log(`📱 Checking device: ${devicePrefix}`);
        
        // Convert dots to slashes for MQTT
        const mqttPrefix = devicePrefix.replace(/\./g, '/');
        
        // Send ping message
        const pingTopic = `${mqttPrefix}/ping`;
        const pingMessage = {
          type: 'ping',
          timestamp: new Date().toISOString(),
          from: 'device-checker'
        };
        
        client.publish(pingTopic, JSON.stringify(pingMessage), { qos: 1 });
        console.log(`   📤 Sent ping to: ${pingTopic}`);

        // Send test message
        const testTopic = `${mqttPrefix}/test`;
        const testMessage = {
          text: `Device check ${index + 1}`,
          color: '#00ff00',
          duration: 3,
          effect: 'scroll',
          timestamp: new Date().toISOString()
        };
        
        client.publish(testTopic, JSON.stringify(testMessage), { qos: 1 });
        console.log(`   📤 Sent test message to: ${testTopic}`);
        console.log('');
      });

      console.log('✅ All ping and test messages sent!');
      console.log('💡 Check your devices to see if they received the messages.');
      console.log('💡 Use "npm run mqtt:monitor" to see message traffic.\n');

      // Close after a short delay
      setTimeout(() => {
        client.end();
        process.exit(0);
      }, 2000);
    });

    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('💥 Error checking devices:', error);
    process.exit(1);
  }
}

checkDevices(); 
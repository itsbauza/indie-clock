const mqtt = require('mqtt');

async function testDeviceCredentials() {
  // Get credentials from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node test-device-credentials.js <username> <password> <topic-prefix>');
    console.log('Example: node test-device-credentials.js awtrix_user123_device1 mypassword123 awtrix_user123_device1');
    console.log('');
    console.log('You can get your credentials from:');
    console.log('1. Dashboard → Devices → View Credentials');
    console.log('2. Or use: npm run mqtt:auth (for test credentials)');
    process.exit(1);
  }

  const [username, password, topicPrefix] = args;

  console.log('🔐 Testing Device Credentials\n');
  console.log(`📱 Username: ${username}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`📡 Topic Prefix: ${topicPrefix}\n`);

  try {
    // Connect with device credentials
    console.log('1️⃣ Connecting to MQTT broker...');
    const client = mqtt.connect('mqtt://localhost:1883', {
      username: username,
      password: password,
      clientId: `test-${username}-${Date.now()}`,
      clean: true,
      connectTimeout: 5000
    });

    client.on('connect', () => {
      console.log('✅ Connected successfully!');
      
      // Test subscription to own topics
      console.log('\n2️⃣ Testing subscription to your topics...');
      const ownTopics = [
        `${topicPrefix}/github-contributions`,
        `${topicPrefix}/status`,
        `${topicPrefix}/notify`
      ];

      let subscribedCount = 0;
      ownTopics.forEach(topic => {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
          } else {
            console.log(`✅ Subscribed to: ${topic}`);
          }
          subscribedCount++;
          
          if (subscribedCount === ownTopics.length) {
            console.log('\n3️⃣ Testing publishing to your topics...');
            testPublishing(client, topicPrefix);
          }
        });
      });

      // Listen for messages
      client.on('message', (topic, message) => {
        console.log(`📨 Received message on ${topic}:`, message.toString());
      });

    });

    client.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Check if RabbitMQ is running: docker ps | grep rabbitmq');
      console.log('   - Verify credentials are correct');
      console.log('   - Ensure device is properly registered');
      process.exit(1);
    });

    client.on('close', () => {
      console.log('🔌 Connection closed');
    });

    // Close after tests
    setTimeout(() => {
      console.log('\n🏁 Tests completed. Closing connection...');
      client.end();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('💥 Error during credential test:', error);
    process.exit(1);
  }
}

function testPublishing(client, topicPrefix) {
  const testMessage = {
    text: 'Test message from device credentials',
    color: '#00ff00',
    timestamp: new Date().toISOString()
  };

  const topics = [
    `${topicPrefix}/github-contributions`,
    `${topicPrefix}/status`,
    `${topicPrefix}/notify`
  ];

  let publishedCount = 0;
  topics.forEach(topic => {
    client.publish(topic, JSON.stringify(testMessage), { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err.message);
      } else {
        console.log(`✅ Published to: ${topic}`);
      }
      publishedCount++;
      
      if (publishedCount === topics.length) {
        console.log('\n4️⃣ Testing access restrictions...');
        testAccessRestrictions(client, topicPrefix);
      }
    });
  });
}

function testAccessRestrictions(client, topicPrefix) {
  const otherTopics = [
    'awtrix_otheruser_device456/github-contributions',
    'users/otheruser/status',
    'backend/system'
  ];

  console.log('   Testing access to other topics (should be denied)...');
  
  otherTopics.forEach(topic => {
    client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.log(`   ✅ Correctly denied access to: ${topic}`);
      } else {
        console.log(`   ⚠️  Unexpectedly allowed access to: ${topic}`);
      }
    });
  });

  console.log('\n🎉 Credential test completed!');
  console.log('💡 If all tests passed, your device should work correctly.');
  console.log('📖 See docs/MQTT_DEVICE_SETUP.md for configuration help.');
}

// Run the test
testDeviceCredentials(); 
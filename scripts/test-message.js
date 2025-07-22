const amqp = require('amqplib');

async function testMessage() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin_password@localhost:5672');
    const channel = await connection.createChannel();
    
    console.log('🔍 Connected to RabbitMQ. Sending test message...\n');
    
    // Test message
    const testMessage = {
      text: "Test message from script!",
      color: "#ff0000",
      duration: 5,
      effect: "scroll"
    };
    
    // Send to multiple topics to test
    const topics = [
      'users.testuser.github-contributions',
      'users.testuser.status',
      'awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667.github-contributions',
      'awtrix_cmck90f8300ke1nu9vz4phiam_36a6444f3667.status'
    ];
    
    for (const topic of topics) {
      channel.publish(
        'amq.topic',
        topic,
        Buffer.from(JSON.stringify(testMessage)),
        { persistent: true }
      );
      console.log(`📤 Sent test message to: ${topic}`);
    }
    
    console.log('\n✅ Test messages sent! Check your monitor for incoming messages.\n');
    
    // Close connection
    await connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    process.exit(1);
  }
}

testMessage(); 
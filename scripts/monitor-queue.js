const amqp = require('amqplib');

async function monitorQueue() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin_password@localhost:5672');
    const channel = await connection.createChannel();
    
    console.log('🔍 Connected to RabbitMQ. Monitoring all user topics...\n');
    
    // Monitor all user topics
    const topics = [
      'users.#.github-contributions',
      'users.#.status'
    ];
    
    for (const topic of topics) {
      // Create a temporary queue for this topic
      const queueName = `monitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await channel.assertQueue(queueName, { exclusive: true, autoDelete: true });
      
      // Bind to the topic
      await channel.bindQueue(queueName, 'amq.topic', topic);
      
      console.log(`📡 Monitoring topic: ${topic}`);
      
      // Consume messages
      channel.consume(queueName, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          const timestamp = new Date().toLocaleTimeString();
          
          console.log(`\n🕐 ${timestamp}`);
          console.log(`📤 Topic: ${msg.fields.routingKey}`);
          console.log(`📦 Message:`, JSON.stringify(content, null, 2));
          console.log('─'.repeat(50));
          
          // Acknowledge the message
          channel.ack(msg);
        }
      });
    }
    
    console.log('\n✅ Monitoring active. Press Ctrl+C to stop.\n');
    
    // Keep the connection alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping monitor...');
      await connection.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error monitoring queue:', error);
    process.exit(1);
  }
}

monitorQueue(); 
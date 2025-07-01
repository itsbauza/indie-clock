import amqp from 'amqplib';

async function setupRabbitMQ() {
  try {
    // Connect as admin
    const connection = await amqp.connect('amqp://admin:admin_password@localhost:5672');
    const channel = await connection.createChannel();

    console.log('Connected to RabbitMQ as admin');

    // Create user-specific permissions
    const users = ['user1', 'user2', 'user3']; // Add your users here

    for (const username of users) {
      try {
        // Create user (this would require RabbitMQ Management API)
        console.log(`Setting up permissions for user: ${username}`);
        
        // The actual user creation would be done via Management API
        // For now, we'll just log what needs to be done
        console.log(`User ${username} should have permissions for topic: users.${username}.*`);
      } catch (error) {
        console.error(`Error setting up user ${username}:`, error);
      }
    }

    await channel.close();
    await connection.close();
    
    console.log('RabbitMQ setup completed');
  } catch (error) {
    console.error('Error setting up RabbitMQ:', error);
  }
}

setupRabbitMQ(); 
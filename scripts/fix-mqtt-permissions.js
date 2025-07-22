const { PrismaClient } = require('@prisma/client');

async function fixMQTTPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing MQTT user permissions...\n');
    
    // Get all devices from database
    const devices = await prisma.device.findMany({
      select: {
        id: true,
        name: true,
        rabbitmqUsername: true,
        rabbitmqPassword: true,
        topicPrefix: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log(`📱 Found ${devices.length} devices to fix\n`);
    
    for (const device of devices) {
      console.log(`🔧 Fixing permissions for device: ${device.name || device.id}`);
      console.log(`   Username: ${device.rabbitmqUsername}`);
      console.log(`   Topic Prefix: ${device.topicPrefix}`);
      
      // Keep topic prefix in dot format for RabbitMQ permissions
      const rabbitmqTopicPrefix = device.topicPrefix; // Keep as-is with dots
      
      // Set correct permissions
      const success = await fixDevicePermissions(
        device.rabbitmqUsername,
        device.rabbitmqPassword,
        rabbitmqTopicPrefix
      );
      
      if (success) {
        console.log(`   ✅ Fixed permissions for ${device.rabbitmqUsername}`);
      } else {
        console.log(`   ❌ Failed to fix permissions for ${device.rabbitmqUsername}`);
      }
      console.log('');
    }
    
    console.log('🏁 Permission fix completed!');
    
  } catch (error) {
    console.error('💥 Error fixing MQTT permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function fixDevicePermissions(username, password, topicPrefix) {
  try {
    const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
    const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
    const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';
    
    // First, check if user exists
    const userResponse = await fetch(`${rabbitmqApiUrl}/users/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
      }
    });
    
    if (!userResponse.ok) {
      console.log(`   ⚠️  User ${username} doesn't exist, creating...`);
      
      // Create user
      const createUserResponse = await fetch(`${rabbitmqApiUrl}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        },
        body: JSON.stringify({
          password: password,
          tags: 'management'
        })
      });
      
      if (!createUserResponse.ok) {
        console.log(`   ❌ Failed to create user ${username}`);
        return false;
      }
    }
    
    // Set correct permissions using dot format
    const escapedTopicPrefix = topicPrefix.replace(/\./g, '\\.');
    const permissions = {
      configure: `amq\\.topic|mqtt-subscription-.*|${escapedTopicPrefix}.*`,
      write: `amq\\.topic|${escapedTopicPrefix}.*`,
      read: `amq\\.topic|${escapedTopicPrefix}.*`
    };
    
    const setPermissionsResponse = await fetch(`${rabbitmqApiUrl}/permissions/%2F/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
      },
      body: JSON.stringify(permissions)
    });
    
    if (!setPermissionsResponse.ok) {
      const errorText = await setPermissionsResponse.text();
      console.log(`   ❌ Failed to set permissions: ${errorText}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error fixing permissions: ${error.message}`);
    return false;
  }
}

// Run the fix
fixMQTTPermissions(); 
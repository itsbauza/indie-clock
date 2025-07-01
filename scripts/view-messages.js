const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewMessages() {
  try {
    console.log('📊 Fetching RabbitMQ messages from database...\n');
    
    // Get all messages with user information
    const messages = await prisma.rabbitMQMessage.findMany({
      include: {
        user: {
          select: {
            username: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 50 // Limit to last 50 messages
    });
    
    if (messages.length === 0) {
      console.log('📭 No messages found in database.');
      return;
    }
    
    console.log(`📋 Found ${messages.length} recent messages:\n`);
    
    messages.forEach((message, index) => {
      console.log(`${index + 1}. 📤 Topic: ${message.topic}`);
      console.log(`   👤 User: ${message.user?.username || 'Unknown'} (${message.user?.name || 'N/A'})`);
      console.log(`   🕐 Sent: ${message.sentAt.toLocaleString()}`);
      console.log(`   📦 Message:`, JSON.stringify(message.message, null, 4));
      console.log('─'.repeat(80));
    });
    
    // Show summary by topic
    const topicSummary = await prisma.rabbitMQMessage.groupBy({
      by: ['topic'],
      _count: {
        topic: true
      },
      orderBy: {
        _count: {
          topic: 'desc'
        }
      }
    });
    
    console.log('\n📈 Message Summary by Topic:');
    topicSummary.forEach(summary => {
      console.log(`   ${summary.topic}: ${summary._count.topic} messages`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewMessages(); 
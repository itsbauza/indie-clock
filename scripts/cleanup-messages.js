const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupMessages() {
  try {
    console.log('🧹 Cleaning up old RabbitMQ messages...\n');
    
    // Delete messages older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await prisma.rabbitMQMessage.deleteMany({
      where: {
        sentAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`✅ Deleted ${result.count} messages older than 30 days`);
    
    // Show remaining message count
    const remainingCount = await prisma.rabbitMQMessage.count();
    console.log(`📊 Remaining messages in database: ${remainingCount}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMessages(); 
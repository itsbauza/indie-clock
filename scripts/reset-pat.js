const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPersonalAccessToken(userEmail) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        personalAccessToken: null,
        patUpdatedAt: null
      }
    });

    console.log(`Personal access token reset for user: ${userEmail}`);
    console.log('Please re-enter your personal access token in the dashboard');
  } catch (error) {
    console.error('Error resetting personal access token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node reset-pat.js <user-email>');
  process.exit(1);
}

resetPersonalAccessToken(userEmail); 
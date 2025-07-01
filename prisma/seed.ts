import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      githubId: '123456',
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://github.com/github.png',
      rabbitmqUsername: 'testuser',
      rabbitmqPassword: 'testpassword'
    }
  });

  console.log('Created test user:', testUser.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
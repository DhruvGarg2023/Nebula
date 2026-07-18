import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for development data.
 * Run with: npm run db:seed
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      authProvider: 'google',
      googleId: 'google-test-id-12345',
      preferences: {
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        keybindings: 'default',
      },
    },
  });

  console.log(`  ✓ Created test user: ${testUser.email} (${testUser.id})`);
  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

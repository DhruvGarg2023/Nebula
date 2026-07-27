import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Collaborative AI Code Editor...');

  // 1. Create Default Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      authProvider: 'local',
      passwordHash,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Dev Editor',
      authProvider: 'local',
      passwordHash,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Read Viewer',
      authProvider: 'local',
      passwordHash,
    },
  });

  console.log(`✅ Users created: Admin (${admin.id}), Editor (${editor.id}), Viewer (${viewer.id})`);

  // 2. Create Sample Room
  const room = await prisma.room.create({
    data: {
      name: 'JavaScript Playground',
      description: 'Default collaborative workspace for JavaScript development',
      language: 'javascript',
      ownerId: admin.id,
      isPublic: true,
      members: {
        create: [
          { userId: admin.id, role: 'admin' },
          { userId: editor.id, role: 'editor' },
          { userId: viewer.id, role: 'viewer' },
        ],
      },
      files: {
        create: [
          {
            name: 'index.js',
            language: 'javascript',
            content: '// Welcome to Collaborative AI Code Editor!\nconsole.log("Hello, Collaborative World!");',
          },
          {
            name: 'utils.js',
            language: 'javascript',
            content: 'export function add(a, b) {\n  return a + b;\n}',
          },
        ],
      },
    },
  });

  console.log(`✅ Room created: '${room.name}' (${room.id}) with 2 default files`);

  // 3. Create Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: 'system',
        title: 'Welcome to Collaborative Editor',
        message: 'Your system environment has been initialized and seeded successfully.',
        link: `/rooms/${room.id}`,
      },
      {
        userId: editor.id,
        type: 'room_invite',
        title: 'Joined JavaScript Playground',
        message: 'You have been granted editor access to JavaScript Playground.',
        link: `/rooms/${room.id}`,
      },
    ],
  });

  console.log('✅ Sample notifications created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

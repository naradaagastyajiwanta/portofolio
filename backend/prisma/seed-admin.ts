import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123!';

  const existing = await prisma.adminUser.findUnique({ where: { username } });

  if (existing) {
    console.log(`Admin user "${username}" already exists. Updating password...`);
    await prisma.adminUser.update({
      where: { username },
      data: { passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Password updated for "${username}".`);
  } else {
    await prisma.adminUser.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 12),
        displayName: 'Narada',
      },
    });
    console.log(`Admin user "${username}" created successfully.`);
  }

  console.log('---');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log('---');
  console.log('You can login at http://localhost:3000/admin/login');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

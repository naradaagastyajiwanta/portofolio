import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
console.log('adminUser:', typeof p.adminUser);
console.log('siteSetting:', typeof p.siteSetting);
try {
  const user = await p.adminUser.findFirst();
  console.log('findFirst works! user:', user?.username);
} catch (e: any) {
  console.error('findFirst error:', e.message);
}
await p.$disconnect();

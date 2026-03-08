import { PrismaClient } from '@prisma/client';

// Step 1: Create prisma instance and check it
const prisma = new PrismaClient();
console.log('Step 1 - Direct PrismaClient:');
console.log('  typeof prisma:', typeof prisma);
console.log('  typeof prisma.adminUser:', typeof (prisma as any).adminUser);
console.log('  typeof prisma.skill:', typeof (prisma as any).skill);
console.log('  typeof prisma.siteSetting:', typeof (prisma as any).siteSetting);
console.log('  typeof prisma.$connect:', typeof prisma.$connect);

// Step 2: Import from db.ts module
console.log('\nStep 2 - Importing from db.ts...');
const dbModule = await import('./src/lib/db.js');
console.log('  dbModule keys:', Object.keys(dbModule));
console.log('  typeof dbModule.prisma:', typeof dbModule.prisma);
console.log('  typeof dbModule.prisma.adminUser:', typeof (dbModule.prisma as any).adminUser);
console.log('  typeof dbModule.prisma.skill:', typeof (dbModule.prisma as any).skill);
console.log('  typeof dbModule.prisma.siteSetting:', typeof (dbModule.prisma as any).siteSetting);
console.log('  dbModule.prisma === prisma:', dbModule.prisma === prisma);
console.log('  dbModule.prisma constructor:', dbModule.prisma?.constructor?.name);

// Step 3: Try connecting
console.log('\nStep 3 - Connecting...');
await dbModule.prisma.$connect();
console.log('  Connected!');
console.log('  typeof prisma.adminUser after connect:', typeof (dbModule.prisma as any).adminUser);

// Step 4: Try actual query
console.log('\nStep 4 - Testing query...');
try {
  const users = await dbModule.prisma.adminUser.findMany();
  console.log('  findMany succeeded! Count:', users.length);
} catch (e: any) {
  console.error('  findMany FAILED:', e.message);
}

// Step 5: Import auth service and test  
console.log('\nStep 5 - Testing auth service...');
try {
  const authService = await import('./src/services/auth.js');
  console.log('  authService keys:', Object.keys(authService));
  const user = await authService.findAdminByUsername('admin');
  console.log('  findAdminByUsername result:', user ? 'Found user: ' + user.username : 'null');
} catch (e: any) {
  console.error('  Auth service FAILED:', e.message);
  console.error('  Stack:', e.stack?.split('\n').slice(0, 5).join('\n'));
}

// Step 6: Import skills route and check
console.log('\nStep 6 - Import skills route...');
try {
  const skillsModule = await import('./src/routes/skills.js');
  console.log('  skills module default:', typeof skillsModule.default);
} catch (e: any) {
  console.error('  Skills import FAILED:', e.message);
}

await dbModule.prisma.$disconnect();
console.log('\nDone!');

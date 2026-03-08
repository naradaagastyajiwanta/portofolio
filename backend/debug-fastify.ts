import Fastify from 'fastify';
import { prisma, connectDatabase } from './src/lib/db.js';
import { config } from 'dotenv';

config();

const app = Fastify({ logger: true });

await connectDatabase();

// Simple test route that uses prisma directly
app.get('/test/skills', async () => {
  console.log('=== REQUEST TIME DEBUG ===');
  console.log('typeof prisma:', typeof prisma);
  console.log('prisma constructor:', prisma?.constructor?.name);
  console.log('typeof prisma.skill:', typeof (prisma as any)?.skill);
  console.log('typeof prisma.adminUser:', typeof (prisma as any)?.adminUser);
  
  // Try to list models
  const proto = Object.getPrototypeOf(prisma);
  const protoKeys = Object.getOwnPropertyNames(proto);
  console.log('proto keys:', protoKeys.filter(k => !k.startsWith('_')));
  console.log('=========================');
  
  const skills = await prisma.skill.findMany({ where: { visible: true } });
  return { count: skills.length, skills };
});

app.get('/test/login', async () => {
  const user = await prisma.adminUser.findUnique({ where: { username: 'admin' } });
  return { found: !!user, username: user?.username };
});

await app.listen({ port: 3002, host: '0.0.0.0' });
console.log('Test server on http://localhost:3002');

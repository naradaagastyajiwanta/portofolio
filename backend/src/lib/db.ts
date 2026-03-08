import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}

export const prisma: PrismaClient = globalForPrisma.__prisma;

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

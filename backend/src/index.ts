import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import { connectDatabase, disconnectDatabase } from './lib/db.js';
import { projectRoutes } from './routes/projects.js';
import { syncRoutes } from './routes/sync.js';
import experienceRoutes from './routes/experiences.js';

config();

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
});

await connectDatabase();

await app.register(projectRoutes);
await app.register(syncRoutes);
await app.register(experienceRoutes);

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const PORT = parseInt(process.env.PORT || '3001', 10);

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await app.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

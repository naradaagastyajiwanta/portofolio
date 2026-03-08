import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { config } from 'dotenv';
import { connectDatabase, disconnectDatabase } from './lib/db.js';
import { projectRoutes } from './routes/projects.js';
import { syncRoutes } from './routes/sync.js';
import experienceRoutes from './routes/experiences.js';
import linkedinRoutes from './routes/linkedin.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import skillsRoutes from './routes/skills.js';
import blogRoutes from './routes/blog.js';
import settingsRoutes from './routes/settings.js';
import { registerAdminAuth } from './middleware/auth.js';
import { cleanExpiredSessions } from './services/auth.js';
import crypto from 'crypto';

config();

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
});

await app.register(fastifyCookie);

await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || (() => {
    const fallback = crypto.randomBytes(32).toString('hex');
    console.warn('WARNING: No JWT_SECRET set. Using random secret — sessions will not survive restarts.');
    return fallback;
  })(),
});

await app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

await connectDatabase();

// Clean expired sessions on startup and every 6 hours
cleanExpiredSessions().catch(() => {});
setInterval(() => cleanExpiredSessions().catch(() => {}), 6 * 60 * 60 * 1000);

// Register auth middleware (must be before route registration)
registerAdminAuth(app);

await app.register(authRoutes);
await app.register(contactRoutes);
await app.register(skillsRoutes);
await app.register(projectRoutes);
await app.register(syncRoutes);
await app.register(experienceRoutes);
await app.register(linkedinRoutes);
await app.register(blogRoutes);
await app.register(settingsRoutes);

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

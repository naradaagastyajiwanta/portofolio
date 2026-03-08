import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// ─── JWT Access Token Verification Hook ─────────────────────────────────────

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

// ─── Register auth hooks on admin routes ────────────────────────────────────

export function registerAdminAuth(app: FastifyInstance) {
  // Protect all /api/admin/* and /api/webhook/* routes
  app.addHook('onRequest', async (request, reply) => {
    const url = request.url;

    // Skip auth for auth endpoints, health, and public contact form
    if (
      url.startsWith('/api/auth/') ||
      url === '/health' ||
      url === '/api/contact' ||
      // Public API endpoints (read-only)
      (url.startsWith('/api/projects') && !url.includes('/admin/')) ||
      (url.startsWith('/api/experiences') && !url.includes('/admin/')) ||
      (url === '/api/skills') ||
      (url.startsWith('/api/blog') && !url.includes('/admin/'))
    ) {
      return;
    }

    // Require auth for admin, webhook, and sync routes
    if (url.startsWith('/api/admin/') || url.startsWith('/api/webhook/') || url.startsWith('/api/sync/')) {
      await authGuard(request, reply);
    }
  });
}

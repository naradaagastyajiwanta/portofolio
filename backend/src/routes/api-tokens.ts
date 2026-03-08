import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';
import { generateApiToken, hashToken } from '../middleware/api-key.js';

export default async function apiTokenRoutes(fastify: FastifyInstance) {
  // ─── List all API tokens ───────────────────────────────────────────────
  fastify.get('/api/admin/api-tokens', {
    preHandler: authGuard
  }, async (request, reply) => {
    const tokens = await prisma.apiToken.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't return the actual token hash
      }
    });

    return {
      tokens: tokens.map(t => ({
        ...t,
        tokenPreview: `pk_********************${t.id.slice(0, 8)}`
      }))
    };
  });

  // ─── Create new API token ───────────────────────────────────────────────
  fastify.post('/api/admin/api-tokens', {
    preHandler: authGuard
  }, async (request, reply) => {
    const { name, scopes, expiresIn } = request.body as {
      name: string;
      scopes?: string[];
      expiresIn?: number; // days
    };

    if (!name?.trim()) {
      return reply.status(400).send({ error: 'Name is required' });
    }

    const token = generateApiToken();
    const tokenHash = hashToken(token);

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const apiToken = await prisma.apiToken.create({
      data: {
        name: name.trim(),
        token: tokenHash,
        scopes: scopes || ['blog:write'],
        expiresAt,
      }
    });

    // Only return the full token on creation
    return reply.status(201).send({
      token,
      apiToken: {
        id: apiToken.id,
        name: apiToken.name,
        scopes: apiToken.scopes,
        expiresAt: apiToken.expiresAt,
        isActive: apiToken.isActive,
        createdAt: apiToken.createdAt
      }
    });
  });

  // ─── Delete API token ───────────────────────────────────────────────────
  fastify.delete('/api/admin/api-tokens/:id', {
    preHandler: authGuard
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.apiToken.delete({ where: { id } });

    return { success: true };
  });

  // ─── Toggle API token status ────────────────────────────────────────────
  fastify.patch('/api/admin/api-tokens/:id/toggle', {
    preHandler: authGuard
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.apiToken.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: 'Token not found' });
    }

    const token = await prisma.apiToken.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });

    return {
      id: token.id,
      isActive: token.isActive
    };
  });
}

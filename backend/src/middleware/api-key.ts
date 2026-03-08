import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/db.js';
import crypto from 'crypto';

// Generate a secure API token
export function generateApiToken(): string {
  return `pk_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash token for storage (simple hash, not for passwords)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify API key and check scopes
export async function verifyApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
  requiredScopes: string[] = []
): Promise<{ token: ApiTokenData }> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const tokenHash = hashToken(token);

  const apiToken = await prisma.apiToken.findUnique({
    where: { token: tokenHash },
  });

  if (!apiToken) {
    return reply.status(401).send({ error: 'Invalid API token' });
  }

  if (!apiToken.isActive) {
    return reply.status(401).send({ error: 'API token is inactive' });
  }

  if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
    return reply.status(401).send({ error: 'API token has expired' });
  }

  // Check scopes
  if (requiredScopes.length > 0) {
    const hasScope = requiredScopes.some(scope => apiToken.scopes.includes(scope));
    if (!hasScope) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  }

  // Update last used timestamp
  prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {}); // Fire and forget

  return { token: apiToken };
}

// Middleware wrapper
export function apiKeyGuard(requiredScopes: string[] = []) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await verifyApiKey(request, reply, requiredScopes);
    if (reply.statusCode >= 400) {
      return reply;
    }
    (request as any).apiToken = result.token;
  };
}

interface ApiTokenData {
  id: string;
  name: string;
  token: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

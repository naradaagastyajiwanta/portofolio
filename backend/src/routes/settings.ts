import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';

// Keys that should never be exposed via public API
const SECRET_KEYS = new Set([
  'integrations.github_token',
  'integrations.linkedin_li_at',
  'integrations.linkedin_jsessionid',
  'integrations.smtp_host',
  'integrations.smtp_port',
  'integrations.smtp_user',
  'integrations.smtp_pass',
  'integrations.notify_email',
]);

function groupSettings(settings: { key: string; value: string; group: string }[]) {
  const grouped: Record<string, Record<string, string>> = {};
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {};
    // Strip group prefix from key for cleaner API
    const shortKey = s.key.startsWith(s.group + '.') ? s.key.slice(s.group.length + 1) : s.key;
    grouped[s.group][shortKey] = s.value;
  }
  return grouped;
}

export default async function settingsRoutes(fastify: FastifyInstance) {
  // ─── GET /api/settings/public — public settings (profile, social, seo) ────
  fastify.get('/api/settings/public', async (_request, reply) => {
    const settings = await prisma.siteSetting.findMany({
      where: {
        group: { in: ['profile', 'social', 'seo'] },
      },
    });

    return groupSettings(settings);
  });

  // ─── GET /api/admin/settings — all settings (auth required) ───────────────
  fastify.get('/api/admin/settings', { preHandler: [authGuard] }, async (_request, reply) => {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Mask secrets
    const masked = settings.map((s) => ({
      ...s,
      value: SECRET_KEYS.has(s.key) && s.value ? '••••••••' : s.value,
    }));

    return groupSettings(masked);
  });

  // ─── PUT /api/admin/settings — bulk upsert settings (auth required) ───────
  fastify.put<{
    Body: Record<string, Record<string, string>>;
  }>('/api/admin/settings', { preHandler: [authGuard] }, async (request, reply) => {
    const body = request.body;

    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'Request body must be an object of grouped settings' });
    }

    const operations: { key: string; value: string; group: string }[] = [];

    for (const [group, entries] of Object.entries(body)) {
      if (typeof entries !== 'object' || entries === null) continue;
      for (const [shortKey, value] of Object.entries(entries)) {
        const fullKey = `${group}.${shortKey}`;
        // Skip masked values (user didn't change the secret)
        if (SECRET_KEYS.has(fullKey) && value === '••••••••') continue;
        operations.push({ key: fullKey, value: String(value), group });
      }
    }

    // Batch upsert within a transaction
    await prisma.$transaction(
      operations.map((op) =>
        prisma.siteSetting.upsert({
          where: { key: op.key },
          create: { key: op.key, value: op.value, group: op.group },
          update: { value: op.value },
        })
      )
    );

    // Return fresh settings
    const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
    const masked = settings.map((s) => ({
      ...s,
      value: SECRET_KEYS.has(s.key) && s.value ? '••••••••' : s.value,
    }));

    return groupSettings(masked);
  });
}

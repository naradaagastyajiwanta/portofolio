import { FastifyInstance } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';
import * as fs from 'fs';

const execAsync = promisify(exec);
const ENV_PATH = '/app/.env';

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

  // ─── POST /api/admin/settings/github-token — update GITHUB_TOKEN in .env + restart ─
  fastify.post<{ Body: { token: string } }>(
    '/api/admin/settings/github-token',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { token } = request.body ?? {};

      if (!token || typeof token !== 'string') {
        return reply.code(400).send({ error: 'Token is required' });
      }

      const trimmed = token.trim();
      if (!trimmed.startsWith('ghp_') && !trimmed.startsWith('github_pat_')) {
        return reply.code(400).send({ error: 'Invalid GitHub token format. Must start with ghp_ or github_pat_' });
      }

      try {
        // Update .env file
        const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
        const lines = envContent.split('\n');
        let found = false;

        const updatedLines = lines.map((line) => {
          if (line.startsWith('GITHUB_TOKEN=')) {
            found = true;
            return `GITHUB_TOKEN=${trimmed}`;
          }
          return line;
        });

        if (!found) {
          updatedLines.push(`GITHUB_TOKEN=${trimmed}`);
        }

        fs.writeFileSync(ENV_PATH, updatedLines.join('\n'), 'utf-8');

        // Also update in database
        await prisma.siteSetting.upsert({
          where: { key: 'integrations.github_token' },
          create: { key: 'integrations.github_token', value: trimmed, group: 'integrations' },
          update: { value: trimmed },
        });

        // Graceful restart: close fastify server, then restart container
        // Give a moment for the response to be sent first
        setTimeout(async () => {
          try {
            await fastify.close();
            // Use docker restart which is available inside the container
            exec('sudo docker restart portfolio-backend', (err) => {
              if (err) console.error('[restart] failed:', err.message);
              else console.log('[restart] backend restarted');
            });
          } catch (e) {
            console.error('[restart] error:', e);
          }
        }, 500);

        return { success: true, message: 'Token updated. Backend is restarting...' };
      } catch (err) {
        console.error('[github-token] error:', err);
        return reply.code(500).send({ error: 'Failed to update token' });
      }
    }
  );
}

import { FastifyInstance } from 'fastify';
import { GitHubSyncService } from '../services/githubSync.js';
import { prisma } from '../lib/db.js';
import 'dotenv/config'; // Ensure dotenv is loaded

export async function syncRoutes(app: FastifyInstance) {
  app.post('/api/sync/github', async (request, reply) => {
    const body = request.body as { username?: string } | undefined;
    let { username } = body || {};

    // If no username in request, get from settings
    if (!username) {
      const usernameSetting = await prisma.siteSetting.findUnique({
        where: { key: 'integrations.github_username' }
      });
      username = usernameSetting?.value || usernameSetting?.value;
    }

    // Also try alternative key
    if (!username) {
      const altSetting = await prisma.siteSetting.findUnique({
        where: { key: 'github_username' }
      });
      username = altSetting?.value;
    }

    if (!username) {
      return reply.status(400).send({ error: 'GitHub username not configured. Please set it in Settings or provide in request.' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    console.log('[SYNC] GITHUB_TOKEN:', githubToken ? 'SET (' + githubToken.substring(0, 5) + '...)' : 'NOT SET');
    console.log('[SYNC] All env keys:', Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('token')).join(', '));

    if (!githubToken) {
      console.log('[SYNC] Available env with TOKEN:', Object.keys(process.env).filter(k => k.toLowerCase().includes('token')));
      return reply.status(500).send({ error: 'GitHub token not configured on server' });
    }

    try {
      const syncService = new GitHubSyncService(githubToken);
      const result = await syncService.syncRepositories(username);
      
      return reply.send({
        success: true,
        message: 'Sync completed',
        result
      });
    } catch (error) {
      console.error('Sync error:', error);
      return reply.status(500).send({ 
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

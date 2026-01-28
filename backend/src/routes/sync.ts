import { FastifyInstance } from 'fastify';
import { GitHubSyncService } from '../services/githubSync.js';

export async function syncRoutes(app: FastifyInstance) {
  app.post('/api/sync/github', async (request, reply) => {
    const { username } = request.body as { username: string };

    if (!username) {
      return reply.status(400).send({ error: 'Username is required' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return reply.status(500).send({ error: 'GitHub token not configured' });
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

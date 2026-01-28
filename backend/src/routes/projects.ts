import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/api/projects', async (request, reply) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          showOnPortfolio: true
        },
        orderBy: [
          { featured: 'desc' },
          { stars: 'desc' },
          { lastCommitAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
          stars: true,
          techStack: true,
          featured: true,
          lastCommitAt: true,
          provider: true
        }
      });

      return reply.send({ projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      return reply.status(500).send({ error: 'Failed to fetch projects' });
    }
  });
}

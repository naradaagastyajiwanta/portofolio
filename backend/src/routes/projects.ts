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

  // Get single project by ID
  app.get('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const project = await prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          url: true,
          stars: true,
          techStack: true,
          featured: true,
          lastCommitAt: true,
          provider: true,
          repoId: true,
          showOnPortfolio: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!project) {
        return reply.status(404).send({ error: 'Project not found' });
      }

      return reply.send({ project });
    } catch (error) {
      console.error('Error fetching project:', error);
      return reply.status(500).send({ error: 'Failed to fetch project' });
    }
  });
}

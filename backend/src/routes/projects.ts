import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';

export async function projectRoutes(app: FastifyInstance) {
  // ─── Public: list portfolio projects ──────────────────────────────────────
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

  // ─── Admin: list ALL projects (including hidden) ──────────────────────────
  app.get('/api/admin/projects', { preHandler: [authGuard] }, async (request, reply) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: [
          { featured: 'desc' },
          { showOnPortfolio: 'desc' },
          { stars: 'desc' },
          { lastCommitAt: 'desc' },
        ],
      });

      const total = projects.length;
      const visible = projects.filter((p) => p.showOnPortfolio).length;
      const featured = projects.filter((p) => p.featured).length;

      return reply.send({ projects, stats: { total, visible, featured } });
    } catch (error) {
      console.error('Error fetching admin projects:', error);
      return reply.status(500).send({ error: 'Failed to fetch projects' });
    }
  });

  // ─── Admin: update project visibility/featured ────────────────────────────
  app.patch<{
    Params: { id: string };
    Body: { showOnPortfolio?: boolean; featured?: boolean; description?: string };
  }>('/api/admin/projects/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const { id } = request.params;
    const { showOnPortfolio, featured, description } = request.body;

    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...(showOnPortfolio !== undefined ? { showOnPortfolio } : {}),
          ...(featured !== undefined ? { featured } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      });

      return reply.send(project);
    } catch (error) {
      console.error('Error updating project:', error);
      return reply.status(500).send({ error: 'Failed to update project' });
    }
  });

  // ─── Admin: dashboard stats ───────────────────────────────────────────────
  app.get('/api/admin/stats', { preHandler: [authGuard] }, async (request, reply) => {
    try {
      const [
        totalProjects,
        visibleProjects,
        featuredProjects,
        totalExperiences,
        unreadMessages,
        totalMessages,
        todayMessages,
        totalSkills,
        totalPosts,
        publishedPosts,
        draftPosts,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { showOnPortfolio: true } }),
        prisma.project.count({ where: { featured: true } }),
        prisma.experience.count(),
        prisma.contactMessage.count({ where: { status: 'unread' } }),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({
          where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.skill.count(),
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { status: 'published' } }),
        prisma.blogPost.count({ where: { status: 'draft' } }),
      ]);

      return reply.send({
        projects: { total: totalProjects, visible: visibleProjects, featured: featuredProjects },
        experiences: { total: totalExperiences },
        messages: { total: totalMessages, unread: unreadMessages, today: todayMessages },
        skills: { total: totalSkills },
        blog: { total: totalPosts, published: publishedPosts, draft: draftPosts },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return reply.status(500).send({ error: 'Failed to fetch stats' });
    }
  });
}

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function experienceRoutes(fastify: FastifyInstance) {
  // Get all experiences (public)
  fastify.get('/api/experiences', async (request, reply) => {
    try {
      const experiences = await prisma.experience.findMany({
        where: { showOnAbout: true },
        orderBy: [
          { order: 'asc' },
          { startDate: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employmentType: true,
          startDate: true,
          endDate: true,
          current: true,
          description: true,
          responsibilities: true,
          skills: true,
          order: true
        }
      });

      return experiences;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experiences' });
    }
  });

  // Get single experience (public)
  fastify.get<{ Params: { id: string } }>('/api/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const experience = await prisma.experience.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employmentType: true,
          startDate: true,
          endDate: true,
          current: true,
          description: true,
          responsibilities: true,
          skills: true,
          order: true,
          showOnAbout: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!experience) {
        return reply.code(404).send({ error: 'Experience not found' });
      }

      return experience;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experience' });
    }
  });

  // Get all experiences for admin (including hidden)
  fastify.get('/api/admin/experiences', async (request, reply) => {
    try {
      const experiences = await prisma.experience.findMany({
        orderBy: [
          { order: 'asc' },
          { startDate: 'desc' }
        ]
      });

      return experiences;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experiences' });
    }
  });

  // Create experience (admin/webhook)
  fastify.post<{
    Body: {
      title: string;
      company: string;
      location?: string;
      employmentType?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      responsibilities?: string[];
      skills?: string[];
      order?: number;
      showOnAbout?: boolean;
    }
  }>('/api/admin/experiences', async (request, reply) => {
    try {
      const experience = await prisma.experience.create({
        data: {
          title: request.body.title,
          company: request.body.company,
          location: request.body.location,
          employmentType: request.body.employmentType,
          startDate: new Date(request.body.startDate),
          endDate: request.body.endDate ? new Date(request.body.endDate) : null,
          current: request.body.current ?? false,
          description: request.body.description,
          responsibilities: request.body.responsibilities ?? [],
          skills: request.body.skills ?? [],
          order: request.body.order ?? 0,
          showOnAbout: request.body.showOnAbout ?? true
        }
      });

      return experience;
    } catch (error) {
      console.error('Create experience error:', error);
      reply.code(500).send({ error: 'Failed to create experience' });
    }
  });

  // Update experience (admin)
  fastify.put<{
    Params: { id: string };
    Body: {
      title?: string;
      company?: string;
      location?: string;
      employmentType?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      responsibilities?: string[];
      skills?: string[];
      order?: number;
      showOnAbout?: boolean;
    }
  }>('/api/admin/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData: any = { ...request.body };

      // Convert date strings to Date objects
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const experience = await prisma.experience.update({
        where: { id },
        data: updateData
      });

      return experience;
    } catch (error) {
      console.error('Update experience error:', error);
      reply.code(500).send({ error: 'Failed to update experience' });
    }
  });

  // Delete experience (admin)
  fastify.delete<{ Params: { id: string } }>('/api/admin/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      await prisma.experience.delete({
        where: { id }
      });

      return { success: true, message: 'Experience deleted' };
    } catch (error) {
      console.error('Delete experience error:', error);
      reply.code(500).send({ error: 'Failed to delete experience' });
    }
  });

  // Bulk upsert for Zapier/Make.com webhooks
  fastify.post<{
    Body: {
      experiences: Array<{
        title: string;
        company: string;
        location?: string;
        employmentType?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        description?: string;
        responsibilities?: string[];
        skills?: string[];
      }>
    }
  }>('/api/webhook/experiences', async (request, reply) => {
    try {
      const { experiences } = request.body;

      // Clear existing and insert new
      await prisma.experience.deleteMany({});

      const created = await Promise.all(
        experiences.map((exp, index) =>
          prisma.experience.create({
            data: {
              title: exp.title,
              company: exp.company,
              location: exp.location,
              employmentType: exp.employmentType,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current ?? false,
              description: exp.description,
              responsibilities: exp.responsibilities ?? [],
              skills: exp.skills ?? [],
              order: index,
              showOnAbout: true
            }
          })
        )
      );

      return {
        success: true,
        message: `Successfully synced ${created.length} experiences`,
        count: created.length
      };
    } catch (error) {
      console.error('Webhook sync error:', error);
      reply.code(500).send({ error: 'Failed to sync experiences' });
    }
  });
}

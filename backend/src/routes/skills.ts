import Fastify from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';

export default async function skillsRoutes(fastify: ReturnType<typeof Fastify>) {
  // ─── Public: Get visible skills ───
  fastify.get('/api/skills', async (request, reply) => {
    const skills = await prisma.skill.findMany({
      where: { visible: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, level: true, category: true },
    });
    return { skills };
  });

  // ─── Admin: List all skills ───
  fastify.get('/api/admin/skills', async (request, reply) => {
    await authGuard(request, reply);
    const skills = await prisma.skill.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return { skills };
  });

  // ─── Admin: Create skill ───
  fastify.post('/api/admin/skills', async (request, reply) => {
    await authGuard(request, reply);
    const { name, level, category, order, visible } = request.body as {
      name: string;
      level?: number;
      category: string;
      order?: number;
      visible?: boolean;
    };

    if (!name || !category) {
      return reply.status(400).send({ error: 'Name and category are required' });
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        level: Math.min(100, Math.max(0, level ?? 80)),
        category: category.trim(),
        order: order ?? 0,
        visible: visible ?? true,
      },
    });

    return reply.status(201).send(skill);
  });

  // ─── Admin: Update skill ───
  fastify.patch('/api/admin/skills/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      level: number;
      category: string;
      order: number;
      visible: boolean;
    }>;

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.level !== undefined) data.level = Math.min(100, Math.max(0, body.level));
    if (body.category !== undefined) data.category = body.category.trim();
    if (body.order !== undefined) data.order = body.order;
    if (body.visible !== undefined) data.visible = body.visible;

    const skill = await prisma.skill.update({ where: { id }, data });
    return skill;
  });

  // ─── Admin: Delete skill ───
  fastify.delete('/api/admin/skills/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };
    await prisma.skill.delete({ where: { id } });
    return { success: true };
  });

  // ─── Admin: Reorder skills (batch) ───
  fastify.put('/api/admin/skills/reorder', async (request, reply) => {
    await authGuard(request, reply);
    const { items } = request.body as { items: { id: string; order: number }[] };

    if (!items?.length) {
      return reply.status(400).send({ error: 'Items array required' });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.skill.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return { success: true };
  });
}

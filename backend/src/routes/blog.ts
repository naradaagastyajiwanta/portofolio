import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export default async function blogRoutes(fastify: FastifyInstance) {
  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Public: List published blog posts ────────────────────────────────────
  fastify.get('/api/blog', async (request, reply) => {
    const { page = '1', limit = '10', tag } = request.query as {
      page?: string;
      limit?: string;
      tag?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      status: 'published',
      publishedAt: { not: null },
    };

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readingTime: true,
          views: true,
          author: { select: { displayName: true, username: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const formatted = posts.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
    }));

    return {
      posts: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  });

  // ─── Public: Get single blog post by slug ─────────────────────────────────
  fastify.get('/api/blog/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { displayName: true, username: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!post || post.status !== 'published') {
      return reply.status(404).send({ error: 'Post not found' });
    }

    // Increment view count (fire-and-forget)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return {
      ...post,
      tags: post.tags.map((t) => t.tag),
    };
  });

  // ─── Public: List all tags ────────────────────────────────────────────────
  fastify.get('/api/blog/tags', async (request, reply) => {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
        postCount: t._count.posts,
      })),
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Admin: List all posts (any status) ───────────────────────────────────
  fastify.get('/api/admin/blog', async (request, reply) => {
    await authGuard(request, reply);

    const { page = '1', status } = request.query as {
      page?: string;
      status?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          author: { select: { displayName: true, username: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const formatted = posts.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
    }));

    const stats = {
      total: await prisma.blogPost.count(),
      published: await prisma.blogPost.count({ where: { status: 'published' } }),
      draft: await prisma.blogPost.count({ where: { status: 'draft' } }),
    };

    return {
      posts: formatted,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      stats,
    };
  });

  // ─── Admin: Get single post by ID (for editing) ──────────────────────────
  fastify.get('/api/admin/blog/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { displayName: true, username: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!post) return reply.status(404).send({ error: 'Post not found' });

    return { ...post, tags: post.tags.map((t) => t.tag) };
  });

  // ─── Admin: Create blog post ──────────────────────────────────────────────
  fastify.post('/api/admin/blog', async (request, reply) => {
    await authGuard(request, reply);

    const { title, content, excerpt, coverImage, status, tags } = request.body as {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      tags?: string[]; // tag names
    };

    if (!title?.trim() || !content?.trim()) {
      return reply.status(400).send({ error: 'Title and content are required' });
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const user = request.user as { sub: string };
    const readingTime = estimateReadingTime(content);
    const isPublished = status === 'published';

    // Upsert tags
    const tagRecords = await Promise.all(
      (tags || []).map(async (name) => {
        const tagSlug = slugify(name);
        return prisma.blogTag.upsert({
          where: { slug: tagSlug },
          create: { name: name.trim(), slug: tagSlug },
          update: {},
        });
      })
    );

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || content.slice(0, 160).trim() + '...',
        coverImage: coverImage || null,
        status: status || 'draft',
        publishedAt: isPublished ? new Date() : null,
        readingTime,
        authorId: user.sub,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        author: { select: { displayName: true, username: true } },
      },
    });

    return reply.status(201).send({
      ...post,
      tags: post.tags.map((t) => t.tag),
    });
  });

  // ─── Admin: Update blog post ──────────────────────────────────────────────
  fastify.patch('/api/admin/blog/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };

    const { title, content, excerpt, coverImage, status, tags } = request.body as {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      tags?: string[];
    };

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Post not found' });

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      data.title = title.trim();
      // Update slug if title changed and post is still draft
      if (existing.status === 'draft') {
        let newSlug = slugify(title);
        const slugConflict = await prisma.blogPost.findFirst({
          where: { slug: newSlug, id: { not: id } },
        });
        if (slugConflict) newSlug = `${newSlug}-${Date.now().toString(36)}`;
        data.slug = newSlug;
      }
    }
    if (content !== undefined) {
      data.content = content;
      data.readingTime = estimateReadingTime(content);
    }
    if (excerpt !== undefined) data.excerpt = excerpt.trim();
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (status !== undefined) {
      data.status = status;
      // Set publishedAt when first published
      if (status === 'published' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    // Handle tags update
    if (tags !== undefined) {
      // Remove existing tag relations
      await prisma.blogPostTag.deleteMany({ where: { postId: id } });

      // Upsert and reconnect tags
      const tagRecords = await Promise.all(
        tags.map(async (name) => {
          const tagSlug = slugify(name);
          return prisma.blogTag.upsert({
            where: { slug: tagSlug },
            create: { name: name.trim(), slug: tagSlug },
            update: {},
          });
        })
      );

      await prisma.blogPostTag.createMany({
        data: tagRecords.map((tag) => ({ postId: id, tagId: tag.id })),
      });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: {
        tags: { include: { tag: true } },
        author: { select: { displayName: true, username: true } },
      },
    });

    return { ...post, tags: post.tags.map((t) => t.tag) };
  });

  // ─── Admin: Delete blog post ──────────────────────────────────────────────
  fastify.delete('/api/admin/blog/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };

    await prisma.blogPost.delete({ where: { id } });
    return { success: true };
  });

  // ─── Admin: Manage tags ───────────────────────────────────────────────────
  fastify.get('/api/admin/blog/tags', async (request, reply) => {
    await authGuard(request, reply);
    const tags = await prisma.blogTag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    return {
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
        postCount: t._count.posts,
      })),
    };
  });

  fastify.delete('/api/admin/blog/tags/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };
    await prisma.blogTag.delete({ where: { id } });
    return { success: true };
  });

  fastify.patch('/api/admin/blog/tags/:id', async (request, reply) => {
    await authGuard(request, reply);
    const { id } = request.params as { id: string };
    const { name, color } = request.body as { name?: string; color?: string };

    const data: Record<string, unknown> = {};
    if (name !== undefined) {
      data.name = name.trim();
      data.slug = slugify(name);
    }
    if (color !== undefined) data.color = color;

    const tag = await prisma.blogTag.update({ where: { id }, data });
    return tag;
  });
}

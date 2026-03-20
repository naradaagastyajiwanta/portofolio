import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { apiKeyGuard } from '../middleware/api-key.js';

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

export default async function webhookRoutes(fastify: FastifyInstance) {
  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOK: Create Blog Post
  // ═══════════════════════════════════════════════════════════════════════════

  fastify.post('/api/webhook/blog', {
    preHandler: apiKeyGuard(['blog:write']),
    schema: {
      description: 'Create a blog post via webhook',
      tags: ['Webhook'],
      headers: {
        type: 'object',
        required: ['Authorization'],
        properties: {
          Authorization: {
            type: 'string',
            description: 'Bearer token (API key)'
          }
        }
      },
      body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', description: 'Blog post title' },
          content: { type: 'string', description: 'Markdown content' },
          excerpt: { type: 'string', description: 'Short excerpt/summary' },
          coverImage: { type: 'string', description: 'Cover image URL' },
          status: { type: 'string', enum: ['draft', 'published'], description: 'Post status' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Tag names' },
          publishedAt: { type: 'string', format: 'date-time', description: 'Custom publish date' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            post: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                slug: { type: 'string' },
                title: { type: 'string' },
                status: { type: 'string' },
                url: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { title, content, excerpt, coverImage, status, tags, publishedAt: customPublishedAt } = request.body as {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      tags?: string[];
      publishedAt?: string;
    };

    // Validation
    if (!title?.trim() || !content?.trim()) {
      return reply.status(400).send({ error: 'Title and content are required' });
    }

    // Get or create default author
    let authorId = (request as any).apiToken?.userId;
    if (!authorId) {
      const defaultAuthor = await prisma.adminUser.findFirst({
        where: { username: 'admin' }
      });
      if (!defaultAuthor) {
        return reply.status(400).send({ error: 'No default author found. Please create an admin user first.' });
      }
      authorId = defaultAuthor.id;
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

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

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || content.slice(0, 160).trim() + '...',
        coverImage: coverImage || null,
        status: status || 'draft',
        publishedAt: isPublished ? (customPublishedAt ? new Date(customPublishedAt) : new Date()) : null,
        readingTime,
        authorId,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return reply.status(200).send({
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/blog/${post.slug}`,
        publishedAt: post.publishedAt,
        tags: post.tags.map((t) => t.tag.name)
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOK: Update Blog Post
  // ═══════════════════════════════════════════════════════════════════════════

  fastify.patch('/api/webhook/blog/:slug', {
    preHandler: apiKeyGuard(['blog:write']),
    schema: {
      description: 'Update a blog post via webhook',
      tags: ['Webhook'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: 'string' },
          coverImage: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { title, content, excerpt, coverImage, status, tags } = request.body as {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      status?: string;
      tags?: string[];
    };

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      data.title = title.trim();
    }
    if (content !== undefined) {
      data.content = content;
      data.readingTime = estimateReadingTime(content);
    }
    if (excerpt !== undefined) data.excerpt = excerpt.trim();
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (status !== undefined) {
      data.status = status;
      if (status === 'published' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    // Handle tags update
    if (tags !== undefined) {
      await prisma.blogPostTag.deleteMany({ where: { postId: existing.id } });

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
        data: tagRecords.map((tag) => ({ postId: existing.id, tagId: tag.id })),
      });
    }

    const post = await prisma.blogPost.update({
      where: { slug },
      data,
      include: {
        tags: { include: { tag: true } },
      },
    });

    return reply.status(200).send({
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/blog/${post.slug}`,
        tags: post.tags.map((t) => t.tag.name)
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOK: Health Check
  // ═══════════════════════════════════════════════════════════════════════════

  fastify.get('/api/webhook/health', {
    config: {
      description: 'Webhook health check endpoint',
      tags: ['Webhook']
    }
  }, async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  });
}

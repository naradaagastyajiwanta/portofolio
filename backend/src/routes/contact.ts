import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { authGuard } from '../middleware/auth.js';
import { sendContactNotification } from '../services/email.js';

// ─── Rate Limiting for contact form submissions ────────────────────────────
const contactAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_CONTACT_PER_HOUR = 3; // max 3 messages per IP per hour
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkContactRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = contactAttempts.get(ip);

  if (!record || now - record.firstAttempt > CONTACT_WINDOW_MS) {
    return { allowed: true, remaining: MAX_CONTACT_PER_HOUR };
  }

  const remaining = MAX_CONTACT_PER_HOUR - record.count;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

function recordContactAttempt(ip: string): void {
  const now = Date.now();
  const record = contactAttempts.get(ip);

  if (!record || now - record.firstAttempt > CONTACT_WINDOW_MS) {
    contactAttempts.set(ip, { count: 1, firstAttempt: now });
    return;
  }

  record.count++;
}

// Clean up stale entries every 30 min
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of contactAttempts.entries()) {
    if (now - record.firstAttempt > CONTACT_WINDOW_MS) {
      contactAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

// ─── Simple email validation ───────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Honeypot + basic spam detection ───────────────────────────────────────
function looksLikeSpam(body: { name: string; email: string; message: string; website?: string }): boolean {
  // Honeypot field — if filled, it's a bot
  if (body.website) return true;

  // Too many URLs in message
  const urlCount = (body.message.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) return true;

  // Very short message (likely spam)
  if (body.message.trim().length < 10) return true;

  return false;
}

export default async function contactRoutes(fastify: FastifyInstance) {
  // ─── POST /api/contact — public endpoint ─────────────────────────────────
  fastify.post<{
    Body: {
      name: string;
      email: string;
      subject?: string;
      message: string;
      website?: string; // honeypot
    };
  }>('/api/contact', async (request, reply) => {
    const { name, email, subject, message } = request.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return reply.code(400).send({ error: 'Name, email, and message are required' });
    }

    if (!isValidEmail(email.trim())) {
      return reply.code(400).send({ error: 'Please provide a valid email address' });
    }

    if (message.trim().length > 5000) {
      return reply.code(400).send({ error: 'Message is too long (max 5000 characters)' });
    }

    if (name.trim().length > 100) {
      return reply.code(400).send({ error: 'Name is too long (max 100 characters)' });
    }

    // Rate limiting
    const rateCheck = checkContactRateLimit(request.ip);
    if (!rateCheck.allowed) {
      return reply.code(429).send({
        error: 'Too many messages. Please try again later.',
      });
    }

    // Spam detection (silently accept but don't store)
    if (looksLikeSpam(request.body)) {
      // Return success to not reveal detection
      return { success: true, message: 'Thank you! Your message has been sent.' };
    }

    // Store message
    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    recordContactAttempt(request.ip);

    // Send email notification (fire-and-forget)
    sendContactNotification({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    });

    return {
      success: true,
      message: 'Thank you! Your message has been sent.',
    };
  });

  // ─── GET /api/admin/contact — list all messages (auth required) ──────────
  fastify.get<{
    Querystring: {
      status?: string;
      page?: string;
      limit?: string;
    };
  }>('/api/admin/contact', { preHandler: [authGuard] }, async (request, reply) => {
    const { status, page = '1', limit = '20' } = request.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status } : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    // Count unread for badge
    const unreadCount = await prisma.contactMessage.count({
      where: { status: 'unread' },
    });

    return {
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      unreadCount,
    };
  });

  // ─── PATCH /api/admin/contact/:id/status — update message status ─────────
  fastify.patch<{
    Params: { id: string };
    Body: { status: string };
  }>('/api/admin/contact/:id/status', { preHandler: [authGuard] }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        ...(status === 'replied' ? { repliedAt: new Date() } : {}),
      },
    });

    return updated;
  });

  // ─── DELETE /api/admin/contact/:id — delete a message ────────────────────
  fastify.delete<{
    Params: { id: string };
  }>('/api/admin/contact/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const { id } = request.params;

    await prisma.contactMessage.delete({ where: { id } });
    return { success: true };
  });

  // ─── GET /api/admin/contact/stats — dashboard stats ──────────────────────
  fastify.get('/api/admin/contact/stats', { preHandler: [authGuard] }, async () => {
    const [total, unread, today] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'unread' } }),
      prisma.contactMessage.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return { total, unread, today };
  });
}

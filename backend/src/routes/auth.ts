import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import {
  findAdminByUsername,
  verifyPassword,
  createSession,
  rotateSession,
  findSession,
  deleteSession,
  deleteAllUserSessions,
  updateLastLogin,
  changePassword,
  createAdmin,
} from '../services/auth.js';
import { authGuard } from '../middleware/auth.js';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

// ─── Rate Limiting (in-memory) ───────────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) return { allowed: true };

  // Currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  // Reset if window expired
  if (now - record.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: record.count < MAX_LOGIN_ATTEMPTS };
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return;
  }

  record.count++;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

function clearFailedAttempts(key: string): void {
  loginAttempts.delete(key);
}

// Clean up stale rate limit entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (now - record.firstAttempt > LOGIN_WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
      loginAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

export default async function authRoutes(fastify: FastifyInstance) {
  // ─── POST /api/auth/login ──────────────────────────────────────────────────
  fastify.post<{
    Body: { username: string; password: string };
  }>('/api/auth/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password are required' });
    }

    // Rate limiting by IP
    const rateLimitKey = request.ip;
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return reply.code(429).send({
        error: 'Too many login attempts. Please try again later.',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await findAdminByUsername(trimmedUsername);
    if (!user) {
      recordFailedAttempt(rateLimitKey);
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordFailedAttempt(rateLimitKey);
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Reset rate limit on successful login
    clearFailedAttempts(rateLimitKey);

    // Create JWT access token (short-lived)
    const accessToken = fastify.jwt.sign(
      { sub: user.id, username: user.username, role: 'admin' },
      { expiresIn: '15m' }
    );

    // Create refresh token (long-lived, stored in DB + httpOnly cookie)
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;
    const session = await createSession(user.id, userAgent, ipAddress);

    await updateLastLogin(user.id);

    reply.setCookie(REFRESH_COOKIE, session.refreshToken, COOKIE_OPTIONS);

    return {
      accessToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    };
  });

  // ─── POST /api/auth/refresh ────────────────────────────────────────────────
  fastify.post('/api/auth/refresh', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];

    if (!refreshToken) {
      return reply.code(401).send({ error: 'No refresh token' });
    }

    const session = await findSession(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) await deleteSession(refreshToken);
      reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
      return reply.code(401).send({ error: 'Session expired, please login again' });
    }

    // Rotate refresh token (invalidate old, issue new)
    const newSession = await rotateSession(refreshToken, session.userId);
    reply.setCookie(REFRESH_COOKIE, newSession.refreshToken, COOKIE_OPTIONS);

    // Issue new access token
    const accessToken = fastify.jwt.sign(
      { sub: session.user.id, username: session.user.username, role: 'admin' },
      { expiresIn: '15m' }
    );

    return {
      accessToken,
      expiresIn: 900,
      user: {
        id: session.user.id,
        username: session.user.username,
        displayName: session.user.displayName,
      },
    };
  });

  // ─── POST /api/auth/logout ─────────────────────────────────────────────────
  fastify.post('/api/auth/logout', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];

    if (refreshToken) {
      await deleteSession(refreshToken);
    }

    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { success: true, message: 'Logged out' };
  });

  // ─── POST /api/auth/logout-all ─────────────────────────────────────────────
  fastify.post('/api/auth/logout-all', { preHandler: [authGuard] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await deleteAllUserSessions(payload.sub);
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { success: true, message: 'All sessions revoked' };
  });

  // ─── GET /api/auth/me ──────────────────────────────────────────────────────
  fastify.get('/api/auth/me', { preHandler: [authGuard] }, async (request) => {
    const payload = request.user as { sub: string; username: string };
    return { id: payload.sub, username: payload.username, role: 'admin' };
  });

  // ─── PUT /api/auth/password ────────────────────────────────────────────────
  fastify.put<{
    Body: { currentPassword: string; newPassword: string };
  }>('/api/auth/password', { preHandler: [authGuard] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const payload = request.user as { sub: string; username: string };

    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ error: 'Both current and new passwords are required' });
    }
    if (newPassword.length < 8) {
      return reply.code(400).send({ error: 'New password must be at least 8 characters' });
    }

    const user = await findAdminByUsername(payload.username);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ error: 'Current password is incorrect' });
    }

    await changePassword(user.id, newPassword);

    // Revoke all sessions so user must re-login
    await deleteAllUserSessions(user.id);
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });

    return { success: true, message: 'Password changed. Please login again.' };
  });

  // ─── POST /api/auth/setup (first-time only) ───────────────────────────────
  fastify.post<{
    Body: { username: string; password: string; displayName?: string };
  }>('/api/auth/setup', async (request, reply) => {
    // Only allow if no admin exists
    const count = await prisma.adminUser.count();

    if (count > 0) {
      return reply.code(403).send({ error: 'Admin already exists. Setup is disabled.' });
    }

    const { username, password, displayName } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password are required' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' });
    }

    const user = await createAdmin(trimmedUsername, password, displayName);

    return {
      success: true,
      message: 'Admin created successfully. You can now login.',
      user: { id: user.id, username: user.username, displayName: user.displayName },
    };
  });
}

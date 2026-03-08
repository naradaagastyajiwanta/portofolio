import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

// ─── Password ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Admin User ──────────────────────────────────────────────────────────────

export async function findAdminByUsername(username: string) {
  return prisma.adminUser.findUnique({ where: { username } });
}

export async function createAdmin(username: string, password: string, displayName?: string) {
  const passwordHash = await hashPassword(password);
  return prisma.adminUser.create({
    data: { username, passwordHash, displayName },
  });
}

export async function updateLastLogin(userId: string) {
  return prisma.adminUser.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export async function changePassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

// ─── Sessions (Refresh Tokens) ──────────────────────────────────────────────

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const session = await prisma.session.create({
    data: { userId, refreshToken, expiresAt, userAgent, ipAddress },
  });

  return { refreshToken: session.refreshToken, expiresAt: session.expiresAt };
}

export async function findSession(refreshToken: string) {
  return prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });
}

export async function deleteSession(refreshToken: string) {
  return prisma.session.delete({ where: { refreshToken } }).catch(() => null);
}

// Rotate: delete old refresh token, issue a new one (prevents token reuse attacks)
export async function rotateSession(oldRefreshToken: string, userId: string) {
  await deleteSession(oldRefreshToken);

  const refreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const session = await prisma.session.create({
    data: { userId, refreshToken, expiresAt },
  });

  return { refreshToken: session.refreshToken, expiresAt: session.expiresAt };
}

export async function deleteAllUserSessions(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}

export async function cleanExpiredSessions() {
  return prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}

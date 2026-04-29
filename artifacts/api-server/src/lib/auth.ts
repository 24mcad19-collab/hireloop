import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable, type UserRow } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "sid";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scryptAsync(password, salt, 64)) as Buffer;
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function createSession(userId: string): Promise<string> {
  const id = randomUUID() + randomBytes(16).toString("hex");
  await db.insert(sessionsTable).values({
    id,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return id;
}

export async function destroySession(id: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
}

export async function getUserFromRequest(
  req: Request,
): Promise<UserRow | null> {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) return null;
  const [row] = await db
    .select({ user: usersTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(eq(sessionsTable.id, sid), gt(sessionsTable.expiresAt, new Date())),
    );
  return row?.user ?? null;
}

export function setSessionCookie(res: Response, sid: string): void {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export interface AuthedRequest extends Request {
  user: UserRow;
}

export function requireAuth(role?: "seeker" | "employer") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (role && user.role !== role) {
      res
        .status(403)
        .json({ error: `This action requires a ${role} account` });
      return;
    }
    (req as AuthedRequest).user = user;
    next();
  };
}

export function newId(): string {
  return randomUUID();
}

import { Router, type IRouter } from "express";
import { db, usersTable, seekerProfilesTable, employerProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  getUserFromRequest,
  newId,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const body = RegisterBody.parse(req.body);
  const email = body.email.toLowerCase().trim();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await hashPassword(body.password);
  const userId = newId();
  const now = new Date();

  const [user] = await db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      passwordHash,
      role: body.role,
      createdAt: now,
    })
    .returning();

  if (body.role === "seeker") {
    await db.insert(seekerProfilesTable).values({
      userId,
      fullName: body.fullName ?? "",
      headline: "",
      location: "",
      phone: "",
      bio: "",
      resumeUrl: "",
      skills: [],
      updatedAt: now,
    });
  } else {
    await db.insert(employerProfilesTable).values({
      userId,
      companyName: body.companyName ?? "",
      website: "",
      industry: "",
      location: "",
      description: "",
      logoUrl: "",
      updatedAt: now,
    });
  }

  const sid = await createSession(userId);
  setSessionCookie(res, sid);

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const email = body.email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const sid = await createSession(user.id);
  setSessionCookie(res, sid);

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.post("/auth/logout", async (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (sid) {
    await destroySession(sid);
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  const user = await getUserFromRequest(req);
  res.json({
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        }
      : null,
  });
});

export default router;

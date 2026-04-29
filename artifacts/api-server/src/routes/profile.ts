import { Router, type IRouter } from "express";
import {
  db,
  seekerProfilesTable,
  employerProfilesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  UpdateSeekerProfileBody,
  UpdateEmployerProfileBody,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/profile/seeker", requireAuth("seeker"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const [row] = await db
    .select()
    .from(seekerProfilesTable)
    .where(eq(seekerProfilesTable.userId, user.id));
  if (!row) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(row);
});

router.put("/profile/seeker", requireAuth("seeker"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const body = UpdateSeekerProfileBody.parse(req.body);
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) patch[k] = v;
  }
  const [row] = await db
    .update(seekerProfilesTable)
    .set(patch)
    .where(eq(seekerProfilesTable.userId, user.id))
    .returning();
  res.json(row);
});

router.get("/profile/employer", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const [row] = await db
    .select()
    .from(employerProfilesTable)
    .where(eq(employerProfilesTable.userId, user.id));
  if (!row) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(row);
});

router.put("/profile/employer", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const body = UpdateEmployerProfileBody.parse(req.body);
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) patch[k] = v;
  }
  const [row] = await db
    .update(employerProfilesTable)
    .set(patch)
    .where(eq(employerProfilesTable.userId, user.id))
    .returning();
  res.json(row);
});

export default router;

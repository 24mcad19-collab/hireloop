import { Router, type IRouter } from "express";
import {
  db,
  applicationsTable,
  jobsTable,
  seekerProfilesTable,
  employerProfilesTable,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import {
  ApplyToJobBody,
  ApplyToJobParams,
  ListJobApplicationsParams,
  UpdateApplicationBody,
  UpdateApplicationParams,
} from "@workspace/api-zod";
import { requireAuth, newId, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/jobs/:id/apply", requireAuth("seeker"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { id: jobId } = ApplyToJobParams.parse(req.params);
  const body = ApplyToJobBody.parse(req.body);

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (job.status !== "open") {
    res.status(400).json({ error: "This job is no longer accepting applications" });
    return;
  }

  const [existing] = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.jobId, jobId),
        eq(applicationsTable.seekerId, user.id),
      ),
    );
  if (existing) {
    res.status(400).json({ error: "You have already applied to this job" });
    return;
  }

  let resumeUrl = body.resumeUrl ?? "";
  if (!resumeUrl) {
    const [profile] = await db
      .select()
      .from(seekerProfilesTable)
      .where(eq(seekerProfilesTable.userId, user.id));
    resumeUrl = profile?.resumeUrl ?? "";
  }

  const now = new Date();
  const [row] = await db
    .insert(applicationsTable)
    .values({
      id: newId(),
      jobId,
      seekerId: user.id,
      coverLetter: body.coverLetter,
      resumeUrl,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.json(row);
});

router.get(
  "/jobs/:id/applications",
  requireAuth("employer"),
  async (req, res) => {
    const { user } = req as AuthedRequest;
    const { id: jobId } = ListJobApplicationsParams.parse(req.params);

    const [job] = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId));
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    if (job.employerId !== user.id) {
      res.status(403).json({ error: "Not allowed to view these applications" });
      return;
    }

    const rows = await db
      .select({
        id: applicationsTable.id,
        jobId: applicationsTable.jobId,
        status: applicationsTable.status,
        coverLetter: applicationsTable.coverLetter,
        resumeUrl: applicationsTable.resumeUrl,
        createdAt: applicationsTable.createdAt,
        seekerEmail: seekerProfilesTable.userId,
        seekerName: seekerProfilesTable.fullName,
        seekerHeadline: seekerProfilesTable.headline,
        seekerLocation: seekerProfilesTable.location,
        seekerSkills: seekerProfilesTable.skills,
      })
      .from(applicationsTable)
      .leftJoin(
        seekerProfilesTable,
        eq(seekerProfilesTable.userId, applicationsTable.seekerId),
      )
      .where(eq(applicationsTable.jobId, jobId))
      .orderBy(desc(applicationsTable.createdAt));

    // Need to join with users to get email — do a second query
    const { usersTable } = await import("@workspace/db");
    const usersById = new Map<string, string>();
    if (rows.length > 0) {
      const seekerIds = rows.map((r) => r.seekerEmail).filter(Boolean) as string[];
      const userRows = await db.select().from(usersTable);
      for (const u of userRows) {
        if (seekerIds.includes(u.id)) usersById.set(u.id, u.email);
      }
    }

    res.json(
      rows.map((r) => ({
        id: r.id,
        jobId: r.jobId,
        status: r.status,
        coverLetter: r.coverLetter,
        resumeUrl: r.resumeUrl,
        createdAt: r.createdAt,
        seekerEmail: usersById.get(r.seekerEmail ?? "") ?? "",
        seekerName: r.seekerName ?? "",
        seekerHeadline: r.seekerHeadline ?? "",
        seekerLocation: r.seekerLocation ?? "",
        seekerSkills: r.seekerSkills ?? [],
      })),
    );
  },
);

router.get("/seeker/applications", requireAuth("seeker"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const rows = await db
    .select({
      id: applicationsTable.id,
      jobId: applicationsTable.jobId,
      status: applicationsTable.status,
      coverLetter: applicationsTable.coverLetter,
      createdAt: applicationsTable.createdAt,
      jobTitle: jobsTable.title,
      location: jobsTable.location,
      jobType: jobsTable.jobType,
      companyName: employerProfilesTable.companyName,
    })
    .from(applicationsTable)
    .leftJoin(jobsTable, eq(jobsTable.id, applicationsTable.jobId))
    .leftJoin(
      employerProfilesTable,
      eq(employerProfilesTable.userId, jobsTable.employerId),
    )
    .where(eq(applicationsTable.seekerId, user.id))
    .orderBy(desc(applicationsTable.createdAt));

  res.json(
    rows.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      status: r.status,
      coverLetter: r.coverLetter,
      createdAt: r.createdAt,
      jobTitle: r.jobTitle ?? "",
      companyName: r.companyName ?? "",
      location: r.location ?? "",
      jobType: r.jobType ?? "full_time",
    })),
  );
});

router.patch(
  "/applications/:id",
  requireAuth("employer"),
  async (req, res) => {
    const { user } = req as AuthedRequest;
    const { id } = UpdateApplicationParams.parse(req.params);
    const body = UpdateApplicationBody.parse(req.body);

    const [existing] = await db
      .select({ app: applicationsTable, job: jobsTable })
      .from(applicationsTable)
      .leftJoin(jobsTable, eq(jobsTable.id, applicationsTable.jobId))
      .where(eq(applicationsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (existing.job?.employerId !== user.id) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }

    const [row] = await db
      .update(applicationsTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(applicationsTable.id, id))
      .returning();

    res.json(row);
  },
);

export default router;

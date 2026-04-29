import { Router, type IRouter } from "express";
import {
  db,
  jobsTable,
  employerProfilesTable,
  applicationsTable,
} from "@workspace/db";
import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobBody,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
  ListJobsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, getUserFromRequest, newId, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/jobs", async (req, res) => {
  const q = ListJobsQueryParams.parse(req.query);
  const conds: unknown[] = [eq(jobsTable.status, "open")];

  if (q.q) {
    conds.push(
      or(
        ilike(jobsTable.title, `%${q.q}%`),
        ilike(jobsTable.description, `%${q.q}%`),
        ilike(jobsTable.tags as never, `%${q.q}%`),
        ilike(employerProfilesTable.companyName, `%${q.q}%`),
      ),
    );
  }
  if (q.location) {
    conds.push(ilike(jobsTable.location, `%${q.location}%`));
  }
  if (q.jobType) {
    conds.push(eq(jobsTable.jobType, q.jobType));
  }
  if (q.minSalary !== undefined) {
    conds.push(gte(jobsTable.salaryMax, q.minSalary));
  }

  const rows = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      location: jobsTable.location,
      jobType: jobsTable.jobType,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      currency: jobsTable.currency,
      tags: jobsTable.tags,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      companyName: employerProfilesTable.companyName,
      companyLogoUrl: employerProfilesTable.logoUrl,
    })
    .from(jobsTable)
    .leftJoin(
      employerProfilesTable,
      eq(jobsTable.employerId, employerProfilesTable.userId),
    )
    .where(and(...(conds as never[])))
    .orderBy(desc(jobsTable.createdAt))
    .limit(q.featured ? 6 : 200);

  res.json(
    rows.map((r) => ({
      ...r,
      companyName: r.companyName ?? "",
      companyLogoUrl: r.companyLogoUrl ?? "",
    })),
  );
});

router.post("/jobs", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const body = CreateJobBody.parse(req.body);
  const now = new Date();
  const [row] = await db
    .insert(jobsTable)
    .values({
      id: newId(),
      employerId: user.id,
      title: body.title,
      description: body.description,
      qualifications: body.qualifications ?? "",
      responsibilities: body.responsibilities ?? "",
      location: body.location,
      jobType: body.jobType,
      salaryMin: body.salaryMin ?? 0,
      salaryMax: body.salaryMax ?? 0,
      currency: body.currency ?? "USD",
      tags: body.tags ?? [],
      status: "open",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const [employer] = await db
    .select()
    .from(employerProfilesTable)
    .where(eq(employerProfilesTable.userId, user.id));

  res.json({
    ...row,
    companyName: employer?.companyName ?? "",
    companyLogoUrl: employer?.logoUrl ?? "",
    companyWebsite: employer?.website ?? "",
    companyIndustry: employer?.industry ?? "",
    companyDescription: employer?.description ?? "",
  });
});

router.get("/jobs/:id", async (req, res) => {
  const { id } = GetJobParams.parse(req.params);
  const [row] = await db
    .select({
      job: jobsTable,
      employer: employerProfilesTable,
    })
    .from(jobsTable)
    .leftJoin(
      employerProfilesTable,
      eq(jobsTable.employerId, employerProfilesTable.userId),
    )
    .where(eq(jobsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    ...row.job,
    companyName: row.employer?.companyName ?? "",
    companyLogoUrl: row.employer?.logoUrl ?? "",
    companyWebsite: row.employer?.website ?? "",
    companyIndustry: row.employer?.industry ?? "",
    companyDescription: row.employer?.description ?? "",
  });
});

router.patch("/jobs/:id", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { id } = UpdateJobParams.parse(req.params);
  const body = UpdateJobBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (existing.employerId !== user.id) {
    res.status(403).json({ error: "Not allowed to edit this job" });
    return;
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) patch[k] = v;
  }

  const [row] = await db
    .update(jobsTable)
    .set(patch)
    .where(eq(jobsTable.id, id))
    .returning();

  const [employer] = await db
    .select()
    .from(employerProfilesTable)
    .where(eq(employerProfilesTable.userId, user.id));

  res.json({
    ...row,
    companyName: employer?.companyName ?? "",
    companyLogoUrl: employer?.logoUrl ?? "",
    companyWebsite: employer?.website ?? "",
    companyIndustry: employer?.industry ?? "",
    companyDescription: employer?.description ?? "",
  });
});

router.delete("/jobs/:id", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { id } = DeleteJobParams.parse(req.params);

  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (existing.employerId !== user.id) {
    res.status(403).json({ error: "Not allowed to delete this job" });
    return;
  }

  await db.delete(applicationsTable).where(eq(applicationsTable.jobId, id));
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.json({ ok: true });
});

router.get("/employer/jobs", requireAuth("employer"), async (req, res) => {
  const { user } = req as AuthedRequest;
  const rows = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      location: jobsTable.location,
      jobType: jobsTable.jobType,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      currency: jobsTable.currency,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      applicationCount: sql<number>`coalesce(count(${applicationsTable.id})::int, 0)`,
    })
    .from(jobsTable)
    .leftJoin(applicationsTable, eq(applicationsTable.jobId, jobsTable.id))
    .where(eq(jobsTable.employerId, user.id))
    .groupBy(jobsTable.id)
    .orderBy(desc(jobsTable.createdAt));

  res.json(rows);
});

export default router;

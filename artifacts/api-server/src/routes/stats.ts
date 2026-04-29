import { Router, type IRouter } from "express";
import { db, jobsTable, applicationsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/stats/dashboard", requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (user.role === "employer") {
    const [jobsAgg] = await db
      .select({
        total: sql<number>`count(*)::int`,
        open: sql<number>`count(*) filter (where ${jobsTable.status} = 'open')::int`,
      })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, user.id));

    const [appsAgg] = await db
      .select({
        total: sql<number>`count(*)::int`,
        recent: sql<number>`count(*) filter (where ${applicationsTable.createdAt} >= ${sevenDaysAgo})::int`,
      })
      .from(applicationsTable)
      .innerJoin(jobsTable, eq(jobsTable.id, applicationsTable.jobId))
      .where(eq(jobsTable.employerId, user.id));

    res.json({
      role: "employer",
      totalJobs: jobsAgg?.total ?? 0,
      openJobs: jobsAgg?.open ?? 0,
      totalApplications: appsAgg?.total ?? 0,
      recentActivityCount: appsAgg?.recent ?? 0,
    });
    return;
  }

  // seeker
  const [appsAgg] = await db
    .select({
      total: sql<number>`count(*)::int`,
      recent: sql<number>`count(*) filter (where ${applicationsTable.createdAt} >= ${sevenDaysAgo})::int`,
    })
    .from(applicationsTable)
    .where(eq(applicationsTable.seekerId, user.id));

  const [openJobsAgg] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(jobsTable)
    .where(eq(jobsTable.status, "open"));

  res.json({
    role: "seeker",
    totalJobs: openJobsAgg?.total ?? 0,
    openJobs: openJobsAgg?.total ?? 0,
    totalApplications: appsAgg?.total ?? 0,
    recentActivityCount: appsAgg?.recent ?? 0,
  });
});

export default router;

import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const applicationsTable = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull(),
    seekerId: text("seeker_id").notNull(),
    coverLetter: text("cover_letter").notNull().default(""),
    resumeUrl: text("resume_url").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueJobSeeker: uniqueIndex("applications_job_seeker_uniq").on(
      table.jobId,
      table.seekerId,
    ),
  }),
);

export type ApplicationRow = typeof applicationsTable.$inferSelect;

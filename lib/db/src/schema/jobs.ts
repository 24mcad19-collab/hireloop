import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  employerId: text("employer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  qualifications: text("qualifications").notNull().default(""),
  responsibilities: text("responsibilities").notNull().default(""),
  location: text("location").notNull().default(""),
  jobType: text("job_type").notNull().default("full_time"),
  salaryMin: integer("salary_min").notNull().default(0),
  salaryMax: integer("salary_max").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JobRow = typeof jobsTable.$inferSelect;

import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const seekerProfilesTable = pgTable("seeker_profiles", {
  userId: text("user_id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  headline: text("headline").notNull().default(""),
  location: text("location").notNull().default(""),
  phone: text("phone").notNull().default(""),
  bio: text("bio").notNull().default(""),
  resumeUrl: text("resume_url").notNull().default(""),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SeekerProfileRow = typeof seekerProfilesTable.$inferSelect;

export const employerProfilesTable = pgTable("employer_profiles", {
  userId: text("user_id").primaryKey(),
  companyName: text("company_name").notNull().default(""),
  website: text("website").notNull().default(""),
  industry: text("industry").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  logoUrl: text("logo_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EmployerProfileRow = typeof employerProfilesTable.$inferSelect;

# Hireloop — Job Listing Portal

A modern, full-featured job board where employers post listings and seekers browse, search, and apply. Built with a high-class, gradient-accented UI (indigo→violet→cyan) inspired by best-in-class hiring products.

## Architecture

Monorepo (pnpm workspace). Artifacts:
- `artifacts/api-server` — Express + drizzle-orm + cookie-parser, exposes `/api/*` routes.
- `artifacts/relationships` — React + Vite (wouter, TanStack Query) frontend at `/`. (Slug retained from template; user-facing brand is "Hireloop".)
- `artifacts/mockup-sandbox` — template scaffold, unused.

Shared libs:
- `lib/api-spec` — OpenAPI 3.0.3 contract + orval codegen.
- `lib/api-client-react` — generated React Query hooks.
- `lib/api-zod` — generated zod validators (used for request validation in routes).
- `lib/db` — drizzle schema: `users`, `sessions`, `seeker_profiles`, `employer_profiles`, `jobs`, `applications`.

## Auth
- Email + password using Node `crypto.scryptSync` (no extra deps).
- Sessions are server-side rows with a 30-day expiry; identifier stored in an httpOnly `sid` cookie.
- `requireAuth(role?)` middleware guards routes. Roles: `seeker` | `employer`.

## Data model
- `users` — id, email (unique), passwordHash, role.
- `sessions` — id (cookie value), userId, expiresAt.
- `seeker_profiles` — fullName, headline, location, phone, bio, skills (jsonb string[]), resumeUrl.
- `employer_profiles` — companyName, website, industry, location, description, logoUrl.
- `jobs` — employerId, title, description, responsibilities, qualifications, location, jobType (enum), salaryMin/Max/currency, tags (jsonb), status (open|closed).
- `applications` — jobId, seekerId, coverLetter, resumeUrl, status (pending|reviewing|interview|accepted|rejected). Unique (jobId, seekerId).

## Feature surface
- **Public landing `/`** — hero with gradient headline, full-width search (keyword + location), filters sidebar (job type, min salary), grid of job cards. Live-counts roles.
- **Job detail `/jobs/:id`** — full description, role/company sidebar, owner sees Edit/Applicants/Delete; seekers get an Apply dialog (cover letter + resume URL).
- **Auth `/login`, `/register`** — branded card forms; register has role picker (seeker vs employer) and conditional fields.
- **Profile `/profile`** — different forms per role (seeker bio/skills/resume vs company info/logo/website).
- **Dashboard `/dashboard`** — role-aware stats grid + listings (employer) or applications + picks (seeker).
- **Employer flows** — `/post-job`, `/employer/jobs/:id/edit`, `/employer/jobs/:id/applicants` (status picker per applicant, links to resume).
- **Seeker flow** — `/applications` shows all sent applications with status badges.

## API routes (excerpt)
- `POST /api/auth/register|login|logout`, `GET /api/auth/me`
- `GET/PUT /api/profile/seeker|employer`
- `GET /api/jobs` (q, location, jobType, minSalary), `POST /api/jobs`, `GET/PATCH/DELETE /api/jobs/:id`, `GET /api/employer/jobs`
- `POST /api/jobs/:id/apply`, `GET /api/jobs/:id/applications`, `GET /api/seeker/applications`, `PATCH /api/applications/:id`
- `GET /api/stats/dashboard`

## Workflows
- `artifacts/api-server: API Server` — Express API.
- `artifacts/relationships: web` — Vite dev server (Hireloop frontend).

## Codegen
From `lib/api-spec`: `pnpm --filter @workspace/api-spec run codegen` regenerates `lib/api-client-react` + `lib/api-zod` from `openapi.yaml`.

Notes:
- Request-body schemas use `*Payload` suffix (e.g. `RegisterPayload`) to avoid name collisions with orval-generated zod consts derived from operationIds (e.g. `RegisterBody`).
- `MeResponse.user` is nullable via `allOf` + `nullable: true`.

## Design system
- Tailwind v4 with CSS variables.
- Fonts: Inter (body) + Plus Jakarta Sans (`font-display` for headings).
- Accent: indigo→violet→cyan gradients on CTAs, hero headline, brand mark.
- Light + dark mode; theme toggle in header.

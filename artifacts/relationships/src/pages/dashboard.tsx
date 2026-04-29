import { Link, useLocation } from "wouter";
import {
  useGetDashboardStats,
  useListMyJobs,
  useListMyApplications,
  useListJobs,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  MapPin,
  Eye,
  Pencil,
  FileText,
  Loader2,
} from "lucide-react";
import {
  formatSalary,
  timeAgo,
  JOB_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/format";
import { JobCard } from "@/components/job-card";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useGetDashboardStats();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {user.role === "employer" ? "Hiring dashboard" : "Your job search"}
          </h1>
          <p className="text-muted-foreground mt-1.5">
            {user.role === "employer"
              ? "Manage your listings and review applicants in one place."
              : "Track your applications and discover new openings tailored to you."}
          </p>
        </div>
        <div>
          {user.role === "employer" ? (
            <Link href="/post-job">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30">
                <Plus className="size-4 mr-2" />
                Post a new job
              </Button>
            </Link>
          ) : (
            <Link href="/applications">
              <Button variant="outline">
                <FileText className="size-4 mr-2" />
                My applications
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {user.role === "employer" ? (
          <>
            <StatCard
              icon={Briefcase}
              label="Active listings"
              value={stats?.openJobs ?? 0}
              accent="indigo"
            />
            <StatCard
              icon={Users}
              label="Total applicants"
              value={stats?.totalApplications ?? 0}
              accent="cyan"
            />
            <StatCard
              icon={TrendingUp}
              label="New this week"
              value={stats?.recentActivityCount ?? 0}
              accent="emerald"
            />
            <StatCard
              icon={Sparkles}
              label="All-time jobs posted"
              value={stats?.totalJobs ?? 0}
              accent="violet"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Applications sent"
              value={stats?.totalApplications ?? 0}
              accent="indigo"
            />
            <StatCard
              icon={TrendingUp}
              label="Sent this week"
              value={stats?.recentActivityCount ?? 0}
              accent="emerald"
            />
            <StatCard
              icon={Briefcase}
              label="Open jobs out there"
              value={stats?.openJobs ?? 0}
              accent="cyan"
            />
            <StatCard
              icon={Sparkles}
              label="Your match score"
              value="92%"
              accent="violet"
            />
          </>
        )}
      </div>

      {user.role === "employer" ? <EmployerDashboard /> : <SeekerDashboard />}
    </div>
  );
}

function EmployerDashboard() {
  const { data: jobs, isLoading } = useListMyJobs();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Your job listings</h2>
        <Link
          href="/post-job"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 inline-flex items-center gap-1"
        >
          <Plus className="size-4" /> New job
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Briefcase className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">
            No listings yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Post your first role and start receiving qualified applications
            within hours.
          </p>
          <Link href="/post-job">
            <Button className="mt-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <Plus className="size-4 mr-2" />
              Post a job
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {jobs.map((j) => (
            <div
              key={j.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${j.id}`}
                    className="font-display font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                  >
                    {j.title}
                  </Link>
                  <Badge
                    variant={j.status === "open" ? "default" : "secondary"}
                    className={
                      j.status === "open"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                        : ""
                    }
                  >
                    {j.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {j.location || "Remote"}
                  </span>
                  <span>{JOB_TYPE_LABELS[j.jobType] ?? j.jobType}</span>
                  <span>{formatSalary(j.salaryMin ?? 0, j.salaryMax ?? 0, j.currency ?? "USD")}</span>
                  <span>· Posted {timeAgo(j.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="font-medium">
                  <Users className="size-3 mr-1" />
                  {j.applicationCount} {j.applicationCount === 1 ? "applicant" : "applicants"}
                </Badge>
                <Link href={`/employer/jobs/${j.id}/applicants`}>
                  <Button variant="outline" size="sm">
                    <Eye className="size-3.5 mr-1.5" /> View
                  </Button>
                </Link>
                <Link href={`/employer/jobs/${j.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SeekerDashboard() {
  const [, setLocation] = useLocation();
  const { data: apps, isLoading: appsLoading } = useListMyApplications();
  const { data: jobs } = useListJobs({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">
            Recent applications
          </h2>
          <Link
            href="/applications"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 inline-flex items-center gap-1"
          >
            See all <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {appsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !apps || apps.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg">
              No applications yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse open jobs and submit your first application.
            </p>
            <Button className="mt-5" onClick={() => setLocation("/")}>
              Browse jobs
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {apps.slice(0, 5).map((a) => (
              <Link href={`/jobs/${a.jobId}`} key={a.id}>
                <div className="py-3 first:pt-0 flex items-center gap-3 hover:bg-accent/40 -mx-2 px-2 rounded-md transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm truncate">
                      {a.jobTitle}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.companyName} · {a.location}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${STATUS_COLORS[a.status] ?? ""}`}
                  >
                    {STATUS_LABELS[a.status] ?? a.status}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Picked for you</h2>
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {jobs?.slice(0, 3).map((j) => <JobCard key={j.id} job={j} />)}
          {(!jobs || jobs.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No open jobs right now — check back soon.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

const ACCENT_BG: Record<string, string> = {
  indigo:
    "bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 text-indigo-600 dark:text-indigo-400",
  cyan: "bg-gradient-to-br from-cyan-500/10 to-cyan-500/0 text-cyan-600 dark:text-cyan-400",
  violet:
    "bg-gradient-to-br from-violet-500/10 to-violet-500/0 text-violet-600 dark:text-violet-400",
  emerald:
    "bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: keyof typeof ACCENT_BG;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div
        className={`size-10 rounded-xl flex items-center justify-center ${ACCENT_BG[accent]} border border-border/40`}
      >
        <Icon className="size-5" />
      </div>
      <div className="font-display font-bold text-3xl mt-4 leading-none">
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
    </Card>
  );
}

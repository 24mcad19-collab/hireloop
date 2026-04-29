import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ArrowUpRight } from "lucide-react";
import {
  formatSalary,
  timeAgo,
  JOB_TYPE_LABELS,
  companyInitials,
} from "@/lib/format";
import type { JobSummary } from "@workspace/api-client-react";

export function JobCard({ job }: { job: JobSummary }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="group relative p-5 hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden">
        <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-indigo-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10 transition-all" />
        <div className="relative flex items-start gap-4">
          <div className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center font-display font-bold text-sm text-foreground/80">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="size-full rounded-xl object-cover"
              />
            ) : (
              companyInitials(job.companyName || "?")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-base leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {job.companyName || "Stealth company"}
                </p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/60 group-hover:text-indigo-500 group-hover:rotate-12 transition-all shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {job.location || "Remote"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-3.5" />
                {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
              </span>
              <span>·</span>
              <span>{timeAgo(job.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3">
              <span className="text-sm font-semibold text-foreground">
                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </span>
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-end">
                  {job.tags.slice(0, 2).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="font-normal text-[10px] px-1.5 py-0"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

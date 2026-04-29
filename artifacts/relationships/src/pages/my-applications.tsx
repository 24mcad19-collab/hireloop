import { Link, useLocation } from "wouter";
import { useListMyApplications } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  MapPin,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  JOB_TYPE_LABELS,
  timeAgo,
} from "@/lib/format";

export default function MyApplicationsPage() {
  const [, setLocation] = useLocation();
  const { data: apps, isLoading } = useListMyApplications();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          My applications
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Track every application you've sent in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !apps || apps.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">
            No applications yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Browse open jobs and start applying — each one only takes a few
            minutes.
          </p>
          <Button className="mt-5" onClick={() => setLocation("/")}>
            Browse jobs
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <Link key={a.id} href={`/jobs/${a.jobId}`}>
              <Card className="p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold leading-tight">
                      {a.jobTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {a.companyName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {a.location || "Remote"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5" />
                        {JOB_TYPE_LABELS[a.jobType] ?? a.jobType}
                      </span>
                      <span>· Applied {timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${STATUS_COLORS[a.status] ?? ""}`}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

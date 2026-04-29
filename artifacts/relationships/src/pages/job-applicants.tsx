import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetJob,
  useListJobApplications,
  useUpdateApplication,
  getListJobApplicationsQueryKey,
  type ApplicationStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  timeAgo,
  companyInitials,
} from "@/lib/format";
import { toast } from "sonner";

const STATUSES: ApplicationStatus[] = [
  "pending",
  "reviewing",
  "interview",
  "accepted",
  "rejected",
];

export default function JobApplicantsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const { data: job } = useGetJob(id);
  const { data: apps, isLoading } = useListJobApplications(id);
  const qc = useQueryClient();

  const updateStatus = useUpdateApplication({
    mutation: {
      onSuccess: () => {
        toast.success("Status updated");
        qc.invalidateQueries({
          queryKey: getListJobApplicationsQueryKey(id),
        });
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Applicants
        </h1>
        {job && (
          <p className="text-muted-foreground mt-1">
            For{" "}
            <Link
              href={`/jobs/${job.id}`}
              className="text-foreground font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {job.title}
            </Link>{" "}
            · {apps?.length ?? 0}{" "}
            {(apps?.length ?? 0) === 1 ? "candidate" : "candidates"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !apps || apps.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">
            No applicants yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Share your listing in your network to get the first applications
            rolling in.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <Card key={a.id} className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-display font-bold">
                  {companyInitials(a.seekerName || a.seekerEmail || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-lg leading-tight">
                        {a.seekerName || "Candidate"}
                      </h3>
                      {a.seekerHeadline && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {a.seekerHeadline}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {a.seekerEmail && (
                          <a
                            href={`mailto:${a.seekerEmail}`}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <Mail className="size-3.5" />
                            {a.seekerEmail}
                          </a>
                        )}
                        {a.seekerLocation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {a.seekerLocation}
                          </span>
                        )}
                        <span>· Applied {timeAgo(a.createdAt)}</span>
                      </div>
                      {a.seekerSkills && a.seekerSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {a.seekerSkills.slice(0, 6).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="font-normal text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md ${STATUS_COLORS[a.status] ?? ""}`}
                      >
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </div>
                  </div>

                  {a.coverLetter && (
                    <div className="mt-4 rounded-lg bg-muted/40 border border-border/60 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                        <FileText className="size-3.5" />
                        Cover letter
                      </div>
                      <p className="text-sm whitespace-pre-line text-foreground/90">
                        {a.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Update status:
                      </span>
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          updateStatus.mutate({
                            id: a.id,
                            data: { status: v as ApplicationStatus },
                          })
                        }
                      >
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {a.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={a.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5 mr-1.5" />
                          Resume
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetJob,
  useApplyToJob,
  useDeleteJob,
  getListMyApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ArrowLeft,
  Building2,
  Globe,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  formatSalary,
  timeAgo,
  JOB_TYPE_LABELS,
  companyInitials,
} from "@/lib/format";
import { toast } from "sonner";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const { data: job, isLoading } = useGetJob(id);

  const apply = useApplyToJob({
    mutation: {
      onSuccess: () => {
        toast.success("Application sent — fingers crossed!");
        setApplyOpen(false);
        setCoverLetter("");
        setResumeUrl("");
        qc.invalidateQueries({ queryKey: getListMyApplicationsQueryKey() });
      },
      onError: (err) => {
        const msg =
          (err as { data?: { error?: string } })?.data?.error ??
          "Could not send application";
        toast.error(msg);
      },
    },
  });

  const del = useDeleteJob({
    mutation: {
      onSuccess: () => {
        toast.success("Job deleted");
        setLocation("/dashboard");
      },
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground mt-2">
          This listing may have been removed.
        </p>
        <Button onClick={() => setLocation("/")} className="mt-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to jobs
        </Button>
      </div>
    );
  }

  const isOwner = user?.role === "employer" && user.id === job.employerId;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="size-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center font-display font-bold">
                {job.companyLogoUrl ? (
                  <img
                    src={job.companyLogoUrl}
                    alt={job.companyName}
                    className="size-full rounded-2xl object-cover"
                  />
                ) : (
                  companyInitials(job.companyName || "?")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {job.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {job.companyName || "Stealth company"}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {job.location || "Remote"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="size-4" />
                    {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <DollarSign className="size-4" />
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    Posted {timeAgo(job.createdAt)}
                  </span>
                </div>
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.tags.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border/60">
              {isOwner ? (
                <>
                  <Button
                    onClick={() =>
                      setLocation(`/employer/jobs/${job.id}/edit`)
                    }
                    variant="outline"
                  >
                    <Pencil className="size-4 mr-2" />
                    Edit job
                  </Button>
                  <Button
                    onClick={() =>
                      setLocation(`/employer/jobs/${job.id}/applicants`)
                    }
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
                  >
                    View applicants
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-600 hover:bg-rose-500/10"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the listing and all
                          related applications. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-600 hover:bg-rose-500"
                          onClick={() => del.mutate({ id: job.id })}
                        >
                          Delete job
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => {
                      if (!user) {
                        setLocation("/login");
                        return;
                      }
                      if (user.role !== "seeker") {
                        toast.error(
                          "Only job seekers can apply to listings.",
                        );
                        return;
                      }
                      setApplyOpen(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                  >
                    <Sparkles className="size-4 mr-2" />
                    Apply now
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Takes about 2 minutes
                  </span>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <Section title="About the role">
              <p>{job.description || "No description provided."}</p>
            </Section>

            {job.responsibilities && (
              <Section title="What you'll do">
                <p>{job.responsibilities}</p>
              </Section>
            )}

            {job.qualifications && (
              <Section title="What we're looking for">
                <p>{job.qualifications}</p>
              </Section>
            )}
          </Card>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Building2 className="size-4 text-indigo-500" />
              About {job.companyName || "this company"}
            </h3>
            {job.companyIndustry && (
              <Badge variant="outline" className="mt-3 font-normal">
                {job.companyIndustry}
              </Badge>
            )}
            {job.companyDescription && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {job.companyDescription}
              </p>
            )}
            {job.companyWebsite && (
              <a
                href={
                  job.companyWebsite.startsWith("http")
                    ? job.companyWebsite
                    : `https://${job.companyWebsite}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mt-4"
              >
                <Globe className="size-4" />
                {job.companyWebsite}
              </a>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/30 border-indigo-200/60 dark:border-indigo-500/20">
            <h3 className="font-display font-semibold text-sm">Hiring tip</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Personalize your cover letter with one specific reason this team
              caught your eye. Generic intros get skipped.
            </p>
          </Card>
        </aside>
      </div>

      {/* APPLY DIALOG */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Apply for {job.title}
            </DialogTitle>
            <DialogDescription>
              Tell {job.companyName || "the team"} why you're a great fit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cover">Cover letter</Label>
              <Textarea
                id="cover"
                rows={8}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Hi! I'm excited about this role because…"
              />
            </div>
            <div>
              <Label htmlFor="resume">Resume URL (optional)</Label>
              <Input
                id="resume"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="Link to your resume — defaults to your profile"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                apply.mutate({
                  id: job.id,
                  data: { coverLetter, resumeUrl },
                })
              }
              disabled={apply.isPending || !coverLetter.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
            >
              {apply.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 mr-2" />
              )}
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none mt-6 first:mt-0">
      <h2 className="font-display font-semibold text-lg mt-0 mb-2 text-foreground not-prose">
        {title}
      </h2>
      <div className="text-muted-foreground whitespace-pre-line leading-relaxed text-[15px]">
        {children}
      </div>
    </div>
  );
}

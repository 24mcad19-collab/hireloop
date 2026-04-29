import { useParams } from "wouter";
import { useGetJob } from "@workspace/api-client-react";
import { JobForm } from "@/components/job-form";
import { Loader2 } from "lucide-react";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const { data: job, isLoading } = useGetJob(id);

  if (isLoading || !job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Edit job listing
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Update your posting details — changes are visible immediately.
        </p>
      </div>
      <JobForm mode="edit" job={job} />
    </div>
  );
}

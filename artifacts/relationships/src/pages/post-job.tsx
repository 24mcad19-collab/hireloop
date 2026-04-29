import { JobForm } from "@/components/job-form";

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Post a new job
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Reach thousands of qualified candidates. It only takes a couple of
          minutes.
        </p>
      </div>
      <JobForm mode="create" />
    </div>
  );
}

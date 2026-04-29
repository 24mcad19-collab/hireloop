import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateJob,
  useUpdateJob,
  getListMyJobsQueryKey,
  getGetJobQueryKey,
  getListJobsQueryKey,
  type Job,
  type JobType,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Sparkles } from "lucide-react";
import { JOB_TYPE_LABELS } from "@/lib/format";
import { toast } from "sonner";

interface JobFormProps {
  mode: "create" | "edit";
  job?: Job;
}

export function JobForm({ mode, job }: JobFormProps) {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [responsibilities, setResponsibilities] = useState(
    job?.responsibilities ?? "",
  );
  const [qualifications, setQualifications] = useState(
    job?.qualifications ?? "",
  );
  const [location, setJobLocation] = useState(job?.location ?? "");
  const [jobType, setJobType] = useState<JobType>(
    (job?.jobType as JobType) ?? "full_time",
  );
  const [salaryMin, setSalaryMin] = useState(String(job?.salaryMin ?? ""));
  const [salaryMax, setSalaryMax] = useState(String(job?.salaryMax ?? ""));
  const [currency, setCurrency] = useState(job?.currency ?? "USD");
  const [tagsInput, setTagsInput] = useState(
    job?.tags?.join(", ") ?? "",
  );

  const create = useCreateJob({
    mutation: {
      onSuccess: (created) => {
        toast.success("Job posted — candidates can find it now!");
        qc.invalidateQueries({ queryKey: getListMyJobsQueryKey() });
        qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
        setLocation(`/jobs/${created.id}`);
      },
    },
  });

  const update = useUpdateJob({
    mutation: {
      onSuccess: (updated) => {
        toast.success("Job updated");
        qc.invalidateQueries({ queryKey: getListMyJobsQueryKey() });
        qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetJobQueryKey(updated.id) });
        setLocation(`/jobs/${updated.id}`);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title,
      description,
      responsibilities,
      qualifications,
      location,
      jobType,
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      currency,
      tags,
    };
    if (mode === "create") {
      create.mutate({ data: payload });
    } else if (job) {
      update.mutate({ id: job.id, data: payload });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Job title *</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Product Designer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              required
              value={location}
              onChange={(e) => setJobLocation(e.target.value)}
              placeholder="San Francisco, CA / Remote"
            />
          </div>
          <div>
            <Label htmlFor="jobType">Job type *</Label>
            <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
              <SelectTrigger id="jobType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Job description *</Label>
          <Textarea
            id="description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell candidates what makes this opportunity special — the team, the mission, the impact."
          />
        </div>

        <div>
          <Label htmlFor="responsibilities">What they'll do</Label>
          <Textarea
            id="responsibilities"
            rows={5}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            placeholder="• Design end-to-end user experiences&#10;• Partner with engineering and product&#10;• Run user research sessions"
          />
        </div>

        <div>
          <Label htmlFor="qualifications">What you're looking for</Label>
          <Textarea
            id="qualifications"
            rows={5}
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            placeholder="• 5+ years of product design experience&#10;• Strong portfolio of shipped work&#10;• Comfortable with Figma and design systems"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salaryMin">Salary min</Label>
            <Input
              id="salaryMin"
              type="number"
              min="0"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="80000"
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Salary max</Label>
            <Input
              id="salaryMax"
              type="number"
              min="0"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="120000"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="React, TypeScript, Remote"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/60">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30"
          >
            {isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : mode === "create" ? (
              <Sparkles className="size-4 mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {mode === "create" ? "Publish job" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

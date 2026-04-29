import { useState } from "react";
import { useLocation } from "wouter";
import { useListJobs } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { JobCard } from "@/components/job-card";
import { JOB_TYPE_LABELS } from "@/lib/format";
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Sparkles,
  Building2,
  Users,
  Loader2,
} from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [q, setQ] = useState<string>("");
  const [loc, setLoc] = useState<string>("");
  const [jobType, setJobType] = useState<string>("all");
  const [minSalary, setMinSalary] = useState<string>("any");

  const params: Record<string, string | number> = {};
  if (q) params.q = q;
  if (loc) params.location = loc;
  if (jobType !== "all") params.jobType = jobType;
  if (minSalary !== "any") params.minSalary = Number(minSalary);

  const { data: jobs, isLoading } = useListJobs(params);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchInput);
    setLoc(locationInput);
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/40 dark:via-background dark:to-cyan-950/30" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.2), transparent 40%), radial-gradient(circle at 80% 60%, rgba(6,182,212,0.18), transparent 40%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur px-3 py-1 text-xs font-medium text-foreground/80 mb-6">
              <Sparkles className="size-3.5 text-indigo-500" />
              Trusted by ambitious teams worldwide
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Find a job{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                you'll love
              </span>
              <br />
              with the team you deserve.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Search thousands of curated openings from companies hiring right
              now. Apply in minutes — no spam, no recruiters cold-calling you.
            </p>
          </div>

          {/* SEARCH BAR */}
          <form
            onSubmit={onSearch}
            className="mt-10 max-w-4xl bg-card border border-border/60 rounded-2xl shadow-2xl shadow-indigo-500/10 p-2 flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-accent/40 transition-colors">
              <Search className="size-5 text-muted-foreground shrink-0" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Job title, keyword, or company"
                className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent text-base h-9"
              />
            </div>
            <div className="hidden md:block w-px bg-border my-2" />
            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-accent/40 transition-colors">
              <MapPin className="size-5 text-muted-foreground shrink-0" />
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="City or remote"
                className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent text-base h-9"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30 px-8"
            >
              Search jobs
            </Button>
          </form>

          {/* STATS STRIP */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
            <Stat icon={Briefcase} value={jobs?.length ?? 0} label="Open roles" />
            <Stat icon={Building2} value="350+" label="Companies hiring" />
            <Stat icon={Users} value="120K+" label="Candidates active" />
          </div>
        </div>
      </section>

      {/* JOBS LIST */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTERS SIDEBAR */}
          <aside className="lg:w-64 shrink-0">
            <Card className="p-5 sticky top-24">
              <h3 className="font-display font-semibold text-sm mb-4">
                Refine results
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Job type
                  </label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Minimum salary
                  </label>
                  <Select value={minSalary} onValueChange={setMinSalary}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any salary</SelectItem>
                      <SelectItem value="40000">$40,000+</SelectItem>
                      <SelectItem value="60000">$60,000+</SelectItem>
                      <SelectItem value="80000">$80,000+</SelectItem>
                      <SelectItem value="100000">$100,000+</SelectItem>
                      <SelectItem value="150000">$150,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSearchInput("");
                    setLocationInput("");
                    setQ("");
                    setLoc("");
                    setJobType("all");
                    setMinSalary("any");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* JOB LIST */}
          <div className="flex-1 min-w-0">
            <div className="flex items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="size-6 text-indigo-500" />
                  {q || loc || jobType !== "all" || minSalary !== "any"
                    ? "Search results"
                    : "Latest opportunities"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLoading
                    ? "Searching…"
                    : `${jobs?.length ?? 0} ${(jobs?.length ?? 0) === 1 ? "role" : "roles"} found`}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  No jobs match your search
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adjusting your filters or check back soon — new roles are
                  posted every day.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => setLocation("/")}
                >
                  See all jobs
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-background/70 backdrop-blur border border-border/60 flex items-center justify-center">
        <Icon className="size-4 text-indigo-500" />
      </div>
      <div>
        <div className="font-display font-bold text-xl leading-none">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  reviewing: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  interview: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function formatSalary(
  min: number,
  max: number,
  currency = "USD",
): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (min && max && min !== max) return `${fmt.format(min)} – ${fmt.format(max)}`;
  return fmt.format(min || max);
}

export function timeAgo(input: string | Date | undefined): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return d.toLocaleDateString();
}

export function companyInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

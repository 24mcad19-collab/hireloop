import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Briefcase, Loader2, User, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { refetch } = useAuth();

  const register = useRegister({
    mutation: {
      onSuccess: () => {
        toast.success("Account created — let's get you set up!");
        qc.invalidateQueries();
        refetch();
        setLocation("/profile");
      },
      onError: (err) => {
        const msg =
          (err as { data?: { error?: string } })?.data?.error ??
          "Could not create account";
        toast.error(msg);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate({
      data: { email, password, role, fullName, companyName },
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <Card className="p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Briefcase className="size-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join Hireloop in less than a minute.
          </p>
        </div>

        {/* ROLE PICKER */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <RoleCard
            active={role === "seeker"}
            onClick={() => setRole("seeker")}
            icon={User}
            title="I'm hiring myself"
            sub="Find your next role"
          />
          <RoleCard
            active={role === "employer"}
            onClick={() => setRole("employer")}
            icon={Building2}
            title="I'm hiring others"
            sub="Post jobs & hire"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {role === "seeker" ? (
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
            disabled={register.isPending}
          >
            {register.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-3 text-left transition-all",
        active
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/30"
          : "border-border hover:border-indigo-300 dark:hover:border-indigo-500/30",
      ].join(" ")}
    >
      <Icon
        className={
          active
            ? "size-4 text-indigo-600 dark:text-indigo-400 mb-1.5"
            : "size-4 text-muted-foreground mb-1.5"
        }
      />
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const login = useLogin({
    mutation: {
      onSuccess: (user) => {
        qc.setQueryData(getGetMeQueryKey(), { user });
        qc.invalidateQueries();
        toast.success("Welcome back!");
        setLocation("/dashboard");
      },
      onError: (err) => {
        const msg =
          (err as { data?: { error?: string } })?.data?.error ??
          "Invalid email or password";
        toast.error(msg);
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ data: { email, password } });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <Card className="p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Briefcase className="size-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to manage your jobs and applications.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
            disabled={login.isPending}
          >
            {login.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New to Hireloop?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}

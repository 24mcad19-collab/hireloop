import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center mb-6">
        <Search className="size-7 text-indigo-500" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        404
      </h1>
      <p className="text-muted-foreground mt-2">
        We couldn't find the page you're looking for.
      </p>
      <Link href="/">
        <Button className="mt-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to jobs
        </Button>
      </Link>
    </div>
  );
}

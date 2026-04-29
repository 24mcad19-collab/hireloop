import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  FileText,
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const qc = useQueryClient();
  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        toast.success("Signed out");
        qc.clear();
        setLocation("/");
      },
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Briefcase className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold tracking-tight text-lg">
                Hireloop
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold">
                Work, found
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={location === "/"}>
              Browse jobs
            </NavLink>
            {user?.role === "employer" && (
              <NavLink href="/post-job" active={location === "/post-job"}>
                Post a job
              </NavLink>
            )}
            {user && (
              <NavLink
                href="/dashboard"
                active={location.startsWith("/dashboard")}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-xs font-semibold">
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                      {user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{user.email}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role === "seeker" ? "Job seeker" : "Employer"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation("/dashboard")}
                  >
                    <LayoutDashboard className="size-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="size-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {user.role === "seeker" && (
                    <DropdownMenuItem
                      onClick={() => setLocation("/applications")}
                    >
                      <FileText className="size-4 mr-2" />
                      My applications
                    </DropdownMenuItem>
                  )}
                  {user.role === "employer" && (
                    <DropdownMenuItem onClick={() => setLocation("/post-job")}>
                      <Plus className="size-4 mr-2" />
                      Post a job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout.mutate()}
                    className="text-rose-600 focus:text-rose-600"
                  >
                    <LogOut className="size-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/login")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/register")}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/30"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500" />
            <span className="font-semibold text-foreground">Hireloop</span>
            <span>· Built for great teams and great talent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Search className="size-3.5" />
            <span>Discover. Apply. Get hired.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        active
          ? "text-foreground bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

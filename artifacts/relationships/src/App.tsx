import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import JobDetailPage from "@/pages/job-detail";
import DashboardPage from "@/pages/dashboard";
import PostJobPage from "@/pages/post-job";
import EditJobPage from "@/pages/job-edit";
import JobApplicantsPage from "@/pages/job-applicants";
import MyApplicationsPage from "@/pages/my-applications";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({
  component: Component,
  role,
}: {
  component: React.ComponentType;
  role?: "seeker" | "employer";
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) {
    setLocation("/login");
    return null;
  }
  if (role && user.role !== role) {
    return <Redirect to="/dashboard" />;
  }
  return <Component />;
}

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/jobs/:id" component={JobDetailPage} />
        <Route path="/dashboard">
          <ProtectedRoute component={DashboardPage} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={ProfilePage} />
        </Route>
        <Route path="/post-job">
          <ProtectedRoute component={PostJobPage} role="employer" />
        </Route>
        <Route path="/employer/jobs/:id/edit">
          <ProtectedRoute component={EditJobPage} role="employer" />
        </Route>
        <Route path="/employer/jobs/:id/applicants">
          <ProtectedRoute component={JobApplicantsPage} role="employer" />
        </Route>
        <Route path="/applications">
          <ProtectedRoute component={MyApplicationsPage} role="seeker" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="hireloop-theme">
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useGetMe, type AuthUser } from "@workspace/api-client-react";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useGetMe();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: (data?.user as AuthUser | null) ?? null,
      isLoading,
      refetch: () => {
        void refetch();
      },
    }),
    [data, isLoading, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

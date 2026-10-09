import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMe, login as loginRequest } from "../api/authApi";
import type { User } from "../model/types";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!localStorage.getItem("crm-token")) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("crm-token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const result = await loginRequest(email, password);
        localStorage.setItem("crm-token", result.token);
        setUser(result.user);
      },
      logout() {
        localStorage.removeItem("crm-token");
        // Drop cached lists so the next user (possibly another tenant) never sees them.
        queryClient.clear();
        setUser(null);
      },
    }),
    [user, loading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

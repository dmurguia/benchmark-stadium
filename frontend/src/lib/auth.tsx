import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type UserOut } from "./api";

/** Which gated action asked for sign-in, if any. Drives the AuthModal copy. */
export type AuthGate = "search" | "projects" | "judging" | null;

interface AuthState {
  user: UserOut | null;
  loading: boolean;
  gate: AuthGate;
  requestAuth: (gate: Exclude<AuthGate, null>) => void;
  dismissAuth: () => void;
  signIn: (token: string, user: UserOut) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  gate: null,
  requestAuth: () => {},
  dismissAuth: () => {},
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<AuthGate>(null);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<UserOut>("/api/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const requestAuth = useCallback((next: Exclude<AuthGate, null>) => setGate(next), []);
  const dismissAuth = useCallback(() => setGate(null), []);

  const signIn = (token: string, u: UserOut) => {
    setToken(token);
    setUser(u);
    setGate(null);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    void api("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, gate, requestAuth, dismissAuth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

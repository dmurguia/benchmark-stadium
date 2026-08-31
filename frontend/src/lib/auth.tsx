import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type UserOut } from "./api";

interface AuthState {
  user: UserOut | null;
  loading: boolean;
  signIn: (token: string, user: UserOut) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signIn = (token: string, u: UserOut) => {
    setToken(token);
    setUser(u);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    void api("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

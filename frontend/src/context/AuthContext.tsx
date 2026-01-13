import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authAPI, setAuthToken } from "../services/api";
import type { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "easybooking_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as {
          user: AuthUser;
          token: string;
        };
        setUser(parsed.user);
        setToken(parsed.token);
        setAuthToken(parsed.token);
      } catch (err) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((payload: { user: AuthUser; token: string }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setUser(payload.user);
    setToken(payload.token);
    setAuthToken(payload.token);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    persist({ user: data.user, token: data.token });
  }, [persist]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await authAPI.register(email, password, name);
      persist({ user: data.user, token: data.token });
    },
    [persist],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

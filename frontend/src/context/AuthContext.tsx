import { useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import type { AuthUser } from "../services/authService";
import { AuthContext } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          setAuthError("Unable to verify your session. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function register(name: string, email: string, password: string) {
    const registeredUser = await authService.register(name, email, password);
    setAuthError(null);
    setUser(registeredUser);
    return registeredUser;
  }

  async function login(email: string, password: string) {
    const loggedInUser = await authService.login(email, password);
    setAuthError(null);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, authError, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

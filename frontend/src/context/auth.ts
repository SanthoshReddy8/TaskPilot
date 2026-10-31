import { createContext } from "react";
import type { AuthUser } from "../services/authService";
import type * as authService from "../services/authService";

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  authError: string | null;
  register: typeof authService.register;
  login: typeof authService.login;
  logout: typeof authService.logout;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

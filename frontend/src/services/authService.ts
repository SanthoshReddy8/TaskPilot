export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export class AuthApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new AuthApiError(body?.error || "The request could not be completed", response.status);
  }

  return (await response.json()) as T;
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const result = await request<{ user: AuthUser }>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return result.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await request<{ user: AuthUser }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return result.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const result = await request<{ user: AuthUser }>("/me");
    return result.user;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await request<{ message: string }>("/logout", { method: "POST" });
}

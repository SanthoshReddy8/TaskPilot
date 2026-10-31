import type { Task, TaskInput } from "../types/task";

export class TaskApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TaskApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T | undefined> {
  const response = await fetch(`/api/tasks${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new TaskApiError(body?.error || "The request could not be completed", response.status);
  }

  if (response.status === 204) {
    return undefined;
  }

  return (await response.json()) as T;
}

async function requireResponse<T>(path: string, options?: RequestInit): Promise<T> {
  const result = await request<T>(path, options);
  if (result === undefined) {
    throw new Error("The server returned an unexpected empty response");
  }
  return result;
}

export const taskService = {
  getAll: () => requireResponse<Task[]>(""),

  getById: (id: string) => requireResponse<Task>(`/${encodeURIComponent(id)}`),

  create: (data: TaskInput) =>
    requireResponse<Task>("", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<TaskInput>) =>
    requireResponse<Task>(`/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  async remove(id: string): Promise<void> {
    await request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

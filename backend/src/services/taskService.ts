import type { Prisma } from "@prisma/client";

export const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

export class TaskError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TaskError";
    this.status = status;
  }
}

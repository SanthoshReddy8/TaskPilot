import type { Prisma } from "@prisma/client";

export const taskSelect = {
  id: true,
  title: true,
  description: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

type CreateTaskInput = {
  title: string;
  description: string | null;
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
};

export class TaskError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TaskError";
    this.status = status;
  }
}

function readTaskBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new TaskError("A JSON request body is required", 400);
  }
  return body as Record<string, unknown>;
}

function rejectUnknownFields(body: Record<string, unknown>) {
  const unknownFields = Object.keys(body).filter((key) => key !== "title" && key !== "description");
  if (unknownFields.length > 0) {
    throw new TaskError(`Unsupported task field: ${unknownFields[0]}`, 400);
  }
}

function readTitle(value: unknown): string {
  if (typeof value !== "string") {
    throw new TaskError("Title is required", 400);
  }
  const title = value.trim();
  if (title.length === 0 || title.length > 200) {
    throw new TaskError("Title must be between 1 and 200 characters", 400);
  }
  return title;
}

function readDescription(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new TaskError("Description must be a string or null", 400);
  }
  const description = value.trim();
  if (description.length > 5000) {
    throw new TaskError("Description must be 5000 characters or fewer", 400);
  }
  return description || null;
}

export function readCreateTaskInput(body: unknown): CreateTaskInput {
  const input = readTaskBody(body);
  rejectUnknownFields(input);
  return {
    title: readTitle(input.title),
    description: readDescription(input.description),
  };
}

export function readUpdateTaskInput(body: unknown): UpdateTaskInput {
  const input = readTaskBody(body);
  rejectUnknownFields(input);
  if (Object.keys(input).length === 0) {
    throw new TaskError("Provide a title or description to update", 400);
  }

  const data: UpdateTaskInput = {};
  if (Object.hasOwn(input, "title")) {
    data.title = readTitle(input.title);
  }
  if (Object.hasOwn(input, "description")) {
    data.description = readDescription(input.description);
  }
  return data;
}

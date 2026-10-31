import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { TaskError } from "../services/taskService";
import {
  readCreateTaskInput,
  taskSelect,
} from "../services/taskService";
import { updateTaskSchema } from "../validators/taskValidator";

function requireUserId(req: Request): string {
  if (!req.userId) {
    throw new TaskError("Authentication required", 401);
  }
  return req.userId;
}

function requireTaskId(req: Request): string {
  const { id } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new TaskError("A valid task ID is required", 400);
  }
  return id;
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const input = readCreateTaskInput(req.body);
    const task = await prisma.task.create({
      data: { ...input, userId },
      select: taskSelect,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: taskSelect,
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await prisma.task.findFirst({
      where: { id: requireTaskId(req), userId: requireUserId(req) },
      select: taskSelect,
    });
    if (!task) {
      throw new TaskError("Task not found", 404);
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = requireTaskId(req);
    const userId = requireUserId(req);
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid task data",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result = await prisma.task.updateMany({
      where: { id, userId },
      data: parsed.data,
    });
    if (result.count === 0) {
      throw new TaskError("Task not found", 404);
    }

    const task = await prisma.task.findFirst({
      where: { id, userId },
      select: taskSelect,
    });
    if (!task) {
      throw new TaskError("Task not found", 404);
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        id: requireTaskId(req),
        userId: requireUserId(req),
      },
    });
    if (result.count === 0) {
      throw new TaskError("Task not found", 404);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export function handleTaskError(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (error instanceof TaskError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: "Invalid task data" });
    return;
  }
  next(error);
}

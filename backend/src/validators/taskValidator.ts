import { z } from "zod";
import { dueDateSchema } from "./dateValidator";

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z
      .string()
      .max(2000)
      .nullable()
      .optional()
      .transform((value) => typeof value === "string" ? value.trim() || null : value),
    dueDate: dueDateSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: dueDateSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

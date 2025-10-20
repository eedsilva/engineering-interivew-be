import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(5000)
    .optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

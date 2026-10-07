import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  role: z.enum(["admin", "vendedor"]),
});

export const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "vendedor"]),
});

export const userIdSchema = z.object({ userId: z.string().uuid() });

export const passwordSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8).max(72),
});

export const activeSchema = z.object({
  userId: z.string().uuid(),
  active: z.boolean(),
});

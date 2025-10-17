import { z } from 'zod';

export const getCustomersSchema = z.object({
  search: z.string().trim().optional().default(''),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(3).max(40),
});

export const editCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().min(3).max(40).optional(),
});

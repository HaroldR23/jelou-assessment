import { z } from 'zod';

export const getCustomersSchema = z.object({
    search: z.preprocess(v => (v === '' ? undefined : v), z.string().trim().optional()),
    cursor: z.preprocess(v => (v === '' || v === undefined ? undefined : Number(v)),
                         z.number().int().positive().optional()),
    limit:  z.preprocess(v => (v === '' || v === undefined ? 10 : Number(v)),
                         z.number().int().min(1).max(100).default(10)),
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

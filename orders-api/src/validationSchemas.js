import { z } from 'zod';

export const createOrderSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(z.object({ product_id: z.number().int().positive(), qty: z.number().int().positive() })).min(1)
});

export const getOrdersSchema = z.object({
  status: z.enum(['CREATED','CONFIRMED','CANCELED']).optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price_cents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
});

export const editProductSchema = z.object({
  name: z.string().min(1).optional(),
  price_cents: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
}).refine((d) => d.name !== undefined || d.price_cents !== undefined || d.stock !== undefined, { message: 'No fields to update' });

export const getProductsSchema = z.object({
  search: z.string().trim().optional().default(''),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

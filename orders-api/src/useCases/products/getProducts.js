import { z } from 'zod';
import { getProductsSchema } from '../../validationSchemas.js';

export const getProducts = async (pool, req, res) => {
  const parsed = getProductsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { search, cursor, limit } = parsed.data;
  const params = [];
  let where = 'WHERE 1=1';
  if (search) { 
    where += ' AND (sku LIKE ? OR name LIKE ?)'; 
    params.push(`%${search}%`, `%${search}%`); 
  }
  if (cursor) { 
    where += ' AND id > ?'; 
    params.push(cursor); 
  }

  const sql = `SELECT id, sku, name, price_cents, stock, created_at FROM products ${where} ORDER BY id ASC LIMIT ${limit + 1}`;
  params.push(limit + 1);

  const [rows] = await pool.execute(sql, params);
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const next_cursor = hasMore ? items[items.length - 1].id : null;
  return res.json({ items, next_cursor, limit });
};

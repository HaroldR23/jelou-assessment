import { editProductSchema } from '../../validationSchemas.js';

export const editProduct = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  const parsed = editProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const fields = parsed.data;
  const sets = [];
  const values = [];
  for (const [k, v] of Object.entries(fields)) { sets.push(`${k} = ?`); values.push(v); }
  values.push(id);

  const [r] = await pool.execute(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });

  const [[row]] = await pool.query('SELECT id, sku, name, price_cents, stock, created_at FROM products WHERE id = ?', [id]);
  return res.json(row);
};

import { createProductSchema } from '../../validationSchemas.js';


export const createProduct = async (pool, req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const { sku, name, price_cents, stock } = parsed.data;
  try {
    const [r] = await pool.execute(
      'INSERT INTO products(sku, name, price_cents, stock) VALUES (?, ?, ?, ?)',
      [sku, name, price_cents, stock]
    );
    res.status(201).json({ id: r.insertId, sku, name, price_cents, stock });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SKU already exists' });
    console.error(e); res.status(500).json({ error: 'Internal error' });
  }
};

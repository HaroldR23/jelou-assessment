export const getProductById = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  const [rows] = await pool.execute('SELECT id, sku, name, price_cents, stock, created_at FROM products WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Product not found' });
  return res.json(rows[0]);
};

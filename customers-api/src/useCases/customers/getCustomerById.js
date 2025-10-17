export const getCustomerById = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  const [rows] = await pool.execute(
    'SELECT * FROM customers WHERE id = ?',
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
  return res.json(rows[0]);
};

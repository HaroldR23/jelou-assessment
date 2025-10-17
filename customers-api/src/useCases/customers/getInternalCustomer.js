export const getInternalCustomer = async (pool, req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    return res.json(rows[0]);
  } catch (e) {
    console.error(e, "Error fetching customer");
    return res.status(500).json({ error: 'Internal error' });
  }
};

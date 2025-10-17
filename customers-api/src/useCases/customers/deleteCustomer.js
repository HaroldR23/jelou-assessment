export const deleteCustomer = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [r] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    return res.status(204).send();
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2' || e.errno === 1451) {
      return res.status(409).json({ error: 'Customer has related orders; cannot delete' });
    }
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

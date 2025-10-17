export const deleteCustomer = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


  const [r] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
  return res.status(204).send();
};  
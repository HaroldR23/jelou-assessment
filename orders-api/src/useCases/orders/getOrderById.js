export const getOrderById = async (pool, req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  
    const [[order]] = await pool.query('SELECT id, customer_id, status, total_cents, created_at FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
  
    const [items] = await pool.execute('SELECT product_id, qty, unit_price_cents, subtotal_cents FROM order_items WHERE order_id = ?', [id]);
    return res.json({ ...order, items });
};

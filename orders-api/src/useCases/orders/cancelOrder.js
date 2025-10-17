export const cancelOrder = async (pool, req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) return res.status(400).json({ error: 'Invalid id' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[order]] = await conn.query('SELECT id, status, created_at FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) throw new Error('ORDER_NOT_FOUND');

    if (order.status === 'CANCELED') {
      await conn.commit();
      return res.json({ id: orderId, status: 'CANCELED' });
    }

    if (order.status === 'CREATED') {
      // Restaura stock
      const [items] = await conn.execute('SELECT product_id, qty FROM order_items WHERE order_id = ?', [orderId]);
      for (const it of items) {
        await conn.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [it.qty, it.product_id]);
      }
      await conn.execute('UPDATE orders SET status = "CANCELED" WHERE id = ?', [orderId]);
      await conn.commit();
      return res.json({ id: orderId, status: 'CANCELED' });
    }

    if (order.status === 'CONFIRMED') {
      // Permitido dentro de los 10 minutos
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMs = now - createdAt;
      if (diffMs > 10 * 60 * 1000) {
        await conn.rollback();
        return res.status(409).json({ error: 'Cancel window exceeded (10 minutes)' });
      }
      const [items] = await conn.execute('SELECT product_id, qty FROM order_items WHERE order_id = ?', [orderId]);
      for (const it of items) {
        await conn.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [it.qty, it.product_id]);
      }
      await conn.execute('UPDATE orders SET status = "CANCELED" WHERE id = ?', [orderId]);
      await conn.commit();
      return res.json({ id: orderId, status: 'CANCELED' });
    }

    await conn.rollback();
    return res.status(409).json({ error: `Cannot cancel from status ${order.status}` });
  } catch (e) {
    await conn.rollback();
    if (e.message === 'ORDER_NOT_FOUND') return res.status(404).json({ error: 'Order not found' });
    console.error(e); return res.status(500).json({ error: 'Internal error' });
  } finally {
    conn.release();
  }
};

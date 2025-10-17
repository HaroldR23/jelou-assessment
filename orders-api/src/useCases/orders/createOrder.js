import axios from 'axios';
import { createOrderSchema } from '../../validationSchemas.js';

export const createOrder = async (pool, req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { customer_id, items } = parsed.data;

  // Valida cliente via customers /internal
  try {
    const token = process.env.SERVICE_TOKEN;
    const base = process.env.CUSTOMERS_API_BASE;
    await axios.get(`${base}/internal/customers/${customer_id}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid customer' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verifica stock y total
    let total = 0;
    const priceCache = new Map();

    for (const it of items) {
      const [rows] = await conn.execute('SELECT price_cents, stock FROM products WHERE id = ? FOR UPDATE', [it.product_id]);
      if (!rows.length) throw new Error('PRODUCT_NOT_FOUND');
      const { price_cents, stock } = rows[0];
      if (stock < it.qty) throw new Error('INSUFFICIENT_STOCK');
      total += price_cents * it.qty;
      priceCache.set(it.product_id, price_cents);
    }

    const [orderRes] = await conn.execute('INSERT INTO orders(customer_id, status, total_cents) VALUES (?, "CREATED", ?)', [customer_id, total]);
    const orderId = orderRes.insertId;

    for (const it of items) {
      const unit = priceCache.get(it.product_id);
      await conn.execute('INSERT INTO order_items(order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)', [orderId, it.product_id, it.qty, unit, unit * it.qty]);
      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [it.qty, it.product_id]);
    }

    await conn.commit();
    return res.status(201).json({ id: orderId, status: 'CREATED', total_cents: total });
  } catch (e) {
    await conn.rollback();
    if (e.message === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'Insufficient stock' });
    if (e.message === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Product not found' });
    console.error(e); return res.status(500).json({ error: 'Internal error' });
  } finally {
    conn.release();
  }
};

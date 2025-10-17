import { getOrdersSchema } from '../../validationSchemas.js';

export const getOrders = async (pool, req, res) => {
  const parsed = getOrdersSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { status, from, to, cursor, limit } = parsed.data;
  const params = [];
    let where = 'WHERE 1=1';
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (from)  { where += ' AND created_at >= ?'; params.push(new Date(from)); }
    if (to)    { where += ' AND created_at < ?'; params.push(new Date(to)); }
    if (cursor){ where += ' AND id > ?'; params.push(cursor); }

    const sql = `SELECT id, customer_id, status, total_cents, created_at FROM orders ${where} ORDER BY id ASC LIMIT ${limit + 1}`;
    params.push(limit + 1);
  
    const [rows] = await pool.execute(sql, params);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const next_cursor = hasMore ? items[items.length - 1].id : null;
    return res.json({ items, next_cursor, limit });
};

import { getCustomersSchema } from "../../validationSchemas.js";

export const getCustomers = async (pool, req, res) => {
  const parsed = getCustomersSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  let { search, cursor, limit } = parsed.data;
  limit = Number(limit);

  const params = [];
  let where = 'WHERE 1=1';

  if (typeof search === 'string' && search.length) {
    where += ' AND (name LIKE ? OR email LIKE ?)';
    const terms = `%${search}%`;
    params.push(terms, terms);
  }

  if (typeof cursor === 'number' && Number.isFinite(cursor)) {
    where += ' AND id > ?';
    params.push(cursor);
  }

  const limitForQuery = limit + 1; 
  const sql = `
    SELECT id, name, email, phone, created_at
    FROM customers
    ${where}
    ORDER BY id ASC
    LIMIT ${limitForQuery}
  `;

    const [rows] = await pool.execute(sql, params);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const next_cursor = items.length ? items[items.length - 1].id : null;

    return res.json({ items, next_cursor, limit });
};

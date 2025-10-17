import { getCustomersSchema } from "../../validationSchemas.js";

export const getCustomers = async (pool, req, res) => {

  const parsed = getCustomersSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });


  const { search, cursor, limit } = parsed.data;
  const terms = `%${search}%`;


  const params = [];
  let where = 'WHERE 1=1';
  if (search) {
    where += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(terms, terms);
  }
  if (cursor) {
    where += ' AND id > ?';
    params.push(cursor);
  }


  const sql = `SELECT id, name, email, phone, created_at
  FROM customers
  ${where}
  ORDER BY id ASC
  LIMIT ?`;
  params.push(limit + 1);


  const [rows] = await pool.execute(sql, params);
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const next_cursor = hasMore ? items[items.length - 1].id : null;


  return res.json({ items, next_cursor, limit });
};

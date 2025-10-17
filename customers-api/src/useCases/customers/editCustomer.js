import { editCustomerSchema } from "../../validationSchemas.js";

export const editCustomer = async (pool, req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  const parsed = editCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });


  const fields = parsed.data;
  const sets = [];
  const values = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    values.push(v);
  }
  values.push(id);


  try {
    const [r] = await pool.execute(
      `UPDATE customers SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });


    const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(e); return res.status(500).json({ error: 'Internal error' });
  }
};

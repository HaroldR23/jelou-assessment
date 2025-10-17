import { createCustomerSchema } from "../../validationSchemas.js";

export const createCustomer = async (pool, req, res) => {


  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });


  const { name, email, phone } = parsed.data;
  try {
    const [r] = await pool.execute(
      'INSERT INTO customers(name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    return res.status(201).json({ id: r.insertId, name, email, phone });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

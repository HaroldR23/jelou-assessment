function parseStoredBody(raw) {
  if (raw == null) return null;
  if (Buffer.isBuffer(raw)) {
    const s = raw.toString('utf8');
    try { return JSON.parse(s); } catch { return s; }
  }
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return raw;
}

export const confirmOrder = async (pool, req, res) => {
  const orderId = Number(req.params.id);
  const key = req.header('X-Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Missing X-Idempotency-Key' });

  // 1) Validar idempotency key existente
  const [existing] = await pool.execute(
    'SELECT `key`, status, response_body FROM idempotency_keys WHERE `key` = ?',
    [key]
  );
  if (existing.length) {
    const body = parseStoredBody(existing[0].response_body);
    return res.status(200).json(body);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 2) Validar orden y lockearla
    const [[order]] = await conn.query(
      'SELECT status, total_cents FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    );
    if (!order) throw new Error('ORDER_NOT_FOUND');

    // 3) Si ya estaba confirmada, persistimos y devolvemos la misma forma de respuesta
    if (order.status === 'CONFIRMED') {
      const response = { id: orderId, status: 'CONFIRMED' };
      try {
        await conn.execute(
          'INSERT INTO idempotency_keys(`key`, target_type, target_id, status, response_body) VALUES (?, ?, ?, ?, ?)',
          [key, 'ORDER_CONFIRM', orderId, 'SUCCESS', JSON.stringify(response)]
        );
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
          const [[dup]] = await conn.query('SELECT response_body FROM idempotency_keys WHERE `key` = ?', [key]);
          const body = parseStoredBody(dup.response_body);
          await conn.commit();
          return res.status(200).json(body);
        }
        throw e;
      }
      await conn.commit();
      return res.json(response);
    }

    // 4) Transición CREATED -> CONFIRMED
    if (order.status !== 'CREATED') {
      await conn.rollback();
      return res.status(409).json({ error: `Cannot confirm from status ${order.status}` });
    }

    await conn.execute('UPDATE orders SET status = "CONFIRMED" WHERE id = ?', [orderId]);
    const response = { id: orderId, status: 'CONFIRMED' };

    try {
      await conn.execute(
        'INSERT INTO idempotency_keys(`key`, target_type, target_id, status, response_body) VALUES (?, ?, ?, ?, ?)',
        [key, 'ORDER_CONFIRM', orderId, 'SUCCESS', JSON.stringify(response)]
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        const [[dup]] = await conn.query('SELECT response_body FROM idempotency_keys WHERE `key` = ?', [key]);
        const body = parseStoredBody(dup.response_body);
        await conn.commit();
        return res.status(200).json(body);
      }
      throw e;
    }

    await conn.commit();
    return res.json(response);
  } catch (e) {
    await conn.rollback();
    if (e.message === 'ORDER_NOT_FOUND') return res.status(404).json({ error: 'Order not found' });
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  } finally {
    conn.release();
  }
};

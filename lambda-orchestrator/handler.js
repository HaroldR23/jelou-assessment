import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const createAndConfirm = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { customer_id, items, idempotency_key, correlation_id } = body || {};

    const serviceToken = process.env.SERVICE_TOKEN;
    const jwtToken = process.env.JWT_TOKEN;
    const customersBase = process.env.CUSTOMERS_API_BASE;
    const ordersBase = process.env.ORDERS_API_BASE;

    // 1) Validar cliente
    const customer = (await axios.get(`${customersBase}/internal/customers/${customer_id}`, { headers: { Authorization: `Bearer ${serviceToken}` } })).data;

    // 2) Crear pedido
    const created = (await axios.post(`${ordersBase}/orders`, { customer_id, items }, { headers: { Authorization: `Bearer ${jwtToken}` } })).data;

    // 3) Confirmar pedido (idempotente)
    const confirmed = (await axios.post(`${ordersBase}/orders/${created.id}/confirm`, {}, { headers: { Authorization: `Bearer ${jwtToken}`, 'X-Idempotency-Key': idempotency_key } })).data;

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        correlationId: correlation_id || null,
        data: {
          customer,
          order: { ...confirmed, total_cents: created.total_cents }
        }
      })
    };
  } catch (e) {
    console.error(e?.response?.data || e);
    return { statusCode: 400, body: JSON.stringify({ success: false, error: e?.response?.data || 'Bad Request' }) };
  }
};

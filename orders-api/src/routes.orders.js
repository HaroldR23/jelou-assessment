import express from 'express';
import { z } from 'zod';
import axios from 'axios';
import { pool } from './db.js';
import { requireJWT } from './auth.js';
import { createOrder, getOrderById, getOrders, confirmOrder, cancelOrder } from './useCases/orders/index.js';

const router = express.Router();

router.get('/health', (_, res) => res.json({ ok: true, service: 'orders-api' }));

// POST /orders – Valida cliente, crea orden, modifica stock y calcula el total de la orden
router.post('/orders', requireJWT, async (req, res) => {
  return createOrder(pool, req, res);
});

// GET /orders/:id – Obtiene orden por ID
router.get('/orders/:id', requireJWT, async (req, res) => {
  return getOrderById(pool, req, res);
});

// GET /orders – Obtiene ordenes con filtros (estado, rango de fechas) + paginación por cursor
router.get('/orders', requireJWT, async (req, res) => {
  return getOrders(pool, req, res);
});

// POST /orders/:id/confirm – Confirma orden con idempotency_key (X-Idempotency-Key)
router.post('/orders/:id/confirm', requireJWT, async (req, res) => {
  return confirmOrder(pool, req, res);
});


// POST /orders/:id/cancel – Restaura stock y cambia estado de la orden a CANCELLED (dentro de los 10 minutos)
router.post('/orders/:id/cancel', requireJWT, async (req, res) => {
  return cancelOrder(pool, req, res);
});

export default router;

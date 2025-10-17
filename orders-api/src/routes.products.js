import express from 'express';
import { pool } from './db.js';
import { requireJWT } from './auth.js';

import { createProduct, editProduct, getProductById, getProducts } from './useCases/products/index.js';
const router = express.Router();

// POST /products – Crea nuevo producto
router.post('/products', requireJWT, async (req, res) => {
  return createProduct(pool, req, res);
});

// PATCH /products/:id – Modifica precio/cantidad
router.patch('/products/:id', requireJWT, async (req, res) => {
  return editProduct(pool, req, res);
});

// GET /products/:id – Obtiene producto por ID
router.get('/products/:id', requireJWT, async (req, res) => {
  return getProductById(pool, req, res);
});

// GET /products – Obtiene productos con paginación por cursor
router.get('/products', requireJWT, async (req, res) => {
  return getProducts(pool, req, res);
});

export default router;

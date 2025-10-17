import { pool } from './db.js';
import { requireJWT, requireServiceToken } from './auth.js';
import express from 'express';
import { 
  createCustomer, 
  deleteCustomer, 
  editCustomer, 
  getCustomerById, 
  getCustomers, 
  getInternalCustomer 
} from './useCases/customers/index.js';

const router = express.Router();


router.get('/health', (_, res) => res.json({ ok: true, service: 'customers-api' }));


// Crear cliente: POST /customers (requiere JWT)
router.post('/customers', requireJWT, async (req, res) => {
  return createCustomer(pool, req, res);
});

// BÚSQUEDA/LISTADO: GET /customers?search=&cursor=&limit= (requiere JWT)
router.get('/customers', requireJWT, async (req, res) => {
  return getCustomers(pool, req, res);
});

// DETALLE: GET /customers/:id (requiere JWT)
router.get('/customers/:id', requireJWT, async (req, res) => {
  return getCustomerById(pool, req, res);
});

// ACTUALIZAR: PUT /customers/:id (requiere JWT)
router.put('/customers/:id', requireJWT, async (req, res) => {
  return editCustomer(pool, req, res);
});

// ELIMINAR (definitivo): DELETE /customers/:id (requiere JWT)
router.delete('/customers/:id', requireJWT, async (req, res) => {
  return deleteCustomer(pool, req, res);
});

// INTERNO (SERVICE_TOKEN): GET /internal/customers/:id
router.get('/internal/customers/:id', requireServiceToken, async (req, res) => {
  return getInternalCustomer(pool, req, res);
});

export default router;

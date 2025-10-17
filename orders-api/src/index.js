import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRoutes from './routes.products.js';
import ordersRoutes from './routes.orders.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/', ordersRoutes);
app.use('/', productsRoutes);


const port = Number(3002);
app.listen(port, () => console.log(`orders-api listening on :${port}`));

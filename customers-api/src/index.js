import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import customersRoutes from './routes.customers.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/', customersRoutes);


const port = Number(3001);
app.listen(port, () => console.log(`customers-api listening on :${port}`));

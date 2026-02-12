import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import cookieParser from 'cookie-parser';
import {apiLimiter} from './middlewares/rateLimit.js'
import  helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(apiLimiter);
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // add your's website domain in .env
    credentials: true ,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', routes);


// basic 404
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Not found Api' }));



export default app;
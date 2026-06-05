import cors from 'cors';
import express from 'express';
import './prisma/main.ts';
import { errorMiddleware } from './middleware/errorMiddleware.ts';
import routes from './routes.ts';

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

export function createApp(): express.Express {
    const app = express();

    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
    }));
    app.use(express.json());
    app.use('/api', routes);
    app.use(errorMiddleware);

    return app;
}

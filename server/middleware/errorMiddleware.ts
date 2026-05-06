import type { ErrorRequestHandler } from 'express';
import { getErrorMessage } from '../utils/getErrorMessage.ts';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

    res.status(statusCode).json({ error: getErrorMessage(error) });
};

import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorMiddleware } from '../../server/middleware/errorMiddleware.ts';

function createResponse(): Response {
    const res = {
        statusCode: 200,
        status: vi.fn(),
        json: vi.fn(),
    } as unknown as Response;

    vi.mocked(res.status).mockImplementation((statusCode: number) => {
        res.statusCode = statusCode;
        return res;
    });

    return res;
}

describe('errorMiddleware', () => {
    it('uses the current response status and error message', () => {
        const res = createResponse();
        res.status(404);

        errorMiddleware(
            new Error('Question was not found.'),
            {} as Request,
            res,
            vi.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Question was not found.' });
    });

    it('uses a server error response for unknown errors', () => {
        const res = createResponse();

        errorMiddleware(
            new Error('Database connection failed.'),
            {} as Request,
            res,
            vi.fn(),
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed.' });
    });

    it('delegates to the default handler after headers have been sent', () => {
        const res = {
            headersSent: true,
        } as Response;
        const error = new Error('Already streaming.');
        const next = vi.fn();

        errorMiddleware(error, {} as Request, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

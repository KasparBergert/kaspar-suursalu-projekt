import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { AuthController } from '../../server/controllers/AuthController.ts';
import type { AuthService } from '../../server/services/AuthService.ts';

function createResponse(): Response {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
        locals: {},
    } as unknown as Response;

    vi.mocked(res.status).mockReturnValue(res);

    return res;
}

describe('AuthController', () => {
    const authResult = {
        user: {
            id: 'user-1',
            name: 'Kaspar',
            email: 'kaspar@example.com',
        },
        token: 'jwt-token',
    };

    let authService: Pick<AuthService, 'register' | 'login' | 'logout'>;

    beforeEach(() => {
        authService = {
            register: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
        };
    });

    it('registers a user and sends a created response', async () => {
        vi.mocked(authService.register).mockResolvedValue(authResult);
        const req = {
            body: {
                name: 'Kaspar',
                email: 'kaspar@example.com',
                password: 'password123',
            },
        } as Request;
        const res = createResponse();

        await new AuthController(authService as AuthService).register(req, res);

        expect(authService.register).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(authResult);
    });

    it('sends a bad request response when registration fails', async () => {
        const error = new Error('Email is already registered.');
        vi.mocked(authService.register).mockRejectedValue(error);
        const req = { body: {} } as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).register(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });

    it('logs in a user and sends the auth result', async () => {
        vi.mocked(authService.login).mockResolvedValue(authResult);
        const req = {
            body: {
                email: 'kaspar@example.com',
                password: 'password123',
            },
        } as Request;
        const res = createResponse();

        await new AuthController(authService as AuthService).login(req, res);

        expect(authService.login).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith(authResult);
    });

    it('sends an unauthorized response when login fails', async () => {
        const error = new Error('Email or password is incorrect.');
        vi.mocked(authService.login).mockRejectedValue(error);
        const req = { body: {} } as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });

    it('logs out a user', async () => {
        const req = {
            header: vi.fn((name: string) => (
                name === 'authorization' ? 'Bearer jwt-token' : undefined
            )),
        } as unknown as Request;
        const res = createResponse();

        await new AuthController(authService as AuthService).logout(req, res);

        expect(authService.logout).toHaveBeenCalledWith('jwt-token');
        expect(res.json).toHaveBeenCalledWith({ message: 'Logged out.' });
    });

    it('does not log out without an auth token', async () => {
        const req = {
            header: vi.fn(),
        } as unknown as Request;
        const res = createResponse();

        await new AuthController(authService as AuthService).logout(req, res);

        expect(authService.logout).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token is required.' });
    });
});

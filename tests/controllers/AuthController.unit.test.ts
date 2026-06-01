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

    let authService: Pick<
        AuthService,
        'register' | 'login' | 'logout' | 'requestPasswordReset' | 'verifyPasswordResetToken' | 'resetPassword'
    >;

    beforeEach(() => {
        authService = {
            register: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            requestPasswordReset: vi.fn(),
            verifyPasswordResetToken: vi.fn(),
            resetPassword: vi.fn(),
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
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).register(req, res, next);

        expect(authService.register).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(authResult);
        expect(next).not.toHaveBeenCalled();
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
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).login(req, res, next);

        expect(authService.login).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith(authResult);
        expect(next).not.toHaveBeenCalled();
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
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).logout(req, res, next);

        expect(authService.logout).toHaveBeenCalledWith('jwt-token');
        expect(res.json).toHaveBeenCalledWith({ message: 'Logged out.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('does not log out without an auth token', async () => {
        const req = {
            header: vi.fn(),
        } as unknown as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).logout(req, res, next);

        expect(authService.logout).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token is required.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('requests a password reset email without exposing a token in the response', async () => {
        vi.mocked(authService.requestPasswordReset).mockResolvedValue({
            message: 'If that email exists, a password reset link has been sent.',
        });
        const req = {
            body: {
                email: 'kaspar@example.com',
            },
        } as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).requestPasswordReset(req, res, next);

        expect(authService.requestPasswordReset).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith({
            message: 'If that email exists, a password reset link has been sent.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('verifies a password reset token from the reset URL', async () => {
        vi.mocked(authService.verifyPasswordResetToken).mockResolvedValue({
            email: 'kaspar@example.com',
        });
        const req = {
            params: {
                token: 'reset-token',
            },
        } as unknown as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).verifyPasswordResetToken(req, res, next);

        expect(authService.verifyPasswordResetToken).toHaveBeenCalledWith('reset-token');
        expect(res.json).toHaveBeenCalledWith({ email: 'kaspar@example.com' });
        expect(next).not.toHaveBeenCalled();
    });

    it('resets a password with the reset URL token', async () => {
        vi.mocked(authService.resetPassword).mockResolvedValue({
            message: 'Password has been reset.',
        });
        const req = {
            params: {
                token: 'reset-token',
            },
            body: {
                password: 'new-password123',
            },
        } as unknown as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new AuthController(authService as AuthService).resetPassword(req, res, next);

        expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', req.body);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset.' });
        expect(next).not.toHaveBeenCalled();
    });
});

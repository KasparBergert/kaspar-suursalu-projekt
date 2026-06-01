import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '../services/AuthService.ts';
import { getBearerToken } from '../utils/parseRequest.ts';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.login(req.body);
            res.json(result);
        } catch (error) {
            res.status(401);
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getBearerToken(req);

        if (!token) {
            res.status(401).json({ error: 'Authentication token is required.' });
            return;
        }

        try {
            await this.authService.logout(token);
            res.json({ message: 'Logged out.' });
        } catch (error) {
            res.status(401);
            next(error);
        }
    };

    requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.requestPasswordReset(req.body);
            res.json(result);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };

    verifyPasswordResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.params.token;

        if (!token) {
            res.status(400).json({ error: 'Password reset token is required.' });
            return;
        }

        try {
            const result = await this.authService.verifyPasswordResetToken(token);
            res.json(result);
        } catch (error) {
            res.status(404);
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.params.token;

        if (!token) {
            res.status(400).json({ error: 'Password reset token is required.' });
            return;
        }

        try {
            const result = await this.authService.resetPassword(token, req.body);
            res.json(result);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };
}

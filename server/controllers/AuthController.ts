import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '../services/AuthService.ts';
import { getBearerToken, getCookieValue, parseRouteParam } from '../utils/parseRequest.ts';

const authCookieName = 'auth_token';
const authCookieOptions = 'HttpOnly; Path=/; SameSite=Lax';
const passwordResetCookieName = 'password_reset_token';
const passwordResetCookieOptions = 'HttpOnly; Path=/api/auth/password-resets; SameSite=Lax; Max-Age=1800';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.register(req.body);
            this.setAuthCookie(res, result.token);
            res.status(201).json({ user: result.user });
        } catch (error) {
            res.status(400);
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.authService.login(req.body);
            this.setAuthCookie(res, result.token);
            res.json({ user: result.user });
        } catch (error) {
            res.status(401);
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getCookieValue(req, authCookieName) ?? getBearerToken(req);

        if (!token) {
            res.status(401).json({ error: 'Authentication token is required.' });
            return;
        }

        try {
            await this.authService.logout(token);
            this.clearAuthCookie(res);
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
        const token = parseRouteParam(req.params.token);

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

    openPasswordResetLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = parseRouteParam(req.params.token);

        if (!token) {
            res.redirect(this.createFrontendUrl('/auth'));
            return;
        }

        try {
            await this.authService.verifyPasswordResetToken(token);
            this.setPasswordResetCookie(res, token);
            res.redirect(this.createFrontendUrl('/password-reset'));
        } catch (error) {
            res.status(404);
            next(error);
        }
    };

    verifyCurrentPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getCookieValue(req, passwordResetCookieName);

        if (!token) {
            res.status(400).json({ error: 'Password reset link is required.' });
            return;
        }

        try {
            const result = await this.authService.verifyPasswordResetToken(token);
            res.json(result);
        } catch (error) {
            this.clearPasswordResetCookie(res);
            res.status(404);
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = parseRouteParam(req.params.token) ?? getCookieValue(req, passwordResetCookieName);

        if (!token) {
            res.status(400).json({ error: 'Password reset token is required.' });
            return;
        }

        try {
            const result = await this.authService.resetPassword(token, req.body);
            this.clearPasswordResetCookie(res);
            res.json(result);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };

    private setAuthCookie(res: Response, token: string): void {
        res.setHeader('Set-Cookie', `${authCookieName}=${encodeURIComponent(token)}; ${authCookieOptions}`);
    }

    private clearAuthCookie(res: Response): void {
        res.setHeader('Set-Cookie', `${authCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    }

    private setPasswordResetCookie(res: Response, token: string): void {
        res.setHeader(
            'Set-Cookie',
            `${passwordResetCookieName}=${encodeURIComponent(token)}; ${passwordResetCookieOptions}`,
        );
    }

    private clearPasswordResetCookie(res: Response): void {
        res.setHeader(
            'Set-Cookie',
            `${passwordResetCookieName}=; HttpOnly; Path=/api/auth/password-resets; SameSite=Lax; Max-Age=0`,
        );
    }

    private createFrontendUrl(path: string): string {
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        return `${frontendUrl}${path}`;
    }
}

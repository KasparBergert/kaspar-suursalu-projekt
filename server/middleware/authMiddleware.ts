import type { NextFunction, Request, Response } from 'express';
import type { TokenService } from '../interfaces/UserInterfaces.ts';
import { getBearerToken } from '../utils/parseRequest.ts';

export function createAuthMiddleware(tokenService: TokenService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getBearerToken(req);

        if (!token) {
            res.status(401).json({ error: 'Authentication token is required.' });
            return;
        }

        try {
            res.locals.user = await tokenService.validate(token);
            next();
        } catch {
            res.status(401).json({ error: 'Authentication token is invalid.' });
        }
    };
}

import type { NextFunction, Request, Response } from 'express';
import type { TokenService } from '../interfaces/UserInterfaces.ts';
import prisma from '../prisma/main.ts';
import { getBearerToken, getCookieValue } from '../utils/parseRequest.ts';

const authCookieName = 'auth_token';

export function createAuthMiddleware(tokenService: TokenService) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = getCookieValue(req, authCookieName) ?? getBearerToken(req);

        if (!token) {
            res.status(401).json({ error: 'Authentication token is required.' });
            return;
        }

        try {
            const user = await tokenService.validate(token);
            const storedUser = await prisma.users.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    id: true,
                },
            });

            if (!storedUser) {
                res.status(401).json({ error: 'Authentication token is invalid.' });
                return;
            }

            res.locals.user = user;
            next();
        } catch {
            res.status(401).json({ error: 'Authentication token is invalid.' });
        }
    };
}

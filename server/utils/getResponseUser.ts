import type { Response } from 'express';
import type { AuthUser } from '../interfaces/UserInterfaces.ts';

export function getResponseUser(res: Response): AuthUser | undefined {
    return res.locals.user;
}

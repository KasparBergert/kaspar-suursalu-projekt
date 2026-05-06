import type { NextFunction, Request, Response } from 'express';
import type { UserService } from '../services/UserService.ts';
import { getResponseUser } from '../utils/getResponseUser.ts';

export class UserController {
    constructor(private readonly userService: UserService) {}

    getProfile = async (_req: Request, res: Response): Promise<void> => {
        const user = getResponseUser(res);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        res.json({ user });
    };

    getMyQuestions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = getResponseUser(res);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        try {
            const questions = await this.userService.getQuestions(user.id);
            res.json({ data: questions });
        } catch (error) {
            next(error);
        }
    };
}

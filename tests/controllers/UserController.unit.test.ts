import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { UserController } from '../../server/controllers/UserController.ts';
import type { UserService } from '../../server/services/UserService.ts';

function createResponse(user?: { id: string; name: string; email: string }): Response {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
        locals: {
            user,
        },
    } as unknown as Response;

    vi.mocked(res.status).mockReturnValue(res);

    return res;
}

describe('UserController', () => {
    const user = {
        id: 'user-1',
        name: 'Kaspar',
        email: 'kaspar@example.com',
    };

    const question = {
        id: 'question-1',
        title: 'How does this work?',
        description: 'I want to understand the flow.',
        createdAt: new Date('2026-05-06T12:00:00.000Z'),
        votes: 3,
        likedByUser: false,
        commentCount: 2,
        user: {
            id: 'user-1',
            name: 'Kaspar',
        },
    };

    let userService: Pick<UserService, 'getQuestions'>;

    beforeEach(() => {
        userService = {
            getQuestions: vi.fn(),
        };
    });

    it('returns the authenticated user profile', async () => {
        const req = {} as Request;
        const res = createResponse(user);

        await new UserController(userService as UserService).getProfile(req, res);

        expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('does not return a profile without authentication', async () => {
        const req = {} as Request;
        const res = createResponse();

        await new UserController(userService as UserService).getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication is required.' });
    });

    it('returns questions for the authenticated user', async () => {
        vi.mocked(userService.getQuestions).mockResolvedValue([question]);
        const req = {} as Request;
        const res = createResponse(user);

        await new UserController(userService as UserService).getMyQuestions(req, res);

        expect(userService.getQuestions).toHaveBeenCalledWith('user-1');
        expect(res.json).toHaveBeenCalledWith({ data: [question] });
    });

    it('passes user questions errors to error middleware', async () => {
        const error = new Error('Could not load questions.');
        vi.mocked(userService.getQuestions).mockRejectedValue(error);
        const req = {} as Request;
        const res = createResponse(user);
        const next = vi.fn() as NextFunction;

        await new UserController(userService as UserService).getMyQuestions(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });

    it('does not return user questions without authentication', async () => {
        const req = {} as Request;
        const res = createResponse();

        await new UserController(userService as UserService).getMyQuestions(req, res);

        expect(userService.getQuestions).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication is required.' });
    });
});

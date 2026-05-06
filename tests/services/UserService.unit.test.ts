import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
    questions: {
        findMany: vi.fn(),
    },
}));

vi.mock('../../server/prisma/main.ts', () => ({
    default: prisma,
}));

import { UserService } from '../../server/services/UserService.ts';

const user = {
    id: 'user-1',
    name: 'Kaspar',
};

const question = {
    id: 'question-1',
    userId: 'user-1',
    title: 'What is clean code?',
    description: 'I want a practical answer.',
    upvotes: 5,
    user,
    _count: {
        comments: 1,
    },
};

describe('UserService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns the questions that belong to a user', async () => {
        prisma.questions.findMany.mockResolvedValue([question]);

        const result = await new UserService().getQuestions('user-1');

        expect(result).toEqual([
            {
                id: 'question-1',
                title: 'What is clean code?',
                description: 'I want a practical answer.',
                upvotes: 5,
                commentCount: 1,
                user,
            },
        ]);
    });
});

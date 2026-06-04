import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
    $transaction: vi.fn(async (callback) => callback(prisma)),
    questions: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
    },
    comments: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
    questionUpvotes: {
        create: vi.fn(),
        findUnique: vi.fn(),
    },
}));

vi.mock('../../server/prisma/main.ts', () => ({
    default: prisma,
}));

import { QuestionsService } from '../../server/services/QuestionsService.ts';

const user = {
    id: 'user-1',
    name: 'Kaspar',
};

const question = {
    id: 'question-1',
    userId: 'user-1',
    title: 'How does this work?',
    description: 'I want to understand the flow.',
    createdAt: new Date('2026-05-06T12:00:00.000Z'),
    upvotes: 3,
    user,
    _count: {
        comments: 2,
    },
};

const comment = {
    id: 'comment-1',
    questionId: 'question-1',
    userId: 'user-1',
    text: 'This is the answer.',
    createdAt: new Date('2026-05-06T12:00:00.000Z'),
    user,
};

describe('QuestionsService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('creates a question for a user', async () => {
        prisma.questions.create.mockResolvedValue(question);

        const result = await new QuestionsService().createQuestion({
            userId: 'user-1',
            title: 'How does this work?',
            description: 'I want to understand the flow.',
        });

        expect(result).toEqual({
            id: 'question-1',
            title: 'How does this work?',
            description: 'I want to understand the flow.',
            createdAt: new Date('2026-05-06T12:00:00.000Z'),
            upvotes: 3,
            commentCount: 2,
            user,
        });
    });

    it('adds an answer to a question as a comment', async () => {
        prisma.comments.create.mockResolvedValue(comment);

        const result = await new QuestionsService().addAnswerToQuestion({
            userId: 'user-1',
            questionId: 'question-1',
            text: 'This is the answer.',
        });

        expect(result.text).toBe('This is the answer.');
    });

    it('returns paginated questions for the feed', async () => {
        prisma.questions.findMany.mockResolvedValue([question]);
        prisma.questions.count.mockResolvedValue(1);

        const result = await new QuestionsService().getQuestions({
            page: 1,
        });

        expect(prisma.questions.findMany).toHaveBeenCalledWith(expect.objectContaining({
            skip: 0,
            take: 10,
        }));
        expect(result).toMatchObject({
            data: [{ id: 'question-1', commentCount: 2 }],
            page: 1,
            limit: 10,
            total: 1,
        });
    });

    it('returns a question with paginated comments', async () => {
        prisma.questions.findUnique.mockResolvedValue(question);
        prisma.comments.findMany.mockResolvedValue([comment]);
        prisma.comments.count.mockResolvedValue(1);

        const result = await new QuestionsService().getQuestion('question-1', {
            page: 1,
            limit: 10,
        });

        expect(result).toMatchObject({
            question: { id: 'question-1', commentCount: 2 },
            comments: { data: [{ id: 'comment-1' }], total: 1 },
        });
    });

    it('does not return comments for a missing question', async () => {
        prisma.questions.findUnique.mockResolvedValue(null);
        prisma.comments.findMany.mockResolvedValue([]);
        prisma.comments.count.mockResolvedValue(0);

        await expect(new QuestionsService().getQuestion('missing-question', {
            page: 1,
            limit: 10,
        })).rejects.toThrow('Question was not found.');
    });

    it('upvotes a question once for a user', async () => {
        prisma.questionUpvotes.findUnique.mockResolvedValue(null);
        prisma.questions.update.mockResolvedValue({
            ...question,
            upvotes: 4,
        });

        const result = await new QuestionsService().upVoteQuestion('user-1', 'question-1');

        expect(prisma.questionUpvotes.findUnique).toHaveBeenCalledWith({
            where: {
                userId_questionId: {
                    userId: 'user-1',
                    questionId: 'question-1',
                },
            },
        });
        expect(prisma.questionUpvotes.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                questionId: 'question-1',
            },
        });
        expect(prisma.questions.update).toHaveBeenCalledWith(expect.objectContaining({
            data: {
                upvotes: {
                    increment: 1,
                },
            },
        }));
        expect(result.upvotes).toBe(4);
    });

    it('does not upvote a question twice for the same user', async () => {
        prisma.questionUpvotes.findUnique.mockResolvedValue({
            id: 'upvote-1',
            userId: 'user-1',
            questionId: 'question-1',
        });

        await expect(new QuestionsService().upVoteQuestion('user-1', 'question-1'))
            .rejects.toThrow('Question has already been upvoted by this user.');

        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(prisma.questions.update).not.toHaveBeenCalled();
    });
});

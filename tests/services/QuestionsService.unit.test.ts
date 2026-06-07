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
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
    },
    questionVotes: {
        create: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
    },
    commentVotes: {
        create: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
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
    votes: 3,
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
    votes: 0,
    user,
};

describe('QuestionsService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('creates a question for a user', async () => {
        prisma.questions.create.mockResolvedValue(question);
        prisma.questions.findUnique.mockResolvedValue(question);

        const result = await new QuestionsService().createQuestion({
            userId: 'user-1',
            title: 'How does this work?',
            description: 'I want to understand the flow.',
        });

        expect(result).toEqual({
            id: 'question-1',
            title: 'How does this work?',
            description: 'I want to understand the flow.',
            imageSrc: undefined,
            createdAt: new Date('2026-05-06T12:00:00.000Z'),
            votes: 3,
            voteState: 'none',
            commentCount: 2,
            user,
        });
    });

    it('returns paginated questions for the feed with vote states', async () => {
        prisma.questions.findMany.mockResolvedValue([question]);
        prisma.questions.count.mockResolvedValue(1);
        prisma.questionVotes.findMany.mockResolvedValue([{
            questionId: 'question-1',
            isUpvote: false,
        }]);

        const result = await new QuestionsService().getQuestions({
            page: 1,
            userId: 'user-1',
        });

        expect(result).toMatchObject({
            data: [{ id: 'question-1', commentCount: 2, voteState: 'down', votes: 3 }],
            page: 1,
            limit: 10,
            total: 1,
        });
    });

    it('returns a question with paginated comments and vote states', async () => {
        prisma.questions.findUnique.mockResolvedValue(question);
        prisma.comments.findMany.mockResolvedValue([comment]);
        prisma.comments.count.mockResolvedValue(1);
        prisma.questionVotes.findUnique.mockResolvedValue({
            questionId: 'question-1',
            isUpvote: true,
        });
        prisma.commentVotes.findMany.mockResolvedValue([{
            commentId: 'comment-1',
            isUpvote: false,
        }]);

        const result = await new QuestionsService().getQuestion('question-1', {
            page: 1,
            limit: 10,
            userId: 'user-1',
        });

        expect(result).toMatchObject({
            question: { id: 'question-1', commentCount: 2, voteState: 'up', votes: 3 },
            comments: { data: [{ id: 'comment-1', votes: 0, voteState: 'down' }], total: 1 },
        });
    });

    it('creates an upvote row for a comment', async () => {
        prisma.comments.findUnique.mockResolvedValue(comment);
        prisma.commentVotes.findUnique.mockResolvedValue(null);
        prisma.comments.update.mockResolvedValue({
            ...comment,
            votes: 1,
        });

        const result = await new QuestionsService().setCommentVote({
            userId: 'user-1',
            commentId: 'comment-1',
            vote: 'up',
        });

        expect(prisma.commentVotes.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                commentId: 'comment-1',
                isUpvote: true,
            },
        });
        expect(prisma.comments.update).toHaveBeenCalledWith(expect.objectContaining({
            data: {
                votes: {
                    increment: 1,
                },
            },
        }));
        expect(result).toMatchObject({
            id: 'comment-1',
            votes: 1,
            voteState: 'up',
        });
    });

    it('switches a question vote from up to down in one transaction', async () => {
        prisma.questions.findUnique.mockResolvedValue(question);
        prisma.questionVotes.findUnique.mockResolvedValue({
            id: 'vote-1',
            userId: 'user-1',
            questionId: 'question-1',
            isUpvote: true,
        });
        prisma.questions.update.mockResolvedValue({
            ...question,
            votes: 1,
        });

        const result = await new QuestionsService().setQuestionVote({
            userId: 'user-1',
            questionId: 'question-1',
            vote: 'down',
        });

        expect(prisma.questionVotes.update).toHaveBeenCalledWith({
            where: {
                userId_questionId: {
                    userId: 'user-1',
                    questionId: 'question-1',
                },
            },
            data: {
                isUpvote: false,
            },
        });
        expect(prisma.questions.update).toHaveBeenCalledWith(expect.objectContaining({
            data: {
                votes: {
                    increment: -2,
                },
            },
        }));
        expect(result.votes).toBe(1);
        expect(result.voteState).toBe('down');
    });

    it('clears a question vote when set back to none', async () => {
        prisma.questions.findUnique.mockResolvedValue(question);
        prisma.questionVotes.findUnique.mockResolvedValue({
            id: 'vote-1',
            userId: 'user-1',
            questionId: 'question-1',
            isUpvote: false,
        });
        prisma.questions.update.mockResolvedValue({
            ...question,
            votes: 4,
        });

        const result = await new QuestionsService().setQuestionVote({
            userId: 'user-1',
            questionId: 'question-1',
            vote: 'none',
        });

        expect(prisma.questionVotes.delete).toHaveBeenCalledWith({
            where: {
                userId_questionId: {
                    userId: 'user-1',
                    questionId: 'question-1',
                },
            },
        });
        expect(prisma.questions.update).toHaveBeenCalledWith(expect.objectContaining({
            data: {
                votes: {
                    increment: 1,
                },
            },
        }));
        expect(result.votes).toBe(4);
        expect(result.voteState).toBe('none');
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { QuestionsController } from '../../server/controllers/QuestionsController.ts';
import type { QuestionsService } from '../../server/services/QuestionsService.ts';

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

describe('QuestionsController', () => {
    const user = {
        id: 'user-1',
        name: 'Kaspar',
        email: 'kaspar@example.com',
    };

    const question = {
        id: 'question-1',
        title: 'How does this work?',
        description: 'I want to understand the flow.',
        upvotes: 3,
        commentCount: 2,
        user: {
            id: 'user-1',
            name: 'Kaspar',
        },
    };

    const answer = {
        id: 'answer-1',
        text: 'This is the answer.',
        createdAt: new Date('2026-05-06T12:00:00.000Z'),
        user: {
            id: 'user-1',
            name: 'Kaspar',
        },
    };

    let questionsService: Pick<
        QuestionsService,
        'createQuestion' | 'getQuestions' | 'getQuestion' | 'addAnswerToQuestion' | 'upVoteQuestion'
    >;

    beforeEach(() => {
        questionsService = {
            createQuestion: vi.fn(),
            getQuestions: vi.fn(),
            getQuestion: vi.fn(),
            addAnswerToQuestion: vi.fn(),
            upVoteQuestion: vi.fn(),
        };
    });

    it('creates a question for the authenticated user', async () => {
        vi.mocked(questionsService.createQuestion).mockResolvedValue(question);
        const req = {
            body: {
                title: 'How does this work?',
                description: 'I want to understand the flow.',
            },
        } as Request;
        const res = createResponse(user);

        await new QuestionsController(questionsService as QuestionsService).createQuestion(req, res);

        expect(questionsService.createQuestion).toHaveBeenCalledWith({
            userId: 'user-1',
            title: 'How does this work?',
            description: 'I want to understand the flow.',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(question);
    });

    it('does not create a question without authentication', async () => {
        const req = { body: {} } as Request;
        const res = createResponse();

        await new QuestionsController(questionsService as QuestionsService).createQuestion(req, res);

        expect(questionsService.createQuestion).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication is required.' });
    });

    it('returns paginated questions', async () => {
        const result = {
            data: [question],
            page: 2,
            limit: 10,
            total: 1,
            totalPages: 1,
        };
        vi.mocked(questionsService.getQuestions).mockResolvedValue(result);
        const req = {
            query: {
                page: '2',
                limit: '1000',
            },
        } as unknown as Request;
        const res = createResponse();

        await new QuestionsController(questionsService as QuestionsService).getQuestions(req, res);

        expect(questionsService.getQuestions).toHaveBeenCalledWith({ page: 2 });
        expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns a question with its answers', async () => {
        const result = {
            question,
            comments: {
                data: [answer],
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            },
        };
        vi.mocked(questionsService.getQuestion).mockResolvedValue(result);
        const req = {
            params: {
                id: 'question-1',
            },
            query: {
                page: '1',
                limit: '10',
            },
        } as unknown as Request;
        const res = createResponse();

        await new QuestionsController(questionsService as QuestionsService).getQuestion(req, res);

        expect(questionsService.getQuestion).toHaveBeenCalledWith('question-1', {
            page: 1,
            limit: 10,
        });
        expect(res.json).toHaveBeenCalledWith(result);
    });

    it('sends not found when a question cannot be loaded', async () => {
        const error = new Error('Question was not found.');
        vi.mocked(questionsService.getQuestion).mockRejectedValue(error);
        const req = {
            params: {
                id: 'missing-question',
            },
            query: {},
        } as unknown as Request;
        const res = createResponse();
        const next = vi.fn() as NextFunction;

        await new QuestionsController(questionsService as QuestionsService).getQuestion(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });

    it('adds an answer for the authenticated user', async () => {
        vi.mocked(questionsService.addAnswerToQuestion).mockResolvedValue(answer);
        const req = {
            params: {
                id: 'question-1',
            },
            body: {
                text: 'This is the answer.',
            },
        } as unknown as Request;
        const res = createResponse(user);

        await new QuestionsController(questionsService as QuestionsService).addAnswer(req, res);

        expect(questionsService.addAnswerToQuestion).toHaveBeenCalledWith({
            userId: 'user-1',
            questionId: 'question-1',
            text: 'This is the answer.',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(answer);
    });

    it('does not add an answer without authentication', async () => {
        const req = {
            params: {
                id: 'question-1',
            },
            body: {},
        } as unknown as Request;
        const res = createResponse();

        await new QuestionsController(questionsService as QuestionsService).addAnswer(req, res);

        expect(questionsService.addAnswerToQuestion).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication is required.' });
    });

    it('upvotes a question for the authenticated user', async () => {
        vi.mocked(questionsService.upVoteQuestion).mockResolvedValue({
            ...question,
            upvotes: 4,
        });
        const req = {
            params: {
                id: 'question-1',
            },
        } as unknown as Request;
        const res = createResponse(user);

        await new QuestionsController(questionsService as QuestionsService).upVoteQuestion(req, res);

        expect(questionsService.upVoteQuestion).toHaveBeenCalledWith('user-1', 'question-1');
        expect(res.json).toHaveBeenCalledWith({
            ...question,
            upvotes: 4,
        });
    });

    it('passes duplicate upvote errors to error middleware', async () => {
        const error = new Error('Question has already been upvoted by this user.');
        vi.mocked(questionsService.upVoteQuestion).mockRejectedValue(error);
        const req = {
            params: {
                id: 'question-1',
            },
        } as unknown as Request;
        const res = createResponse(user);
        const next = vi.fn() as NextFunction;

        await new QuestionsController(questionsService as QuestionsService).upVoteQuestion(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});

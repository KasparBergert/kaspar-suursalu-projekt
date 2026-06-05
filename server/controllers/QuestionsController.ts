import type { NextFunction, Request, Response } from 'express';
import type { QuestionsService } from '../services/QuestionsService.ts';
import { getResponseUser } from '../utils/getResponseUser.ts';
import { getBearerToken, getCookieValue, parseQueryNumber, parseRouteParam } from '../utils/parseRequest.ts';
import type { TokenService } from '../interfaces/UserInterfaces.ts';

const authCookieName = 'auth_token';

export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService,
        private readonly tokenService?: TokenService,
    ) {}

    createQuestion = async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
        const user = await this.getRequestUser(req, res);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        try {
            const question = await this.questionsService.createQuestion({
                userId: user.id,
                title: req.body?.title,
                description: req.body?.description,
                imageSrc: req.body?.imageSrc,
            });

            res.status(201).json(question);
        } catch (error) {
            res.status(400);
            next?.(error);
        }
    };

    getQuestions = async (req: Request, res: Response): Promise<void> => {
        const user = await this.getRequestUser(req, res);
        const questions = await this.questionsService.getQuestions({
            page: parseQueryNumber(req.query.page),
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
            userId: user?.id,
        });

        res.status(200).json(questions);
    };

    getQuestion = async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
        const user = await this.getRequestUser(req, res);
        const questionId = parseRouteParam(req.params.id);

        if (!questionId) {
            res.status(400).json({ error: 'Question id is required.' });
            return;
        }

        try {
            const question = await this.questionsService.getQuestion(questionId, {
                page: parseQueryNumber(req.query.page),
                limit: parseQueryNumber(req.query.limit),
                userId: user?.id,
            });

            res.json(question);
        } catch (error) {
            res.status(404);
            next?.(error);
        }
    };

    addAnswer = async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
        const user = await this.getRequestUser(req, res);
        const questionId = parseRouteParam(req.params.id);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        if (!questionId) {
            res.status(400).json({ error: 'Question id is required.' });
            return;
        }

        try {
            const answer = await this.questionsService.addAnswerToQuestion({
                userId: user.id,
                questionId,
                text: req.body?.text,
            });

            res.status(201).json(answer);
        } catch (error) {
            res.status(400);
            next?.(error);
        }
    };

    upVoteQuestion = async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
        const user = await this.getRequestUser(req, res);
        const questionId = parseRouteParam(req.params.id);
        const active = parseUpvoteState(req.body?.active ?? req.query.active);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        if (!questionId) {
            res.status(400).json({ error: 'Question id is required.' });
            return;
        }

        try {
            const question = await this.questionsService.upVoteQuestion({
                userId: user.id,
                questionId,
                active,
            });
            res.json(question);
        } catch (error) {
            res.status(400);
            next?.(error);
        }
    };

    upVoteComment = async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
        const user = await this.getRequestUser(req, res);
        const commentId = parseRouteParam(req.params.id);
        const active = parseUpvoteState(req.body?.active ?? req.query.active);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        if (!commentId) {
            res.status(400).json({ error: 'Comment id is required.' });
            return;
        }

        try {
            const comment = await this.questionsService.upVoteComment({
                userId: user.id,
                commentId,
                active,
            });
            res.json(comment);
        } catch (error) {
            res.status(400);
            next?.(error);
        }
    };

    private async getRequestUser(req: Request, res: Response) {
        const existingUser = getResponseUser(res);

        if (existingUser || !this.tokenService) {
            return existingUser;
        }

        const token = getCookieValue(req, authCookieName) ?? getBearerToken(req);

        if (!token) {
            return undefined;
        }

        try {
            const user = await this.tokenService.validate(token);
            res.locals.user = user;
            return user;
        } catch {
            return undefined;
        }
    }
}

function parseUpvoteState(value: unknown): boolean {
    if (value === false || value === 0 || value === '0' || value === 'false') {
        return false;
    }

    return true;
}

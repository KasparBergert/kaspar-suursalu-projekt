import type { NextFunction, Request, Response } from 'express';
import type { QuestionsService } from '../services/QuestionsService.ts';
import { getResponseUser } from '../utils/getResponseUser.ts';
import { parseQueryNumber, parseRouteParam } from '../utils/parseRequest.ts';

export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = getResponseUser(res);

        if (!user) {
            res.status(401).json({ error: 'Authentication is required.' });
            return;
        }

        try {
            const question = await this.questionsService.createQuestion({
                userId: user.id,
                title: req.body?.title,
                description: req.body?.description,
            });

            res.status(201).json(question);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };

    getQuestions = async (req: Request, res: Response): Promise<void> => {
        const questions = await this.questionsService.getQuestions({
            page: parseQueryNumber(req.query.page),
        });

        res.json(questions);
    };

    getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const questionId = parseRouteParam(req.params.id);

        if (!questionId) {
            res.status(400).json({ error: 'Question id is required.' });
            return;
        }

        try {
            const question = await this.questionsService.getQuestion(questionId, {
                page: parseQueryNumber(req.query.page),
                limit: parseQueryNumber(req.query.limit),
            });

            res.json(question);
        } catch (error) {
            res.status(404);
            next(error);
        }
    };

    addAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = getResponseUser(res);
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
            next(error);
        }
    };

    upVoteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = getResponseUser(res);
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
            const question = await this.questionsService.upVoteQuestion(user.id, questionId);
            res.json(question);
        } catch (error) {
            res.status(400);
            next(error);
        }
    };
}

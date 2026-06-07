import prisma from '../prisma/main.ts';
import type {
    AddAnswerData,
    CommentData,
    CreateQuestionData,
    PaginatedData,
    PaginationData,
    QuestionData,
    QuestionWithCommentsData,
    SetCommentVoteData,
    SetQuestionVoteData,
} from '../interfaces/QuestionInterfaces.ts';
import { QuestionImageService } from './QuestionImageService.ts';
import { toCommentData, toQuestionData } from './questions/questionMappers.ts';
import { normalizeLimit, normalizePage, questionsPageLimit, getTotalPages } from './questions/questionPagination.ts';
import { getQuestionSearchWhere } from './questions/questionSearch.ts';
import { QuestionVoteService } from './questions/QuestionVoteService.ts';

export class QuestionsService {
    private readonly imageService = new QuestionImageService();
    private readonly voteService = new QuestionVoteService();

    async createQuestion(data: CreateQuestionData): Promise<QuestionData> {
        const question = await prisma.questions.create({
            data: {
                userId: data.userId,
                title: data.title,
                description: data.description,
                imageData: this.imageService.toDatabaseBytes(data.imageSrc),
            },
        });

        return this.getQuestionData(question.id);
    }

    async addAnswerToQuestion(data: AddAnswerData): Promise<CommentData> {
        const comment = await prisma.comments.create({
            data: {
                userId: data.userId,
                questionId: data.questionId,
                text: data.text,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            votes: comment.votes,
            voteState: 'none',
            user: comment.user,
        };
    }

    async getQuestions(
        pagination: Pick<PaginationData, 'page'> & { search?: string; userId?: string },
    ): Promise<PaginatedData<QuestionData>> {
        const page = normalizePage(pagination.page);
        const limit = questionsPageLimit;
        const skip = (page - 1) * limit;
        const where = getQuestionSearchWhere(pagination.search);

        const [questions, total] = await Promise.all([
            prisma.questions.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
            }),
            prisma.questions.count({ where }),
        ]);

        const questionVoteStates = await this.voteService.getQuestionVoteStates(questions, pagination.userId);

        return {
            data: questions.map((question) => toQuestionData(
                question,
                this.imageService,
                questionVoteStates.get(question.id) ?? 'none',
            )),
            page,
            limit,
            total,
            totalPages: getTotalPages(total, limit),
        };
    }

    async getQuestion(
        questionId: string,
        pagination: PaginationData & { userId?: string },
    ): Promise<QuestionWithCommentsData> {
        const page = normalizePage(pagination.page);
        const limit = normalizeLimit(pagination.limit);
        const skip = (page - 1) * limit;

        const [question, comments, total] = await Promise.all([
            prisma.questions.findUnique({
                where: {
                    id: questionId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
            }),
            prisma.comments.findMany({
                where: {
                    questionId,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.comments.count({
                where: {
                    questionId,
                },
            }),
        ]);

        if (!question) {
            throw new Error('Question was not found.');
        }

        const [questionVoteState, commentVoteStates] = await Promise.all([
            pagination.userId
            ? await this.voteService.getUserQuestionVoteState(pagination.userId, question.id)
            : 'none',
            this.voteService.getCommentVoteStates(comments, pagination.userId),
        ]);

        return {
            question: toQuestionData(question, this.imageService, questionVoteState),
            comments: {
                data: comments.map((comment) => toCommentData(
                    comment,
                    commentVoteStates.get(comment.id) ?? 'none',
                )),
                page,
                limit,
                total,
                totalPages: getTotalPages(total, limit),
            },
        };
    }

    async setQuestionVote(data: SetQuestionVoteData): Promise<QuestionData> {
        return this.voteService.setQuestionVote(data);
    }

    async setCommentVote(data: SetCommentVoteData): Promise<CommentData> {
        return this.voteService.setCommentVote(data);
    }

    private async getQuestionData(questionId: string): Promise<QuestionData> {
        const question = await prisma.questions.findUnique({
            where: {
                id: questionId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        if (!question) {
            throw new Error('Question was not found.');
        }

        return toQuestionData(question, this.imageService);
    }

}

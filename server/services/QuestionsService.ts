import prisma from '../prisma/main.ts';
import type {
    AddAnswerData,
    CommentData,
    CreateQuestionData,
    PaginatedData,
    PaginationData,
    QuestionData,
    QuestionWithCommentsData,
} from '../interfaces/QuestionInterfaces.ts';

export class QuestionsService {
    async createQuestion(data: CreateQuestionData): Promise<QuestionData> {
        const question = await prisma.questions.create({
            data: {
                userId: data.userId,
                title: data.title,
                description: data.description,
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

        return {
            id: question.id,
            title: question.title,
            description: question.description,
            upvotes: question.upvotes,
            commentCount: question._count.comments,
            user: question.user,
        };
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
            user: comment.user,
        };
    }

    async getQuestions(pagination: PaginationData): Promise<PaginatedData<QuestionData>> {
        const page = normalizePage(pagination.page);
        const limit = normalizeLimit(pagination.limit);
        const skip = (page - 1) * limit;

        const [questions, total] = await Promise.all([
            prisma.questions.findMany({
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
            prisma.questions.count(),
        ]);

        return {
            data: questions.map((question) => ({
                id: question.id,
                title: question.title,
                description: question.description,
                upvotes: question.upvotes,
                commentCount: question._count.comments,
                user: question.user,
            })),
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getQuestion(
        questionId: string,
        pagination: PaginationData,
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

        return {
            question: {
                id: question.id,
                title: question.title,
                description: question.description,
                upvotes: question.upvotes,
                commentCount: question._count.comments,
                user: question.user,
            },
            comments: {
                data: comments.map((comment) => ({
                    id: comment.id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    user: comment.user,
                })),
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

function normalizePage(page: number): number {
    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

function normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1) {
        return 10;
    }

    return Math.min(limit, 50);
}

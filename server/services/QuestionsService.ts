import prisma from '../prisma/main.ts';
import type {
    AddAnswerData,
    CommentData,
    CreateQuestionData,
    PaginatedData,
    PaginationData,
    QuestionData,
    QuestionWithCommentsData,
    ToggleCommentUpvoteData,
    ToggleQuestionUpvoteData,
} from '../interfaces/QuestionInterfaces.ts';
import { QuestionImageService } from './QuestionImageService.ts';

const questionsPageLimit = 10;

export class QuestionsService {
    private readonly imageService = new QuestionImageService();

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
            upvotes: comment.upvotes,
            likedByUser: false,
            user: comment.user,
        };
    }

    async getQuestions(
        pagination: Pick<PaginationData, 'page'> & { search?: string; userId?: string },
    ): Promise<PaginatedData<QuestionData>> {
        const page = normalizePage(pagination.page);
        const limit = questionsPageLimit;
        const skip = (page - 1) * limit;
        const search = pagination.search?.trim();
        const where = search
            ? {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        user: {
                            name: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                ],
            }
            : undefined;

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

        const upvotedQuestionIds = await this.getUpvotedQuestionIds(questions, pagination.userId);

        return {
            data: questions.map((question) => this.toQuestionData(question, upvotedQuestionIds.has(question.id))),
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
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

        const [likedByUser, upvotedCommentIds] = await Promise.all([
            pagination.userId
            ? await this.hasUserUpvotedQuestion(pagination.userId, question.id)
            : false,
            this.getUpvotedCommentIds(comments, pagination.userId),
        ]);

        return {
            question: this.toQuestionData(question, likedByUser),
            comments: {
                data: comments.map((comment) => ({
                    id: comment.id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    upvotes: comment.upvotes,
                    likedByUser: upvotedCommentIds.has(comment.id),
                    user: comment.user,
                })),
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async upVoteQuestion(data: ToggleQuestionUpvoteData): Promise<QuestionData> {
        const question = await prisma.questions.findUnique({
            where: {
                id: data.questionId,
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

        const existingUpvote = await prisma.questionUpvotes.findUnique({
            where: {
                userId_questionId: {
                    userId: data.userId,
                    questionId: data.questionId,
                },
            },
        });

        if (data.active && existingUpvote) {
            return this.toQuestionData(question, true);
        }

        if (!data.active && !existingUpvote) {
            return this.toQuestionData(question, false);
        }

        const updatedQuestion = await prisma.$transaction(async (tx) => {
            if (data.active) {
                const created = await tx.questionUpvotes.createMany({
                    data: [{
                        userId: data.userId,
                        questionId: data.questionId,
                    }],
                    skipDuplicates: true,
                });

                if (created.count === 0) {
                    return this.toQuestionData(question, true);
                }

                return tx.questions.update({
                    where: {
                        id: data.questionId,
                    },
                    data: {
                        upvotes: {
                            increment: 1,
                        },
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
            }

            const deleted = await tx.questionUpvotes.deleteMany({
                where: {
                    userId: data.userId,
                    questionId: data.questionId,
                },
            });

            if (deleted.count === 0) {
                return this.toQuestionData(question, false);
            }

            return tx.questions.update({
                where: {
                    id: data.questionId,
                },
                data: {
                    upvotes: {
                        decrement: 1,
                    },
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
        });

        if ('likedByUser' in updatedQuestion) {
            return updatedQuestion;
        }

        return this.toQuestionData(updatedQuestion, data.active);
    }

    async upVoteComment(data: ToggleCommentUpvoteData): Promise<CommentData> {
        const comment = await prisma.comments.findUnique({
            where: {
                id: data.commentId,
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

        if (!comment) {
            throw new Error('Comment was not found.');
        }

        const existingUpvote = await prisma.commentUpvotes.findUnique({
            where: {
                userId_commentId: {
                    userId: data.userId,
                    commentId: data.commentId,
                },
            },
        });

        if (data.active && existingUpvote) {
            return this.toCommentData(comment, true);
        }

        if (!data.active && !existingUpvote) {
            return this.toCommentData(comment, false);
        }

        const updatedComment = await prisma.$transaction(async (tx) => {
            if (data.active) {
                const created = await tx.commentUpvotes.createMany({
                    data: [{
                        userId: data.userId,
                        commentId: data.commentId,
                    }],
                    skipDuplicates: true,
                });

                if (created.count === 0) {
                    return comment;
                }

                return tx.comments.update({
                    where: {
                        id: data.commentId,
                    },
                    data: {
                        upvotes: {
                            increment: 1,
                        },
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
            }

            const deleted = await tx.commentUpvotes.deleteMany({
                where: {
                    userId: data.userId,
                    commentId: data.commentId,
                },
            });

            if (deleted.count === 0) {
                return comment;
            }

            return tx.comments.update({
                where: {
                    id: data.commentId,
                },
                data: {
                    upvotes: {
                        decrement: 1,
                    },
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
        });

        return this.toCommentData(updatedComment, data.active);
    }

    private toQuestionData(question: {
        id: string;
        title: string;
        description: string;
        imageData?: Uint8Array | Buffer | null;
        createdAt: Date;
        upvotes: number;
        _count: {
            comments: number;
        };
        user: {
            id: string;
            name: string;
        };
    }, likedByUser = false): QuestionData {
        return {
            id: question.id,
            title: question.title,
            description: question.description,
            imageSrc: this.imageService.toImageSrc(question.imageData),
            createdAt: question.createdAt,
            upvotes: question.upvotes,
            likedByUser,
            commentCount: question._count.comments,
            user: question.user,
        };
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

        return this.toQuestionData(question);
    }

    private toCommentData(comment: {
        id: string;
        text: string;
        createdAt: Date;
        upvotes: number;
        user: {
            id: string;
            name: string;
        };
    }, likedByUser = false): CommentData {
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            upvotes: comment.upvotes,
            likedByUser,
            user: comment.user,
        };
    }

    private async hasUserUpvotedQuestion(userId: string, questionId: string): Promise<boolean> {
        const upvote = await prisma.questionUpvotes.findUnique({
            where: {
                userId_questionId: {
                    userId,
                    questionId,
                },
            },
        });

        return Boolean(upvote);
    }

    private async getUpvotedQuestionIds(
        questions: Array<{ id: string; userId: string }>,
        userId?: string,
    ): Promise<Set<string>> {
        if (!userId || questions.length === 0) {
            return new Set();
        }

        const upvotes = await prisma.questionUpvotes.findMany({
            where: {
                userId,
                questionId: {
                    in: questions.map((question) => question.id),
                },
            },
            select: {
                questionId: true,
            },
        });

        return new Set(upvotes.map((upvote) => upvote.questionId));
    }

    private async getUpvotedCommentIds(
        comments: Array<{ id: string }>,
        userId?: string,
    ): Promise<Set<string>> {
        if (!userId || comments.length === 0) {
            return new Set();
        }

        const upvotes = await prisma.commentUpvotes.findMany({
            where: {
                userId,
                commentId: {
                    in: comments.map((comment) => comment.id),
                },
            },
            select: {
                commentId: true,
            },
        });

        return new Set(upvotes.map((upvote) => upvote.commentId));
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

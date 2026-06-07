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
    VoteState,
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
        const search = pagination.search?.trim();
        const where = search
            ? {
                OR: [
                    {
                        title: {
                            contains: search,
                        },
                    },
                    {
                        description: {
                            contains: search,
                        },
                    },
                    {
                        user: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                    {
                        user: {
                            is: {
                                email: {
                                    contains: search,
                                },
                            },
                        },
                    },
                    {
                        comments: {
                            some: {
                                text: {
                                    contains: search,
                                },
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

        const questionVoteStates = await this.getQuestionVoteStates(questions, pagination.userId);

        return {
            data: questions.map((question) => this.toQuestionData(question, questionVoteStates.get(question.id) ?? 'none')),
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

        const [questionVoteState, commentVoteStates] = await Promise.all([
            pagination.userId
            ? await this.getUserQuestionVoteState(pagination.userId, question.id)
            : 'none',
            this.getCommentVoteStates(comments, pagination.userId),
        ]);

        return {
            question: this.toQuestionData(question, questionVoteState),
            comments: {
                data: comments.map((comment) => ({
                    id: comment.id,
                    text: comment.text,
                    createdAt: comment.createdAt,
                    votes: comment.votes,
                    voteState: commentVoteStates.get(comment.id) ?? 'none',
                    user: comment.user,
                })),
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async setQuestionVote(data: SetQuestionVoteData): Promise<QuestionData> {
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

        const existingVote = await prisma.questionVotes.findUnique({
            where: {
                userId_questionId: {
                    userId: data.userId,
                    questionId: data.questionId,
                },
            },
        });

        const currentVoteState = this.getVoteStateFromRecord(existingVote);

        if (currentVoteState === data.vote) {
            return this.toQuestionData(question, currentVoteState);
        }

        const voteDelta = getVoteDelta(currentVoteState, data.vote);

        const updatedQuestion = await prisma.$transaction(async (tx) => {
            if (data.vote === 'none') {
                await tx.questionVotes.delete({
                    where: {
                        userId_questionId: {
                            userId: data.userId,
                            questionId: data.questionId,
                        },
                    },
                });
            } else if (existingVote) {
                await tx.questionVotes.update({
                    where: {
                        userId_questionId: {
                            userId: data.userId,
                            questionId: data.questionId,
                        },
                    },
                    data: {
                        isUpvote: data.vote === 'up',
                    },
                });
            } else {
                await tx.questionVotes.create({
                    data: {
                        userId: data.userId,
                        questionId: data.questionId,
                        isUpvote: data.vote === 'up',
                    },
                });
            }

            return tx.questions.update({
                where: {
                    id: data.questionId,
                },
                data: {
                    votes: {
                        increment: voteDelta,
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

        return this.toQuestionData(updatedQuestion, data.vote);
    }

    async setCommentVote(data: SetCommentVoteData): Promise<CommentData> {
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

        const existingVote = await prisma.commentVotes.findUnique({
            where: {
                userId_commentId: {
                    userId: data.userId,
                    commentId: data.commentId,
                },
            },
        });

        const currentVoteState = this.getVoteStateFromRecord(existingVote);

        if (currentVoteState === data.vote) {
            return this.toCommentData(comment, currentVoteState);
        }

        const voteDelta = getVoteDelta(currentVoteState, data.vote);

        const updatedComment = await prisma.$transaction(async (tx) => {
            if (data.vote === 'none') {
                await tx.commentVotes.delete({
                    where: {
                        userId_commentId: {
                            userId: data.userId,
                            commentId: data.commentId,
                        },
                    },
                });
            } else if (existingVote) {
                await tx.commentVotes.update({
                    where: {
                        userId_commentId: {
                            userId: data.userId,
                            commentId: data.commentId,
                        },
                    },
                    data: {
                        isUpvote: data.vote === 'up',
                    },
                });
            } else {
                await tx.commentVotes.create({
                    data: {
                        userId: data.userId,
                        commentId: data.commentId,
                        isUpvote: data.vote === 'up',
                    },
                });
            }

            return tx.comments.update({
                where: {
                    id: data.commentId,
                },
                data: {
                    votes: {
                        increment: voteDelta,
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

        return this.toCommentData(updatedComment, data.vote);
    }

    private toQuestionData(question: {
        id: string;
        title: string;
        description: string;
        imageData?: Uint8Array | Buffer | null;
        createdAt: Date;
        votes: number;
        _count: {
            comments: number;
        };
        user: {
            id: string;
            name: string;
        };
    }, voteState: VoteState = 'none'): QuestionData {
        return {
            id: question.id,
            title: question.title,
            description: question.description,
            imageSrc: this.imageService.toImageSrc(question.imageData),
            createdAt: question.createdAt,
            votes: question.votes,
            voteState,
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
        votes: number;
        user: {
            id: string;
            name: string;
        };
    }, voteState: VoteState = 'none'): CommentData {
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            votes: comment.votes,
            voteState,
            user: comment.user,
        };
    }

    private async getUserQuestionVoteState(userId: string, questionId: string): Promise<VoteState> {
        const vote = await prisma.questionVotes.findUnique({
            where: {
                userId_questionId: {
                    userId,
                    questionId,
                },
            },
        });

        return this.getVoteStateFromRecord(vote);
    }

    private async getQuestionVoteStates(
        questions: Array<{ id: string; userId: string }>,
        userId?: string,
    ): Promise<Map<string, VoteState>> {
        if (!userId || questions.length === 0) {
            return new Map();
        }

        const votes = await prisma.questionVotes.findMany({
            where: {
                userId,
                questionId: {
                    in: questions.map((question) => question.id),
                },
            },
            select: {
                questionId: true,
                isUpvote: true,
            },
        });

        return new Map(votes.map((vote) => [vote.questionId, vote.isUpvote ? 'up' : 'down']));
    }

    private async getCommentVoteStates(
        comments: Array<{ id: string }>,
        userId?: string,
    ): Promise<Map<string, VoteState>> {
        if (!userId || comments.length === 0) {
            return new Map();
        }

        const votes = await prisma.commentVotes.findMany({
            where: {
                userId,
                commentId: {
                    in: comments.map((comment) => comment.id),
                },
            },
            select: {
                commentId: true,
                isUpvote: true,
            },
        });

        return new Map(votes.map((vote) => [vote.commentId, vote.isUpvote ? 'up' : 'down']));
    }

    private getVoteStateFromRecord(vote?: { isUpvote: boolean } | null): VoteState {
        if (!vote) {
            return 'none';
        }

        return vote.isUpvote ? 'up' : 'down';
    }
}

function getVoteDelta(currentVote: VoteState, nextVote: VoteState): number {
    if (currentVote === nextVote) {
        return 0;
    }

    if (nextVote === 'none') {
        return currentVote === 'up' ? -1 : currentVote === 'down' ? 1 : 0;
    }

    if (currentVote === 'none') {
        return nextVote === 'up' ? 1 : -1;
    }

    return nextVote === 'up' ? 2 : -2;
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

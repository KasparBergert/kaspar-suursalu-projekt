import prisma from '../../prisma/main.ts';
import type {
    CommentData,
    QuestionData,
    SetCommentVoteData,
    SetQuestionVoteData,
    VoteState,
} from '../../interfaces/QuestionInterfaces.ts';
import { QuestionImageService } from '../QuestionImageService.ts';
import { toCommentData, toQuestionData } from './questionMappers.ts';
import { getVoteDelta, getVoteStateFromRecord } from './questionVotes.ts';

export class QuestionVoteService {
    private readonly imageService = new QuestionImageService();

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

        const currentVoteState = getVoteStateFromRecord(existingVote);

        if (currentVoteState === data.vote) {
            return toQuestionData(question, this.imageService, currentVoteState);
        }

        const voteDelta = getVoteDelta(currentVoteState, data.vote);

        const updatedQuestion = await prisma.$transaction(async (tx) => {
            await this.saveQuestionVote(tx, data, Boolean(existingVote));

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

        return toQuestionData(updatedQuestion, this.imageService, data.vote);
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

        const currentVoteState = getVoteStateFromRecord(existingVote);

        if (currentVoteState === data.vote) {
            return toCommentData(comment, currentVoteState);
        }

        const voteDelta = getVoteDelta(currentVoteState, data.vote);

        const updatedComment = await prisma.$transaction(async (tx) => {
            await this.saveCommentVote(tx, data, Boolean(existingVote));

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

        return toCommentData(updatedComment, data.vote);
    }

    async getUserQuestionVoteState(userId: string, questionId: string): Promise<VoteState> {
        const vote = await prisma.questionVotes.findUnique({
            where: {
                userId_questionId: {
                    userId,
                    questionId,
                },
            },
        });

        return getVoteStateFromRecord(vote);
    }

    async getQuestionVoteStates(
        questions: Array<{ id: string }>,
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

        return new Map(votes.map((vote) => [vote.questionId, getVoteStateFromRecord(vote)]));
    }

    async getCommentVoteStates(
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

        return new Map(votes.map((vote) => [vote.commentId, getVoteStateFromRecord(vote)]));
    }

    private saveQuestionVote(
        tx: typeof prisma,
        data: SetQuestionVoteData,
        hasExistingVote: boolean,
    ) {
        if (data.vote === 'none') {
            return tx.questionVotes.delete({
                where: {
                    userId_questionId: {
                        userId: data.userId,
                        questionId: data.questionId,
                    },
                },
            });
        }

        if (hasExistingVote) {
            return tx.questionVotes.update({
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
        }

        return tx.questionVotes.create({
            data: {
                userId: data.userId,
                questionId: data.questionId,
                isUpvote: data.vote === 'up',
            },
        });
    }

    private saveCommentVote(
        tx: typeof prisma,
        data: SetCommentVoteData,
        hasExistingVote: boolean,
    ) {
        if (data.vote === 'none') {
            return tx.commentVotes.delete({
                where: {
                    userId_commentId: {
                        userId: data.userId,
                        commentId: data.commentId,
                    },
                },
            });
        }

        if (hasExistingVote) {
            return tx.commentVotes.update({
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
        }

        return tx.commentVotes.create({
            data: {
                userId: data.userId,
                commentId: data.commentId,
                isUpvote: data.vote === 'up',
            },
        });
    }
}

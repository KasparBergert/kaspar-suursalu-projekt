import type {
    CommentData,
    QuestionData,
    VoteState,
} from '../../interfaces/QuestionInterfaces.ts';
import type { QuestionImageService } from '../QuestionImageService.ts';

export type QuestionRecord = {
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
};

export type CommentRecord = {
    id: string;
    text: string;
    createdAt: Date;
    votes: number;
    user: {
        id: string;
        name: string;
    };
};

export function toQuestionData(
    question: QuestionRecord,
    imageService: QuestionImageService,
    voteState: VoteState = 'none',
): QuestionData {
    return {
        id: question.id,
        title: question.title,
        description: question.description,
        imageSrc: imageService.toImageSrc(question.imageData),
        createdAt: question.createdAt,
        votes: question.votes,
        voteState,
        commentCount: question._count.comments,
        user: question.user,
    };
}

export function toCommentData(
    comment: CommentRecord,
    voteState: VoteState = 'none',
): CommentData {
    return {
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        votes: comment.votes,
        voteState,
        user: comment.user,
    };
}

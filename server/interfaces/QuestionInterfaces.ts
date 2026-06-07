export interface PaginationData {
    page: number;
    limit: number;
}

export interface PaginatedData<TData> {
    data: TData[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface QuestionUserData {
    id: string;
    name: string;
}

export type VoteState = 'up' | 'down' | 'none';

export interface QuestionData {
    id: string;
    title: string;
    description: string;
    imageSrc?: string;
    createdAt: Date;
    votes: number;
    voteState: VoteState;
    commentCount: number;
    user: QuestionUserData;
}

export interface CommentData {
    id: string;
    text: string;
    createdAt: Date;
    votes: number;
    voteState: VoteState;
    user: QuestionUserData;
}

export interface QuestionWithCommentsData {
    question: QuestionData;
    comments: PaginatedData<CommentData>;
}

export interface CreateQuestionData {
    userId: string;
    title: string;
    description: string;
    imageSrc?: string;
}

export interface AddAnswerData {
    userId: string;
    questionId: string;
    text: string;
}

export interface SetQuestionVoteData {
    userId: string;
    questionId: string;
    vote: VoteState;
}

export interface SetCommentVoteData {
    userId: string;
    commentId: string;
    vote: VoteState;
}

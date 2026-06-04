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

export interface QuestionData {
    id: string;
    title: string;
    description: string;
    imageSrc?: string;
    upvotes: number;
    commentCount: number;
    user: QuestionUserData;
}

export interface CommentData {
    id: string;
    text: string;
    createdAt: Date;
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

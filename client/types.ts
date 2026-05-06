export type View = 'feed' | 'profile';

export type AuthMode = 'login' | 'register';

export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

export type AuthResult = {
    user: AuthUser;
    token: string;
};

export type QuestionUserData = {
    id: string;
    name: string;
};

export type QuestionData = {
    id: string;
    title: string;
    description: string;
    upvotes: number;
    commentCount: number;
    user: QuestionUserData;
};

export type CommentData = {
    id: string;
    text: string;
    createdAt: string;
    user: QuestionUserData;
};

export type PaginatedData<TData> = {
    data: TData[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type QuestionWithCommentsData = {
    question: QuestionData;
    comments: PaginatedData<CommentData>;
};

export type AuthCredentials = {
    email: string;
    password: string;
};

export type RegisterPayload = AuthCredentials & {
    name: string;
};

export type CreateQuestionPayload = {
    title: string;
    description: string;
};

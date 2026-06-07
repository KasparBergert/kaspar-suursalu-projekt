export type View = 'feed' | 'profile';
export type AppRoute = View | 'auth';

export type AuthMode = 'login' | 'register';
export type AuthPageMode = AuthMode | 'forgot-password' | 'reset-password';

export type AuthFormModel = {
    errorMessage: string;
    isSubmitting: boolean;
    message: string;
};

export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

export type QuestionUserData = {
    id: string;
    name: string;
};

export type VoteState = 'up' | 'down' | 'none';

export type QuestionData = {
    id: string;
    title: string;
    description: string;
    imageSrc?: string;
    createdAt: string;
    votes: number;
    voteState: VoteState;
    commentCount: number;
    user: QuestionUserData;
};

export type CommentData = {
    id: string;
    text: string;
    createdAt: string;
    votes: number;
    voteState: VoteState;
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

export type PasswordResetRequestPayload = {
    email: string;
};

export type PasswordResetPayload = {
    password: string;
};

export type RegisterPayload = AuthCredentials & {
    name: string;
};

export type CreateQuestionPayload = {
    title: string;
    description: string;
    imageSrc?: string;
};

export type AuthPageModel = AuthFormModel & {
    mode: AuthPageMode;
};

export type QuestionListModel = {
    comments: CommentData[];
    emptyText: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSubmitting: boolean;
    questions: QuestionData[];
    selectedQuestionId: string | null;
    showAuthor: boolean;
    title: string;
    user: AuthUser | null;
};

export type QuestionCardModel = {
    detail: QuestionListModel;
    isSelected: boolean;
    question: QuestionData;
};

export type CommentSectionModel = {
    comments: CommentData[];
    isAuthenticated: boolean;
    isSubmitting: boolean;
};

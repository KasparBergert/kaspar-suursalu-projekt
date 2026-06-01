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
};

export type TopbarModel = {
    isAuthenticated: boolean;
    isSubmitting: boolean;
    user: AuthUser | null;
    view: View;
};

export type TopbarActions = {
    logout: () => void | Promise<void>;
    openAuth: () => void;
    openQuestionModal: () => void;
    showFeed: () => void;
    showProfile: () => void | Promise<void>;
};

export type AuthPageModel = AuthFormModel & {
    mode: AuthPageMode;
};

export type AuthPageActions = {
    forgotPassword: () => void;
    requestPasswordReset: (email: string) => void | Promise<void>;
    resetPassword: (password: string) => void | Promise<void>;
    showLogin: () => void;
    showRegister: () => void;
    submit: (payload: AuthCredentials | RegisterPayload) => void | Promise<void>;
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

export type QuestionListActions = {
    answer: (text: string) => void | Promise<void>;
    open: (questionId: string) => void | Promise<void>;
    upvote: (question: QuestionData) => void | Promise<void>;
};

export type FeedPageModel = {
    canLoadMore: boolean;
    questions: QuestionListModel;
};

export type FeedPageActions = {
    askQuestion: () => void;
    loadMore: () => void | Promise<void>;
    questions: QuestionListActions;
};

export type QuestionCardModel = {
    detail: QuestionListModel;
    isSelected: boolean;
    question: QuestionData;
};

export type QuestionCardActions = QuestionListActions & {
    hide: (questionId: string) => void;
};

export type CommentSectionModel = {
    comments: CommentData[];
    isAuthenticated: boolean;
    isSubmitting: boolean;
};

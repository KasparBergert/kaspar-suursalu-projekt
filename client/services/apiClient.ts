import type {
    AuthCredentials,
    AuthResult,
    AuthUser,
    CommentData,
    CreateQuestionPayload,
    PaginatedData,
    QuestionData,
    QuestionWithCommentsData,
    RegisterPayload,
} from '../types.ts';

const apiBaseUrl = 'http://localhost:3000/api';

type TokenProvider = () => string;

export function createApiClient(getToken: TokenProvider) {
    async function request<TData>(
        path: string,
        options: RequestInit = {},
    ): Promise<TData> {
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');

        const token = getToken();

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${apiBaseUrl}${path}`, {
            ...options,
            headers,
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            throw new Error(data?.error ?? 'Request failed.');
        }

        return data as TData;
    }

    return {
        register(data: RegisterPayload): Promise<AuthResult> {
            return request<AuthResult>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        login(data: AuthCredentials): Promise<AuthResult> {
            return request<AuthResult>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        logout(): Promise<{ message: string }> {
            return request<{ message: string }>('/auth/logout', { method: 'POST' });
        },
        getProfile(): Promise<{ user: AuthUser }> {
            return request<{ user: AuthUser }>('/profile');
        },
        getMyQuestions(): Promise<{ data: QuestionData[] }> {
            return request<{ data: QuestionData[] }>('/profile/questions');
        },
        getQuestions(page: number, limit = 10): Promise<PaginatedData<QuestionData>> {
            return request<PaginatedData<QuestionData>>(`/questions?page=${page}&limit=${limit}`);
        },
        getQuestion(questionId: string, page = 1, limit = 20): Promise<QuestionWithCommentsData> {
            return request<QuestionWithCommentsData>(
                `/questions/${questionId}?page=${page}&limit=${limit}`,
            );
        },
        createQuestion(data: CreateQuestionPayload): Promise<QuestionData> {
            return request<QuestionData>('/questions', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        upvoteQuestion(questionId: string): Promise<QuestionData> {
            return request<QuestionData>(`/questions/${questionId}/upvotes`, {
                method: 'POST',
            });
        },
        addAnswer(questionId: string, text: string): Promise<CommentData> {
            return request<CommentData>(`/questions/${questionId}/answers`, {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
        },
    };
}

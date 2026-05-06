import type {
    CommentData,
    CreateQuestionPayload,
    PaginatedData,
    QuestionData,
    QuestionWithCommentsData,
} from '../../../types.ts';
import { apiRequest } from '../../../utils/apiRequest.ts';

export function getQuestions(page: number): Promise<PaginatedData<QuestionData>> {
    return apiRequest<PaginatedData<QuestionData>>(`/questions?page=${page}`);
}

export function getQuestion(
    questionId: string,
    page = 1,
    limit = 20,
): Promise<QuestionWithCommentsData> {
    return apiRequest<QuestionWithCommentsData>(
        `/questions/${questionId}?page=${page}&limit=${limit}`,
    );
}

export function getMyQuestions(token: string): Promise<{ data: QuestionData[] }> {
    return apiRequest<{ data: QuestionData[] }>('/profile/questions', { token });
}

export function createQuestion(
    data: CreateQuestionPayload,
    token: string,
): Promise<QuestionData> {
    return apiRequest<QuestionData>('/questions', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
    });
}

export function upvoteQuestion(questionId: string, token: string): Promise<QuestionData> {
    return apiRequest<QuestionData>(`/questions/${questionId}/upvotes`, {
        method: 'POST',
        token,
    });
}

export function addAnswer(
    questionId: string,
    text: string,
    token: string,
): Promise<CommentData> {
    return apiRequest<CommentData>(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ text }),
        token,
    });
}

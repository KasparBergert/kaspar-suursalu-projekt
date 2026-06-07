import type {
    CommentData,
    CreateQuestionPayload,
    PaginatedData,
    QuestionData,
    QuestionWithCommentsData,
    VoteState,
} from '../../../types.ts';
import { apiRequest } from '../../../utils/apiRequest.ts';

export function getQuestions(page: number, search?: string): Promise<PaginatedData<QuestionData>> {
    const query = new URLSearchParams();
    query.set('page', String(page));

    if (search?.trim()) {
        query.set('search', search.trim());
    }

    return apiRequest<PaginatedData<QuestionData>>(`/questions?${query.toString()}`);
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

export function getMyQuestions(): Promise<{ data: QuestionData[] }> {
    return apiRequest<{ data: QuestionData[] }>('/profile/questions');
}

export function createQuestion(
    data: CreateQuestionPayload,
): Promise<QuestionData> {
    return apiRequest<QuestionData>('/questions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function setQuestionVote(questionId: string, vote: VoteState): Promise<QuestionData> {
    return apiRequest<QuestionData>(`/questions/${questionId}/votes`, {
        method: 'POST',
        body: JSON.stringify({ vote }),
    });
}

export function setCommentVote(commentId: string, vote: VoteState): Promise<CommentData> {
    return apiRequest<CommentData>(`/comments/${commentId}/votes`, {
        method: 'POST',
        body: JSON.stringify({ vote }),
    });
}

export function addAnswer(
    questionId: string,
    text: string,
): Promise<CommentData> {
    return apiRequest<CommentData>(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
}

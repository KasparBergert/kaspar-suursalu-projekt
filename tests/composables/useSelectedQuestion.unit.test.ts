import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectedQuestion } from '../../client/features/questions/composables/useSelectedQuestion.ts';
import * as questionsApi from '../../client/features/questions/services/questionsApi.ts';

describe('useSelectedQuestion', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('clears the selected question when the same question is toggled twice', async () => {
        const getQuestionMock = vi.spyOn(questionsApi, 'getQuestion').mockResolvedValue({
            question: {
                commentCount: 0,
                createdAt: '2026-06-05T00:00:00.000Z',
                description: 'Question description',
                id: 'question-1',
                imageSrc: undefined,
                title: 'Question title',
                voteState: 'none',
                votes: 0,
                user: {
                    id: 'user-1',
                    name: 'Kaspar',
                },
            },
            comments: {
                data: [],
                limit: 20,
                page: 1,
                total: 0,
                totalPages: 0,
            },
        });

        const selectedQuestion = useSelectedQuestion();

        await selectedQuestion.toggleQuestion('question-1');

        expect(selectedQuestion.selectedQuestionId.value).toBe('question-1');
        expect(selectedQuestion.selectedQuestion.value?.question.id).toBe('question-1');
        expect(getQuestionMock).toHaveBeenCalledTimes(1);

        await selectedQuestion.toggleQuestion('question-1');

        expect(selectedQuestion.selectedQuestionId.value).toBeNull();
        expect(selectedQuestion.selectedQuestion.value).toBeNull();
        expect(getQuestionMock).toHaveBeenCalledTimes(1);
    });
});

import { computed, ref } from 'vue';
import * as questionsApi from '../services/questionsApi.ts';
import type { QuestionData, QuestionWithCommentsData } from '../../../types.ts';

export function useSelectedQuestion() {
    const selectedQuestionId = ref<string | null>(null);
    const selectedQuestion = ref<QuestionWithCommentsData | null>(null);
    const selectedComments = computed(() => selectedQuestion.value?.comments.data ?? []);

    async function selectQuestion(questionId: string): Promise<void> {
        selectedQuestionId.value = questionId;
        selectedQuestion.value = await questionsApi.getQuestion(questionId);
    }

    function clearSelectedQuestion(): void {
        selectedQuestionId.value = null;
        selectedQuestion.value = null;
    }

    async function toggleQuestion(questionId: string): Promise<void> {
        if (selectedQuestionId.value === questionId) {
            clearSelectedQuestion();
            return;
        }

        await selectQuestion(questionId);
    }

    function updateSelectedQuestion(updatedQuestion: QuestionData): void {
        if (selectedQuestion.value?.question.id === updatedQuestion.id) {
            selectedQuestion.value.question = updatedQuestion;
        }
    }

    return {
        clearSelectedQuestion,
        selectQuestion,
        selectedComments,
        selectedQuestion,
        selectedQuestionId,
        toggleQuestion,
        updateSelectedQuestion,
    };
}

import { computed, ref, watch, type Ref } from 'vue';
import * as questionsApi from '../services/questionsApi.ts';
import type { QuestionData } from '../../../types.ts';

export function useQuestionCollections(
    isAuthenticated: Readonly<Ref<boolean>>,
) {
    const questions = ref<QuestionData[]>([]);
    const myQuestions = ref<QuestionData[]>([]);
    const page = ref(1);
    const totalPages = ref(1);
    const hasMoreFeed = computed(() => page.value < totalPages.value);

    watch(isAuthenticated, (nextIsAuthenticated) => {
        if (!nextIsAuthenticated) {
            myQuestions.value = [];
        }
    });

    async function loadFeed(nextPage = page.value, search?: string): Promise<void> {
        const result = await questionsApi.getQuestions(nextPage, search);

        questions.value = result.data;
        page.value = result.page;
        totalPages.value = result.totalPages || 1;
    }

    async function loadMoreFeed(search?: string): Promise<void> {
        if (!hasMoreFeed.value) {
            return;
        }

        const result = await questionsApi.getQuestions(page.value + 1, search);

        questions.value = [...questions.value, ...result.data];
        page.value = result.page;
        totalPages.value = result.totalPages || 1;
    }

    async function loadMyQuestions(): Promise<void> {
        if (!isAuthenticated.value) {
            myQuestions.value = [];
            return;
        }

        const result = await questionsApi.getMyQuestions();
        myQuestions.value = result.data;
    }

    function prependQuestion(question: QuestionData): void {
        questions.value = [question, ...questions.value];
    }

    function replaceQuestion(updatedQuestion: QuestionData): void {
        questions.value = replaceQuestionInList(questions.value, updatedQuestion);
        myQuestions.value = replaceQuestionInList(myQuestions.value, updatedQuestion);
    }

    return {
        hasMoreFeed,
        loadFeed,
        loadMoreFeed,
        loadMyQuestions,
        myQuestions,
        page,
        prependQuestion,
        questions,
        replaceQuestion,
        totalPages,
    };
}

function replaceQuestionInList(
    questions: QuestionData[],
    updatedQuestion: QuestionData,
): QuestionData[] {
    return questions.map((question) => (
        question.id === updatedQuestion.id ? updatedQuestion : question
    ));
}

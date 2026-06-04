import { computed, ref } from 'vue';
import * as questionsApi from '../services/questionsApi.ts';
import type { QuestionData } from '../../../types.ts';

const query = ref('');
const activeQuery = ref('');
const page = ref(1);
const totalPages = ref(1);
const questions = ref<QuestionData[]>([]);
const isLoading = ref(false);

const hasMore = computed(() => page.value < totalPages.value);

async function runSearch(nextPage = 1): Promise<void> {
    isLoading.value = true;

    try {
        const result = await questionsApi.getQuestions(nextPage, activeQuery.value);
        questions.value = nextPage === 1 ? result.data : [...questions.value, ...result.data];
        page.value = result.page;
        totalPages.value = result.totalPages || 1;
    } finally {
        isLoading.value = false;
    }
}

async function search(): Promise<void> {
    activeQuery.value = query.value.trim();

    if (!activeQuery.value) {
        reset();
        return;
    }

    await runSearch(1);
}

async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoading.value) {
        return;
    }

    await runSearch(page.value + 1);
}

function updateQuery(value: string): void {
    query.value = value;
}

function reset(): void {
    query.value = '';
    activeQuery.value = '';
    page.value = 1;
    totalPages.value = 1;
    questions.value = [];
}

export function useQuestionSearchStore() {
    return {
        activeQuery,
        hasMore,
        isLoading,
        loadMore,
        page,
        query,
        questions,
        reset,
        search,
        totalPages,
        updateQuery,
    };
}

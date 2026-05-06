import { computed, ref, watch, type Ref } from 'vue';
import type { createApiClient } from '../../../services/apiClient.ts';
import type {
    CreateQuestionPayload,
    QuestionData,
    QuestionWithCommentsData,
    View,
} from '../../../types.ts';
import type { useNotice } from '../../../shared/composables/useNotice.ts';

type ApiClient = ReturnType<typeof createApiClient>;
type Notice = ReturnType<typeof useNotice>;

export function useQuestions(
    api: ApiClient,
    isAuthenticated: Readonly<Ref<boolean>>,
    notice: Notice,
) {
    const view = ref<View>('feed');
    const questions = ref<QuestionData[]>([]);
    const myQuestions = ref<QuestionData[]>([]);
    const selectedQuestionId = ref<string | null>(null);
    const selectedQuestion = ref<QuestionWithCommentsData | null>(null);
    const page = ref(1);
    const totalPages = ref(1);
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const selectedComments = computed(() => selectedQuestion.value?.comments.data ?? []);

    watch(isAuthenticated, (nextIsAuthenticated) => {
        if (!nextIsAuthenticated) {
            myQuestions.value = [];
        }
    });

    async function loadFeed(nextPage = page.value): Promise<void> {
        isLoading.value = true;
        notice.clearNotice();

        try {
            const result = await api.getQuestions(nextPage);

            questions.value = result.data;
            page.value = result.page;
            totalPages.value = result.totalPages || 1;

            if (!selectedQuestionId.value && result.data[0]) {
                await selectQuestion(result.data[0].id);
            }
        } catch (error) {
            notice.showError(error);
        } finally {
            isLoading.value = false;
        }
    }

    async function loadMyQuestions(): Promise<void> {
        if (!isAuthenticated.value) {
            myQuestions.value = [];
            return;
        }

        isLoading.value = true;
        notice.clearNotice();

        try {
            const result = await api.getMyQuestions();
            myQuestions.value = result.data;
        } catch (error) {
            notice.showError(error);
        } finally {
            isLoading.value = false;
        }
    }

    async function selectQuestion(questionId: string): Promise<void> {
        selectedQuestionId.value = questionId;
        notice.clearNotice();

        try {
            selectedQuestion.value = await api.getQuestion(questionId);
        } catch (error) {
            notice.showError(error);
        }
    }

    async function createQuestion(payload: CreateQuestionPayload): Promise<boolean> {
        isSubmitting.value = true;
        notice.clearNotice();

        try {
            const question = await api.createQuestion(payload);

            questions.value = [question, ...questions.value];
            await selectQuestion(question.id);
            notice.showMessage('Question posted.');
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function upvote(question: QuestionData): Promise<void> {
        if (!isAuthenticated.value) {
            notice.showErrorMessage('Log in to upvote questions.');
            return;
        }

        notice.clearNotice();

        try {
            const updatedQuestion = await api.upvoteQuestion(question.id);

            replaceQuestion(updatedQuestion);

            if (selectedQuestion.value?.question.id === updatedQuestion.id) {
                selectedQuestion.value.question = updatedQuestion;
            }
        } catch (error) {
            notice.showError(error);
        }
    }

    async function addAnswer(text: string): Promise<void> {
        if (!selectedQuestionId.value) {
            return;
        }

        isSubmitting.value = true;
        notice.clearNotice();

        try {
            await api.addAnswer(selectedQuestionId.value, text);
            await selectQuestion(selectedQuestionId.value);
            notice.showMessage('Answer posted.');
        } catch (error) {
            notice.showError(error);
        } finally {
            isSubmitting.value = false;
        }
    }

    async function showProfile(): Promise<void> {
        view.value = 'profile';
        await loadMyQuestions();
    }

    function showFeed(): void {
        view.value = 'feed';
    }

    async function openProfileQuestion(questionId: string): Promise<void> {
        showFeed();
        await selectQuestion(questionId);
    }

    function replaceQuestion(updatedQuestion: QuestionData): void {
        questions.value = questions.value.map((question) => (
            question.id === updatedQuestion.id ? updatedQuestion : question
        ));
        myQuestions.value = myQuestions.value.map((question) => (
            question.id === updatedQuestion.id ? updatedQuestion : question
        ));
    }

    return {
        addAnswer,
        createQuestion,
        isLoading,
        isSubmitting,
        loadFeed,
        myQuestions,
        openProfileQuestion,
        page,
        questions,
        selectedComments,
        selectedQuestion,
        selectedQuestionId,
        selectQuestion,
        showFeed,
        showProfile,
        totalPages,
        upvote,
        view,
    };
}

import { ref, type Ref } from 'vue';
import type {
    CreateQuestionPayload,
    QuestionData,
    View,
} from '../../../types.ts';
import type { useNotice } from '../../../shared/composables/useNotice.ts';
import { postAnswer, postQuestion, upvoteQuestion } from './questionCommands.ts';
import { runQuestionTask } from './runQuestionTask.ts';
import { useQuestionCollections } from './useQuestionCollections.ts';
import { useSelectedQuestion } from './useSelectedQuestion.ts';

type Notice = ReturnType<typeof useNotice>;

export function useQuestions(
    isAuthenticated: Readonly<Ref<boolean>>,
    token: Readonly<Ref<string>>,
    notice: Notice,
) {
    const view = ref<View>('feed');
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const collections = useQuestionCollections(isAuthenticated, token);
    const selectedQuestion = useSelectedQuestion();

    function loadFeed(nextPage?: number): Promise<void | undefined> {
        return runQuestionTask(
            isLoading,
            notice,
            () => collections.loadFeed(nextPage),
        );
    }

    function loadMoreFeed(): Promise<void | undefined> {
        if (view.value !== 'feed' || isLoading.value || collections.page.value >= collections.totalPages.value) {
            return Promise.resolve(undefined);
        }

        return runQuestionTask(
            isLoading,
            notice,
            collections.loadMoreFeed,
        );
    }

    function selectQuestion(questionId: string): Promise<void | undefined> {
        return runQuestionTask(
            isLoading,
            notice,
            () => selectedQuestion.selectQuestion(questionId),
        );
    }

    function loadMyQuestions(): Promise<void | undefined> {
        return runQuestionTask(
            isLoading,
            notice,
            collections.loadMyQuestions,
        );
    }

    async function createQuestion(payload: CreateQuestionPayload): Promise<boolean> {
        const question = await runQuestionTask(isSubmitting, notice, () => (
            postQuestion(payload, token.value, collections, selectedQuestion)
        ));

        if (question) {
            notice.showMessage('Question posted.');
        }

        return Boolean(question);
    }

    async function upvote(question: QuestionData): Promise<void> {
        if (!isAuthenticated.value) {
            notice.showErrorMessage('Log in to upvote questions.');
            return;
        }

        notice.clearNotice();

        try {
            await upvoteQuestion(question.id, token.value, collections, selectedQuestion);
        } catch (error) {
            notice.showError(error);
        }
    }

    async function addAnswer(text: string): Promise<void> {
        const questionId = selectedQuestion.selectedQuestionId.value;

        if (!questionId) {
            return;
        }

        await runQuestionTask(isSubmitting, notice, async () => {
            await postAnswer(questionId, text, token.value, selectedQuestion);
            notice.showMessage('Answer posted.');
        });
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

    return {
        addAnswer,
        createQuestion,
        isLoading,
        isSubmitting,
        loadFeed,
        loadMoreFeed,
        myQuestions: collections.myQuestions,
        openProfileQuestion,
        page: collections.page,
        questions: collections.questions,
        selectedComments: selectedQuestion.selectedComments,
        selectedQuestion: selectedQuestion.selectedQuestion,
        selectedQuestionId: selectedQuestion.selectedQuestionId,
        selectQuestion,
        showFeed,
        showProfile,
        totalPages: collections.totalPages,
        upvote,
        view,
    };
}

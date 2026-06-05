import { ref, type Ref } from 'vue';
import type {
    CreateQuestionPayload,
    QuestionData,
} from '../../../types.ts';
import type { useNotice } from '../../../shared/composables/useNotice.ts';
import { addAnswer as addQuestionAnswer, createQuestion as createQuestionCommand, upvoteQuestion } from './questionCommands.ts';
import { runQuestionTask } from './runQuestionTask.ts';
import { useQuestionCollections } from './useQuestionCollections.ts';
import { useSelectedQuestion } from './useSelectedQuestion.ts';

type Notice = ReturnType<typeof useNotice>;

export function useQuestions(
    isAuthenticated: Readonly<Ref<boolean>>,
    notice: Notice,
) {
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const collections = useQuestionCollections(isAuthenticated);
    const selectedQuestion = useSelectedQuestion();

    function loadFeed(nextPage?: number, search?: string): Promise<void | undefined> {
        return runQuestionTask(
            isLoading,
            notice,
            () => collections.loadFeed(nextPage, search),
        );
    }

    function loadMoreFeed(search?: string): Promise<void | undefined> {
        if (isLoading.value || !collections.hasMoreFeed.value) {
            return Promise.resolve(undefined);
        }

        return runQuestionTask(
            isLoading,
            notice,
            () => collections.loadMoreFeed(search),
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
            createQuestionCommand(payload, collections, selectedQuestion)
        ));

        if (question) {
            notice.showMessage('Question created.');
        }

        return Boolean(question);
    }

    async function upvote(question: QuestionData, active: boolean): Promise<QuestionData | null> {
        if (!isAuthenticated.value) {
            notice.showErrorMessage('Log in to upvote questions.');
            return null;
        }

        notice.clearNotice();

        try {
            return await upvoteQuestion(question.id, active, collections, selectedQuestion);
        } catch (error) {
            notice.showError(error);
            return null;
        }
    }

    async function addAnswer(text: string): Promise<void> {
        const questionId = selectedQuestion.selectedQuestionId.value;

        if (!questionId) {
            return;
        }

        await runQuestionTask(isSubmitting, notice, async () => {
            await addQuestionAnswer(questionId, text, selectedQuestion);
            notice.showMessage('Answer added.');
        });
    }

    async function openProfileQuestion(questionId: string): Promise<void> {
        await selectQuestion(questionId);
    }

    return {
        addAnswer,
        createQuestion,
        hasMoreFeed: collections.hasMoreFeed,
        isLoading,
        isSubmitting,
        loadFeed,
        loadMoreFeed,
        loadMyQuestions,
        myQuestions: collections.myQuestions,
        openProfileQuestion,
        page: collections.page,
        questions: collections.questions,
        selectedComments: selectedQuestion.selectedComments,
        selectedQuestion: selectedQuestion.selectedQuestion,
        selectedQuestionId: selectedQuestion.selectedQuestionId,
        selectQuestion,
        totalPages: collections.totalPages,
        upvote,
    };
}

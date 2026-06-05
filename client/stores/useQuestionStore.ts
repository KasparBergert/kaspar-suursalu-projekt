import { computed } from 'vue';
import AskQuestionPanel from '../features/questions/components/AskQuestionPanel.vue';
import { useQuestions } from '../features/questions/composables/useQuestions.ts';
import { useModal } from '../shared/composables/useModal.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useAppRouter } from '../router.ts';
import { useAuthStore } from './useAuthStore.ts';
import type { QuestionData, QuestionListModel } from '../types.ts';

let questionStore: ReturnType<typeof createQuestionStore> | null = null;

export function useQuestionStore() {
    questionStore ??= createQuestionStore();
    return questionStore;
}

function createQuestionStore() {
    const auth = useAuthStore();
    const notice = useNotice();
    const modal = useModal();
    const router = useAppRouter();
    const questions = useQuestions(auth.session.isAuthenticated, notice);
    const isSubmitting = computed(() => auth.isSubmitting.value || questions.isSubmitting.value);

    const feedModel = computed<QuestionListModel>(() => ({
        comments: questions.selectedComments.value,
        emptyText: 'No questions yet.',
        isAuthenticated: auth.session.isAuthenticated.value,
        isLoading: questions.isLoading.value,
        isSubmitting: isSubmitting.value,
        questions: questions.questions.value,
        selectedQuestionId: questions.selectedQuestionId.value,
        showAuthor: true,
        title: 'Questions',
        user: auth.session.user.value,
    }));

    const profileModel = computed<QuestionListModel>(() => ({
        comments: questions.selectedComments.value,
        emptyText: 'You have not asked anything yet.',
        isAuthenticated: auth.session.isAuthenticated.value,
        isLoading: questions.isLoading.value,
        isSubmitting: isSubmitting.value,
        questions: questions.myQuestions.value,
        selectedQuestionId: questions.selectedQuestionId.value,
        showAuthor: false,
        title: 'Your questions',
        user: auth.session.user.value,
    }));

    async function createQuestion(payload: Parameters<typeof questions.createQuestion>[0]): Promise<void> {
        modal.state.props.isSubmitting = true;
        const didCreate = await questions.createQuestion(payload);
        modal.state.props.isSubmitting = false;

        if (didCreate) {
            modal.closeModal();
        }
    }

    function openAskQuestionModal(): void {
        modal.openModal(AskQuestionPanel, {
            props: {
                isSubmitting: isSubmitting.value,
                onSubmit: createQuestion,
            },
            title: 'Ask a question',
        });
    }

    async function openProfileQuestion(questionId: string): Promise<void> {
        router.goTo('feed');
        await questions.openProfileQuestion(questionId);
    }

    async function openQuestion(questionId: string, context: 'feed' | 'profile' = 'feed'): Promise<void> {
        if (context === 'profile') {
            await openProfileQuestion(questionId);
            return;
        }

        await questions.selectQuestion(questionId);
    }

    async function answerQuestion(text: string): Promise<void> {
        await questions.addAnswer(text);
    }

    async function upvoteQuestion(question: QuestionData, active: boolean): Promise<QuestionData | null> {
        if (!auth.session.isAuthenticated.value) {
            auth.openLoginPage();
            return null;
        }

        return questions.upvote(question, active);
    }

    return {
        answerQuestion,
        feedModel,
        isSubmitting,
        loadFeed: questions.loadFeed,
        loadMoreFeed: questions.loadMoreFeed,
        loadMyQuestions: questions.loadMyQuestions,
        openAskQuestionModal,
        openQuestion,
        profileModel,
        questions,
        upvoteQuestion,
    };
}

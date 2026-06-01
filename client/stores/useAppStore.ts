import { computed, onMounted, watch } from 'vue';
import AskQuestionPanel from '../features/questions/components/AskQuestionPanel.vue';
import { useAuth } from '../features/auth/composables/useAuth.ts';
import { useSession } from '../features/auth/composables/useSession.ts';
import { useQuestions } from '../features/questions/composables/useQuestions.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useModal } from '../shared/composables/useModal.ts';
import { useAuthPage } from '../shared/composables/useAuthPage.ts';
import { useAppRouter } from '../router.ts';
import type {
    AuthPageActions,
    AuthPageModel,
    FeedPageActions,
    FeedPageModel,
    QuestionData,
    QuestionListActions,
    QuestionListModel,
    TopbarModel,
} from '../types.ts';

export function useAppStore() {
    const notice = useNotice();
    const session = useSession();
    const auth = useAuth(session, notice);
    const questions = useQuestions(session.isAuthenticated, session.token, notice);
    const modal = useModal();
    const authPage = useAuthPage();
    const router = useAppRouter();

    const isSubmitting = computed(() => auth.isSubmitting.value || questions.isSubmitting.value);
    const isAuthPageVisible = computed(() => router.isAuthRoute.value && !session.isAuthenticated.value);

    const topbarModel = computed<TopbarModel>(() => ({
        isAuthenticated: session.isAuthenticated.value,
        isSubmitting: isSubmitting.value,
        user: session.user.value,
        view: router.currentRoute.value,
    }));

    const authPageModel = computed<AuthPageModel>(() => ({
        errorMessage: notice.errorMessage.value,
        isSubmitting: isSubmitting.value,
        message: notice.message.value,
        mode: authPage.mode.value,
    }));

    const feedModel = computed<QuestionListModel>(() => ({
        comments: questions.selectedComments.value,
        emptyText: 'No questions yet.',
        isAuthenticated: session.isAuthenticated.value,
        isLoading: questions.isLoading.value,
        isSubmitting: isSubmitting.value,
        questions: questions.questions.value,
        selectedQuestionId: questions.selectedQuestionId.value,
        showAuthor: true,
        title: 'Questions',
        user: session.user.value,
    }));

    const profileModel = computed<QuestionListModel>(() => ({
        comments: questions.selectedComments.value,
        emptyText: 'You have not asked anything yet.',
        isAuthenticated: session.isAuthenticated.value,
        isLoading: questions.isLoading.value,
        isSubmitting: isSubmitting.value,
        questions: questions.myQuestions.value,
        selectedQuestionId: questions.selectedQuestionId.value,
        showAuthor: false,
        title: 'Your questions',
        user: session.user.value,
    }));

    const feedPageModel = computed<FeedPageModel>(() => ({
        canLoadMore: questions.hasMoreFeed.value,
        questions: feedModel.value,
    }));

    const authPageActions: AuthPageActions = {
        forgotPassword: authPage.toggleForgotPassword,
        requestPasswordReset,
        resetPassword,
        showLogin: showLoginPage,
        showRegister: showRegisterPage,
        submit: submitAuth,
    };

    const topbarActions = {
        logout: auth.logout,
        openAuth: openLoginPage,
        openQuestionModal: openAskQuestionModal,
        showFeed,
        showProfile,
    };

    const questionActions: QuestionListActions = {
        answer: questions.addAnswer,
        open: questions.selectQuestion,
        upvote: upvoteQuestion,
    };

    const profileQuestionActions: QuestionListActions = {
        answer: questions.addAnswer,
        open: openProfileQuestion,
        upvote: upvoteQuestion,
    };

    const feedPageActions: FeedPageActions = {
        askQuestion: openAskQuestionModal,
        loadMore: questions.loadMoreFeed,
        questions: questionActions,
    };

    onMounted(async () => {
        const resetToken = new URLSearchParams(window.location.search).get('resetToken');

        if (resetToken) {
            authPage.openResetPassword(resetToken);
            router.goTo('auth');
            await auth.verifyPasswordResetToken(resetToken);
        }

        await questions.loadFeed();

        if (session.token.value) {
            await auth.loadProfile();
        }
    });

    watch(router.currentRoute, async (nextRoute) => {
        if (nextRoute === 'profile') {
            await questions.loadMyQuestions();
        }
    }, { immediate: true });

    async function submitAuth(payload: Parameters<typeof auth.submitAuth>[0]): Promise<void> {
        const didSubmit = await auth.submitAuth(payload);

        if (didSubmit) {
            authPage.close();
            showFeed();
        }
    }

    async function requestPasswordReset(email: string): Promise<void> {
        const didRequest = await auth.requestPasswordReset(email);

        if (didRequest) {
            showLoginPage();
        }
    }

    async function resetPassword(password: string): Promise<void> {
        const didReset = await auth.resetPassword(authPage.passwordResetToken.value, password);

        if (didReset) {
            showLoginPage();
            authPage.clearResetToken();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    async function createQuestion(payload: Parameters<typeof questions.createQuestion>[0]): Promise<void> {
        modal.state.props.isSubmitting = true;
        const didCreate = await questions.createQuestion(payload);
        modal.state.props.isSubmitting = false;

        if (didCreate) {
            modal.closeModal();
        }
    }

    function showFeed(): void {
        router.goTo('feed');
    }

    async function showProfile(): Promise<void> {
        if (!session.isAuthenticated.value) {
            openLoginPage();
            return;
        }

        router.goTo('profile');
        await questions.loadMyQuestions();
    }

    async function openProfileQuestion(questionId: string): Promise<void> {
        showFeed();
        await questions.openProfileQuestion(questionId);
    }

    async function upvoteQuestion(question: QuestionData): Promise<void> {
        if (!session.isAuthenticated.value) {
            openLoginPage();
            return;
        }

        await questions.upvote(question);
    }

function openLoginPage(): void {
    showLoginPage();
    authPage.openLogin();
    router.goTo('auth');
}

function openRegisterPage(): void {
    showRegisterPage();
    authPage.openRegister();
    router.goTo('auth');
}

    function showLoginPage(): void {
        auth.switchAuthMode('login');
        authPage.showLogin();
    }

    function showRegisterPage(): void {
        auth.switchAuthMode('register');
        authPage.showRegister();
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

    return {
        authPage,
        authPageActions,
        authPageModel,
        feedModel,
        feedPageActions,
        feedPageModel,
        isAuthPageVisible,
        isSubmitting,
        notice,
        openAskQuestionModal,
        openLoginPage,
        openRegisterPage,
        profileModel,
        profileQuestionActions,
        questionActions,
        questions,
        requestPasswordReset,
        resetPassword,
        router,
        session,
        showLoginPage,
        showRegisterPage,
        submitAuth,
        topbarActions,
        topbarModel,
    };
}

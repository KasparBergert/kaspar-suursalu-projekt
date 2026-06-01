<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppModal from './shared/components/AppModal.vue';
import AppTopbar from './shared/components/AppTopbar.vue';
import NoticeStack from './shared/components/NoticeStack.vue';
import AskQuestionPanel from './features/questions/components/AskQuestionPanel.vue';
import AuthPage from './pages/AuthPage.vue';
import FeedPage from './pages/FeedPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import { useAuth } from './features/auth/composables/useAuth.ts';
import { useSession } from './features/auth/composables/useSession.ts';
import { useQuestions } from './features/questions/composables/useQuestions.ts';
import { useNotice } from './shared/composables/useNotice.ts';
import { useModal } from './shared/composables/useModal.ts';
import type { QuestionListModel, TopbarModel } from './types.ts';

const notice = useNotice();
const session = useSession();
const auth = useAuth(session, notice);
const questions = useQuestions(session.isAuthenticated, session.token, notice);
const modal = useModal();
const isAuthPageVisible = ref(false);
const authPageMode = ref<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
const passwordResetToken = ref('');
const isSubmitting = computed(() => auth.isSubmitting.value || questions.isSubmitting.value);
const topbarModel = computed<TopbarModel>(() => ({
    isAuthenticated: session.isAuthenticated.value,
    isSubmitting: isSubmitting.value,
    user: session.user.value,
    view: questions.view.value,
}));
const topbarActions = {
    logout: auth.logout,
    openAuth: openAuthPage,
    openQuestionModal: openAskQuestionModal,
    showFeed: questions.showFeed,
    showProfile: questions.showProfile,
};
const questionActions = {
    answer: questions.addAnswer,
    open: questions.selectQuestion,
    upvote: questions.upvote,
};
const profileQuestionActions = {
    answer: questions.addAnswer,
    open: questions.openProfileQuestion,
    upvote: questions.upvote,
};
const feedModel = computed<QuestionListModel>(() => createQuestionListModel({
    emptyText: 'No questions yet.',
    questions: questions.questions.value,
    showAuthor: true,
    title: 'Questions',
}));
const profileModel = computed<QuestionListModel>(() => createQuestionListModel({
    emptyText: 'You have not asked anything yet.',
    questions: questions.myQuestions.value,
    showAuthor: false,
    title: 'Your questions',
}));

onMounted(async () => {
    const resetToken = new URLSearchParams(window.location.search).get('resetToken');

    if (resetToken) {
        isAuthPageVisible.value = true;
        authPageMode.value = 'reset-password';
        passwordResetToken.value = resetToken;
        await auth.verifyPasswordResetToken(resetToken);
    }

    await questions.loadFeed();

    if (session.token.value) {
        await auth.loadProfile();
    }
});

async function submitAuth(payload: Parameters<typeof auth.submitAuth>[0]): Promise<void> {
    const didSubmit = await auth.submitAuth(payload);

    if (didSubmit) {
        isAuthPageVisible.value = false;
        questions.showFeed();
    }
}

async function requestPasswordReset(email: string): Promise<void> {
    const didRequest = await auth.requestPasswordReset(email);

    if (didRequest) {
        authPageMode.value = 'login';
    }
}

async function resetPassword(password: string): Promise<void> {
    const didReset = await auth.resetPassword(passwordResetToken.value, password);

    if (didReset) {
        authPageMode.value = 'login';
        passwordResetToken.value = '';
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

function openAuthPage(): void {
    showLoginPage();
    isAuthPageVisible.value = true;
}

function openRegisterPage(): void {
    showRegisterPage();
    isAuthPageVisible.value = true;
}

function showLoginPage(): void {
    auth.switchAuthMode('login');
    authPageMode.value = 'login';
}

function showRegisterPage(): void {
    auth.switchAuthMode('register');
    authPageMode.value = 'register';
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

function createQuestionListModel(options: {
    emptyText: string;
    questions: QuestionListModel['questions'];
    showAuthor: boolean;
    title: string;
}): QuestionListModel {
    return {
        comments: questions.selectedComments.value,
        emptyText: options.emptyText,
        isAuthenticated: session.isAuthenticated.value,
        isLoading: questions.isLoading.value,
        isSubmitting: isSubmitting.value,
        questions: options.questions,
        selectedQuestionId: questions.selectedQuestionId.value,
        showAuthor: options.showAuthor,
        title: options.title,
        user: session.user.value,
    };
}
</script>

<template>
    <div class="shell">
        <AuthPage
            v-if="isAuthPageVisible && !session.isAuthenticated.value"
            :error-message="notice.errorMessage.value"
            :is-submitting="isSubmitting"
            :message="notice.message.value"
            :mode="authPageMode"
            @forgot-password="authPageMode = authPageMode === 'forgot-password' ? 'login' : 'forgot-password'"
            @request-password-reset="requestPasswordReset"
            @reset-password="resetPassword"
            @show-login="showLoginPage"
            @show-register="showRegisterPage"
            @submit="submitAuth"
        />

        <template v-else>
        <AppTopbar
            :actions="topbarActions"
            :model="topbarModel"
        />

        <main class="layout">
            <aside class="sidebar">
                <section v-if="!session.isAuthenticated.value" class="rail-panel">
                    <h2>Join the conversation</h2>
                    <button class="rail-link rail-link-strong" type="button" @click="openAuthPage">
                        Log in
                    </button>
                    <button class="rail-link rail-link-strong" type="button" @click="openRegisterPage">
                        Register
                    </button>
                </section>

                <section v-else class="rail-panel">
                    <h2>Start a thread</h2>
                    <button class="rail-link rail-link-strong" type="button" @click="openAskQuestionModal">
                        Ask a question
                    </button>
                </section>
            </aside>

            <section class="content">
                <NoticeStack
                    :error-message="notice.errorMessage.value"
                    :message="notice.message.value"
                />

                <FeedPage
                    v-if="questions.view.value === 'feed'"
                    :actions="questionActions"
                    :model="feedModel"
                    :on-ask-question="openAskQuestionModal"
                    :on-load-more="questions.loadMoreFeed"
                />

                <ProfilePage
                    v-else
                    :actions="profileQuestionActions"
                    :model="profileModel"
                />
            </section>
        </main>

        <AppModal />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppModal from './shared/components/AppModal.vue';
import AppTopbar from './shared/components/AppTopbar.vue';
import NoticeStack from './shared/components/NoticeStack.vue';
import AuthPanel from './features/auth/components/AuthPanel.vue';
import AskQuestionPanel from './features/questions/components/AskQuestionPanel.vue';
import BrowsePanel from './features/questions/components/BrowsePanel.vue';
import QuestionDetail from './features/questions/components/QuestionDetail.vue';
import FeedPage from './pages/FeedPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import { useAuth } from './features/auth/composables/useAuth.ts';
import { useSession } from './features/auth/composables/useSession.ts';
import { useQuestions } from './features/questions/composables/useQuestions.ts';
import { useNotice } from './shared/composables/useNotice.ts';
import { useModal } from './shared/composables/useModal.ts';

const notice = useNotice();
const session = useSession();
const auth = useAuth(session, notice);
const questions = useQuestions(session.isAuthenticated, session.token, notice);
const modal = useModal();
const isSubmitting = computed(() => auth.isSubmitting.value || questions.isSubmitting.value);

onMounted(async () => {
    await questions.loadFeed();

    if (session.token.value) {
        await auth.loadProfile();
    }
});

async function submitAuth(payload: Parameters<typeof auth.submitAuth>[0]): Promise<void> {
    modal.state.props.isSubmitting = true;
    const didSubmit = await auth.submitAuth(payload);
    modal.state.props.isSubmitting = false;

    if (didSubmit) {
        modal.closeModal();
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

function openAuthModal(): void {
    modal.openModal(AuthPanel, {
        props: {
            authMode: auth.authMode.value,
            isSubmitting: isSubmitting.value,
            onSubmit: submitAuth,
            onSwitchMode: (nextMode: typeof auth.authMode.value) => {
                auth.switchAuthMode(nextMode);
                modal.state.props.authMode = nextMode;
                modal.state.title = nextMode === 'login' ? 'Log in' : 'Create account';
            },
        },
        title: auth.authMode.value === 'login' ? 'Log in' : 'Create account',
    });
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
</script>

<template>
    <div class="shell">
        <AppTopbar
            :is-authenticated="session.isAuthenticated.value"
            :is-submitting="isSubmitting"
            :user="session.user.value"
            :view="questions.view.value"
            @logout="auth.logout"
            @open-auth="openAuthModal"
            @open-question-modal="openAskQuestionModal"
            @show-feed="questions.showFeed"
            @show-profile="questions.showProfile"
        />

        <main class="layout">
            <aside class="sidebar">
                <section v-if="!session.isAuthenticated.value" class="panel compact">
                    <h2>Join the conversation</h2>
                    <button class="wide-button" type="button" @click="openAuthModal">
                        Log in or sign up
                    </button>
                </section>

                <section v-else class="panel compact">
                    <h2>Start a thread</h2>
                    <button class="wide-button" type="button" @click="openAskQuestionModal">
                        Ask a question
                    </button>
                </section>

                <BrowsePanel
                    :page="questions.page.value"
                    :total-pages="questions.totalPages.value"
                    @load-feed="questions.loadFeed"
                />
            </aside>

            <section class="content">
                <NoticeStack
                    :error-message="notice.errorMessage.value"
                    :message="notice.message.value"
                />

                <FeedPage
                    v-if="questions.view.value === 'feed'"
                    :is-loading="questions.isLoading.value"
                    :questions="questions.questions.value"
                    :selected-question-id="questions.selectedQuestionId.value"
                    @open="questions.selectQuestion"
                    @upvote="questions.upvote"
                />

                <ProfilePage
                    v-else
                    :is-loading="questions.isLoading.value"
                    :questions="questions.myQuestions.value"
                    @open="questions.openProfileQuestion"
                    @upvote="questions.upvote"
                />
            </section>

            <aside class="detail">
                <QuestionDetail
                    :comments="questions.selectedComments.value"
                    :is-authenticated="session.isAuthenticated.value"
                    :is-submitting="isSubmitting"
                    :selected-question="questions.selectedQuestion.value"
                    @answer="questions.addAnswer"
                    @upvote="questions.upvote"
                />
            </aside>
        </main>

        <AppModal />
    </div>
</template>

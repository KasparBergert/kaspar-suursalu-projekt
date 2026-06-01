<script setup lang="ts">
import FeedComposer from '../features/questions/components/FeedComposer.vue';
import QuestionList from '../features/questions/components/QuestionList.vue';
import AppSidebar from '../shared/components/AppSidebar.vue';
import AppTopbar from '../shared/components/AppTopbar.vue';
import NoticeStack from '../shared/components/NoticeStack.vue';
import { useInfiniteFeed } from '../features/questions/composables/useInfiniteFeed.ts';
import { useAppStore } from '../stores/useAppStore.ts';

const app = useAppStore();

useInfiniteFeed(
    () => app.feedPageModel.value.canLoadMore,
    app.feedPageActions.loadMore,
);
</script>

<template>
    <AppTopbar
        :actions="app.topbarActions"
        :model="app.topbarModel.value"
    />

    <main class="layout">
        <AppSidebar
            :is-authenticated="app.session.isAuthenticated.value"
            @ask-question="app.openAskQuestionModal"
            @login="app.openLoginPage"
            @register="app.openRegisterPage"
        />

        <section class="content">
            <NoticeStack
                :error-message="app.notice.errorMessage.value"
                :message="app.notice.message.value"
            />

            <FeedComposer
                v-if="app.feedPageModel.value.questions.isAuthenticated"
                :user="app.feedPageModel.value.questions.user"
                @ask-question="app.feedPageActions.askQuestion"
            />

            <QuestionList
                :actions="app.feedPageActions.questions"
                :model="app.feedPageModel.value.questions"
            />
        </section>
    </main>
</template>
